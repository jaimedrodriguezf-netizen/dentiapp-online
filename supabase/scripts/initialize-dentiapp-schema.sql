-- =====================================================
-- DENTIAPP-ONLINE: INICIALIZACIÓN DE SCHEMA
-- =====================================================
-- ⚠️  SCRIPT DESTRUCTIVO
-- Borra TODAS las tablas y recrea el schema desde cero
-- para el proyecto DentiApp Online.
--
-- ANTES DE EJECUTAR:
--   1. Hacer backup completo (Settings → Database → Backups)
--   2. Confirmar que el proyecto Supabase es el correcto
--   3. Avisar a todos los usuarios que van a perder acceso
--
-- DESPUÉS DE EJECUTAR:
--   - Las tablas de IAPI Shop se eliminaron
--   - Las tablas compartidas se recrearon con schema DentiApp
--   - Las tablas que faltaban se crearon
--   - RLS y policies están configuradas
--   - Los 6 tenants y 5 memberships anteriores se BORRARON
--   - Los usuarios en auth.users SIGUEN existiendo
--     (deberán registrarse de nuevo como miembros de un tenant)
-- =====================================================

-- =====================================================
-- PARTE 0: LIMPIEZA DE STORAGE
-- =====================================================
-- Borrar el bucket viejo (con sus policies) para recrearlo privado
DELETE FROM storage.buckets WHERE id = 'support_screenshots';

-- =====================================================
-- PARTE 1: DROP DE TODAS LAS TABLAS (orden por FK)
-- =====================================================
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.support_feedbacks CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.periodontograms CASCADE;
DROP TABLE IF EXISTS public.stomatognathic_exam CASCADE;
DROP TABLE IF EXISTS public.nursing_notes CASCADE;
DROP TABLE IF EXISTS public.vital_signs CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.odontogram_teeth CASCADE;
DROP TABLE IF EXISTS public.treatment_sessions CASCADE;
DROP TABLE IF EXISTS public.dental_records CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.operating_hours CASCADE;
DROP TABLE IF EXISTS public.consents CASCADE;
DROP TABLE IF EXISTS public.tenant_members CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.platform_admins CASCADE;
DROP TABLE IF EXISTS public.tenant_followers CASCADE;
DROP TABLE IF EXISTS public.product_favorites CASCADE;
DROP TABLE IF EXISTS public.store_reports CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_tags CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.section_products CASCADE;
DROP TABLE IF EXISTS public.sections CASCADE;
DROP TABLE IF EXISTS public.promo_banners CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.subscription_payments CASCADE;
DROP TABLE IF EXISTS public.tenant_subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.cantons CASCADE;
DROP TABLE IF EXISTS public.provinces CASCADE;
DROP TABLE IF EXISTS public.countries CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;

-- =====================================================
-- PARTE 2: DROP DE TODOS LOS ENUMS
-- =====================================================
DROP TYPE IF EXISTS public.tenant_status CASCADE;
DROP TYPE IF EXISTS public.tenant_role CASCADE;
DROP TYPE IF EXISTS public.member_status CASCADE;
DROP TYPE IF EXISTS public.platform_role CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.marketplace_review_status CASCADE;

-- =====================================================
-- PARTE 3: CREATE DE ENUMS DE DENTIAPP
-- =====================================================
CREATE TYPE public.tenant_role AS ENUM (
  'admin',
  'supervisor',
  'doctor',
  'nurse',
  'receptionist'
);

CREATE TYPE public.platform_role AS ENUM (
  'admin',
  'support',
  'moderator',
  'billing_admin'
);

CREATE TYPE public.feedback_type AS ENUM (
  'bug',
  'feature',
  'feedback'
);

CREATE TYPE public.feedback_status AS ENUM (
  'pending',
  'diagnosed',
  'resolved'
);

CREATE TYPE public.appointment_status AS ENUM (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE public.patient_status AS ENUM (
  'active',
  'inactive',
  'in_treatment',
  'discharged'
);

CREATE TYPE public.consent_type AS ENUM (
  'data_treatment',
  'marketing',
  'medical_history'
);

-- =====================================================
-- PARTE 4: CREATE DE TABLAS CORE
-- =====================================================

-- 4.1 profiles (link a auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Perfil público de cada usuario autenticado.';

-- 4.2 platform_admins (super admins del sistema)
CREATE TABLE public.platform_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.platform_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.platform_admins IS 'Usuarios con privilegios cross-tenant (super admins).';

-- 4.3 tenants (clínicas)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 120),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('free', 'standard', 'business')),
  phone TEXT,
  address TEXT,
  email TEXT,
  whatsapp_number VARCHAR(20),
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tenants IS 'Clínicas dentales (cada tenant del sistema multi-tenant).';
COMMENT ON COLUMN public.tenants.slug IS 'Identificador URL-safe único, ej: dentiapp, clinica-norte';
COMMENT ON COLUMN public.tenants.plan IS 'Plan comercial: free | standard | business';

-- 4.4 tenant_members (membresía user ↔ tenant)
CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL DEFAULT 'doctor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);
COMMENT ON TABLE public.tenant_members IS 'Relación user ↔ tenant con su rol. UNIQUE evita duplicados.';

-- 4.5 patients
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cedula TEXT,
  birth_date DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  status public.patient_status NOT NULL DEFAULT 'active',
  observations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.patients IS 'Pacientes de cada clínica. Aislamiento por tenant_id via RLS.';

-- 4.6 appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.appointments IS 'Turnos de pacientes. La landing pública puede consultar busy slots via RPC.';

-- 4.7 dental_records (Form 033 MSP)
CREATE TABLE public.dental_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  opening_date DATE,
  control_date DATE,
  consultation_reason TEXT,
  current_problem JSONB,
  personal_family_history TEXT,
  diagnosis JSONB,
  treatment JSONB,
  diagnostic_plan TEXT,
  educational_plan TEXT,
  therapeutic_plan TEXT,
  vital_signs JSONB,
  oral_hygiene JSONB,
  stomatognathic_exam JSONB,
  personal_history JSONB,
  family_history JSONB,
  complementary_exams JSONB,
  pregnant BOOLEAN,
  periodontal_disease VARCHAR(20) CHECK (periodontal_disease IN ('leve', 'moderada', 'severa')),
  fluorosis TEXT,
  malocclusion JSONB,
  cpod_index JSONB,
  ceod_index JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.dental_records IS 'Historia clínica dental (Form 033 MSP Ecuador).';
COMMENT ON COLUMN dental_records.stomatognathic_exam IS 'Examen sistema estomatognático — {regions: [{id, finding}], free_text}';
COMMENT ON COLUMN dental_records.diagnosis IS 'Diagnóstico(s) — array de [{code, description, type, notes}]';
COMMENT ON COLUMN dental_records.personal_history IS 'Antecedentes patológicos personales (Sección D MSP)';
COMMENT ON COLUMN dental_records.family_history IS 'Antecedentes patológicos familiares (Sección E MSP)';
COMMENT ON COLUMN dental_records.complementary_exams IS 'Pedido de exámenes complementarios (Sección L MSP)';

-- 4.8 odontogram_teeth (dientes del odontograma)
CREATE TABLE public.odontogram_teeth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tooth_number SMALLINT NOT NULL CHECK (tooth_number BETWEEN 1 AND 52),
  status TEXT NOT NULL,
  surfaces JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dental_record_id, tooth_number)
);
COMMENT ON TABLE public.odontogram_teeth IS 'Estado de cada pieza dental en una historia clínica. UNIQUE por (record, tooth).';

-- 4.9 treatment_sessions (Sección P MSP)
CREATE TABLE public.treatment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  session_date DATE,
  diagnoses_complications TEXT,
  procedures TEXT,
  prescriptions TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.treatment_sessions IS 'Sección P MSP: Sesiones de tratamiento del Form 033.';

-- 4.10 prescriptions
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  quantity INT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.prescriptions IS 'Recetas médicas asociadas a una historia clínica.';

-- 4.11 vital_signs (enfermería)
CREATE TABLE public.vital_signs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  heart_rate TEXT,
  blood_pressure TEXT,
  temperature TEXT,
  oxygen_saturation TEXT,
  respiratory_rate TEXT,
  weight TEXT,
  height TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.vital_signs IS 'Signos vitales registrados por enfermería. Una fila por medición.';

-- 4.12 nursing_notes
CREATE TABLE public.nursing_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL REFERENCES public.dental_records(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.nursing_notes IS 'Notas libres de enfermería sobre un paciente.';

-- 4.13 stomatognathic_exam (examen estomatognático por enfermería)
CREATE TABLE public.stomatognathic_exam (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dental_record_id UUID NOT NULL UNIQUE REFERENCES public.dental_records(id) ON DELETE CASCADE,
  lips TEXT,
  cheeks TEXT,
  maxilla TEXT,
  mandible TEXT,
  tongue TEXT,
  palate TEXT,
  floor_of_mouth TEXT,
  salivary_glands TEXT,
  tmj TEXT,
  lymph_nodes TEXT,
  regions JSONB,
  free_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.stomatognathic_exam IS 'Examen estomatognático (1 fila por historia clínica, UPSERT).';

-- 4.14 periodontograms
CREATE TABLE public.periodontograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dental_record_id UUID REFERENCES public.dental_records(id) ON DELETE SET NULL,
  examination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.periodontograms IS 'Periodontograma clínico. data es JSONB con el estado por pieza.';

-- 4.15 role_permissions (permisos dinámicos por tenant y rol)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL,
  permission_key TEXT NOT NULL,
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, role, permission_key)
);
COMMENT ON TABLE public.role_permissions IS 'Permisos granulares por (tenant, role, permission_key). Si está vacío, default = permitido.';

-- 4.16 operating_hours (horarios de atención)
CREATE TABLE public.operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open BOOLEAN NOT NULL DEFAULT false,
  open_time TIME,
  close_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, day_of_week)
);
COMMENT ON TABLE public.operating_hours IS 'Horarios semanales por clínica. 0=Domingo, 6=Sábado.';
COMMENT ON COLUMN public.operating_hours.day_of_week IS '0=Domingo, 1=Lunes, ..., 6=Sábado';

-- 4.17 consents (consentimientos de tratamiento de datos)
CREATE TABLE public.consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  type public.consent_type NOT NULL DEFAULT 'data_treatment',
  ip_address VARCHAR(45),
  user_agent TEXT,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
COMMENT ON TABLE public.consents IS 'Registro de consentimientos de tratamiento de datos personales.';

-- 4.18 support_feedbacks (reportes de soporte)
CREATE TABLE public.support_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  type public.feedback_type NOT NULL,
  message TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  screenshot_path TEXT,
  status public.feedback_status NOT NULL DEFAULT 'pending',
  ai_diagnosis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.support_feedbacks IS 'Tickets de soporte. screenshot_path referencia storage.objects.';

-- 4.19 audit_logs (auditoría general)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.audit_logs IS 'Log de auditoría. Solo se inserta y solo lo leen roles privilegiados.';

-- 4.20 notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.notifications IS 'Notificaciones in-app para usuarios autenticados.';

-- =====================================================
-- PARTE 5: ÍNDICES OPTIMIZADOS
-- =====================================================

-- 5.1 tenant_members: para RLS y queries de membresía
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_role ON public.tenant_members(tenant_id, role);

-- 5.2 patients: listados y búsquedas
CREATE INDEX idx_patients_tenant_id ON public.patients(tenant_id);
CREATE INDEX idx_patients_tenant_lastname ON public.patients(tenant_id, last_name);
CREATE INDEX idx_patients_tenant_cedula ON public.patients(tenant_id, cedula);
CREATE INDEX idx_patients_tenant_status ON public.patients(tenant_id, status);

-- 5.3 appointments: agenda
CREATE INDEX idx_appointments_tenant_date ON public.appointments(tenant_id, date);
CREATE INDEX idx_appointments_tenant_patient ON public.appointments(tenant_id, patient_id);
CREATE INDEX idx_appointments_tenant_status ON public.appointments(tenant_id, status);

-- 5.4 dental_records
CREATE INDEX idx_dental_records_tenant_patient ON public.dental_records(tenant_id, patient_id);
CREATE INDEX idx_dental_records_opening_date ON public.dental_records(tenant_id, opening_date DESC);

-- 5.5 odontogram_teeth
CREATE INDEX idx_odontogram_teeth_record ON public.odontogram_teeth(dental_record_id);

-- 5.6 treatment_sessions
CREATE INDEX idx_treatment_sessions_record ON public.treatment_sessions(dental_record_id, session_number);

-- 5.7 prescriptions
CREATE INDEX idx_prescriptions_tenant ON public.prescriptions(tenant_id);
CREATE INDEX idx_prescriptions_record ON public.prescriptions(dental_record_id);

-- 5.8 vital_signs
CREATE INDEX idx_vital_signs_record ON public.vital_signs(dental_record_id, created_at DESC);

-- 5.9 nursing_notes
CREATE INDEX idx_nursing_notes_record ON public.nursing_notes(dental_record_id, created_at DESC);

-- 5.10 periodontograms
CREATE INDEX idx_periodontograms_tenant_patient ON public.periodontograms(tenant_id, patient_id);

-- 5.11 consents
CREATE INDEX idx_consents_tenant ON public.consents(tenant_id, consented_at DESC);

-- 5.12 support_feedbacks
CREATE INDEX idx_support_feedbacks_tenant_status ON public.support_feedbacks(tenant_id, status, created_at DESC);

-- 5.13 audit_logs
CREATE INDEX idx_audit_logs_tenant_action ON public.audit_logs(tenant_id, action, created_at DESC);

-- 5.14 notifications
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- 5.15 operating_hours
-- Ya tiene UNIQUE(tenant_id, day_of_week) que sirve como índice

-- =====================================================
-- PARTE 6: ROW LEVEL SECURITY
-- =====================================================

-- 6.1 Habilitar RLS en TODAS las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dental_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontogram_teeth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nursing_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stomatognathic_exam ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 7: RLS POLICIES
-- =====================================================

-- 7.1 profiles: solo el dueño puede ver/editar su perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- 7.2 platform_admins: solo platform_admins ven la tabla
CREATE POLICY "Platform admins can view platform admins"
  ON public.platform_admins FOR SELECT
  USING (user_id = auth.uid());

-- 7.3 tenants: lectura pública (para landing), update solo admin
CREATE POLICY "Tenants are publicly viewable by slug"
  ON public.tenants FOR SELECT
  USING (true);

CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (
    id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 7.4 tenant_members: miembros ven otros miembros del mismo tenant
CREATE POLICY "Members can view members of their tenants"
  ON public.tenant_members FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert members"
  ON public.tenant_members FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can update members"
  ON public.tenant_members FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can delete members"
  ON public.tenant_members FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 7.5 patients: miembros del tenant
CREATE POLICY "Members can view their tenant patients"
  ON public.patients FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their tenant patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update their tenant patients"
  ON public.patients FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete their tenant patients"
  ON public.patients FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.6 appointments: miembros del tenant
CREATE POLICY "Members can view their tenant appointments"
  ON public.appointments FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their tenant appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update their tenant appointments"
  ON public.appointments FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete their tenant appointments"
  ON public.appointments FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.7 dental_records: miembros del tenant
CREATE POLICY "Members can view their tenant dental records"
  ON public.dental_records FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their tenant dental records"
  ON public.dental_records FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update their tenant dental records"
  ON public.dental_records FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete their tenant dental records"
  ON public.dental_records FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.8 odontogram_teeth: miembros del tenant
CREATE POLICY "Members can view odontogram teeth"
  ON public.odontogram_teeth FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage odontogram teeth"
  ON public.odontogram_teeth FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

-- 7.9 treatment_sessions: via dental_record_id
CREATE POLICY "Members can view treatment sessions"
  ON public.treatment_sessions FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can manage treatment sessions"
  ON public.treatment_sessions FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

-- 7.10 prescriptions: miembros del tenant
CREATE POLICY "Members can view their tenant prescriptions"
  ON public.prescriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert their tenant prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update their tenant prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can delete their tenant prescriptions"
  ON public.prescriptions FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.11 vital_signs: via dental_record_id
CREATE POLICY "Members can view vital signs"
  ON public.vital_signs FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can manage vital signs"
  ON public.vital_signs FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

-- 7.12 nursing_notes: via dental_record_id
CREATE POLICY "Members can view nursing notes"
  ON public.nursing_notes FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can manage nursing notes"
  ON public.nursing_notes FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

-- 7.13 stomatognathic_exam: via dental_record_id
CREATE POLICY "Members can view stomatognathic exam"
  ON public.stomatognathic_exam FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can manage stomatognathic exam"
  ON public.stomatognathic_exam FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records WHERE tenant_id IN (
        SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
      )
    )
  );

-- 7.14 periodontograms: miembros del tenant
CREATE POLICY "Members can view periodontograms"
  ON public.periodontograms FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage periodontograms"
  ON public.periodontograms FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

-- 7.15 role_permissions: miembros del tenant pueden ver, admin puede modificar
CREATE POLICY "Members can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 7.16 operating_hours: lectura pública + admin puede modificar
CREATE POLICY "Public can view operating hours"
  ON public.operating_hours FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage operating hours"
  ON public.operating_hours FOR ALL
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 7.17 consents: tenant members ven, público puede insertar SOLO si tenant existe
CREATE POLICY "Members can view their tenant consents"
  ON public.consents FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can create consents for valid tenants"
  ON public.consents FOR INSERT
  WITH CHECK (
    tenant_id IN (SELECT id FROM public.tenants)
  );

CREATE POLICY "Admins can delete their tenant consents"
  ON public.consents FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 7.18 support_feedbacks: miembros pueden insertar/ver del propio tenant
CREATE POLICY "Members can insert feedbacks for their tenant"
  ON public.support_feedbacks FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can view feedbacks for their tenant"
  ON public.support_feedbacks FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privileged roles can update feedbacks"
  ON public.support_feedbacks FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

CREATE POLICY "Privileged roles can delete feedbacks"
  ON public.support_feedbacks FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.19 audit_logs: solo insertar y leer por roles privilegiados
CREATE POLICY "Authenticated users can insert audit logs for their tenant"
  ON public.audit_logs FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privileged roles can read audit logs for their tenant"
  ON public.audit_logs FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.tenant_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- 7.20 notifications: solo el usuario dueño
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- PARTE 8: STORAGE BUCKET (PRIVADO)
-- =====================================================
-- Crear bucket privado (no público) para screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('support_screenshots', 'support_screenshots', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Policies de storage basadas en el tenant_id del path
CREATE POLICY "Tenant members can insert support screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'support_screenshots'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE user_id = auth.uid()
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );

CREATE POLICY "Tenant members can read support screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support_screenshots'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE user_id = auth.uid()
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );

CREATE POLICY "Tenant members can delete support screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'support_screenshots'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE user_id = auth.uid()
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );

-- =====================================================
-- PARTE 9: FUNCTIONS
-- =====================================================

-- 9.1 add_tenant_member_by_email (recreada con el nuevo enum)
CREATE OR REPLACE FUNCTION public.add_tenant_member_by_email(
  p_slug TEXT,
  p_email TEXT,
  p_role public.tenant_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_user_id UUID;
  v_caller_role public.tenant_role;
BEGIN
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = p_slug;
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'Clínica no encontrada';
  END IF;

  SELECT role INTO v_caller_role
  FROM public.tenant_members
  WHERE tenant_id = v_tenant_id AND user_id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'supervisor') THEN
    RAISE EXCEPTION 'No tenés autorización para gestionar el equipo de esta clínica';
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'El usuario con el correo % no está registrado en DentiApp Online', p_email;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = v_tenant_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'El usuario ya pertenece a esta clínica';
  END IF;

  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  VALUES (v_tenant_id, v_user_id, p_role);
END;
$$;

-- 9.2 auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9.3 updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables that have updated_at
CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_tenant_members
  BEFORE UPDATE ON public.tenant_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_patients
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_dental_records
  BEFORE UPDATE ON public.dental_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_odontogram_teeth
  BEFORE UPDATE ON public.odontogram_teeth
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_treatment_sessions
  BEFORE UPDATE ON public.treatment_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_prescriptions
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_nursing_notes
  BEFORE UPDATE ON public.nursing_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_stomatognathic_exam
  BEFORE UPDATE ON public.stomatognathic_exam
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_periodontograms
  BEFORE UPDATE ON public.periodontograms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_role_permissions
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_operating_hours
  BEFORE UPDATE ON public.operating_hours
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_support_feedbacks
  BEFORE UPDATE ON public.support_feedbacks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_platform_admins
  BEFORE UPDATE ON public.platform_admins
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- PARTE 10: BOOK_APPOINTMENT RPC
-- =====================================================
-- Esta función es llamada desde la landing pública del tenant
-- para que un visitante pueda reservar un turno sin auth.
CREATE OR REPLACE FUNCTION public.book_appointment(
  p_tenant_id UUID,
  p_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_date DATE,
  p_time TIME,
  p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_slug TEXT;
  v_patient_id UUID;
  v_appointment_id UUID;
BEGIN
  -- Validar tenant
  SELECT slug INTO v_tenant_slug FROM public.tenants WHERE id = p_tenant_id;
  IF v_tenant_slug IS NULL THEN
    RAISE EXCEPTION 'Clínica no encontrada';
  END IF;

  -- Buscar o crear paciente (por teléfono dentro del tenant)
  SELECT id INTO v_patient_id
  FROM public.patients
  WHERE tenant_id = p_tenant_id AND phone = p_phone
  LIMIT 1;

  IF v_patient_id IS NULL THEN
    INSERT INTO public.patients (tenant_id, first_name, last_name, phone, email, status)
    VALUES (
      p_tenant_id,
      split_part(p_name, ' ', 1),
      COALESCE(NULLIF(substring(p_name from position(' ' in p_name) + 1), ''), '—'),
      p_phone,
      NULLIF(p_email, ''),
      'active'
    )
    RETURNING id INTO v_patient_id;
  END IF;

  -- Crear el turno
  INSERT INTO public.appointments (tenant_id, patient_id, date, time, reason, status)
  VALUES (p_tenant_id, v_patient_id, p_date, p_time, p_reason, 'scheduled')
  RETURNING id INTO v_appointment_id;

  RETURN jsonb_build_object(
    'appointment_id', v_appointment_id,
    'patient_id', v_patient_id,
    'tenant_slug', v_tenant_slug
  );
END;
$$;

-- =====================================================
-- PARTE 11: RE-GRANT a roles de Supabase
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
-- Próximos pasos:
-- 1. Verificar que no haya errores en la consola de Supabase
-- 2. Confirmar que las tablas se crearon con: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- 3. Confirmar que RLS está habilitado: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 4. Crear un tenant de prueba desde el flujo de register
-- 5. Probar el flujo completo: login → /[slug]/dashboard
-- =====================================================
