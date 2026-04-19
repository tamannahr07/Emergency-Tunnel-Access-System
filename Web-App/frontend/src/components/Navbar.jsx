import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout } from '../services/authService'
import { Shield, LogOut, LayoutDashboard } from 'lucide-react'

const steps = [
  { path: '/details',   label: 'Details',     step: 1 },
  { path: '/authorize', label: 'Authorize',   step: 2 },
  { path: '/biometric', label: 'Biometric',   step: 3 },
  { path: '/activation',label: 'ID Card',     step: 4 },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('sgs_token')
  const user  = JSON.parse(localStorage.getItem('sgs_user') || '{}')

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isLoginPage = location.pathname === '/'

  if (isLoginPage) return null

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to={token ? '/details' : '/'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">DefenderID</span>
            <p className="text-xs text-slate-500 leading-none">Smart Gate System</p>
          </div>
        </Link>

        {/* Steps progress */}
        {token && (
          <div className="hidden md:flex items-center gap-1">
            {steps.map((s, i) => {
              const isActive = location.pathname === s.path
              const paths = steps.map(x => x.path)
              const currentIdx = paths.indexOf(location.pathname)
              const isDone = currentIdx > i
              return (
                <div key={s.path} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'bg-primary-600 text-white' :
                    isDone   ? 'bg-accent-600/20 text-accent-400' :
                               'text-slate-500'
                  }`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-white text-primary-600' :
                      isDone   ? 'bg-accent-500 text-white' :
                                 'bg-dark-500 text-slate-400'
                    }`}>{isDone ? '✓' : s.step}</span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 h-px ${isDone ? 'bg-accent-500' : 'bg-dark-400'}`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Right actions */}
        {token && (
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-dark-500 transition-all">
                <LayoutDashboard size={14} />
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-danger-400 hover:bg-danger-500/10 transition-all">
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
