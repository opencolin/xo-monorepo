import { xoApp } from "./app"
import { XOAppShell } from "@/components/XOAppShell"

export const metadata = xoApp.metadata

type User = {
  id: number
  name: string
  username: string
  email: string
  company?: { name?: string }
}

const API_BASE = "https://jsonplaceholder.typicode.com"

async function listUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}${xoApp.endpoint}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<User[]>
}

export default async function ApiDemoPage() {
  let users: User[] = []
  let error: string | null = null
  try {
    users = await listUsers()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <XOAppShell app={xoApp}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl p-3 mb-3">
          Fetch failed: {error}
        </div>
      )}

      {!error && users.length === 0 && (
        <p className="text-white/40 text-sm">No users returned.</p>
      )}

      {users.slice(0, 6).map(u => (
        <section
          key={u.id}
          className="bg-phone-card2 rounded-xl p-4 mb-3"
        >
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-white font-semibold">{u.name}</h2>
            <span className="text-white/40 text-xs font-mono">@{u.username}</span>
          </div>
          <p className="text-white/60 text-sm">{u.email}</p>
          {u.company?.name && (
            <p className="text-white/40 text-xs mt-1">{u.company.name}</p>
          )}
        </section>
      ))}

      {!error && users.length > 6 && (
        <p className="text-white/30 text-xs text-center mt-2">
          Showing 6 of {users.length}.
        </p>
      )}
    </XOAppShell>
  )
}
