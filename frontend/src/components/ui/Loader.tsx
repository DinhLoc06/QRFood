export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400 font-medium animate-pulse">Đang tải...</p>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
      <div className="h-40 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 skeleton rounded-lg w-3/4" />
        <div className="h-4 skeleton rounded-lg w-full" />
        <div className="h-4 skeleton rounded-lg w-2/3" />
        <div className="h-10 skeleton rounded-xl mt-4" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 skeleton rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 skeleton rounded w-24" />
          <div className="h-3 skeleton rounded w-16" />
        </div>
      </div>
      <div className="h-6 skeleton rounded-full w-20" />
    </div>
  )
}

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-600">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
    </div>
  )
}
