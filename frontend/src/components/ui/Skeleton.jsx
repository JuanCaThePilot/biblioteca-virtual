export function ResourceSkeleton() {
  return (
    <div className="glass shimmer rounded-[1.75rem] p-5">
      <div className="mb-5 flex gap-3">
        <div className="h-12 w-12 rounded-2xl bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
      </div>
      <div className="mt-6 h-10 rounded-full bg-white/10" />
    </div>
  )
}
