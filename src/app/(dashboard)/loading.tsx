import SidebarSkeleton from '@/components/dashboard/SidebarSkeleton'

export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      <SidebarSkeleton />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-base-100 shadow-sm border-b border-base-200 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="skeleton h-6 w-36 rounded" />
          <div className="skeleton h-8 w-8 rounded-xl" />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/60 font-medium text-sm">Cargando panel...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

