/**
 * finance.js – Core financial calculations for Net Profit.
 *
 * All "return" values are expressed as percentages (e.g. 8.5 = 8.5%).
 * All "fee" values are expressed as percentages per year (e.g. 0.03 = 0.03% / yr).
 */

// ---------------------------------------------------------------------------
// Period filtering
// ---------------------------------------------------------------------------

export const PERIODS = [
  { label: 'יום',        value: '1D'  },
  { label: 'שבוע',       value: '1W'  },
  { label: 'חודש',       value: '1M'  },
  { label: '3 חודשים',  value: '3M'  },
  { label: '6 חודשים',  value: '6M'  },
  { label: 'מתחילת שנה', value: 'YTD' },
  { label: 'שנה',        value: '1Y'  },
  { label: '3 שנים',     value: '3Y'  },
  { label: '5 שנים',     value: '5Y'  },
  { label: 'עשור',       value: '10Y' },
  { label: 'הכל',        value: 'ALL' },
]

/**
 * Filter a price series by period or custom date range.
 */
export function filterPrices(prices, period, customStart = '', customEnd = '') {
  if (!prices || prices.length === 0) return prices
  if (period === 'ALL') return prices

  const today = new Date()
  let startDate = null
  let endDate = today

  if (period === 'custom') {
    startDate = customStart ? new Date(customStart) : null
    endDate   = customEnd   ? new Date(customEnd)   : today
    return prices.filter((p) => {
      const d = new Date(p.date)
      return (!startDate || d >= startDate) && d <= endDate
    })
  }

  if (period === 'YTD') {
    startDate = new Date(today.getFullYear(), 0, 1)
  } else {
    const daysMap = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180,
                      '1Y': 365, '3Y': 1095, '5Y': 1825, '10Y': 3650 }
    const days = daysMap[period]
    if (days) { startDate = new Date(today); startDate.setDate(startDate.getDate() - days) }
  }

  return prices.filter((p) => !startDate || new Date(p.date) >= startDate)
}

/**
 * Returns annual return for each calendar year in the price series.
 */
export function calcYearlyReturns(prices) {
  if (!prices || prices.length < 2) return []
  const byYear = {}
  for (const p of prices) {
    const yr = new Date(p.date).getFullYear()
    if (!byYear[yr]) byYear[yr] = []
    byYear[yr].push(p)
  }
  const years = Object.keys(byYear).map(Number).sort()
  return years.map((yr) => {
    const arr = byYear[yr]
    const s = (arr[0].adj_close ?? arr[0].close)
    const e = (arr[arr.length - 1].adj_close ?? arr[arr.length - 1].close)
    if (!s || !e) return null
    return { year: yr, return: Number((((e - s) / s) * 100).toFixed(2)) }
  }).filter(Boolean)
}

/**
 * Returns monthly return for each calendar month in the price series.
 */
export function calcMonthlyReturns(prices) {
  if (!prices || prices.length < 2) return []
  const byMonth = {}
  for (const p of prices) {
    const ym = p.date.slice(0, 7) // "YYYY-MM"
    byMonth[ym] = p               // keep last price of each month
  }
  const months = Object.keys(byMonth).sort()
  const results = []
  for (let i = 1; i < months.length; i++) {
    const s = price(byMonth[months[i - 1]])
    const e = price(byMonth[months[i]])
    if (!s || !e) continue
    results.push({ month: months[i], return: Number((((e - s) / s) * 100).toFixed(2)) })
  }
  return results
}

// ---------------------------------------------------------------------------
// Known annual management fees (%) for common ETFs / indices
// Index symbols have no fee because they are theoretical benchmarks.
// ---------------------------------------------------------------------------
export const KNOWN_FEES = {
  // US broad market
  SPY: 0.0945,
  IVV: 0.03,
  VOO: 0.03,
  VTI: 0.03,
  // NASDAQ
  QQQ: 0.2,
  QQQM: 0.15,
  // International
  EFA: 0.32,
  EEM: 0.68,
  VEA: 0.05,
  VWO: 0.08,
  // Fixed income
  AGG: 0.03,
  BND: 0.03,
  // Commodities
  GLD: 0.4,
  SLV: 0.5,
  // Index benchmarks – no fee
  '^GSPC': 0,
  '^IXIC': 0,
  '^DJI': 0,
  '^RUT': 0,
  '^FTSE': 0,
  '^N225': 0,
}

/**
 * Returns the known management fee for a symbol, or null if unknown.
 * @param {string} symbol
 * @returns {number|null}
 */
export function getFee(symbol) {
  const fee = KNOWN_FEES[symbol.toUpperCase()]
  return fee !== undefined ? fee : null
}

// ---------------------------------------------------------------------------
// Price helpers
// ---------------------------------------------------------------------------

/** Returns the adjusted close (preferred) or close for a price record. */
function price(record) {
  return record.adj_close ?? record.close
}

// ---------------------------------------------------------------------------
// Cumulative return series
// ---------------------------------------------------------------------------

/**
 * Converts a price series to a cumulative-return series, rebased to 0 % at
 * the first data point.
 *
 * @param {Array<{date: string, adj_close?: number, close?: number}>} prices
 * @returns {Array<{date: string, cumReturn: number}>}
 */
export function calcCumulativeReturns(prices) {
  if (!prices || prices.length === 0) return []
  const base = price(prices[0])
  if (!base) return []
  return prices.map((p) => ({
    date: p.date,
    cumReturn: Number((((price(p) - base) / base) * 100).toFixed(2)),
  }))
}

// ---------------------------------------------------------------------------
// CAGR
// ---------------------------------------------------------------------------

/**
 * Compound Annual Growth Rate.
 *
 * @param {number} startPrice
 * @param {number} endPrice
 * @param {number} years  – must be > 0
 * @returns {number} CAGR in percent
 */
export function calcCAGR(startPrice, endPrice, years) {
  if (years <= 0 || startPrice <= 0 || endPrice <= 0) return 0
  return Number(((Math.pow(endPrice / startPrice, 1 / years) - 1) * 100).toFixed(2))
}

/**
 * Derives CAGR directly from a sorted price array.
 *
 * @param {Array<{date: string, adj_close?: number, close?: number}>} prices
 * @returns {number} CAGR in percent, or 0 if insufficient data
 */
export function calcCAGRFromSeries(prices) {
  if (!prices || prices.length < 2) return 0
  const startPrice = price(prices[0])
  const endPrice = price(prices[prices.length - 1])
  const years =
    (new Date(prices[prices.length - 1].date) - new Date(prices[0].date)) /
    (365.25 * 24 * 60 * 60 * 1000)
  return calcCAGR(startPrice, endPrice, years)
}

// ---------------------------------------------------------------------------
// YTD
// ---------------------------------------------------------------------------

/**
 * Year-to-date return.
 *
 * Finds the last trading day of the previous year (or the first record of the
 * current year) as the baseline, and compares it to the latest record.
 *
 * @param {Array<{date: string, adj_close?: number, close?: number}>} prices
 * @returns {number} YTD return in percent
 */
export function calcYTD(prices) {
  if (!prices || prices.length < 2) return 0
  const currentYear = new Date().getFullYear()
  // Last price of the previous year
  const prevYearPrices = prices.filter((p) => new Date(p.date).getFullYear() < currentYear)
  const baseline =
    prevYearPrices.length > 0
      ? prevYearPrices[prevYearPrices.length - 1]
      : prices[0]
  const latest = prices[prices.length - 1]
  const base = price(baseline)
  const last = price(latest)
  if (!base || !last) return 0
  return Number((((last - base) / base) * 100).toFixed(2))
}

// ---------------------------------------------------------------------------
// Net Profit (the core metric)
// ---------------------------------------------------------------------------

/**
 * Calculates gross vs. net portfolio value and profit after annual fees.
 *
 * The fee is applied as a continuous drag on returns:
 *   netRate = grossCAGR% - managementFee%
 *
 * @param {object} params
 * @param {number} params.initialInvestment  – in any currency unit
 * @param {number} params.grossCAGR          – percent per year (e.g. 10.5)
 * @param {number} params.managementFee      – percent per year (e.g. 0.2)
 * @param {number} params.years              – investment horizon
 * @returns {{
 *   grossValue:  number,
 *   netValue:    number,
 *   grossProfit: number,
 *   netProfit:   number,
 *   feeCost:     number,
 *   netCAGR:     number,
 * }}
 */
export function calcNetProfit({ initialInvestment, grossCAGR, managementFee, years }) {
  const grossRate = grossCAGR / 100
  const feeRate = managementFee / 100
  const netRate = grossRate - feeRate

  const grossValue = initialInvestment * Math.pow(1 + grossRate, years)
  const netValue = initialInvestment * Math.pow(1 + netRate, years)

  return {
    grossValue: Number(grossValue.toFixed(2)),
    netValue: Number(netValue.toFixed(2)),
    grossProfit: Number((grossValue - initialInvestment).toFixed(2)),
    netProfit: Number((netValue - initialInvestment).toFixed(2)),
    feeCost: Number((grossValue - netValue).toFixed(2)),
    netCAGR: Number((netRate * 100).toFixed(2)),
  }
}

// ---------------------------------------------------------------------------
// Chart data merging
// ---------------------------------------------------------------------------

/**
 * Merges price series from multiple symbols into a single chart-ready array.
 * Each entry: { date, [symbol]: cumReturnPercent, ... }
 *
 * For performance with large datasets, data is downsampled to monthly frequency.
 *
 * @param {string[]} symbols
 * @param {Record<string, Array>} pricesMap  – symbol → sorted price array
 * @returns {Array<Record<string, any>>}
 */
export function buildChartData(symbols, pricesMap) {
  if (symbols.length === 0) return []

  // Build per-symbol lookup: date string → price
  const lookups = {}
  const bases = {}

  for (const sym of symbols) {
    const prices = pricesMap[sym]
    if (!prices || prices.length === 0) continue
    lookups[sym] = {}
    for (const p of prices) {
      lookups[sym][p.date] = price(p)
    }
    bases[sym] = price(prices[0])
  }

  // Collect all dates, then downsample: keep first trading day of each month
  const allDates = new Set()
  for (const sym of symbols) {
    if (pricesMap[sym]) pricesMap[sym].forEach((p) => allDates.add(p.date))
  }

  const sorted = Array.from(allDates).sort()
  const monthly = []
  let lastMonth = ''
  for (const d of sorted) {
    const ym = d.slice(0, 7) // "YYYY-MM"
    if (ym !== lastMonth) {
      monthly.push(d)
      lastMonth = ym
    }
  }
  // Always include the latest actual date so the chart endpoint matches the table
  const latestDate = sorted[sorted.length - 1]
  if (monthly.length > 0 && monthly[monthly.length - 1] !== latestDate) {
    monthly.push(latestDate)
  }

  return monthly.map((date) => {
    const point = { date }
    for (const sym of symbols) {
      if (!lookups[sym] || !bases[sym]) continue
      // Walk backwards up to 5 days to find the nearest available price
      let found = lookups[sym][date]
      if (found === undefined) {
        for (let i = 1; i <= 5; i++) {
          const d = new Date(date)
          d.setDate(d.getDate() - i)
          const key = d.toISOString().slice(0, 10)
          if (lookups[sym][key] !== undefined) {
            found = lookups[sym][key]
            break
          }
        }
      }
      if (found !== undefined) {
        point[sym] = Number((((found - bases[sym]) / bases[sym]) * 100).toFixed(2))
      }
    }
    return point
  })
}
