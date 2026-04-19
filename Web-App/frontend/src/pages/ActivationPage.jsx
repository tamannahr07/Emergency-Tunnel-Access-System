import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateCard } from '../services/userService'
import CardPreview from '../components/CardPreview'
import toast from 'react-hot-toast'
import { CreditCard, AlertCircle } from 'lucide-react'

export default function ActivationPage() {
  const navigate = useNavigate()
  const [card, setCard] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const res = await generateCard()
        setCard(res.data.card)
        setEmployee(res.data.employee)
        toast.success('Digital ID card generated! 🎉')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to generate card.'
        setError(msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sgs_token');
    localStorage.removeItem('sgs_user');
    navigate('/');
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-primary-600/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-slate-400">Generating your digital access card...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="form-card text-center space-y-4">
          <div className="alert-error justify-center">
            <AlertCircle size={16} />
            <p>{error}</p>
          </div>
          <p className="text-slate-400 text-sm">Please complete all verification steps first.</p>
          <button onClick={() => navigate('/details')} className="btn-secondary">Restart Process</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="w-full max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="step-badge-done">✓</div>
          <div>
            <h1 className="text-2xl font-bold text-white">Access Card Generated</h1>
            <p className="text-slate-400 text-sm">Your digital ID card is ready</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card preview */}
          <div className="flex justify-center">
            <CardPreview employee={employee} card={card} />
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            {/* Card details */}
            <div className="glass rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard size={16} className="text-primary-400" />
                Card Details
              </h3>
              {[
                ['Card Number', card?.cardNumber],
                ['Employee ID', employee?.employeeId],
                ['Name', employee?.fullName],
                ['Position', employee?.position],
                ['Branch', employee?.branch],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium font-mono text-xs">{v}</span>
                </div>
              ))}
            </div>

            {/* Next steps */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Next Steps</p>
              <div className="space-y-2 text-sm">
                {[
                  { step: '1', text: 'Download your ID card (PDF/PNG)' },
                  { step: '2', text: 'Proceed to security gate' },
                  { step: '3', text: 'Verify fingerprint to enter' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary-600/30 text-primary-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                    <p className="text-slate-300">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <button id="btn-final-logout" onClick={handleLogout} className="btn-danger w-full mt-4 flex items-center justify-center gap-2">
              Finish & Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
