import { useEffect, useState } from 'react'
import { getAccessLogs, closeGate, verifyCard } from '../services/gateService'
import GateStatus from '../components/GateStatus'
import toast from 'react-hot-toast'
import { LayoutDashboard, RefreshCw, XCircle, CheckCircle, Search, CreditCard, User, Building2, Briefcase, Hash, AlertCircle } from 'lucide-react'

const EVENT_COLORS = {
  ACCESS_GRANTED:       'text-accent-400',
  GATE_OPEN:            'text-accent-400',
  RFID_SUCCESS:         'text-primary-400',
  FINGERPRINT_SUCCESS:  'text-primary-400',
  OTP_SUCCESS:          'text-primary-400',
  ACCESS_DENIED:        'text-danger-400',
  RFID_FAIL:            'text-danger-400',
  FINGERPRINT_FAIL:     'text-danger-400',
  OTP_FAIL:             'text-danger-400',
  GATE_CLOSE:           'text-slate-400',
}

const EVENT_ICONS = {
  ACCESS_GRANTED: '✅', GATE_OPEN: '🔓', RFID_SUCCESS: '📡',
  FINGERPRINT_SUCCESS: '🖐', OTP_SUCCESS: '🔢', ACCESS_DENIED: '🚫',
  RFID_FAIL: '❌', FINGERPRINT_FAIL: '❌', OTP_FAIL: '❌', GATE_CLOSE: '🔒',
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ granted: 0, denied: 0, rfid: 0 })
  
  // Security Lookup states
  const [cardNumber, setCardNumber] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupError, setLookupError] = useState(false)

  const user = JSON.parse(localStorage.getItem('sgs_user') || '{}')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await getAccessLogs()
      const l = res.data.logs
      setLogs(l)
      setStats({
        granted: l.filter(x => x.event === 'ACCESS_GRANTED' || x.event === 'GATE_OPEN').length,
        denied:  l.filter(x => x.event.includes('FAIL') || x.event === 'ACCESS_DENIED').length,
        rfid:    l.filter(x => x.event === 'RFID_SUCCESS').length,
      })
    } catch (err) {
      toast.error('Failed to load access logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const handleCloseGate = async () => {
    try {
      await closeGate()
      toast.success('Gate manually closed.')
    } catch { toast.error('Failed to close gate.') }
  }

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!cardNumber.trim()) { toast.error('Enter a card number'); return }
    setLookupLoading(true)
    setLookupResult(null)
    setLookupError(false)
    try {
      const res = await verifyCard(cardNumber.trim().toUpperCase())
      setLookupResult(res.data.data)
      toast.success('Record found!')
    } catch (err) {
      setLookupError(true)
      toast.error('No record found for this card number.')
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div className="page-content items-start py-8">
      <div className="w-full max-w-6xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-xs">Logged in as {user.email} · {user.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchLogs} className="btn-secondary flex items-center gap-1.5 text-sm px-4 py-2">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button onClick={handleCloseGate} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-danger-400 border border-danger-500/30 hover:bg-danger-500/10 transition-all">
              <XCircle size={14} />
              Close Gate
            </button>
          </div>
        </div>

        {/* Stats and Security Lookup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <GateStatus />
              {[
                { label: 'Access Granted', value: stats.granted, icon: <CheckCircle size={20} className="text-accent-400" />, color: 'text-accent-400' },
                { label: 'Access Denied',  value: stats.denied,  icon: <XCircle size={20} className="text-danger-400" />,  color: 'text-danger-400'  },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-4 flex items-center gap-3">
                  <div>{s.icon}</div>
                  <div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Access Logs */}
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-semibold text-white">Access Logs</h2>
                <span className="status-pill-blue">{logs.length} entries</span>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-primary-600/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No access logs yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                        {['Time', 'Event', 'Step', 'Employee', 'Unique Card ID'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 10).map((log, i) => (
                        <tr key={log._id || i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className={`px-4 py-3 font-medium whitespace-nowrap ${EVENT_COLORS[log.event] || 'text-slate-300'}`}>
                            {EVENT_ICONS[log.event]} {log.event}
                          </td>
                          <td className="px-4 py-3">
                            <span className="status-pill-blue">{log.step}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">{log.employeeName || '—'}</td>
                          <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                            {log.cardNumber || log.rfidUid || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Security Lookup Tool */}
          <div className="space-y-4">
            <div className="glass p-6 rounded-2xl">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Search size={18} className="text-primary-400" />
                Security Detail Lookup
              </h3>
              <form onSubmit={handleLookup} className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.toUpperCase())}
                    placeholder="Enter Card ID (e.g. 51F2D26)"
                    className="input-field pl-9 text-xs font-mono py-2"
                  />
                </div>
                <button type="submit" disabled={lookupLoading} className="btn-primary p-2">
                  {lookupLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
                </button>
              </form>

              {lookupError && (
                <div className="alert-error text-[10px] py-2">
                  <AlertCircle size={12} /> No personnel found with this ID.
                </div>
              )}

              {lookupResult && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-white/20 overflow-hidden bg-dark-600">
                      {lookupResult.employeeId?.photoPath ? (
                        <img src={`http://localhost:5000${lookupResult.employeeId.photoPath}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{lookupResult.employeeId?.fullName}</p>
                      <p className="text-primary-400 text-[10px] uppercase tracking-wider">{lookupResult.employeeId?.position}</p>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] mt-1 ${lookupResult.isActive ? 'bg-accent-500/10 text-accent-400' : 'bg-danger-500/10 text-danger-400'}`}>
                        <div className={`w-1 h-1 rounded-full ${lookupResult.isActive ? 'bg-accent-400' : 'bg-danger-400'}`} />
                        {lookupResult.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { icon: <CreditCard size={12} />, label: 'CARD ID', value: lookupResult.cardNumber },
                      { icon: <Hash size={12} />, label: 'EMP ID', value: lookupResult.employeeId?.employeeId },
                      { icon: <Building2 size={12} />, label: 'Branch', value: lookupResult.employeeId?.branch },
                      { icon: <Briefcase size={12} />, label: 'Position', value: lookupResult.employeeId?.position },
                      { icon: <User size={12} />, label: 'Gmail', value: lookupResult.employeeId?.email },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-500">{item.icon}</span>
                        <span className="text-slate-500 w-16">{item.label}:</span>
                        <span className="text-slate-300 font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!lookupResult && !lookupError && (
                <div className="bg-dark-600/50 rounded-xl p-6 text-center border border-dashed border-white/5 mt-4">
                  <User size={24} className="mx-auto text-slate-700 mb-2" />
                  <p className="text-[10px] text-slate-500">Search for a card ID to view personnel details</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a href="/details" className="glass rounded-xl p-3 text-center text-xs text-slate-400 hover:text-white transition-all">📝 New Reg</a>
              <a href="/activation" className="glass rounded-xl p-3 text-center text-xs text-slate-400 hover:text-white transition-all">💳 ID Card</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
