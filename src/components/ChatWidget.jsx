import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useIsMobile } from '../hooks/useIsMobile'

const WELCOME_MESSAGES = [
  'ברוכים הבאים 👋 אני איתמר — היועץ הפיננסי האישי שלך (לפחות עד שהשוק מחליט אחרת 📉📈). כאן אנחנו לא מנחשים… אנחנו מנסים להישאר ברווח 😄 איך אפשר לעזור לך היום בעולם ההשקעות?',
  'היי! אני איתמר 💼 היועץ שלך להשקעות, החלטות פיננסיות… ולפעמים גם לנחמה אחרי ירידות בשוק 😅 תגיד לי מה אתה מחפש — ואני אנסה לא להרוס לך את התיק 😉',
  'שלום 👋 אני איתמר — היועץ הפיננסי שלך. אני כאן כדי לעזור לך להשקיע חכם… או לפחות פחות להתחרט אחרי זה 😄📉📈 יאללה, במה מתחילים?',
  'היי! אני איתמר 💼 היועץ שלך להשקעות. אני לא מבטיח שתהיה מיליונר… אבל אני כן מבטיח שיהיה מעניין בדרך 😄💸 איך אפשר לעזור?',
  'שלום וברוך הבא 👋 אני איתמר — היועץ הפיננסי שלך. אני מבין במספרים, גרפים וקצת גם בחיים… אבל בעיקר בלנסות לא להמליץ לך על משהו שתתחרט עליו 😅📊',
  'היי, אני איתמר 📈 היועץ הפיננסי שלך. בוא נראה אם נצליח לגרום לכסף שלך להתנהג יפה 😄💰',
  'שלום 👋 אני איתמר — היועץ הפיננסי שלך. אני לא קורא את העתיד… אבל אני כן יודע לקרוא גרפים (וזה כבר חצי ניצחון 😄📊)',
]

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const isMobile = useIsMobile()

  function handleOpen() {
    if (!open && messages.length === 0) {
      const welcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
      setMessages([{ role: 'assistant', content: welcome }])
    }
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setLoading(true)
    const { data } = await supabase.functions.invoke('get-symbol-info', {
      body: { messages: next.map((m) => ({ role: m.role, content: m.content })) },
    })
    setLoading(false)
    setMessages([...next, {
      role: 'assistant',
      content: data?.reply || 'מצטער, משהו השתבש. נסה שוב 🙏',
    }])
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const panelW = isMobile ? 'calc(100vw - 24px)' : 360
  const panelH = isMobile ? 'calc(100vh - 100px)' : 500

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          style={{
            position: 'fixed', bottom: 20, right: 20, zIndex: 100,
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            border: 'none', cursor: 'pointer', fontSize: 24,
            boxShadow: '0 4px 16px rgba(74,222,128,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="שאל את איתמר"
        >
          💬
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 100,
          width: panelW, height: panelH,
          background: '#111827', border: '1px solid #1f2937',
          borderRadius: 14, display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderBottom: '1px solid #1f2937',
            background: '#0f172a', flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>💼</span>
            <div>
              <div style={{ color: '#f9fafb', fontWeight: 700, fontSize: 14 }}>איתמר</div>
              <div style={{ color: '#4ade80', fontSize: 11 }}>יועץ פיננסי • מחובר</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#6b7280', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4,
              }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%', padding: '8px 12px', borderRadius: 12, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? '#16a34a' : '#1f2937',
                  color: m.role === 'user' ? '#f0fdf4' : '#d1d5db',
                  borderBottomRightRadius: m.role === 'user' ? 3 : 12,
                  borderBottomLeftRadius: m.role === 'assistant' ? 3 : 12,
                  direction: 'rtl', textAlign: 'right',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: '#1f2937', borderRadius: 12, borderBottomLeftRadius: 3, padding: '10px 14px', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map((j) => (
                    <span key={j} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
                      display: 'inline-block',
                      animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', gap: 8, padding: '10px 12px',
            borderTop: '1px solid #1f2937', background: '#0f172a', flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="שאל שאלה פיננסית..."
              disabled={loading}
              style={{
                flex: 1, background: '#1f2937', border: '1px solid #374151',
                borderRadius: 8, padding: '8px 12px', color: '#f9fafb',
                fontSize: 13, outline: 'none', direction: 'rtl', textAlign: 'right',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                background: input.trim() && !loading ? '#16a34a' : '#1f2937',
                border: 'none', borderRadius: 8, padding: '8px 14px',
                color: input.trim() && !loading ? 'white' : '#4b5563',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontSize: 16, transition: 'background 0.15s',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
