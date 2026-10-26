import { NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/auth-context'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/wanted', label: 'Se Busca' },
  { to: '/news', label: 'News Coo' },
  { to: '/sagas', label: 'Poneglyph' },
] as const

export function AppLayout() {
  const { session, logout } = useAuth()

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-bold text-amber-300">Log Pose Console</span>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {session && (
              <span className="text-slate-400">
                {session.team.name} · <span className="font-mono text-amber-200">{session.team.code}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => logout('manual')}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-200 hover:bg-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
