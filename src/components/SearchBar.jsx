import { useState, useRef, useEffect } from 'react'
import { searchSymbols } from '../utils/symbolsDb'

const QUICK_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ', 'VOO', 'GLD']

export default function SearchBar({ onAdd }) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (value.trim().length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const results = searchSymbols(value)
    setSuggestions(results)
    setShowSuggestions(results.length > 0)
    setHighlighted(-1)
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    const sym = highlighted >= 0 && suggestions[highlighted]
      ? suggestions[highlighted].symbol
      : value.trim().toUpperCase()
    if (sym) {
      onAdd(sym)
      setValue('')
      setShowSuggestions(false)
    }
  }

  function handleSelect(sym) {
    onAdd(sym)
    setValue('')
    setShowSuggestions(false)
  }

  function handleKeyDown(e) {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, -1))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="חפש סימול או שם (לדוג' SPY, S&P 500, זהב, נאסד״ק)"
          style={{
            flex: 1, background: '#1f2937', border: '1px solid #374151',
            borderRadius: 8, padding: '8px 14px', color: 'white',
            fontSize: 14, outline: 'none', direction: 'rtl',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#4ade80', color: '#030712', fontWeight: 600,
            padding: '8px 20px', borderRadius: 8, border: 'none',
            cursor: 'pointer', fontSize: 14,
          }}
        >
          הוסף
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
          marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {suggestions.map((s, i) => (
            <div
              key={s.symbol}
              onMouseDown={() => handleSelect(s.symbol)}
              style={{
                padding: '10px 14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10,
                background: i === highlighted ? '#374151' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid #374151' : 'none',
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span style={{
                background: '#111827', border: '1px solid #4b5563',
                borderRadius: 4, padding: '2px 7px', fontSize: 12,
                fontFamily: 'monospace', color: '#4ade80', whiteSpace: 'nowrap',
              }}>
                {s.symbol}
              </span>
              <span style={{ color: '#d1d5db', fontSize: 13 }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick-add chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: 12 }}>מהיר:</span>
        {QUICK_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => onAdd(sym)}
            style={{
              fontSize: 12, background: '#1f2937', color: '#9ca3af',
              padding: '3px 10px', borderRadius: 20, border: '1px solid #374151',
              cursor: 'pointer',
            }}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}
