import { useRef } from 'react'
import { Shield, CreditCard, Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function CardPreview({ employee, card }) {
  const cardRef = useRef(null)

  const downloadPNG = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = `${card.cardNumber}-id-card.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadPDF = async () => {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [90, 57] })
    pdf.addImage(imgData, 'PNG', 0, 0, 90, 57)
    pdf.save(`${card.cardNumber}-id-card.pdf`)
  }

  if (!employee || !card) return null

  const photoUrl = employee.photoPath
    ? `http://localhost:5000${employee.photoPath}`
    : null

  return (
    <div className="space-y-6">
      {/* ID Card */}
      <div
        ref={cardRef}
        id="digital-id-card"
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          width: '400px',
          height: '240px',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/20"
              style={{ width: `${80 + i * 60}px`, height: `${80 + i * 60}px`, top: '-20px', right: '-20px' }} />
          ))}
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-4 pb-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xs tracking-wider">DEFENDER ID</p>
              <p className="text-purple-300 text-[9px] tracking-widest">SMART GATE SECURITY</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-300 text-[9px] tracking-widest">ACCESS CARD</p>
            <p className="text-white font-mono text-[10px] font-bold">{card.cardNumber}</p>
          </div>
        </div>

        {/* Body */}
        <div className="relative flex gap-4 px-5 pt-3">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/30 bg-dark-600">
              {photoUrl ? (
                <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 text-3xl">
                  👤
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight truncate">{employee.fullName}</h3>
            <p className="text-purple-300 text-xs font-medium mt-0.5">{employee.position}</p>
            <div className="mt-2 space-y-0.5">
              <p className="text-purple-200 text-[10px]"><span className="text-purple-400 uppercase tracking-wider text-[9px]">ID: </span>{employee.employeeId}</p>
              <p className="text-purple-200 text-[10px]"><span className="text-purple-400 uppercase tracking-wider text-[9px]">Branch: </span>{employee.branch}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-3 flex items-end justify-between">
          {/* Barcode simulation */}
          <div className="flex gap-px items-end h-8">
            {[3,5,2,7,4,6,3,8,2,5,4,7,3,6,5,2,8,4].map((h, i) => (
              <div key={i} className="bg-white/60 w-0.5" style={{ height: `${h * 3}px` }} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-[9px] text-purple-300">{card.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
          </div>
        </div>

        {/* Holographic overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <button onClick={downloadPNG} id="btn-download-png" className="btn-secondary flex items-center gap-2 flex-1 justify-center">
          <Download size={16} />
          Download PNG
        </button>
        <button onClick={downloadPDF} id="btn-download-pdf" className="btn-primary flex items-center gap-2 flex-1 justify-center">
          <CreditCard size={16} />
          Download PDF
        </button>
      </div>
    </div>
  )
}
