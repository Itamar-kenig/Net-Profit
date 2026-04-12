import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { buildChartData, filterPrices, PERIODS } from '../utils/finance'

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f472b6','#a78bfa','#34d399','#fb923c']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getFullYear()}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{ background:'#111827', border:'1px solid #374151', borderRadius:8, padding:'10px 14px', fontSize:13 }}>
      <p style={{ color:'#9ca3af', marginBottom:6 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:entry.color, display:'inline-block' }} />
          <span style={{ color:'#d1d5db' }}>{entry.dataKey}:</span>
          <span style={{ color:entry.color, fontWeight:600 }}>
            {entry.value >= 0 ? '+' : ''}{entry.value?.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonChart({
  symbols, pricesMap, period, setPeriod,
  customStart, customEnd, setCustomStart, setCustomEnd,
}) {
  const filteredMap = {}
  for (const sym of symbols) {
    filteredMap[sym] = filterPrices(pricesMap[sym] || [], period, customStart, customEnd)
  }
  const chartData = buildChartData(symbols, filteredMap)

  return (
    <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, padding:16 }}>
      {/* Period buttons */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12, alignItems:'center' }}>
        <span style={{ color:'#6b7280', fontSize:12 }}>תקופה:</span>
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            style={{
              padding:'3px 10px', borderRadius:6, fontSize:12, cursor:'pointer',
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
            padding:'3px 10px', borderRadius:6, fontSize:12, cursor:'pointer',
            background: period === 'custom' ? '#4ade80' : '#1f2937',
            color:       period === 'custom' ? '#030712' : '#9ca3af',
            border:      period === 'custom' ? 'none'    : '1px solid #374151',
            fontWeight:  period === 'custom' ? 600       : 400,
          }}
        >
          תאריך מותאם
        </button>
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

      <h2 style={{ color:'#e5e7eb', fontWeight:600, marginBottom:12, fontSize:16 }}>תשואה מצטברת</h2>

      {chartData.length === 0 ? (
        <div style={{ textAlign:'center', color:'#6b7280', padding:'40px 0' }}>
          אין נתונים להצגה לתקופה הנבחרת
        </div>
      ) : (
        <div style={{ width:'100%', height:380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top:5, right:20, left:10, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill:'#6b7280', fontSize:11 }} interval="preserveStartEnd" minTickGap={60} />
              <YAxis tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}%`} tick={{ fill:'#6b7280', fontSize:11 }} width={65} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(value) => <span style={{ color:'#d1d5db', fontSize:13 }}>{value}</span>} />
              <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
              {symbols.map((sym, i) => (
                <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} connectNulls />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
