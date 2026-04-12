/**
 * mockData.js – Generates synthetic price series for demo mode.
 * Uses a seeded random walk so results are consistent across reloads.
 *
 * Called when VITE_SUPABASE_URL is not configured, or VITE_DEMO_MODE=true.
 */

// Simple seeded pseudo-random (mulberry32)
function makeRng(seed) {
  let s = seed
  return () => {
    s |= 0; s = s + 0x6d2b79f5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/**
 * Generate monthly closing prices using Geometric Brownian Motion.
 * @param {object} params
 * @param {string} params.symbol
 * @param {number} params.startYear
 * @param {number} params.startPrice
 * @param {number} params.annualReturn  – e.g. 0.10 for 10%
 * @param {number} params.annualVol     – e.g. 0.16 for 16% volatility
 * @param {number} params.seed
 * @returns {Array<{symbol, date, adj_close, close}>}
 */
function generateSeries({ symbol, startYear, startPrice, annualReturn, annualVol, seed }) {
  const rng = makeRng(seed)
  const dt = 1 / 12 // monthly steps
  const mu = annualReturn - 0.5 * annualVol * annualVol
  const sigma = annualVol * Math.sqrt(dt)
  const endYear = new Date().getFullYear()
  const endMonth = new Date().getMonth() // 0-indexed

  const rows = []
  let price = startPrice

  for (let year = startYear; year <= endYear; year++) {
    const maxMonth = year === endYear ? endMonth : 11
    for (let month = 0; month <= maxMonth; month++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-01`
      const z = normalRandom(rng)
      price = price * Math.exp(mu * dt + sigma * z)
      const p = Number(price.toFixed(2))
      rows.push({ symbol, date, adj_close: p, close: p })
    }
  }
  return rows
}

// Box-Muller normal random
function normalRandom(rng) {
  const u1 = rng() || 1e-10
  const u2 = rng()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

// Pre-generated series for the default symbols
export const MOCK_PRICES = {
  '^GSPC': generateSeries({
    symbol: '^GSPC',
    startYear: 2000,
    startPrice: 1469,
    annualReturn: 0.105,
    annualVol: 0.17,
    seed: 1001,
  }),
  '^IXIC': generateSeries({
    symbol: '^IXIC',
    startYear: 2000,
    startPrice: 4069,
    annualReturn: 0.125,
    annualVol: 0.22,
    seed: 1002,
  }),
  SPY: generateSeries({
    symbol: 'SPY',
    startYear: 2000,
    startPrice: 146,
    annualReturn: 0.103,
    annualVol: 0.17,
    seed: 1003,
  }),
  QQQ: generateSeries({
    symbol: 'QQQ',
    startYear: 2000,
    startPrice: 180,
    annualReturn: 0.12,
    annualVol: 0.22,
    seed: 1004,
  }),
  VOO: generateSeries({
    symbol: 'VOO',
    startYear: 2010,
    startPrice: 100,
    annualReturn: 0.13,
    annualVol: 0.16,
    seed: 1005,
  }),
  GLD: generateSeries({
    symbol: 'GLD',
    startYear: 2005,
    startPrice: 45,
    annualReturn: 0.08,
    annualVol: 0.14,
    seed: 1006,
  }),
}

export function isDemoMode() {
  const url = import.meta.env.VITE_SUPABASE_URL || 'https://vwmcuhkwjvcxnnzndgac.supabase.co'
  const demo = import.meta.env.VITE_DEMO_MODE ?? ''
  return demo === 'true' || url.includes('your-project-id')
}
