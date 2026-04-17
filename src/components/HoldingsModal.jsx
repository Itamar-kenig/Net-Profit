import { useEffect } from 'react'

export default function HoldingsModal({ symbol, color, holdings = [], onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const maxPct = holdings.length > 0 ? Math.max(...holdings.map((h) => h.pct)) : 1

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  }
  const card = {
    background: '#111827', border: '1px solid #374151', borderRadius: 12,
    width: '100%', maxWidth: 480, maxHeight: '80vh', overflowY: 'auto',
    padding: 24, direction: 'rtl',
  }
  const th = {
    padding: '6px 10px', color: '#6b7280', fontWeight: 500, fontSize: 12,
    borderBottom: '1px solid #1f2937', textAlign: 'right',
  }
  const td = { padding: '8px 10px', fontSize: 13 }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{symbol}</span>
            <span style={{ color: '#6b7280', fontSize: 13 }}>— הרכב קרן</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {/* Table */}
        {holdings.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 28 }}>#</th>
                <th style={th}>שם</th>
                <th style={{ ...th, width: 48, textAlign: 'left' }}>%</th>
                <th style={{ ...th, width: '38%' }} />
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ ...td, color: '#4b5563', width: 28 }}>{i + 1}</td>
                  <td style={{ ...td, color: '#e5e7eb' }}>{h.name}</td>
                  <td style={{ ...td, fontFamily: 'monospace', color: '#d1d5db', width: 48, textAlign: 'left' }}>
                    {h.pct}%
                  </td>
                  <td style={{ ...td, paddingLeft: 0 }}>
                    <div style={{ background: '#1f2937', borderRadius: 3, height: 8 }}>
                      <div style={{
                        background: color, borderRadius: 3, height: 8,
                        width: `${(h.pct / maxPct) * 100}%`,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
            אין נתוני הרכב זמינים
          </p>
        )}

        {/* Footer */}
        <p style={{ color: '#4b5563', fontSize: 11, marginTop: 12 }}>
          * נכסים משוערים, ייתכנו שינויים
        </p>
      </div>
    </div>
  )
}
