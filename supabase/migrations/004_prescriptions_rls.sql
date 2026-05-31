-- Migración: Agregar RLS policies para la tabla prescriptions
-- La tabla ya existe con RLS habilitado pero sin policies,
-- lo que bloquea TODAS las operaciones (INSERT/SELECT/UPDATE/DELETE).

-- Asegurarnos de que RLS está habilitado
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- SELECT: miembros del tenant pueden ver recetas de su clínica
CREATE POLICY "Tenant members can view prescriptions"
  ON prescriptions FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- INSERT: miembros del tenant pueden crear recetas para su clínica
CREATE POLICY "Tenant members can insert prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- UPDATE: miembros del tenant pueden actualizar recetas de su clínica
CREATE POLICY "Tenant members can update prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );

-- DELETE: miembros del tenant pueden eliminar recetas de su clínica
CREATE POLICY "Tenant members can delete prescriptions"
  ON prescriptions FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
    )
  );
