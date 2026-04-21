import { useState, useRef, useEffect } from 'react'
import { searchSymbols } from '../utils/symbolsDb'

const DEFAULT_QUICK = ['^GSPC', '^NDX', '^IXIC', '^DJI', 'SPY', 'QQQ', 'VOO', 'GLD']

const QUICK_LABELS = {
  '^GSPC': 'S&P 500',
  '^NDX':  'נאסד"ק 100',
}

function loadQuick() {
  try { return JSON.parse(localStorage.getItem('np-quick') ?? 'null') || DEFAULT_QUICK } catch { return DEFAULT_QUICK }
}
function saveQuick(syms) {
  localStorage.setItem('np-quick', JSON.stringify(syms))
}

export default function SearchBar({ onAdd }) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const [quickSymbols, setQuickSymbols] = useState(loadQuick)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (value.trim().length === 0) { setSuggestions([]); setShowSuggestions(false); return }
    const results = searchSymbols(value)
    setSuggestions(results)
    setShowSuggestions(results.length > 0)
    setHighlighted(-1)
  }, [value])

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function getInputSymbol() {
    if (highlighted >= 0 && suggestions[highlighted]) return suggestions[highlighted].symbol
    return value.trim().toUpperCase()
  }

  function handleSubmit(e) {
    e.preventDefault()
    const sym = getInputSymbol()
    if (sym) { onAdd(sym); setValue(''); setShowSuggestions(false) }
  }

  function handleSelect(sym) {
    onAdd(sym); setValue(''); setShowSuggestions(false)
  }

  function handleKeyDown(e) {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, -1)) }
    else if (e.key === 'Escape') setShowSuggestions(false)
  }

  function addToQuick() {
    const sym = getInputSymbol()
    if (!sym || quickSymbols.includes(sym)) return
    const updated = [...quickSymbols, sym]
    setQuickSymbols(updated)
    saveQuick(updated)
  }

  function removeFromQuick(sym) {
    const updated = quickSymbols.filter((s) => s !== sym)
    setQuickSymbols(updated)
    saveQuick(updated)
  }

  const inputSym = value.trim().toUpperCase()
  const canAddToQuick = inputSym && !quickSymbols.includes(inputSym)

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Input with search icon */}
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: '#6b7280', fontSize: 16, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="חפש סימול או שם (SPY, S&P 500, זהב, נאסד״ק...)"
            style={{
              width: '100%', background: '#1f2937', border: '1px solid #374151',
              borderRadius: 8, padding: '9px 40px 9px 14px', color: 'white',
              fontSize: 14, outline: 'none', boxSizing: 'border-box', direction: 'rtl',
            }}
          />
        </div>

        <button type="submit" style={{
          background: '#4ade80', color: '#030712', fontWeight: 700,
          padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14,
        }}>+</button>

        {/* Add to quick button */}
        {canAddToQuick && (
          <button
            type="button"
            onClick={addToQuick}
            title={`הוסף ${inputSym} לרשימה המהירה`}
            style={{
              background: '#1f2937', border: '1px solid #4ade80', color: '#4ade80',
              padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
            }}
          >
            ⭐ מהיר
          </button>
        )}
      </form>

      {/* Autocomplete dropdown */}
      {showSuggestions && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: '#1f2937', border: '1px solid #374151', borderRadius: 8,
          marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {suggestions.map((s, i) => (
            <div key={s.symbol} onMouseDown={() => handleSelect(s.symbol)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '10px 14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10,
                background: i === highlighted ? '#374151' : 'transparent',
                borderBottom: i < suggestions.length - 1 ? '1px solid #374151' : 'none',
              }}
            >
              <span style={{
                background: '#111827', border: '1px solid #4b5563', borderRadius: 4,
                padding: '2px 7px', fontSize: 12, fontFamily: 'monospace', color: '#4ade80', whiteSpace: 'nowrap',
              }}>{s.symbol}</span>
              <span style={{ color: '#d1d5db', fontSize: 13 }}>{s.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick-add chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
        <span style={{ color: '#6b7280', fontSize: 12 }}>מהיר:</span>
        {quickSymbols.map((sym) => (
          <span key={sym} style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#1f2937', border: '1px solid #374151', borderRadius: 20, overflow: 'hidden',
          }}>
            <button onClick={() => onAdd(sym)} style={{
              fontSize: 12, color: '#9ca3af', background: 'transparent',
              padding: '3px 8px 3px 10px', border: 'none', cursor: 'pointer',
            }}>{QUICK_LABELS[sym] ?? sym}</button>
            <button onClick={() => removeFromQuick(sym)} title="הסר" style={{
              fontSize: 12, color: '#6b7280', background: 'transparent',
              padding: '3px 8px 3px 4px', border: 'none', cursor: 'pointer', lineHeight: 1,
            }}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
