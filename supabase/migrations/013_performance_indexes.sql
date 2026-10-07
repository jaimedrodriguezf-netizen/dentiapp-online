-- =====================================================
-- MIGRACIÓN 013: Índices de rendimiento para PostgreSQL / Supabase
-- =====================================================
-- Optimiza las consultas frecuentes por tenant, usuario y fecha,
-- eliminando Table Scans en evaluaciones de RLS y joins clave.
-- =====================================================

-- 1. Consultas de Tenant y Membresías (Crítico para RLS current_user_tenant_ids)
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- 2. Pacientes (Búsqueda, RLS y filtros de estado)
CREATE INDEX IF NOT EXISTS idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_patients_tenant_status ON public.patients(tenant_id, status);

-- 3. Turnos / Agenda (Filtros de fecha de agenda y estado)
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date ON public.appointments(tenant_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_status ON public.appointments(tenant_id, status);

-- 4. Historias Clínicas y Formulario 033
CREATE INDEX IF NOT EXISTS idx_dental_records_tenant_id ON public.dental_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dental_records_patient_id ON public.dental_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_odontogram_teeth_dental_record ON public.odontogram_teeth(dental_record_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_dental_record ON public.prescriptions(dental_record_id);
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_dental_record ON public.treatment_sessions(dental_record_id);

-- 5. Exámenes complementarios y notas de enfermería
CREATE INDEX IF NOT EXISTS idx_nursing_notes_tenant_patient ON public.nursing_notes(tenant_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_stomatognathic_exam_record ON public.stomatognathic_exam(dental_record_id);
CREATE INDEX IF NOT EXISTS idx_periodontograms_tenant_patient ON public.periodontograms(tenant_id, patient_id);
