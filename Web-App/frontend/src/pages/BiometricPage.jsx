import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FingerprintScan from '../components/FingerprintScan'
import { biometricDone } from '../services/userService'
import toast from 'react-hot-toast'
import { CheckCircle, ChevronRight } from 'lucide-react'

export default function BiometricPage() {
  const navigate = useNavigate()
  const [scanned, setScanned] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleScanComplete = () => {
    setScanned(true)
  }

  const handleAuthorize = async () => {
    setLoading(true)
    try {
      await biometricDone()
      toast.success('Biometric verified! Generating your ID card...')
      setTimeout(() => navigate('/activation'), 800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Biometric step failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-content">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="step-badge">4</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Biometric Verification</h1>
            <p className="text-slate-400 text-sm">Scan your fingerprint to continue</p>
          </div>
        </div>

        <div className="glass p-8 shadow-glass space-y-8">
          {/* Fingerprint scanner */}
          <FingerprintScan onScanComplete={handleScanComplete} />

          {/* Fingerprint info */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: '🔐', label: 'Encrypted', desc: 'Stored locally only' },
              { icon: '⚡', label: 'Fast Match', desc: 'Under 2 seconds' },
              { icon: '🎯', label: '99.9%', desc: 'Match accuracy' },
            ].map(item => (
              <div key={item.label} className="glass rounded-xl p-3">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-white text-xs font-semibold">{item.label}</p>
                <p className="text-slate-500 text-[10px]">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Authorize button — enabled after scan */}
          {scanned && (
            <div className="space-y-4 animate-fade-in">
              <div className="alert-success">
                <CheckCircle size={16} className="shrink-0" />
                <p className="text-sm">Fingerprint scan complete. Click below to authorize access.</p>
              </div>
              <button
                id="btn-authorize-access"
                onClick={handleAuthorize}
                disabled={loading}
                className="btn-success w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    Authorize Access
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Note */}
        <div className="mt-4 text-center text-slate-500 text-xs">
          <p>🛡 On real hardware, this step uses your ESP32 fingerprint sensor (AS608/R307)</p>
        </div>
      </div>
    </div>
  )
}
