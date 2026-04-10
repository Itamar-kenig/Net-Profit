import { useState } from 'react'
import {
  calcCAGRFromSeries,
  calcYTD,
  calcNetProfit,
  getFee,
} from '../utils/finance'

const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#34d399', '#fb923c']

function fmt(n, decimals = 2) {
  return n.toFixed(decimals)
}

function fmtCurrency(n) {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function colorClass(n) {
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-gray-400'
}

export default function StatsTable({ symbols, pricesMap, investment }) {
  // managementFees: symbol → fee% (editable per row)
  const [fees, setFees] = useState(() => {
    const init = {}
    for (const sym of symbols) {
      init[sym] = getFee(sym) ?? 0.2
    }
    return init
  })

  function setFee(sym, val) {
    setFees((prev) => ({ ...prev, [sym]: Number(val) }))
  }

  // Add new symbols to fees state when symbols list changes
  for (const sym of symbols) {
    if (fees[sym] === undefined) {
      // schedule state update outside render
      setTimeout(() => setFees((prev) => ({ ...prev, [sym]: getFee(sym) ?? 0.2 })), 0)
    }
  }

  const years = 20

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
      <h2 className="text-gray-200 font-semibold p-4 text-lg border-b border-gray-800">
        סיכום סטטיסטי – השקעה של {fmtCurrency(investment)} לאורך {years} שנה
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-right">
            <th className="px-4 py-3 font-medium">סימול</th>
            <th className="px-4 py-3 font-medium">CAGR ברוטו</th>
            <th className="px-4 py-3 font-medium">YTD</th>
            <th className="px-4 py-3 font-medium">דמי ניהול (% / שנה)</th>
            <th className="px-4 py-3 font-medium">CAGR נטו</th>
            <th className="px-4 py-3 font-medium">רווח ברוטו</th>
            <th className="px-4 py-3 font-medium text-green-400">רווח נקי (Net Profit)</th>
            <th className="px-4 py-3 font-medium text-red-400">עלות דמי ניהול</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym, i) => {
            const prices = pricesMap[sym]
            const hasData = prices && prices.length >= 2

            const cagr = hasData ? calcCAGRFromSeries(prices) : null
            const ytd = hasData ? calcYTD(prices) : null
            const fee = fees[sym] ?? 0

            const netResult =
              hasData && cagr !== null
                ? calcNetProfit({ initialInvestment: investment, grossCAGR: cagr, managementFee: fee, years })
                : null

            return (
              <tr key={sym} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                {/* Symbol */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    <span className="font-semibold text-white">{sym}</span>
                  </div>
                </td>

                {/* CAGR Gross */}
                <td className={`px-4 py-3 font-mono ${cagr !== null ? colorClass(cagr) : 'text-gray-600'}`}>
                  {cagr !== null ? `${cagr >= 0 ? '+' : ''}${fmt(cagr)}%` : '–'}
                </td>

                {/* YTD */}
                <td className={`px-4 py-3 font-mono ${ytd !== null ? colorClass(ytd) : 'text-gray-600'}`}>
                  {ytd !== null ? `${ytd >= 0 ? '+' : ''}${fmt(ytd)}%` : '–'}
                </td>

                {/* Management fee (editable) */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.01"
                      value={fee}
                      onChange={(e) => setFee(sym, e.target.value)}
                      className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white font-mono focus:outline-none focus:border-green-500 text-right"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </td>

                {/* Net CAGR */}
                <td className={`px-4 py-3 font-mono ${netResult ? colorClass(netResult.netCAGR) : 'text-gray-600'}`}>
                  {netResult ? `${netResult.netCAGR >= 0 ? '+' : ''}${fmt(netResult.netCAGR)}%` : '–'}
                </td>

                {/* Gross profit */}
                <td className={`px-4 py-3 font-mono ${netResult ? colorClass(netResult.grossProfit) : 'text-gray-600'}`}>
                  {netResult ? fmtCurrency(netResult.grossProfit) : '–'}
                </td>

                {/* Net Profit */}
                <td className={`px-4 py-3 font-mono font-semibold ${netResult ? colorClass(netResult.netProfit) : 'text-gray-600'}`}>
                  {netResult ? fmtCurrency(netResult.netProfit) : '–'}
                </td>

                {/* Fee cost */}
                <td className="px-4 py-3 font-mono text-red-400">
                  {netResult ? fmtCurrency(netResult.feeCost) : '–'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-gray-600 text-xs px-4 py-3">
        * חישוב Net Profit מניח השקעה חד-פעמית, ריבית דריבית ושיעור דמי ניהול קבוע לאורך כל התקופה.
      </p>
    </div>
  )
}
