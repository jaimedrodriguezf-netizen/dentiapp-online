-- Migración: Tabla de Periodontogramas Clínicos
CREATE TABLE IF NOT EXISTS periodontograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  dental_record_id UUID REFERENCES dental_records(id) ON DELETE SET NULL,
  examination_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE periodontograms ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
CREATE POLICY "Users can view periodontograms for their tenant" 
  ON periodontograms FOR SELECT 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert periodontograms for their tenant" 
  ON periodontograms FOR INSERT 
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update periodontograms for their tenant" 
  ON periodontograms FOR UPDATE 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete periodontograms for their tenant" 
  ON periodontograms FOR DELETE 
  USING (tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()));
