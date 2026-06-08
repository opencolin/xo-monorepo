/**
 * Streaming skeleton for the API demo. Renders during the
 * server-side fetch so the layoutId icon-morph has something to
 * draw to until the data arrives.
 */
export default function Loading() {
  return (
    <div className="p-5">
      <div className="animate-pulse">
        <div className="h-6 w-20 bg-white/10 rounded mb-6" />
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-phone-card2 rounded-xl mb-3" />
        ))}
      </div>
    </div>
  )
}
