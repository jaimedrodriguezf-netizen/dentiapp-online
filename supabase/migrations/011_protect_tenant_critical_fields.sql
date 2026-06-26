-- =====================================================
-- MIGRACIÓN 011: Proteger columnas críticas de tenants
-- =====================================================
-- RLS controla FILAS (qué rows puede ver/editar un user),
-- no COLUMNAS. Sin protección extra, un admin autenticado
-- puede hacer .from('tenants').update({ plan: 'business' })
-- desde la consola del browser y auto-upgradear su plan.
--
-- Fix: trigger BEFORE UPDATE que rechaza cambios en columnas
-- críticas (plan, slug, id, created_at) cuando el actor NO es
-- service_role ni platform_admin ni superuser.
--
-- service_role bypasea RLS y se usa solo desde backend
-- confiable (webhooks de billing, migrations, scripts).
-- =====================================================

CREATE OR REPLACE FUNCTION public.protect_tenant_critical_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- service_role y postgres pueden cambiar todo (billing, migrations, DBA)
  IF current_setting('role', true) = 'service_role'
     OR current_setting('is_superuser', true) = 'on'
     OR auth.uid() IS NULL THEN  -- null = no JWT = backend directo
    RETURN NEW;
  END IF;

  -- platform_admins también pueden (super admins del sistema)
  IF EXISTS (
    SELECT 1 FROM public.platform_admins
    WHERE user_id = auth.uid()
  ) THEN
    RETURN NEW;
  END IF;

  -- Para usuarios normales, validar columnas inmutables
  IF NEW.plan IS DISTINCT FROM OLD.plan THEN
    RAISE EXCEPTION 'La columna "plan" solo puede ser modificada por el sistema de billing'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF NEW.slug IS DISTINCT FROM OLD.slug THEN
    RAISE EXCEPTION 'La columna "slug" no puede ser modificada (rompería las URLs)'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'La columna "id" no puede ser modificada'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'La columna "created_at" no puede ser modificada'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.protect_tenant_critical_fields() IS
  'Trigger: rechaza cambios en plan/slug/id/created_at de tenants por users no-privileged. ERRCODE insufficient_privilege.';

DROP TRIGGER IF EXISTS protect_tenant_critical_fields_trigger ON public.tenants;
CREATE TRIGGER protect_tenant_critical_fields_trigger
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_tenant_critical_fields();

-- También proteger en INSERT: validar que el plan sea default
-- (los users usan el flow de register que setea plan='standard')
DROP TRIGGER IF EXISTS protect_tenant_insert_defaults ON public.tenants;
CREATE TRIGGER protect_tenant_insert_defaults
  BEFORE INSERT ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_tenant_critical_fields();
