import { useEffect, useState } from 'react'
import { getGateStatus } from '../services/gateService'

export default function GateStatus() {
  const [gate, setGate] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getGateStatus()
        setGate(res.data.gate)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 3000)
    return () => clearInterval(interval)
  }, [])

  const isOpen = gate?.isOpen

  return (
    <div className={`glass rounded-xl p-4 flex items-center gap-4 transition-all duration-500 ${
      isOpen ? 'border-accent-500/30 bg-accent-500/5' : 'border-danger-500/20'
    }`}>
      {/* Animated gate icon */}
      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
        isOpen ? 'bg-accent-500/20' : 'bg-dark-500'
      }`}>
        <span className="text-2xl">{isOpen ? '🔓' : '🔒'}</span>
        {isOpen && (
          <div className="absolute inset-0 rounded-xl ring-pulse border-2 border-accent-500/50" />
        )}
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Gate Status</p>
        <p className={`font-bold ${isOpen ? 'text-accent-400' : 'text-slate-300'}`}>
          {gate === null ? 'Connecting...' : isOpen ? 'Open' : 'Secured'}
        </p>
        {gate?.lastOpened && (
          <p className="text-xs text-slate-500 mt-0.5">
            Last opened: {new Date(gate.lastOpened).toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className={`ml-auto w-2 h-2 rounded-full ${isOpen ? 'bg-accent-400 animate-pulse' : 'bg-slate-600'}`} />
    </div>
  )
}
