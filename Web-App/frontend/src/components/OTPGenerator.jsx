import { useState, useEffect } from 'react'
import { Shield, Clock, RefreshCw, Zap } from 'lucide-react'

export default function OTPGenerator({ otp, expiresAt, onGenerate, loading }) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!expiresAt) return
    const total = 5 * 60 * 1000 // 5 minutes in ms

    const tick = () => {
      const remaining = new Date(expiresAt) - new Date()
      if (remaining <= 0) {
        setTimeLeft(0)
        setProgress(0)
        return
      }
      setTimeLeft(Math.ceil(remaining / 1000))
      setProgress((remaining / total) * 100)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isExpired = timeLeft <= 0 && otp

  const progressColor = progress > 50 ? 'bg-accent-500' :
                        progress > 20 ? 'bg-yellow-500' : 'bg-danger-500'

  return (
    <div className="glass rounded-2xl p-6 text-center space-y-6">
      {/* OTP Display */}
      <div>
        <p className="text-sm text-slate-400 mb-3 flex items-center justify-center gap-2">
          <Zap size={14} className="text-primary-400" />
          Current OTP Code
        </p>
        {otp ? (
          <div className={`font-mono text-6xl font-bold tracking-[0.3em] transition-all ${
            isExpired ? 'text-slate-600 line-through' : 'text-primary-400 otp-digit'
          }`}>
            {otp}
          </div>
        ) : (
          <div className="font-mono text-6xl font-bold tracking-[0.3em] text-dark-400 select-none">
            ????
          </div>
        )}
      </div>

      {/* Timer */}
      {otp && !isExpired && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Clock size={14} />
            <span>Expires in <strong className={`font-mono ${timeLeft < 60 ? 'text-danger-400' : 'text-slate-200'}`}>
              {String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}
            </strong></span>
          </div>
          <div className="h-1.5 bg-dark-500 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${progressColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {isExpired && (
        <div className="alert-error text-sm justify-center">
          ⏱ OTP expired — generate a new one
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={loading}
        id="btn-generate-otp"
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            {otp ? 'Regenerate OTP' : 'Generate OTP'}
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="text-xs text-slate-500 space-y-1 border-t border-white/5 pt-4">
        <p>📟 Enter this code on the hardware keypad at the gate</p>
        <p>🔒 OTP is valid for 5 minutes and single-use only</p>
        <p>📡 This page is only accessible on local WiFi network</p>
      </div>
    </div>
  )
}
