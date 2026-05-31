-- Migración: Tabla de Feedbacks de Soporte y Almacenamiento de Capturas
CREATE TABLE IF NOT EXISTS support_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL, -- 'bug' | 'feature' | 'feedback'
  message TEXT NOT NULL,
  context JSONB NOT NULL, -- ruta_actual, user_agent, rol, etc.
  screenshot_path TEXT, -- Ruta del archivo en el bucket de storage
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'diagnosed' | 'resolved'
  ai_diagnosis TEXT, -- Diagnóstico sugerido de forma automática por la IA
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE support_feedbacks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can insert feedbacks for their tenant" 
  ON support_feedbacks FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Admins/Doctors can read/update feedbacks for their tenant" 
  ON support_feedbacks FOR ALL 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

-- Inicialización del Bucket en Supabase Storage (Esquema public de storage)
INSERT INTO storage.buckets (id, name, public)
VALUES ('support_screenshots', 'support_screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas del Bucket de Almacenamiento
CREATE POLICY "Allow public inserts to support_screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'support_screenshots');

CREATE POLICY "Allow authenticated read of support_screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'support_screenshots');

CREATE POLICY "Allow authenticated deletion of support_screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'support_screenshots');
