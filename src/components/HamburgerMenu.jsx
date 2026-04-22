import { useState, useEffect, useRef } from 'react'

const MENU_ITEMS = [
  { icon: '🏠', label: 'בית', href: '#', active: true },
  { icon: '⚙️', label: 'הגדרות', href: '#', soon: true },
]

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="תפריט ניווט"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          borderRadius: 6,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            display: 'block',
            width: 22,
            height: 2,
            borderRadius: 2,
            background: '#9ca3af',
            transition: 'transform 0.25s, opacity 0.25s',
            transform: open
              ? i === 0 ? 'translateY(7px) rotate(45deg)'
              : i === 2 ? 'translateY(-7px) rotate(-45deg)'
              : 'scaleX(0)'
              : 'none',
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s',
        }}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
          width: 260,
          background: '#0f172a',
          borderLeft: '1px solid #1f2937',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 20,
        }}
      >
        {/* Sidebar header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px 20px',
          borderBottom: '1px solid #1f2937',
        }}>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 18 }}>Net Profit</span>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, marginBottom: 4,
                textDecoration: 'none',
                color: item.active ? '#4ade80' : item.soon ? '#4b5563' : '#9ca3af',
                background: item.active ? 'rgba(74,222,128,0.08)' : 'transparent',
                cursor: item.soon ? 'default' : 'pointer',
                fontSize: 15,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => { if (!item.soon && !item.active) e.currentTarget.style.background = '#1f2937' }}
              onMouseLeave={(e) => { if (!item.soon && !item.active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ flex: 1, direction: 'rtl' }}>{item.label}</span>
              {item.soon && (
                <span style={{
                  fontSize: 10, background: '#1f2937', color: '#6b7280',
                  borderRadius: 4, padding: '2px 6px',
                }}>בקרוב</span>
              )}
            </a>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1f2937', color: '#4b5563', fontSize: 12, textAlign: 'center' }}>
          Net Profit v1.0
        </div>
      </div>
    </>
  )
}
