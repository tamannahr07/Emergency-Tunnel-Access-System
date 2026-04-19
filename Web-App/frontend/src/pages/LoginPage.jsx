import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { login } from '../services/authService'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await login(form.email, form.password)
      localStorage.setItem('sgs_token', res.data.token)
      localStorage.setItem('sgs_user', JSON.stringify(res.data.user))
      toast.success('Welcome back! 👋')
      navigate(res.data.user.role === 'admin' ? '/admin' : '/details')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email, password) => {
    setForm({ email, password })
    setError('')
  }

  return (
    <div className="page-content min-h-screen">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center shadow-glow-primary mb-4 animate-float">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">DefenderID</h1>
          <p className="text-slate-400 mt-2">Smart Gate Security System</p>
          <p className="text-slate-500 text-sm mt-1">Sign in to access the control panel</p>
        </div>

        {/* Login Card */}
        <div className="form-card">
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="alert-error mb-5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label className="form-label" htmlFor="login-email">Gmail / Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@gmail.com"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="btn-login" type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="divider mt-6"><span>Demo Accounts</span></div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '🛡 Admin',    email: 'admin@gate.local',           pass: 'admin123'    },
              { label: '🔍 Security', email: 'security@gate.local',        pass: 'security123' },
              { label: '👤 Tamanna',  email: 'tamannasaini860@gmail.com',  pass: 'tanusaini'  },
              { label: '👤 Sonakshi', email: 'sonakshidhiman12@gmail.com', pass: 'sonakshi12'  },
            ].map(d => (
              <button
                key={d.email}
                onClick={() => fillDemo(d.email, d.pass)}
                className="text-xs px-3 py-2 rounded-lg bg-dark-600 text-slate-400 hover:text-white hover:bg-dark-500 transition-all text-left"
              >
                <span className="font-medium">{d.label}</span>
                <br />
                <span className="text-slate-500">{d.email}</span>
              </button>
            ))}       
          </div>
        </div>
      </div>
    </div>
  )
}
