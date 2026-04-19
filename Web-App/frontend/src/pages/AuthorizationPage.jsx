import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyCode, getProfile } from '../services/userService'
import toast from 'react-hot-toast'
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react'

export default function AuthorizationPage() {
  const [code, setCode] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user has already submitted details
    const checkStatus = async () => {
      try {
        const res = await getProfile()
        if (!res.data.employee) {
          toast.error('Please submit your details first.')
          navigate('/details')
        } else if (res.data.employee.isVerified) {
          navigate('/biometric')
        }
      } catch (err) {
        toast.error('Session error. Please log in again.')
        navigate('/login')
      } finally {
        setChecking(false)
      }
    }
    checkStatus()
  }, [navigate])

  const handleChange = (index, value) => {
    if (isNaN(value)) return
    const newCode = [...code]
    newCode[index] = value.substring(value.length - 1)
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const verificationCode = code.join('')
    if (verificationCode.length !== 4) {
      toast.error('Please enter the 4-digit code.')
      return
    }

    setLoading(true)
    try {
      await verifyCode(verificationCode)
      toast.success('Identity Verified Successfully!')
      setTimeout(() => navigate('/biometric'), 1000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="flex-1 flex items-center justify-center bg-dark-900">
      <RefreshCw className="animate-spin text-primary-500" size={32} />
    </div>
  )

  return (
    <div className="page-content py-12">
      <div className="w-full max-w-md mx-auto animate-fade-in px-4">
        <div className="glass rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary-600 via-accent-500 to-primary-400" />
          
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-primary-500/30">
              <KeyRound size={40} className="text-primary-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">Security Authorization</h1>
            <p className="text-slate-400 text-sm mb-8">
              Enter the unique 4-digit authorization code displayed on the previous step to verify your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-14 h-16 text-center text-3xl font-bold bg-dark-700/50 border-2 border-white/10 rounded-xl focus:border-primary-500 focus:bg-dark-600 outline-none transition-all text-white"
                    placeholder="•"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ShieldCheck size={20} />
                      Verify Authorization
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/details')}
                  className="text-slate-500 hover:text-white text-xs transition-colors"
                >
                  Lost the code? Go back to details
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-xs text-center">
          <ShieldCheck size={14} className="text-accent-500" />
          <span>Double-layer encryption active • DSD Security Division</span>
        </div>
      </div>
    </div>
  )
}
