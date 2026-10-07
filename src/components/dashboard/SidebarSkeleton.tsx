export default function SidebarSkeleton() {
  return (
    <aside
      aria-label="Cargando menú lateral"
      className="w-64 bg-base-100 h-full shadow-xl flex flex-col border-r border-base-200 select-none animate-pulse"
    >
      {/* Clinic Header Placeholder */}
      <div className="p-4 border-b border-base-200 flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="skeleton h-3.5 w-28 rounded" />
          <div className="skeleton h-2.5 w-16 rounded" />
        </div>
      </div>

      {/* Navigation Items Placeholder */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-base-200/50"
          >
            <div className="skeleton w-5 h-5 rounded-lg shrink-0" />
            <div
              className="skeleton h-3 rounded"
              style={{ width: `${60 + (index % 4) * 15}%` }}
            />
          </div>
        ))}
      </nav>

      {/* Footer / Logout Placeholder */}
      <div className="p-4 border-t border-base-200 bg-base-100/50 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-base-200/50">
          <div className="skeleton w-5 h-5 rounded-lg shrink-0" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="skeleton h-2 w-12 mx-auto rounded" />
      </div>
    </aside>
  )
}
