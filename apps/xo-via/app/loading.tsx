/**
 * Global loading skeleton. Next streams this in while the route's RSC
 * payload is fetched, so the layoutId transition from icon to AppView
 * has something to animate to even before the page body arrives.
 */
export default function Loading() {
  return (
    <div className="p-5 text-white/40 text-sm">
      <div className="animate-pulse">
        <div className="h-6 w-24 bg-white/10 rounded mb-3" />
        <div className="h-4 w-3/4 bg-white/5 rounded mb-2" />
        <div className="h-4 w-2/3 bg-white/5 rounded" />
      </div>
    </div>
  )
}
