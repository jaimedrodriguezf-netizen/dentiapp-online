-- Agregar campos de estado y observaciones a la tabla patients
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in_treatment', 'discharged')),
  ADD COLUMN IF NOT EXISTS observations TEXT;

COMMENT ON COLUMN patients.status IS 'Estado del paciente: active, inactive, in_treatment, discharged';
COMMENT ON COLUMN patients.observations IS 'Observaciones clínicas y administrativas del paciente';

-- Agregar campo de WhatsApp a tenants
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

COMMENT ON COLUMN tenants.whatsapp_number IS 'Número de WhatsApp para contacto directo desde la landing page';

-- Crear tabla de horarios de atención por clínica
CREATE TABLE IF NOT EXISTS operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT false,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, day_of_week)
);

COMMENT ON TABLE operating_hours IS 'Horarios de atención semanal por clínica';
COMMENT ON COLUMN operating_hours.day_of_week IS '0=Domingo, 1=Lunes, ..., 6=Sábado';

ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view their operating hours"
  ON operating_hours FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admin can manage operating hours"
  ON operating_hours FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Crear tabla de consentimientos de tratamiento de datos
CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'data_treatment',
  ip_address VARCHAR(45),
  user_agent TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE consents IS 'Registro de consentimientos de tratamiento de datos personales';
COMMENT ON COLUMN consents.type IS 'Tipo de consentimiento: data_treatment, marketing, etc.';

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant members can view their consents"
  ON consents FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Public can create consents"
  ON consents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can manage consents"
  ON consents FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid() AND role = 'admin'
  ));
