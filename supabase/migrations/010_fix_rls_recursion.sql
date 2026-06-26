-- =====================================================
-- MIGRACIÓN 010: Fix recursión infinita en RLS
-- =====================================================
-- El patrón original `tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())`
-- causa recursión infinita porque la policy de tenant_members se aplica también al subselect.
--
-- Solución: función helper con SECURITY DEFINER que retorna ARRAY de tenant_ids del user.
-- Postgres no permite SETOF en policies, por eso usamos array.
--
-- Performance bonus: como la función es STABLE, Postgres cachea el resultado por query,
-- en vez de ejecutar el subselect por cada fila evaluada por la policy.
-- =====================================================

-- 1. DROP function viejo si existe (puede no existir en BDs nuevas)
DROP FUNCTION IF EXISTS public.current_user_tenant_ids();

-- 2. CREATE la función helper
CREATE FUNCTION public.current_user_tenant_ids()
RETURNS UUID[]
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(tenant_id), '{}'::UUID[])
  FROM public.tenant_members
  WHERE user_id = auth.uid();
$$;

COMMENT ON FUNCTION public.current_user_tenant_ids() IS
  'Devuelve ARRAY de tenant_ids del usuario actual. SECURITY DEFINER bypasea RLS para evitar recursión. STABLE = cachea por query.';

-- 3. DROP todas las policies con el patrón viejo
DROP POLICY IF EXISTS "Members can view members of their tenants" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can insert members" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can delete members" ON public.tenant_members;
DROP POLICY IF EXISTS "Tenant admins can update their tenant" ON public.tenants;
DROP POLICY IF EXISTS "Members can view their tenant patients" ON public.patients;
DROP POLICY IF EXISTS "Members can insert their tenant patients" ON public.patients;
DROP POLICY IF EXISTS "Members can update their tenant patients" ON public.patients;
DROP POLICY IF EXISTS "Admins can delete their tenant patients" ON public.patients;
DROP POLICY IF EXISTS "Members can view their tenant appointments" ON public.appointments;
DROP POLICY IF EXISTS "Members can insert their tenant appointments" ON public.appointments;
DROP POLICY IF EXISTS "Members can update their tenant appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete their tenant appointments" ON public.appointments;
DROP POLICY IF EXISTS "Members can view their tenant dental records" ON public.dental_records;
DROP POLICY IF EXISTS "Members can insert their tenant dental records" ON public.dental_records;
DROP POLICY IF EXISTS "Members can update their tenant dental records" ON public.dental_records;
DROP POLICY IF EXISTS "Doctors can delete their tenant dental records" ON public.dental_records;
DROP POLICY IF EXISTS "Members can view odontogram teeth" ON public.odontogram_teeth;
DROP POLICY IF EXISTS "Members can manage odontogram teeth" ON public.odontogram_teeth;
DROP POLICY IF EXISTS "Members can view their tenant prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Members can insert their tenant prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Members can update their tenant prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Doctors can delete their tenant prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Members can view periodontograms" ON public.periodontograms;
DROP POLICY IF EXISTS "Members can manage periodontograms" ON public.periodontograms;
DROP POLICY IF EXISTS "Members can view role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins can manage operating hours" ON public.operating_hours;
DROP POLICY IF EXISTS "Members can view their tenant consents" ON public.consents;
DROP POLICY IF EXISTS "Admins can delete their tenant consents" ON public.consents;
DROP POLICY IF EXISTS "Members can insert feedbacks for their tenant" ON public.support_feedbacks;
DROP POLICY IF EXISTS "Members can view feedbacks for their tenant" ON public.support_feedbacks;
DROP POLICY IF EXISTS "Privileged roles can update feedbacks" ON public.support_feedbacks;
DROP POLICY IF EXISTS "Privileged roles can delete feedbacks" ON public.support_feedbacks;
DROP POLICY IF EXISTS "Authenticated users can insert audit logs for their tenant" ON public.audit_logs;
DROP POLICY IF EXISTS "Privileged roles can read audit logs for their tenant" ON public.audit_logs;
DROP POLICY IF EXISTS "Members can view treatment sessions" ON public.treatment_sessions;
DROP POLICY IF EXISTS "Members can manage treatment sessions" ON public.treatment_sessions;
DROP POLICY IF EXISTS "Members can view vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Members can manage vital signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Members can view nursing notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Members can manage nursing notes" ON public.nursing_notes;
DROP POLICY IF EXISTS "Members can view stomatognathic exam" ON public.stomatognathic_exam;
DROP POLICY IF EXISTS "Members can manage stomatognathic exam" ON public.stomatognathic_exam;

-- 4. CREATE de nuevo usando current_user_tenant_ids() con = ANY()
-- tenants
CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  USING (
    id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = public.tenants.id
        AND tm.role = 'admin'
    )
  );

-- tenant_members
CREATE POLICY "Members can view members of their tenants"
  ON public.tenant_members FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Admins can insert members"
  ON public.tenant_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = tenant_members.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can update members"
  ON public.tenant_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = tenant_members.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can delete members"
  ON public.tenant_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = tenant_members.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

-- patients
CREATE POLICY "Members can view their tenant patients"
  ON public.patients FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can insert their tenant patients"
  ON public.patients FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can update their tenant patients"
  ON public.patients FOR UPDATE
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Admins can delete their tenant patients"
  ON public.patients FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = patients.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- appointments
CREATE POLICY "Members can view their tenant appointments"
  ON public.appointments FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can insert their tenant appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can update their tenant appointments"
  ON public.appointments FOR UPDATE
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Admins can delete their tenant appointments"
  ON public.appointments FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = appointments.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- dental_records
CREATE POLICY "Members can view their tenant dental records"
  ON public.dental_records FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can insert their tenant dental records"
  ON public.dental_records FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can update their tenant dental records"
  ON public.dental_records FOR UPDATE
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Doctors can delete their tenant dental records"
  ON public.dental_records FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = dental_records.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- odontogram_teeth
CREATE POLICY "Members can view odontogram teeth"
  ON public.odontogram_teeth FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can manage odontogram teeth"
  ON public.odontogram_teeth FOR ALL
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

-- treatment_sessions
CREATE POLICY "Members can view treatment sessions"
  ON public.treatment_sessions FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

CREATE POLICY "Members can manage treatment sessions"
  ON public.treatment_sessions FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

-- prescriptions
CREATE POLICY "Members can view their tenant prescriptions"
  ON public.prescriptions FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can insert their tenant prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can update their tenant prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Doctors can delete their tenant prescriptions"
  ON public.prescriptions FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = prescriptions.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- vital_signs
CREATE POLICY "Members can view vital signs"
  ON public.vital_signs FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

CREATE POLICY "Members can manage vital signs"
  ON public.vital_signs FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

-- nursing_notes
CREATE POLICY "Members can view nursing notes"
  ON public.nursing_notes FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

CREATE POLICY "Members can manage nursing notes"
  ON public.nursing_notes FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

-- stomatognathic_exam
CREATE POLICY "Members can view stomatognathic exam"
  ON public.stomatognathic_exam FOR SELECT
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

CREATE POLICY "Members can manage stomatognathic exam"
  ON public.stomatognathic_exam FOR ALL
  USING (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  )
  WITH CHECK (
    dental_record_id IN (
      SELECT id FROM public.dental_records
      WHERE tenant_id = ANY(public.current_user_tenant_ids())
    )
  );

-- periodontograms
CREATE POLICY "Members can view periodontograms"
  ON public.periodontograms FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can manage periodontograms"
  ON public.periodontograms FOR ALL
  USING (tenant_id = ANY(public.current_user_tenant_ids()))
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

-- role_permissions
CREATE POLICY "Members can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Admins can manage role permissions"
  ON public.role_permissions FOR ALL
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = role_permissions.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = role_permissions.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

-- operating_hours
CREATE POLICY "Admins can manage operating hours"
  ON public.operating_hours FOR ALL
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = operating_hours.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  )
  WITH CHECK (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = operating_hours.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

-- consents
CREATE POLICY "Members can view their tenant consents"
  ON public.consents FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Admins can delete their tenant consents"
  ON public.consents FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = consents.tenant_id
        AND tm.role IN ('admin', 'supervisor')
    )
  );

-- support_feedbacks
CREATE POLICY "Members can insert feedbacks for their tenant"
  ON public.support_feedbacks FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Members can view feedbacks for their tenant"
  ON public.support_feedbacks FOR SELECT
  USING (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Privileged roles can update feedbacks"
  ON public.support_feedbacks FOR UPDATE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = support_feedbacks.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  )
  WITH CHECK (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = support_feedbacks.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

CREATE POLICY "Privileged roles can delete feedbacks"
  ON public.support_feedbacks FOR DELETE
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = support_feedbacks.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- audit_logs
CREATE POLICY "Authenticated users can insert audit logs for their tenant"
  ON public.audit_logs FOR INSERT
  WITH CHECK (tenant_id = ANY(public.current_user_tenant_ids()));

CREATE POLICY "Privileged roles can read audit logs for their tenant"
  ON public.audit_logs FOR SELECT
  USING (
    tenant_id = ANY(public.current_user_tenant_ids())
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.tenant_id = audit_logs.tenant_id
        AND tm.role IN ('admin', 'supervisor', 'doctor')
    )
  );

-- Grant execute a la función
GRANT EXECUTE ON FUNCTION public.current_user_tenant_ids() TO authenticated, anon;
