/**
 * symbolsDb.js – Searchable database of common symbols.
 * Each entry: { symbol, name, keywords[] }
 * Keywords are used for name-based search (case-insensitive).
 */
export const SYMBOLS_DB = [
  // ── S&P 500 ─────────────────────────────────────────────
  { symbol: '^GSPC', name: 'S&P 500 Index',             keywords: ['s&p', 'sp500', 'sp 500', 's&p 500', 'index', 'מדד'] },
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF',          keywords: ['s&p', 'sp500', 'sp 500', 's&p 500', 'spdr', 'state street'] },
  { symbol: 'VOO',   name: 'Vanguard S&P 500 ETF',      keywords: ['s&p', 'sp500', 'sp 500', 's&p 500', 'vanguard'] },
  { symbol: 'IVV',   name: 'iShares Core S&P 500 ETF',  keywords: ['s&p', 'sp500', 'sp 500', 's&p 500', 'ishares', 'blackrock'] },
  { symbol: 'SPLG',  name: 'SPDR Portfolio S&P 500 ETF', keywords: ['s&p', 'sp500', 's&p 500', 'spdr'] },

  // ── NASDAQ ───────────────────────────────────────────────
  { symbol: '^IXIC', name: 'NASDAQ Composite Index',    keywords: ['nasdaq', 'נאסד״ק', 'נאסדק', 'tech', 'טכנולוגיה', 'index'] },
  { symbol: 'QQQ',   name: 'Invesco NASDAQ 100 ETF',    keywords: ['nasdaq', 'nasdaq 100', 'נאסד״ק', 'נאסדק', 'invesco', 'tech', 'טכנולוגיה'] },
  { symbol: 'QQQM',  name: 'Invesco NASDAQ 100 ETF (Mini)', keywords: ['nasdaq', 'nasdaq 100', 'invesco', 'tech'] },
  { symbol: 'ONEQ',  name: 'Fidelity NASDAQ Composite ETF', keywords: ['nasdaq', 'fidelity', 'tech'] },

  // ── Dow Jones ────────────────────────────────────────────
  { symbol: '^DJI',  name: 'Dow Jones Industrial Average', keywords: ['dow', 'dow jones', 'djia', 'industrial', 'index'] },
  { symbol: 'DIA',   name: 'SPDR Dow Jones ETF',        keywords: ['dow', 'dow jones', 'djia', 'spdr'] },

  // ── Total Market ─────────────────────────────────────────
  { symbol: 'VTI',   name: 'Vanguard Total Stock Market ETF', keywords: ['total market', 'us market', 'שוק', 'vanguard', 'all market'] },
  { symbol: 'ITOT',  name: 'iShares Core S&P Total US Market ETF', keywords: ['total market', 'us market', 'ishares'] },

  // ── Small Cap ────────────────────────────────────────────
  { symbol: '^RUT',  name: 'Russell 2000 Index',        keywords: ['russell', 'small cap', 'קטן', 'index'] },
  { symbol: 'IWM',   name: 'iShares Russell 2000 ETF',  keywords: ['russell', 'small cap', 'ishares'] },
  { symbol: 'VB',    name: 'Vanguard Small-Cap ETF',    keywords: ['small cap', 'vanguard'] },

  // ── International ────────────────────────────────────────
  { symbol: 'EFA',   name: 'iShares MSCI EAFE ETF',     keywords: ['international', 'europe', 'אירופה', 'developed', 'eafe', 'ishares'] },
  { symbol: 'VEA',   name: 'Vanguard Developed Markets ETF', keywords: ['international', 'europe', 'developed', 'vanguard'] },
  { symbol: 'VXUS',  name: 'Vanguard Total International ETF', keywords: ['international', 'world', 'עולם', 'vanguard'] },
  { symbol: 'EEM',   name: 'iShares MSCI Emerging Markets ETF', keywords: ['emerging', 'מתפתח', 'china', 'סין', 'ishares'] },
  { symbol: 'VWO',   name: 'Vanguard Emerging Markets ETF', keywords: ['emerging', 'מתפתח', 'vanguard'] },

  // ── Bonds ────────────────────────────────────────────────
  { symbol: 'AGG',   name: 'iShares Core US Aggregate Bond ETF', keywords: ['bond', 'bonds', 'אג״ח', 'אגח', 'fixed income', 'ishares'] },
  { symbol: 'BND',   name: 'Vanguard Total Bond Market ETF', keywords: ['bond', 'bonds', 'אג״ח', 'אגח', 'fixed income', 'vanguard'] },
  { symbol: 'TLT',   name: 'iShares 20+ Year Treasury Bond ETF', keywords: ['bond', 'treasury', 'אג״ח', 'long term', 'ishares'] },
  { symbol: 'IEF',   name: 'iShares 7-10 Year Treasury ETF', keywords: ['bond', 'treasury', 'אג״ח', 'medium term', 'ishares'] },
  { symbol: 'SHY',   name: 'iShares 1-3 Year Treasury ETF', keywords: ['bond', 'treasury', 'אג״ח', 'short term', 'ishares'] },

  // ── Commodities ──────────────────────────────────────────
  { symbol: 'GLD',   name: 'SPDR Gold ETF',             keywords: ['gold', 'זהב', 'commodity', 'סחורה', 'spdr'] },
  { symbol: 'IAU',   name: 'iShares Gold Trust',        keywords: ['gold', 'זהב', 'commodity', 'ishares'] },
  { symbol: 'SLV',   name: 'iShares Silver Trust',      keywords: ['silver', 'כסף', 'commodity', 'ishares'] },
  { symbol: 'GDX',   name: 'VanEck Gold Miners ETF',    keywords: ['gold', 'זהב', 'miners', 'vaneck'] },

  // ── Sector ETFs ──────────────────────────────────────────
  { symbol: 'XLK',   name: 'Technology Select Sector SPDR', keywords: ['tech', 'technology', 'טכנולוגיה', 'sector'] },
  { symbol: 'VGT',   name: 'Vanguard Information Technology ETF', keywords: ['tech', 'technology', 'טכנולוגיה', 'vanguard'] },
  { symbol: 'XLE',   name: 'Energy Select Sector SPDR', keywords: ['energy', 'אנרגיה', 'oil', 'נפט', 'sector'] },
  { symbol: 'XLF',   name: 'Financial Select Sector SPDR', keywords: ['finance', 'financial', 'banks', 'בנקים', 'sector'] },
  { symbol: 'XLV',   name: 'Health Care Select Sector SPDR', keywords: ['health', 'healthcare', 'בריאות', 'pharma', 'sector'] },
  { symbol: 'XLY',   name: 'Consumer Discretionary Select Sector SPDR', keywords: ['consumer', 'retail', 'sector'] },
  { symbol: 'VNQ',   name: 'Vanguard Real Estate ETF',  keywords: ['real estate', 'נדלן', 'נדל״ן', 'reit', 'vanguard'] },

  // ── Popular Stocks ───────────────────────────────────────
  { symbol: 'AAPL',  name: 'Apple Inc.',                keywords: ['apple', 'אפל', 'tech', 'iphone'] },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',     keywords: ['microsoft', 'מיקרוסופט', 'tech', 'windows'] },
  { symbol: 'GOOGL', name: 'Alphabet (Google)',          keywords: ['google', 'alphabet', 'גוגל', 'tech'] },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',           keywords: ['amazon', 'אמזון', 'e-commerce', 'cloud'] },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',        keywords: ['nvidia', 'gpu', 'ai', 'chip', 'tech'] },
  { symbol: 'TSLA',  name: 'Tesla Inc.',                keywords: ['tesla', 'ev', 'electric', 'car', 'musk'] },
  { symbol: 'META',  name: 'Meta Platforms (Facebook)', keywords: ['meta', 'facebook', 'פייסבוק', 'social media', 'instagram'] },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway B',      keywords: ['berkshire', 'buffett', 'באפט'] },
  { symbol: 'JPM',   name: 'JPMorgan Chase & Co.',      keywords: ['jpmorgan', 'bank', 'בנק', 'finance'] },
  { symbol: 'V',     name: 'Visa Inc.',                 keywords: ['visa', 'payment', 'credit card'] },

  // ── Israeli / Tel Aviv ───────────────────────────────────
  { symbol: 'EIS',        name: 'iShares MSCI Israel ETF',          keywords: ['israel', 'ישראל', 'tel aviv', 'תל אביב', 'tase'] },
  { symbol: '^TA125.TA',  name: 'תל אביב 125 – מדד הדגל',           keywords: ['תל אביב', 'ta125', 'ת"א 125', 'ישראל', 'israel', 'tase', 'בורסה'] },
  { symbol: '^TA35.TA',   name: 'תל אביב 35 – מדד הבכורה',          keywords: ['תל אביב', 'ta35', 'ת"א 35', 'ישראל', 'israel', 'tase', 'בורסה'] },
  { symbol: '^TA90.TA',   name: 'תל אביב 90 – מדד חברות ביניים',    keywords: ['תל אביב', 'ta90', 'ת"א 90', 'ישראל', 'tase'] },
  { symbol: '^TELBND.TA', name: 'תל בונד – מדד אג"ח תל אביב',       keywords: ['תל בונד', 'אג"ח', 'אגח', 'telbond', 'ישראל', 'israel', 'tase'] },
]

/**
 * Search symbols by query string (matches symbol, name, or keywords).
 * Returns up to `limit` results, sorted by relevance.
 */
export function searchSymbols(query, limit = 8) {
  if (!query || query.trim().length < 1) return []
  const q = query.toLowerCase().trim()

  const results = SYMBOLS_DB.map((entry) => {
    let score = 0
    const sym = entry.symbol.toLowerCase()
    const name = entry.name.toLowerCase()

    if (sym === q) score = 100
    else if (sym.startsWith(q)) score = 80
    else if (name.startsWith(q)) score = 60
    else if (name.includes(q)) score = 40
    else if (entry.keywords.some((k) => k.includes(q))) score = 20
    else if (entry.keywords.some((k) => q.includes(k))) score = 10

    return { ...entry, score }
  }).filter((e) => e.score > 0)

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
