import { useState } from 'react'
import {
  calcCAGRFromSeries, calcNetProfit,
  getFee, filterPrices, calcYearlyReturns, calcMonthlyReturns,
} from '../utils/finance'

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f472b6','#a78bfa','#34d399','#fb923c']

function fmt(n) { return n.toFixed(2) }
function fmtCurrency(n) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
function colorStyle(n) {
  return { color: n > 0 ? '#4ade80' : n < 0 ? '#f87171' : '#9ca3af' }
}

const PERIOD_LABELS = {
  '1D': 'יום', '1W': 'שבוע', '1M': 'חודש', '3M': '3 חודשים',
  '6M': '6 חודשים', 'YTD': 'מתחילת שנה', '1Y': 'שנה',
  '3Y': '3 שנים', '5Y': '5 שנים', '10Y': 'עשור', 'ALL': 'כל הזמן',
}

function getPeriodLabel(period, customStart, customEnd) {
  if (period === 'custom') {
    if (customStart && customEnd) return `${customStart} – ${customEnd}`
    return 'תאריך מותאם'
  }
  return PERIOD_LABELS[period] || period
}

function getActualYears(prices) {
  if (!prices || prices.length < 2) return null
  return (new Date(prices[prices.length - 1].date) - new Date(prices[0].date)) / (365.25 * 24 * 60 * 60 * 1000)
}

export default function StatsTable({ symbols, pricesMap, investment, period, customStart, customEnd }) {
  const [breakdown, setBreakdown] = useState(null) // null | 'yearly' | 'monthly'

  const cell = { padding: '10px 14px', fontSize: 13 }
  const th = { ...cell, color: '#6b7280', fontWeight: 500, borderBottom: '1px solid #1f2937', textAlign: 'right' }
  const stickyTh = { ...th, position: 'sticky', right: 0, background: '#0f172a', zIndex: 2 }
  const stickyCell = { ...cell, position: 'sticky', right: 0, background: '#111827', zIndex: 1 }
  const periodLabel = getPeriodLabel(period, customStart, customEnd)

  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1f2937', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ color: '#e5e7eb', fontWeight: 600, fontSize: 16 }}>
          סיכום – השקעה של {fmtCurrency(investment)} | {periodLabel}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['yearly', 'monthly'].map((type) => (
            <button key={type} onClick={() => setBreakdown(breakdown === type ? null : type)}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                background: breakdown === type ? '#4ade80' : '#1f2937',
                color: breakdown === type ? '#030712' : '#9ca3af',
                border: breakdown === type ? 'none' : '1px solid #374151',
              }}
            >
              {breakdown === type ? 'הסתר' : type === 'yearly' ? 'תשואות שנתיות ▼' : 'תשואות חודשיות ▼'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['סימול', 'תשואה', 'תשואה כוללת', 'דמי ניהול %', 'CAGR ברוטו', 'CAGR נטו', 'שווי היום', 'רווח ברוטו', 'רווח נטו', 'עלות דמי ניהול'].map((h, i) => (
                <th key={h} style={i === 0 ? stickyTh : th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              // Shared start: latest first-date across all symbols for fair comparison
              const sharedStart = symbols.reduce((latest, sym) => {
                const p = filterPrices(pricesMap[sym] || [], period, customStart, customEnd)
                return p.length > 0 && p[0].date > latest ? p[0].date : latest
              }, '')
              return symbols.map((sym, i) => {
              const raw    = pricesMap[sym] || []
              const prices = filterPrices(raw, period, customStart, customEnd)
                .filter((p) => p.date >= sharedStart)
              const hasData = prices.length >= 2
              const cagr = hasData ? calcCAGRFromSeries(prices) : null
              const fee  = getFee(sym) ?? 0.2
              const years = hasData ? getActualYears(prices) : null
              const net  = hasData && cagr !== null && years
                ? calcNetProfit({ initialInvestment: investment, grossCAGR: cagr, managementFee: fee, years })
                : null
              const pAdj = (r) => r.adj_close ?? r.close
              const pClose = (r) => r.close
              const priceReturn = hasData
                ? Number((((pClose(prices[prices.length - 1]) - pClose(prices[0])) / pClose(prices[0])) * 100).toFixed(2))
                : null
              const totalReturn = hasData
                ? Number((((pAdj(prices[prices.length - 1]) - pAdj(prices[0])) / pAdj(prices[0])) * 100).toFixed(2))
                : null
              const currentValue = totalReturn !== null
                ? investment * (1 + totalReturn / 100)
                : null

              return (
                <tr key={sym} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={stickyCell}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                      <span style={{ color: 'white', fontWeight: 600 }}>{sym}</span>
                    </div>
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', ...colorStyle(priceReturn ?? 0) }}>
                    {priceReturn !== null ? `${priceReturn >= 0 ? '+' : ''}${fmt(priceReturn)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', fontWeight: 600, ...colorStyle(totalReturn ?? 0) }}>
                    {totalReturn !== null ? `${totalReturn >= 0 ? '+' : ''}${fmt(totalReturn)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', color: '#9ca3af' }}>
                    {fmt(fee)}%
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', ...colorStyle(cagr ?? 0) }}>
                    {cagr !== null ? `${cagr >= 0 ? '+' : ''}${fmt(cagr)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', ...colorStyle(net?.netCAGR ?? 0) }}>
                    {net ? `${net.netCAGR >= 0 ? '+' : ''}${fmt(net.netCAGR)}%` : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', fontWeight: 600, color: '#e5e7eb' }}>
                    {currentValue !== null ? fmtCurrency(currentValue) : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', ...colorStyle(net?.grossProfit ?? 0) }}>
                    {net ? fmtCurrency(net.grossProfit) : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', fontWeight: 600, ...colorStyle(net?.netProfit ?? 0) }}>
                    {net ? fmtCurrency(net.netProfit) : '–'}
                  </td>
                  <td style={{ ...cell, fontFamily: 'monospace', color: '#f87171' }}>
                    {net ? fmtCurrency(net.feeCost) : '–'}
                  </td>
                </tr>
              )
            })
          })()}
          </tbody>
        </table>
      </div>

      {/* Yearly / Monthly breakdown */}
      {breakdown && (
        <div style={{ padding: 16, borderTop: '1px solid #1f2937' }}>
          <h3 style={{ color: '#e5e7eb', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
            {breakdown === 'yearly' ? 'תשואות לפי שנה' : 'תשואות לפי חודש'} — {periodLabel}
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ ...th, fontSize: 12 }}>{breakdown === 'yearly' ? 'שנה' : 'חודש'}</th>
                  {symbols.map((sym, i) => (
                    <th key={sym} style={{ ...th, fontSize: 12, color: COLORS[i % COLORS.length] }}>{sym}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const sharedStart = symbols.reduce((latest, sym) => {
                    const p = filterPrices(pricesMap[sym] || [], period, customStart, customEnd)
                    return p.length > 0 && p[0].date > latest ? p[0].date : latest
                  }, '')
                  const allKeys = new Set()
                  const dataMap = {}
                  for (const sym of symbols) {
                    const filtered = filterPrices(pricesMap[sym] || [], period, customStart, customEnd)
                      .filter((p) => p.date >= sharedStart)
                    dataMap[sym] = {}
                    if (breakdown === 'yearly') {
                      calcYearlyReturns(filtered).forEach((r) => { dataMap[sym][r.year] = r.return; allKeys.add(r.year) })
                    } else {
                      calcMonthlyReturns(filtered).forEach((r) => { dataMap[sym][r.month] = r.return; allKeys.add(r.month) })
                    }
                  }
                  return Array.from(allKeys).sort((a, b) => (a > b ? -1 : 1)).map((key) => (
                    <tr key={key} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ ...cell, fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                        {breakdown === 'monthly'
                          ? new Date(key + '-01').toLocaleDateString('he-IL', { month: 'short', year: 'numeric' })
                          : key}
                      </td>
                      {symbols.map((sym) => {
                        const val = dataMap[sym]?.[key]
                        return (
                          <td key={sym} style={{ ...cell, fontSize: 12, fontFamily: 'monospace', ...colorStyle(val ?? 0) }}>
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

      <p style={{ color: '#4b5563', fontSize: 11, padding: '8px 16px' }}>
        * Net Profit מחושב על בסיס CAGR מהתקופה הנבחרת עם ריבית דריבית.
      </p>
    </div>
  )
}
