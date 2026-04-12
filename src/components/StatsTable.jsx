import { useState } from 'react'
import {
  calcCAGRFromSeries, calcYTD, calcNetProfit,
  getFee, filterPrices, calcYearlyReturns,
} from '../utils/finance'

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f472b6','#a78bfa','#34d399','#fb923c']

function fmt(n) { return n.toFixed(2) }
function fmtCurrency(n) {
  return new Intl.NumberFormat('he-IL', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(n)
}
function colorStyle(n) {
  return { color: n > 0 ? '#4ade80' : n < 0 ? '#f87171' : '#9ca3af' }
}

export default function StatsTable({ symbols, pricesMap, investment, period, customStart, customEnd }) {
  const [fees, setFees] = useState(() => {
    const init = {}
    for (const sym of symbols) init[sym] = getFee(sym) ?? 0.2
    return init
  })
  const [showYearly, setShowYearly] = useState(false)

  for (const sym of symbols) {
    if (fees[sym] === undefined)
      setTimeout(() => setFees((prev) => ({ ...prev, [sym]: getFee(sym) ?? 0.2 })), 0)
  }

  const years = 20
  const cell = { padding:'10px 14px', fontSize:13 }
  const th = { ...cell, color:'#6b7280', fontWeight:500, borderBottom:'1px solid #1f2937', textAlign:'right' }

  return (
    <div style={{ background:'#111827', border:'1px solid #1f2937', borderRadius:12, overflow:'hidden' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #1f2937' }}>
        <h2 style={{ color:'#e5e7eb', fontWeight:600, fontSize:16 }}>
          סיכום – השקעה של {fmtCurrency(investment)} לאורך {years} שנה
        </h2>
        <button
          onClick={() => setShowYearly((v) => !v)}
          style={{ padding:'4px 12px', borderRadius:6, fontSize:12, cursor:'pointer',
            background: showYearly ? '#4ade80' : '#1f2937',
            color: showYearly ? '#030712' : '#9ca3af',
            border: showYearly ? 'none' : '1px solid #374151' }}
        >
          {showYearly ? 'הסתר' : 'תשואות שנתיות ▼'}
        </button>
      </div>

      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr>
              {['סימול','CAGR ברוטו','YTD','דמי ניהול %','CAGR נטו','רווח ברוטו','רווח נקי','עלות דמי'].map((h) => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((sym, i) => {
              const raw    = pricesMap[sym] || []
              const prices = filterPrices(raw, period, customStart, customEnd)
              const hasData = prices.length >= 2
              const cagr = hasData ? calcCAGRFromSeries(prices) : null
              const ytd  = hasData ? calcYTD(raw) : null
              const fee  = fees[sym] ?? 0
              const net  = hasData && cagr !== null
                ? calcNetProfit({ initialInvestment: investment, grossCAGR: cagr, managementFee: fee, years })
                : null

              return (
                <tr key={sym} style={{ borderBottom:'1px solid #1f2937' }}>
                  <td style={cell}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:10, height:10, borderRadius:'50%', background:COLORS[i % COLORS.length], display:'inline-block' }} />
                      <span style={{ color:'white', fontWeight:600 }}>{sym}</span>
                    </div>
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', ...colorStyle(cagr ?? 0) }}>
                    {cagr !== null ? `${cagr >= 0 ? '+' : ''}${fmt(cagr)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', ...colorStyle(ytd ?? 0) }}>
                    {ytd !== null ? `${ytd >= 0 ? '+' : ''}${fmt(ytd)}%` : '–'}
                  </td>
                  <td style={cell}>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <input
                        type="number" min="0" max="5" step="0.01" value={fee}
                        onChange={(e) => setFees((prev) => ({ ...prev, [sym]: Number(e.target.value) }))}
                        style={{ width:64, background:'#1f2937', border:'1px solid #374151', borderRadius:4,
                          padding:'2px 6px', color:'white', fontFamily:'monospace', fontSize:12, textAlign:'right' }}
                      />
                      <span style={{ color:'#6b7280' }}>%</span>
                    </div>
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', ...colorStyle(net?.netCAGR ?? 0) }}>
                    {net ? `${net.netCAGR >= 0 ? '+' : ''}${fmt(net.netCAGR)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', ...colorStyle(net?.grossProfit ?? 0) }}>
                    {net ? fmtCurrency(net.grossProfit) : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', fontWeight:600, ...colorStyle(net?.netProfit ?? 0) }}>
                    {net ? fmtCurrency(net.netProfit) : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily:'monospace', color:'#f87171' }}>
                    {net ? fmtCurrency(net.feeCost) : '–'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Yearly returns breakdown */}
      {showYearly && (
        <div style={{ padding:16, borderTop:'1px solid #1f2937' }}>
          <h3 style={{ color:'#e5e7eb', fontWeight:600, marginBottom:12, fontSize:14 }}>תשואות לפי שנה</h3>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr>
                  <th style={{ ...th, fontSize:12 }}>שנה</th>
                  {symbols.map((sym, i) => (
                    <th key={sym} style={{ ...th, fontSize:12, color:COLORS[i % COLORS.length] }}>{sym}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const allYears = new Set()
                  const yearlyMap = {}
                  for (const sym of symbols) {
                    const yr = calcYearlyReturns(pricesMap[sym] || [])
                    yearlyMap[sym] = {}
                    yr.forEach((r) => { yearlyMap[sym][r.year] = r.return; allYears.add(r.year) })
                  }
                  return Array.from(allYears).sort((a, b) => b - a).map((year) => (
                    <tr key={year} style={{ borderBottom:'1px solid #1f2937' }}>
                      <td style={{ ...cell, fontSize:12, color:'#9ca3af', fontWeight:500 }}>{year}</td>
                      {symbols.map((sym) => {
                        const val = yearlyMap[sym]?.[year]
                        return (
                          <td key={sym} style={{ ...cell, fontSize:12, fontFamily:'monospace', ...colorStyle(val ?? 0) }}>
                            {val !== undefined ? `${val >= 0 ? '+' : ''}${fmt(val)}%` : '–'}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p style={{ color:'#4b5563', fontSize:11, padding:'8px 16px' }}>
        * Net Profit מחשב השקעה חד-פעמית עם ריבית דריבית לאורך {years} שנה.
      </p>
    </div>
  )
}
