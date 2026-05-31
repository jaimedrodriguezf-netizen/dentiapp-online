# Propuesta Técnica: Módulo de Soporte y Reporte de Feedbacks

Esta propuesta detalla el diseño e implementación de un sistema de soporte al cliente integrado en la plataforma. Permite a los usuarios reportar bugs, sugerir funcionalidades y enviar comentarios clínicos con captura de pantalla y contexto técnico automático.

## 1. Flujo de Trabajo y Políticas de Costo
- **Captura de Pantalla**: Las capturas de pantalla se suben al bucket `support_screenshots` de Supabase Storage para evitar el sobrecosto de guardar binarios (Base64) en la base de datos relacional.
- **Limpieza Automática (Políticas de Almacenamiento)**: Para evitar llenar el storage, una vez que el ticket es diagnosticado por la IA o marcado como `resolved` por soporte, se invoca a la API de Supabase Storage para eliminar físicamente la captura de pantalla de forma definitiva.

## 2. Esquema de Base de Datos y Storage (`supabase/migrations/006_support_feedbacks.sql`)
```sql
-- Crear la tabla de feedbacks de soporte
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

-- Inicialización del Bucket en Supabase Storage
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
```

## 3. Integración con IA
Para diagnosticar y proponer soluciones:
- El agente de IA expone un comando de chat: si el usuario escribe `dame los feedbacks` o similar, la IA ejecuta la Server Action `getPendingFeedbacks` para obtener la lista de reportes del tenant activo (excluyendo el path del screenshot para optimizar tokens).
- Para cada reporte, la IA examina la ruta y los metadatos técnicos en `context`, correlaciona la falla con el código del proyecto, y escribe su propuesta en el campo `ai_diagnosis` del ticket además de presentarlo en el chat de soporte.
