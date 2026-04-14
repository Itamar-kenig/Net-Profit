import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { MOCK_PRICES, isDemoMode } from './utils/mockData'
import SearchBar from './components/SearchBar'
import ComparisonChart from './components/ComparisonChart'
import StatsTable from './components/StatsTable'

const DEMO = isDemoMode()

export default function App() {
  const [symbols, setSymbols] = useState([])
  const [pricesMap, setPricesMap] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchingSymbol, setFetchingSymbol] = useState(null) // symbol being downloaded from Yahoo
  const [error, setError] = useState(null)
  const [investment, setInvestment] = useState(10000)
  const [period, setPeriod] = useState('5Y')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const fetchPrices = useCallback(
    async (syms) => {
      const missing = syms.filter((s) => !pricesMap[s])
      if (missing.length === 0) return
      setLoading(true)
      setError(null)
      try {
        const results = {}
        if (DEMO) {
          missing.forEach((sym) => { results[sym] = MOCK_PRICES[sym] ?? [] })
        } else {
          await Promise.all(
            missing.map(async (sym) => {
              // 1. Try Supabase first
              const { data, error: err } = await supabase
                .from('historical_prices')
                .select('date, adj_close, close')
                .eq('symbol', sym)
                .order('date', { ascending: true })
                .limit(10000)
              if (err) throw new Error(`[${sym}] ${err.message}`)

              if (data && data.length > 0) {
                results[sym] = data
                return
              }

              // 2. Not in DB — fetch via Edge Function
              setFetchingSymbol(sym)
              const { data: fnData, error: fnErr } = await supabase.functions.invoke('fetch-symbol', {
                body: { symbol: sym },
              })
              setFetchingSymbol(null)

              if (fnErr || !fnData?.success) {
                throw new Error(`לא נמצאו נתונים עבור "${sym}". בדוק שהסימול נכון.`)
              }

              // 3. Re-fetch from Supabase after download
              const { data: fresh } = await supabase
                .from('historical_prices')
                .select('date, adj_close, close')
                .eq('symbol', sym)
                .order('date', { ascending: true })
                .limit(10000)
              results[sym] = fresh ?? []
            })
          )
        }
        setPricesMap((prev) => ({ ...prev, ...results }))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
        setFetchingSymbol(null)
      }
    },
    [pricesMap]
  )

  useEffect(() => {
    if (symbols.length > 0) fetchPrices(symbols)
  }, [symbols]) // eslint-disable-line react-hooks/exhaustive-deps

  function addSymbol(sym) {
    const upper = sym.trim().toUpperCase()
    if (upper && !symbols.includes(upper)) setSymbols((prev) => [...prev, upper])
  }

  function removeSymbol(sym) {
    setSymbols((prev) => prev.filter((s) => s !== sym))
    setPricesMap((prev) => { const n = { ...prev }; delete n[sym]; return n })
  }

  const isLoading = loading || !!fetchingSymbol

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-400 tracking-tight">Net Profit</h1>
          <p className="text-gray-500 text-sm">ניתוח והשוואת מניות, מדדים וקרנות סל</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-gray-400">השקעה ($):</label>
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
        {DEMO && (
          <div className="bg-yellow-950 border border-yellow-700 text-yellow-300 px-4 py-2 rounded-lg text-sm">
            ⚠️ <strong>מצב Demo</strong> – נתונים מדומים. חבר Supabase לנתונים אמיתיים.
          </div>
        )}

        <SearchBar onAdd={addSymbol} />

        {symbols.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {symbols.map((sym, i) => {
              const colors = ['border-green-600 text-green-400','border-blue-600 text-blue-400',
                'border-yellow-600 text-yellow-400','border-pink-600 text-pink-400','border-purple-600 text-purple-400']
              return (
                <span key={sym} className={`flex items-center gap-1.5 bg-gray-900 border rounded-full px-3 py-1 text-sm ${colors[i % colors.length]}`}>
                  {sym}
                  <button onClick={() => removeSymbol(sym)} className="text-gray-600 hover:text-red-400 transition-colors leading-none text-base">×</button>
                </span>
              )
            })}
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
            <strong>שגיאה:</strong> {error}
          </div>
        )}

        {isLoading && (
          <div className="text-center text-gray-500 py-12">
            <div className="inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-3" />
            {fetchingSymbol
              ? <p>מוריד נתונים עבור <strong style={{ color: '#4ade80' }}>{fetchingSymbol}</strong> מ-Yahoo Finance…</p>
              : <p>טוען נתונים…</p>
            }
          </div>
        )}

        {!isLoading && symbols.length > 0 && (
          <>
            <ComparisonChart
              symbols={symbols}
              pricesMap={pricesMap}
              period={period}
              setPeriod={setPeriod}
              customStart={customStart}
              customEnd={customEnd}
              setCustomStart={setCustomStart}
              setCustomEnd={setCustomEnd}
            />
            <StatsTable
              symbols={symbols}
              pricesMap={pricesMap}
              investment={investment}
              period={period}
              customStart={customStart}
              customEnd={customEnd}
            />
          </>
        )}

        {!isLoading && symbols.length === 0 && (
          <div className="text-center text-gray-600 py-24">
            <div className="text-5xl mb-4">📈</div>
            <p className="text-lg">הוסף סימול כדי להתחיל בניתוח</p>
            <p className="text-sm mt-2">לדוגמה: SPY, QQQ, ^GSPC, AAPL, NVDA, BRK-B</p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 px-6 py-4 text-gray-600 text-xs text-center">
        Net Profit • נתונים מ-Yahoo Finance • אין בנתונים אלו המלצת השקעה
      </footer>
    </div>
  )
}
