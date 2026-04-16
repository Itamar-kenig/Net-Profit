import { useEffect } from 'react'

export default function InfoModal({ symbol, color, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#111827', border: '1px solid #374151', borderRadius: 12,
          padding: 24, width: '100%', maxWidth: 480, maxHeight: '80vh',
          overflowY: 'auto', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          <h2 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 20, margin: 0 }}>{symbol}</h2>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: '#6b7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#9ca3af', fontSize: 13 }}>מידע נוסף בקרוב...</p>
      </div>
    </div>
  )
}
