import { useState } from 'react'

export default function FingerprintScan({ onScanComplete }) {
  const [state, setState] = useState('idle') // idle | scanning | success

  const handleScan = async () => {
    setState('scanning')
    // Simulate 3s scan
    await new Promise(r => setTimeout(r, 3000))
    setState('success')
    if (onScanComplete) onScanComplete()
  }

  const ringColor = state === 'success' ? '#10b981' : state === 'scanning' ? '#6366f1' : '#374151'
  const glowColor = state === 'success' ? 'shadow-glow-green' : state === 'scanning' ? 'shadow-glow-primary ring-pulse' : ''

  return (
    <div className="flex flex-col items-center gap-8">
      {/* SVG Fingerprint */}
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${glowColor}`}
        style={{ border: `3px solid ${ringColor}`, boxShadow: state === 'idle' ? 'none' : undefined }}>
        
        {/* Scanning beam overlay */}
        {state === 'scanning' && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent"
              style={{ top: '15%' }} />
          </div>
        )}

        <svg viewBox="0 0 100 100" className={`w-32 h-32 transition-all duration-500 ${
          state === 'success' ? 'opacity-100' : state === 'scanning' ? 'opacity-70' : 'opacity-40'
        }`}>
          {/* Fingerprint ridges */}
          {[
            "M50 15 Q50 15 50 15",
            "M50 18 Q65 18 72 30 Q79 42 79 50 Q79 63 72 72 Q65 81 50 81 Q35 81 28 72 Q21 63 21 50 Q21 37 28 28 Q35 18 50 18",
            "M50 24 Q60 24 66 33 Q72 42 72 50 Q72 60 66 67 Q60 74 50 74 Q40 74 34 67 Q28 60 28 50 Q28 40 34 33 Q40 24 50 24",
            "M50 30 Q57 30 61 38 Q65 45 65 50 Q65 57 61 62 Q57 68 50 68 Q43 68 39 62 Q35 57 35 50 Q35 44 39 38 Q43 30 50 30",
            "M50 37 Q54 37 57 43 Q60 48 60 50 Q60 54 57 57 Q54 62 50 62 Q46 62 43 57 Q40 54 40 50 Q40 47 43 43 Q46 37 50 37",
            "M50 44 Q52 44 54 47 Q56 49 56 50 Q56 52 54 54 Q52 56 50 56 Q48 56 46 54 Q44 52 44 50 Q44 49 46 47 Q48 44 50 44",
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={state === 'success' ? '#10b981' : state === 'scanning' ? '#818cf8' : '#6b7280'}
              strokeWidth="1.8"
              strokeLinecap="round"
              style={{
                transition: 'stroke 0.5s ease',
                strokeDasharray: state === 'scanning' ? '4 2' : 'none',
                animation: state === 'scanning' ? `dash 1s ${i * 0.15}s linear infinite` : 'none',
              }}
            />
          ))}
          {/* Touch indicator center */}
          <circle cx="50" cy="50" r="3" fill={state === 'success' ? '#10b981' : state === 'scanning' ? '#6366f1' : '#4b5563'} />
        </svg>

        {/* Status overlay icon */}
        {state === 'success' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-xl">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        {state === 'idle' && (
          <>
            <p className="text-slate-300 font-medium">Place your finger on the sensor</p>
            <p className="text-slate-500 text-sm">Click the button below to begin scanning</p>
          </>
        )}
        {state === 'scanning' && (
          <>
            <p className="text-primary-400 font-medium animate-pulse">Scanning fingerprint...</p>
            <p className="text-slate-500 text-sm">Please hold still</p>
          </>
        )}
        {state === 'success' && (
          <>
            <p className="text-accent-400 font-semibold">✓ Fingerprint Verified!</p>
            <p className="text-slate-500 text-sm">Biometric authentication complete</p>
          </>
        )}
      </div>

      {/* Scan button */}
      {state !== 'success' && (
        <button
          id="btn-scan-fingerprint"
          onClick={handleScan}
          disabled={state === 'scanning'}
          className={`btn-primary flex items-center gap-2 ${state === 'scanning' ? 'opacity-75 cursor-wait' : ''}`}
        >
          {state === 'scanning' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Scanning...
            </>
          ) : (
            '🫆 Scan Fingerprint'
          )}
        </button>
      )}

      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -12; }
        }
      `}</style>
    </div>
  )
}
