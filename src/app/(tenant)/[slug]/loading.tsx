import { Tooth } from '@/components/ui/ToothIcon'

export default function TenantLoading() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Anillo de carga giratorio */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin" />
        <div className="absolute">
          <Tooth className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
          Cargando clínica...
        </p>
      </div>
    </div>
  )
}
