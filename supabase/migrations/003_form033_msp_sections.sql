-- Migración: Ampliar dental_records para cubrir las 12 secciones del MSP Form 033
-- Secciones: A-E (paciente/consulta/antecedentes), F (vitales), G (estomatognático),
-- H (odontograma - tabla existente), I-J (indicadores), L (exámenes), N (diagnóstico),
-- P (tratamiento multi-sesión - tabla nueva)

-- Sección B: Embarazada
ALTER TABLE dental_records
  ADD COLUMN IF NOT EXISTS pregnant BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN dental_records.pregnant IS 'Sección B MSP: ¿Paciente embarazada?';

-- Sección D: Antecedentes patológicos personales (JSONB con 10 checkboxes)
ALTER TABLE dental_records
  ADD COLUMN IF NOT EXISTS personal_history JSONB DEFAULT NULL;

COMMENT ON COLUMN dental_records.personal_history IS 'Sección D MSP: Antecedentes patológicos personales — {allergy_antibiotic:bool, allergy_anesthesia:bool, hemorrhages:bool, hiv:bool, tuberculosis:bool, asthma:bool, diabetes:bool, hypertension:bool, heart_disease:bool, other:bool, other_text:string}';

-- Sección E: Antecedentes patológicos familiares (JSONB con 10 checkboxes)
ALTER TABLE dental_records
  ADD COLUMN IF NOT EXISTS family_history JSONB DEFAULT NULL;

COMMENT ON COLUMN dental_records.family_history IS 'Sección E MSP: Antecedentes patológicos familiares — {cardiopathy:bool, hypertension:bool, vascular_disease:bool, endocrine:bool, cancer:bool, tuberculosis:bool, mental_illness:bool, infectious_disease:bool, malformation:bool, other:bool, other_text:string}';

-- Sección I: Enfermedad periodontal
ALTER TABLE dental_records
  ADD COLUMN IF NOT EXISTS periodontal_disease VARCHAR(20) DEFAULT NULL CHECK (periodontal_disease IN ('leve', 'moderada', 'severa') OR periodontal_disease IS NULL);

COMMENT ON COLUMN dental_records.periodontal_disease IS 'Sección I MSP: Enfermedad periodontal — leve | moderada | severa';

-- Sección L: Exámenes complementarios (JSONB)
ALTER TABLE dental_records
  ADD COLUMN IF NOT EXISTS complementary_exams JSONB DEFAULT NULL;

COMMENT ON COLUMN dental_records.complementary_exams IS 'Sección L MSP: Pedido de exámenes complementarios — {hematology:string, blood_chemistry:string, xray:string, other:string}';

-- Sección N: El campo diagnosis ya existe como JSONB.
-- Lo ampliamos para soportar diagnóstico múltiple (presuntivo + definitivo + CIE)
-- Formato actual: {code, description, text}
-- Nuevo formato: [{code, description, type: "presuntivo"|"definitivo", notes}]
-- No se requiere cambio de columna, solo se actualiza el contenido.

COMMENT ON COLUMN dental_records.diagnosis IS 'Sección N MSP: Diagnóstico(s) — array de [{code:string, description:string, type:"presuntivo"|"definitivo"|null, notes:string|null}]';

-- Sección G: stomatognathic_exam ya existe como VARCHAR.
-- Lo migramos a JSONB con 13 regiones MSP + texto libre.
-- Usamos una columna auxiliar para la migración sin pérdida de datos.

-- Paso 1: Renombrar columna existente y crear nueva columna JSONB
DO $$
BEGIN
  -- Verificar si la columna actual es VARCHAR/TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dental_records' AND column_name = 'stomatognathic_exam'
    AND data_type IN ('character varying', 'text')
  ) THEN
    -- Renombrar la vieja a un backup
    ALTER TABLE dental_records RENAME COLUMN stomatognathic_exam TO stomatognathic_exam_old;
    
    -- Crear nueva columna JSONB
    ALTER TABLE dental_records ADD COLUMN stomatognathic_exam JSONB DEFAULT NULL;
    
    -- Migrar datos existentes: string separado por coma → formato MSP
    UPDATE dental_records
    SET stomatognathic_exam = jsonb_build_object(
      'regions', (
        SELECT jsonb_agg(jsonb_build_object('id', trim(region), 'finding', ''))
        FROM unnest(string_to_array(stomatognathic_exam_old, ',')) AS region
      ),
      'free_text', ''
    )
    WHERE stomatognathic_exam_old IS NOT NULL AND stomatognathic_exam_old != '';
  END IF;
END $$;

COMMENT ON COLUMN dental_records.stomatognathic_exam IS 'Sección G MSP: Examen sistema estomatognático — {regions: [{id:string, finding:string}], free_text:string}';

-- ==========================================================
-- Sección P: Tratamiento multi-sesión (nueva tabla)
-- ==========================================================

CREATE TABLE IF NOT EXISTS treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL REFERENCES dental_records(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  session_date DATE,
  diagnoses_complications TEXT,
  procedures TEXT,
  prescriptions TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE treatment_sessions IS 'Sección P MSP: Sesiones de tratamiento del Form 033';
COMMENT ON COLUMN treatment_sessions.session_number IS 'Número de sesión (1, 2, 3...)';
COMMENT ON COLUMN treatment_sessions.session_date IS 'Fecha de la sesión';
COMMENT ON COLUMN treatment_sessions.diagnoses_complications IS 'Diagnósticos y complicaciones de la sesión';
COMMENT ON COLUMN treatment_sessions.procedures IS 'Procedimientos realizados';
COMMENT ON COLUMN treatment_sessions.prescriptions IS 'Prescripciones de la sesión';
COMMENT ON COLUMN treatment_sessions.signature IS 'Firma o nombre del profesional';

-- Índice para ordenar por nº de sesión
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_record ON treatment_sessions(dental_record_id, session_number);

-- RLS para treatment_sessions: solo miembros del tenant pueden ver
ALTER TABLE treatment_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view treatment sessions"
  ON treatment_sessions FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Tenant members can insert treatment sessions"
  ON treatment_sessions FOR INSERT
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Tenant members can update treatment sessions"
  ON treatment_sessions FOR UPDATE
  USING (
    dental_record_id IN (
      SELECT id FROM dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Tenant members can delete treatment sessions"
  ON treatment_sessions FOR DELETE
  USING (
    dental_record_id IN (
      SELECT id FROM dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
      )
    )
  );
