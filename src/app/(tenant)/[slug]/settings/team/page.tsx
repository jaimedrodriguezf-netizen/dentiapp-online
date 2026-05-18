import { getTeamMembers, removeMember, updateMemberRole } from '../actions'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
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
  const { data: { user } } = await supabase.auth.getUser()
  const members = await getTeamMembers(slug)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${slug}/settings/profile`} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipo</h2>
          <p className="text-gray-500 mt-1">Miembros de tu clínica</p>
        </div>
      </div>

      {/* Members list */}
      <div className="card bg-white border border-gray-200 shadow-sm">
        <div className="card-body p-0">
          <div className="divide-y divide-gray-100">
            {members.map((member) => {
              const userArr = member.users as unknown as { id: string; email: string }[]
              const memberUser = (Array.isArray(userArr) ? userArr[0] : userArr) as unknown as { id: string; email: string }
              const isCurrentUser = memberUser?.id === user?.id

              return (
                <div key={member.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">
                        {memberUser?.email?.[0].toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {memberUser?.email || 'Usuario'}
                        {isCurrentUser && (
                          <span className="text-xs text-gray-400 ml-2">(vos)</span>
                        )}
                      </p>
                      {member.role && (
                        <form action={async (fd: FormData) => {
                          'use server'
                          await updateMemberRole(slug, member.id, fd)
                        }} className="mt-0.5">
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="text-xs border border-gray-200 rounded-md px-2 py-0.5 text-gray-600 focus:border-blue-500 focus:outline-none"
                          >
                            {Object.entries(roleLabels).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="hidden"></button>
                        </form>
                      )}
                    </div>
                  </div>
                  {!isCurrentUser && member.role !== 'admin' && (
                    <form action={async () => {
                      'use server'
                      await removeMember(slug, member.id)
                    }}>
                      <button
                        type="submit"
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
        Para agregar un miembro, pedile que se registre en DentiApp y despues agregalo desde acá con su email.
      </div>
    </div>
  )
}
