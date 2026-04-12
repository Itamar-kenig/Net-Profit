import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { MOCK_PRICES, isDemoMode } from './utils/mockData'
import SearchBar from './components/SearchBar'
import ComparisonChart from './components/ComparisonChart'
import StatsTable from './components/StatsTable'

const DEFAULT_SYMBOLS = ['^GSPC', '^IXIC']
const DEMO = isDemoMode()

export default function App() {
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS)
  const [pricesMap, setPricesMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [investment, setInvestment] = useState(10000)

  const fetchPrices = useCallback(
    async (syms) => {
      const missing = syms.filter((s) => !pricesMap[s])
      if (missing.length === 0) return

      setLoading(true)
      setError(null)

      try {
        const results = {}

        if (DEMO) {
          // Demo mode: use locally generated mock data
          missing.forEach((sym) => {
            results[sym] = MOCK_PRICES[sym] ?? []
          })
        } else {
          await Promise.all(
            missing.map(async (sym) => {
              const { data, error: err } = await supabase
                .from('historical_prices')
                .select('date, adj_close, close')
                .eq('symbol', sym)
                .order('date', { ascending: true })

              if (err) throw new Error(`[${sym}] ${err.message}`)
              results[sym] = data ?? []
            })
          )
        }

        setPricesMap((prev) => ({ ...prev, ...results }))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    },
    [pricesMap]
  )

  useEffect(() => {
    if (symbols.length > 0) fetchPrices(symbols)
  }, [symbols]) // eslint-disable-line react-hooks/exhaustive-deps

  function addSymbol(sym) {
    const upper = sym.trim().toUpperCase()
    if (upper && !symbols.includes(upper)) {
      setSymbols((prev) => [...prev, upper])
    }
  }

  function removeSymbol(sym) {
    setSymbols((prev) => prev.filter((s) => s !== sym))
    setPricesMap((prev) => {
      const next = { ...prev }
      delete next[sym]
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400 tracking-tight">Net Profit</h1>
          <p className="text-gray-500 text-sm">ניתוח והשוואת מניות, מדדים וקרנות סל</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-gray-400">השקעה ראשונית ($):</label>
          <input
            type="number"
            value={investment}
            min={100}
            step={1000}
            onChange={(e) => setInvestment(Math.max(0, Number(e.target.value)))}
            className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-right focus:outline-none focus:border-green-500 transition-colors"
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Demo mode banner */}
        {DEMO && (
          <div className="bg-yellow-950 border border-yellow-700 text-yellow-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>
              <strong>מצב Demo</strong> – מוצגים נתונים מדומים. לנתונים אמיתיים: הגדר{' '}
              <code className="bg-yellow-900 px-1 rounded">VITE_SUPABASE_URL</code> ב-
              <code className="bg-yellow-900 px-1 rounded">.env</code> והרץ את סקריפט ה-Python.
            </span>
          </div>
        )}

        {/* Search */}
        <SearchBar onAdd={addSymbol} />

        {/* Active symbol chips */}
        {symbols.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {symbols.map((sym, i) => {
              const colors = [
                'border-green-600 text-green-400',
                'border-blue-600 text-blue-400',
                'border-yellow-600 text-yellow-400',
                'border-pink-600 text-pink-400',
                'border-purple-600 text-purple-400',
              ]
              const cls = colors[i % colors.length]
              return (
                <span
                  key={sym}
                  className={`flex items-center gap-1.5 bg-gray-900 border rounded-full px-3 py-1 text-sm ${cls}`}
                >
                  {sym}
                  <button
                    onClick={() => removeSymbol(sym)}
                    className="text-gray-600 hover:text-red-400 transition-colors leading-none text-base"
                    aria-label={`הסר ${sym}`}
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
            <strong>שגיאה:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center text-gray-500 py-12">
            <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>טוען נתונים מ-Supabase…</p>
          </div>
        )}

        {/* Charts & table */}
        {!loading && symbols.length > 0 && (
          <>
            <ComparisonChart symbols={symbols} pricesMap={pricesMap} />
            <StatsTable symbols={symbols} pricesMap={pricesMap} investment={investment} />
          </>
        )}

        {/* Empty state */}
        {!loading && symbols.length === 0 && (
          <div className="text-center text-gray-600 py-20">
            <p className="text-4xl mb-3">📈</p>
            <p>הוסף סימול כדי להתחיל בניתוח</p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 px-6 py-4 text-gray-600 text-xs text-center">
        Net Profit • נתונים היסטוריים מסופקים על ידי Yahoo Finance דרך yfinance • אין בנתונים אלו המלצת השקעה
      </footer>
    </div>
  )
}
