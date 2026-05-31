-- Migración: Asegurar políticas de acceso al Bucket support_screenshots basadas en tenant_members
DROP POLICY IF EXISTS "Allow public inserts to support_screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read of support_screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletion of support_screenshots" ON storage.objects;

-- Crear políticas basadas en la coincidencia del tenant_id en el path del archivo
CREATE POLICY "Allow tenant members to insert support_screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'support_screenshots' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE user_id = auth.uid() 
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );

CREATE POLICY "Allow tenant members to read support_screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'support_screenshots' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE user_id = auth.uid() 
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );

CREATE POLICY "Allow tenant members to delete support_screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'support_screenshots' 
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM tenant_members 
      WHERE user_id = auth.uid() 
      AND tenant_id::text = split_part(name, '/', 1)
    )
  );
