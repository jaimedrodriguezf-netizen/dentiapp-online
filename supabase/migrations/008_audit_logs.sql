-- Migración: Tabla de Auditoría General (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Authenticated users can insert audit logs for their tenant"
  ON audit_logs FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins/Doctors can read audit logs for their tenant"
  ON audit_logs FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'supervisor', 'doctor')
  ));
