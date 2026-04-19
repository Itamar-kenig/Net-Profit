import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function InfoModal({ symbol, color, onClose }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    let cancelled = false

    const cacheKey = `np-info-${symbol}`
    if (refreshCount > 0) { try { localStorage.removeItem(cacheKey) } catch {} }

    const cached = refreshCount === 0 ? (() => {
      try {
        const item = localStorage.getItem(cacheKey)
        if (!item) return null
        const { text, ts } = JSON.parse(item)
        if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) { localStorage.removeItem(cacheKey); return null }
        return text
      } catch { return null }
    })() : null

    if (cached) { setInfo(cached); setLoading(false); return }

    setLoading(true)
    setInfo(null)
    setError(null)

    supabase.functions.invoke('get-symbol-info', { body: { symbol } })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(`שגיאת רשת: ${err.message}`)
        } else if (!data?.success) {
          setError(`שגיאה: ${data?.error || 'תגובה לא תקינה'}`)
        } else {
          try { localStorage.setItem(cacheKey, JSON.stringify({ text: data.info, ts: Date.now() })) } catch {}
          setInfo(data.info)
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [symbol, refreshCount])

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
          padding: 'clamp(14px, 4vw, 24px)', width: '100%', maxWidth: 480, maxHeight: '85vh',
          overflowY: 'auto', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
          <h2 style={{ color: '#f9fafb', fontWeight: 700, fontSize: 20, margin: 0 }}>{symbol}</h2>
          <button
            onClick={() => setRefreshCount((c) => c + 1)}
            disabled={loading}
            title="רענן מידע"
            style={{
              marginLeft: 'auto', background: 'none', border: '1px solid #374151', borderRadius: 6,
              color: loading ? '#374151' : '#6b7280', cursor: loading ? 'default' : 'pointer',
              fontSize: 16, padding: '2px 8px', lineHeight: 1.4,
            }}
          >
            ↺
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: '#6b7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#9ca3af', fontSize: 14 }}>
            <div style={{ width: 16, height: 16, border: '2px solid #4ade80', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            טוען מידע...
          </div>
        )}

        {error && (
          <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
        )}

        {info && (
          <p style={{ color: '#d1d5db', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{info}</p>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
