import { getTeamMembers, removeMember, updateMemberRole } from '../actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Trash2, User, ShieldCheck, Mail, Info } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

interface UserData {
  id: string
  email: string
  raw_user_meta_data: {
    name?: string
  }
}

interface Member {
  id: string
  role: string
  users: UserData | UserData[]
}

const roleLabels: Record<string, string> = {
  supervisor: 'Supervisor',
  admin: 'Admin',
  doctor: 'Doctor',
  nurse: 'Enfermero',
  receptionist: 'Admisión',
}

export default async function TeamSettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  const membersRaw = await getTeamMembers(slug)
  const members = (membersRaw as unknown as Member[]) || []

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 px-4 md:px-0">
        <Link href={`/${slug}/settings/profile`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Equipo</h2>
          <p className="text-gray-500 font-medium">Gestioná los especialistas de tu clínica</p>
        </div>
      </div>

      {/* Members list - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 md:px-0">
        {members.map((member) => {
          const userArr = member.users
          const memberUser = Array.isArray(userArr) ? userArr[0] : userArr
          const isCurrentUser = memberUser?.id === user?.id
          const memberName = memberUser?.raw_user_meta_data?.name || memberUser?.email?.split('@')[0] || 'Usuario'

          return (
            <div 
              key={member.id} 
              className={`bg-white border-2 rounded-[32px] overflow-hidden transition-all shadow-sm ${
                isCurrentUser ? 'border-blue-500 ring-4 ring-blue-500/5' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                      isCurrentUser ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {memberName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-gray-900 leading-tight truncate">
                        {memberName}
                        {isCurrentUser && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg uppercase tracking-widest">Vos</span>}
                      </p>
                      <p className="text-xs font-medium text-gray-400 flex items-center gap-1 mt-1 truncate">
                        <Mail className="w-3 h-3" /> {memberUser?.email}
                      </p>
                    </div>
                  </div>

                  {!isCurrentUser && member.role !== 'admin' && (
                    <form action={async () => {
                      'use server'
                      await removeMember(slug, member.id)
                    }}>
                      <button
                        type="submit"
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </form>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Rol en la Clínica
                  </label>
                  <form action={async (fd: FormData) => {
                    'use server'
                    await updateMemberRole(slug, member.id, fd)
                  }}>
                    <select
                      name="role"
                      defaultValue={member.role}
                      disabled={isCurrentUser || member.role === 'admin'}
                      className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none transition-all appearance-none disabled:opacity-60"
                    >
                      {Object.entries(roleLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="hidden"></button>
                  </form>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="mx-4 md:mx-0 p-6 bg-blue-50 border-2 border-blue-100 rounded-[32px] flex gap-4">
        <div className="p-3 bg-blue-600 text-white rounded-2xl h-fit">
          <Info className="w-6 h-6" />
        </div>
        <div className="text-sm">
          <p className="font-black text-blue-900 uppercase tracking-wide mb-1">¿Cómo agregar gente?</p>
          <p className="text-blue-800 leading-relaxed font-medium">
            Pedile a tu colega que se registre en **DentiApp Online**. Una vez que tenga su cuenta, vas a poder agregarlo desde este panel usando su correo electrónico.
          </p>
        </div>
      </div>
    </div>
  )
}
