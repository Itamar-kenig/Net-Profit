import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { buildChartData, filterPrices, PERIODS } from '../utils/finance'
import { useIsMobile } from '../hooks/useIsMobile'

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f472b6','#a78bfa','#34d399','#fb923c']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getFullYear()}`
}

function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function CustomTooltip({ active, payload, label, investment, showDollar }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{ background:'#111827', border:'1px solid #374151', borderRadius:8, padding:'10px 14px', fontSize:13 }}>
      <p style={{ color:'#9ca3af', marginBottom:6 }}>{label}</p>
      {payload.map((entry) => {
        const pct = entry.value
        const val = investment * (1 + pct / 100)
        return (
          <div key={entry.dataKey} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:entry.color, display:'inline-block' }} />
            <span style={{ color:'#d1d5db' }}>{entry.dataKey}:</span>
            <span style={{ color:entry.color, fontWeight:600 }}>
              {showDollar ? fmtUSD(val) : `${pct >= 0 ? '+' : ''}${pct?.toFixed(1)}%`}
            </span>
            {showDollar && (
              <span style={{ color:'#6b7280', fontSize:11 }}>({pct >= 0 ? '+' : ''}{pct?.toFixed(1)}%)</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const BENCHMARK_SYM = '^GSPC'

export default function ComparisonChart({
  symbols, pricesMap, investment, period, setPeriod,
  customStart, customEnd, setCustomStart, setCustomEnd,
  benchmark, benchmarkData, onToggleBenchmark,
}) {
  const [showDollar, setShowDollar] = useState(false)
  const isMobile = useIsMobile()
  const filteredMap = {}
  for (const sym of symbols) {
    filteredMap[sym] = filterPrices(pricesMap[sym] || [], period, customStart, customEnd)
  }
  const showBenchmarkLine = benchmark && benchmarkData?.length > 0 && !symbols.includes(BENCHMARK_SYM)
  if (showBenchmarkLine) {
    filteredMap[BENCHMARK_SYM] = filterPrices(benchmarkData, period, customStart, customEnd)
  }
  const chartSymbols = showBenchmarkLine ? [...symbols, BENCHMARK_SYM] : symbols
  const chartData = buildChartData(chartSymbols, filteredMap)

  return (
    <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding: isMobile ? '12px 0 8px' : 16 }}>
      {/* Period buttons row — horizontally scrollable on mobile */}
      <div style={{ overflowX:'auto', marginBottom:8, marginInline: isMobile ? 0 : -16, paddingInline: isMobile ? 12 : 16 }}>
        <div style={{ display:'flex', gap: isMobile ? 5 : 6, alignItems:'center', minWidth:'max-content' }}>
          <span style={{ color:'#6b7280', fontSize: isMobile ? 11 : 12 }}>תקופה:</span>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                padding: isMobile ? '6px 10px' : '3px 10px',
                borderRadius:6, fontSize: isMobile ? 13 : 12, cursor:'pointer',
                background: period === p.value ? '#4ade80' : '#1f2937',
                color:       period === p.value ? '#030712' : '#9ca3af',
                border:      period === p.value ? 'none'    : '1px solid #374151',
                fontWeight:  period === p.value ? 600       : 400,
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => setPeriod('custom')}
            style={{
              padding: isMobile ? '6px 10px' : '3px 10px',
              borderRadius:6, fontSize: isMobile ? 13 : 12, cursor:'pointer',
              background: period === 'custom' ? '#4ade80' : '#1f2937',
              color:       period === 'custom' ? '#030712' : '#9ca3af',
              border:      period === 'custom' ? 'none'    : '1px solid #374151',
              fontWeight:  period === 'custom' ? 600       : 400,
            }}
          >
            {isMobile ? 'מותאם' : 'תאריך מותאם'}
          </button>
          {/* Dollar / % toggle */}
          <button
            onClick={() => setShowDollar((d) => !d)}
            style={{
              padding: isMobile ? '6px 10px' : '3px 10px',
              borderRadius:6, fontSize: isMobile ? 13 : 12, cursor:'pointer',
              background: showDollar ? '#1e3a5f' : '#1f2937',
              color: showDollar ? '#60a5fa' : '#6b7280',
              border: showDollar ? '1px solid #3b82f6' : '1px solid #374151',
            }}
          >
            $ ←→ %
          </button>
          {/* Benchmark toggle */}
          {onToggleBenchmark && (
            <button
              onClick={onToggleBenchmark}
              style={{
                padding: isMobile ? '6px 10px' : '3px 10px',
                borderRadius:6, fontSize: isMobile ? 13 : 12, cursor:'pointer',
                background: benchmark ? '#374151' : '#1f2937',
                color: benchmark ? '#d1d5db' : '#6b7280',
                border: benchmark ? '1px solid #6b7280' : '1px solid #374151',
              }}
            >
              {benchmark ? '✕ S&P 500' : '⚖ S&P 500'}
            </button>
          )}
        </div>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div style={{ display:'flex', gap:10, marginBottom:12, alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ color:'#6b7280', fontSize:12 }}>מתאריך:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            style={{ background:'#1f2937', border:'1px solid #374151', borderRadius:6, padding:'4px 8px', color:'white', fontSize:12 }}
          />
          <span style={{ color:'#6b7280', fontSize:12 }}>עד:</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={{ background:'#1f2937', border:'1px solid #374151', borderRadius:6, padding:'4px 8px', color:'white', fontSize:12 }}
          />
        </div>
      )}

      <h2 style={{ color:'#e5e7eb', fontWeight:600, marginBottom:8, fontSize: isMobile ? 14 : 16, paddingInline: isMobile ? 12 : 0 }}>תשואה מצטברת</h2>

      {chartData.length === 0 ? (
        <div style={{ textAlign:'center', color:'#6b7280', padding:'40px 0' }}>
          אין נתונים להצגה לתקופה הנבחרת
        </div>
      ) : (
        <div style={{ width:'100%', height: isMobile ? 240 : 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top:5, right: isMobile ? 8 : 20, left: isMobile ? 0 : 10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill:'#6b7280', fontSize: isMobile ? 10 : 11 }} interval="preserveStartEnd" minTickGap={isMobile ? 50 : 60} />
              <YAxis
                tickFormatter={(v) => showDollar ? fmtUSD(investment * (1 + v / 100)) : `${v >= 0 ? '+' : ''}${v}%`}
                tick={{ fill:'#6b7280', fontSize: isMobile ? 10 : 11 }} width={isMobile ? 48 : 75}
              />
              <Tooltip content={<CustomTooltip investment={investment} showDollar={showDollar} />} />
              <Legend formatter={(value) => <span style={{ color:'#d1d5db', fontSize: isMobile ? 11 : 13 }}>{value}</span>} />
              <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
              {symbols.map((sym, i) => (
                <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} connectNulls />
              ))}
              {showBenchmarkLine && (
                <Line key={BENCHMARK_SYM} type="monotone" dataKey={BENCHMARK_SYM} stroke="#6b7280" dot={false} strokeWidth={1.5} strokeDasharray="5 3" connectNulls />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
