export type ClinicPlan = 'free' | 'standard' | 'business'
export type UserRole = 'admin' | 'supervisor' | 'doctor' | 'nurse' | 'receptionist'

export interface Clinic {
  id: string
  name: string
  slug: string
  plan: ClinicPlan
  logo_url: string | null
  phone: string | null
  address: string | null
  business_hours?: string | null
  whatsapp_number?: string | null
  theme_colors?: string | null
}

export interface ClinicMembership {
  id?: string
  role: UserRole
  tenant_id: string
  user_id?: string
  tenants: Clinic
}
