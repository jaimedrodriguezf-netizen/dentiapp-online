-- =====================================================
-- MIGRACIÓN 012: Fix trigger protect_tenant_critical_fields para INSERT
-- =====================================================
-- El trigger usaba NEW.plan IS DISTINCT FROM OLD.plan en su cuerpo.
-- OLD no existe en BEFORE INSERT triggers. Si un user real intentaba
-- crear un tenant via el flow de register, el trigger explotaba
-- con error de OLD no asignado (solo NO explotaba para superuser
-- porque el bypass se ejecuta ANTES del check).
--
-- Fix: distinguir TG_OP. En INSERT, validar que el plan sea free|standard.
-- En UPDATE, validar columnas inmutables.
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

  IF TG_OP = 'INSERT' THEN
    -- En INSERT: solo permitir plan free|standard
    -- business solo se asigna via service_role (billing webhook)
    IF NEW.plan NOT IN ('free', 'standard') THEN
      RAISE EXCEPTION 'El plan "%" solo puede asignarse via el sistema de billing', NEW.plan
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- En UPDATE: proteger columnas inmutables
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
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.protect_tenant_critical_fields() IS
  'Trigger: INSERT rechaza plan!=free|standard. UPDATE rechaza cambios en plan/slug/id/created_at. service_role y platform_admin bypasean.';
