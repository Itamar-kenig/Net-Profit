/**
 * symbolsDb.js – Searchable database of common symbols.
 * Each entry: { symbol, name, keywords[] }
 * Keywords support Hebrew slang, partial names, and common misspellings.
 */
export const SYMBOLS_DB = [
  // ── S&P 500 ─────────────────────────────────────────────
  { symbol: '^GSPC', name: 'S&P 500 Index',
    keywords: ['s&p', 'sp500', 'sp 500', 's&p 500', 'index', 'מדד', 'סנופי', 'סנופ', 'אס אנד פי', 'אס פי', 'חמש מאות', 'מדד אמריקאי'] },
  { symbol: 'SPY',   name: 'SPDR S&P 500 ETF',
    keywords: ['s&p', 'sp500', 's&p 500', 'spdr', 'state street', 'סנופי', 'סנופ', 'אס פי', 'קרן סל'] },
  { symbol: 'VOO',   name: 'Vanguard S&P 500 ETF',
    keywords: ['s&p', 'sp500', 's&p 500', 'vanguard', 'ואנגארד', 'סנופי', 'קרן סל'] },
  { symbol: 'IVV',   name: 'iShares Core S&P 500 ETF',
    keywords: ['s&p', 'sp500', 's&p 500', 'ishares', 'blackrock', 'סנופי', 'קרן סל'] },
  { symbol: 'SPLG',  name: 'SPDR Portfolio S&P 500 ETF',
    keywords: ['s&p', 'sp500', 's&p 500', 'spdr', 'סנופי', 'קרן סל'] },

  // ── NASDAQ ───────────────────────────────────────────────
  { symbol: '^NDX',  name: 'NASDAQ 100 Index',
    keywords: ['nasdaq 100', 'nasdaq100', 'נאסד״ק 100', 'נאסדק 100', 'נאסד 100', 'tech', 'טכנולוגיה', 'index', 'מדד טכנולוגיה', 'הייטק'] },
  { symbol: '^IXIC', name: 'NASDAQ Composite Index',
    keywords: ['nasdaq', 'נאסד״ק', 'נאסדק', 'נאסד', 'tech', 'טכנולוגיה', 'index', 'מדד טכנולוגיה', 'הייטק'] },
  { symbol: 'QQQ',   name: 'Invesco NASDAQ 100 ETF',
    keywords: ['nasdaq', 'nasdaq 100', 'נאסד״ק', 'נאסדק', 'נאסד', 'invesco', 'tech', 'טכנולוגיה', 'הייטק', 'קרן סל'] },
  { symbol: 'QQQM',  name: 'Invesco NASDAQ 100 ETF (Mini)',
    keywords: ['nasdaq', 'nasdaq 100', 'נאסדק', 'invesco', 'tech', 'טכנולוגיה', 'קרן סל'] },
  { symbol: 'ONEQ',  name: 'Fidelity NASDAQ Composite ETF',
    keywords: ['nasdaq', 'נאסדק', 'fidelity', 'tech', 'טכנולוגיה'] },

  // ── Dow Jones ────────────────────────────────────────────
  { symbol: '^DJI',  name: 'Dow Jones Industrial Average',
    keywords: ['dow', 'dow jones', 'djia', 'industrial', 'index', 'דאו', 'דאו ג\'ונס', 'דאו ג׳ונס', 'ג\'ונס', 'תעשייתי', 'מדד'] },
  { symbol: 'DIA',   name: 'SPDR Dow Jones ETF',
    keywords: ['dow', 'dow jones', 'djia', 'spdr', 'דאו', 'ג\'ונס', 'קרן סל'] },

  // ── Total Market ─────────────────────────────────────────
  { symbol: 'VTI',   name: 'Vanguard Total Stock Market ETF',
    keywords: ['total market', 'us market', 'שוק', 'שוק אמריקאי', 'שוק כולל', 'vanguard', 'ואנגארד', 'all market', 'קרן סל'] },
  { symbol: 'ITOT',  name: 'iShares Core S&P Total US Market ETF',
    keywords: ['total market', 'us market', 'שוק כולל', 'ishares', 'קרן סל'] },

  // ── Small Cap ────────────────────────────────────────────
  { symbol: '^RUT',  name: 'Russell 2000 Index',
    keywords: ['russell', 'ראסל', 'small cap', 'קטן', 'חברות קטנות', 'index', 'מדד'] },
  { symbol: 'IWM',   name: 'iShares Russell 2000 ETF',
    keywords: ['russell', 'ראסל', 'small cap', 'חברות קטנות', 'ishares', 'קרן סל'] },
  { symbol: 'VB',    name: 'Vanguard Small-Cap ETF',
    keywords: ['small cap', 'חברות קטנות', 'vanguard', 'ואנגארד', 'קרן סל'] },

  // ── International broad ──────────────────────────────────
  { symbol: 'EFA',   name: 'iShares MSCI EAFE ETF',
    keywords: ['international', 'europe', 'אירופה', 'בינלאומי', 'developed', 'מפותחות', 'eafe', 'ishares', 'קרן סל'] },
  { symbol: 'VEA',   name: 'Vanguard Developed Markets ETF',
    keywords: ['international', 'europe', 'אירופה', 'בינלאומי', 'developed', 'מפותחות', 'vanguard', 'ואנגארד', 'קרן סל'] },
  { symbol: 'VXUS',  name: 'Vanguard Total International ETF',
    keywords: ['international', 'world', 'עולם', 'בינלאומי', 'vanguard', 'ואנגארד', 'קרן סל'] },
  { symbol: 'EEM',   name: 'iShares MSCI Emerging Markets ETF',
    keywords: ['emerging', 'מתפתח', 'שווקים מתפתחים', 'china', 'סין', 'ishares', 'קרן סל'] },
  { symbol: 'VWO',   name: 'Vanguard Emerging Markets ETF',
    keywords: ['emerging', 'מתפתח', 'שווקים מתפתחים', 'vanguard', 'ואנגארד', 'קרן סל'] },
  { symbol: 'ACWI',  name: 'iShares MSCI ACWI ETF – כל העולם',
    keywords: ['global', 'world', 'עולם', 'גלובלי', 'all world', 'כל העולם', 'acwi', 'ishares', 'קרן סל'] },
  { symbol: 'VT',    name: 'Vanguard Total World Stock ETF',
    keywords: ['global', 'world', 'עולם', 'גלובלי', 'all world', 'כל העולם', 'vanguard', 'ואנגארד', 'קרן סל'] },

  // ── Europe broad ─────────────────────────────────────────
  { symbol: '^STOXX50E', name: 'Euro Stoxx 50 – מדד אירופה',
    keywords: ['europe', 'אירופה', 'european', 'stoxx', 'euro stoxx', 'stoxx 50', 'מדד אירופי', 'index', 'מדד'] },
  { symbol: 'VGK',   name: 'Vanguard FTSE Europe ETF',
    keywords: ['europe', 'אירופה', 'european', 'vanguard', 'ואנגארד', 'ftse europe', 'קרן סל'] },
  { symbol: 'IEV',   name: 'iShares Europe ETF',
    keywords: ['europe', 'אירופה', 'european', 'ishares', 'קרן סל'] },
  { symbol: 'FEZ',   name: 'SPDR Euro Stoxx 50 ETF',
    keywords: ['europe', 'אירופה', 'european', 'stoxx 50', 'euro stoxx', 'spdr', 'קרן סל'] },

  // ── Europe – countries ───────────────────────────────────
  { symbol: '^GDAXI', name: 'DAX – מדד גרמניה',
    keywords: ['germany', 'גרמניה', 'german', 'deutsch', 'dax', 'דאקס', 'frankfurter', 'מדד', 'index'] },
  { symbol: 'EWG',   name: 'iShares MSCI Germany ETF',
    keywords: ['germany', 'גרמניה', 'german', 'deutsch', 'dax', 'דאקס', 'ishares', 'קרן סל'] },
  { symbol: '^FCHI', name: 'CAC 40 – מדד צרפת',
    keywords: ['france', 'צרפת', 'french', 'cac', 'קאק', 'cac 40', 'פריז', 'paris', 'מדד', 'index'] },
  { symbol: 'EWQ',   name: 'iShares MSCI France ETF',
    keywords: ['france', 'צרפת', 'french', 'cac', 'קאק', 'ishares', 'קרן סל'] },
  { symbol: '^FTSE', name: 'FTSE 100 – מדד בריטניה',
    keywords: ['uk', 'britain', 'england', 'בריטניה', 'אנגליה', 'ftse', 'ftse 100', 'לונדון', 'london', 'מדד', 'index'] },
  { symbol: 'EWU',   name: 'iShares MSCI United Kingdom ETF',
    keywords: ['uk', 'britain', 'england', 'בריטניה', 'אנגליה', 'ftse', 'לונדון', 'london', 'ishares', 'קרן סל'] },
  { symbol: 'EWI',   name: 'iShares MSCI Italy ETF',
    keywords: ['italy', 'איטליה', 'italian', 'ishares', 'קרן סל'] },
  { symbol: 'EWP',   name: 'iShares MSCI Spain ETF',
    keywords: ['spain', 'ספרד', 'spanish', 'ibex', 'ishares', 'קרן סל'] },
  { symbol: 'EWL',   name: 'iShares MSCI Switzerland ETF',
    keywords: ['switzerland', 'שוויץ', 'swiss', 'ishares', 'קרן סל'] },
  { symbol: 'EWN',   name: 'iShares MSCI Netherlands ETF',
    keywords: ['netherlands', 'holland', 'הולנד', 'dutch', 'amsterdam', 'ishares', 'קרן סל'] },
  { symbol: 'EWD',   name: 'iShares MSCI Sweden ETF',
    keywords: ['sweden', 'שוודיה', 'swedish', 'nordic', 'נורדי', 'ishares', 'קרן סל'] },

  // ── Japan ────────────────────────────────────────────────
  { symbol: '^N225', name: 'Nikkei 225 – מדד יפן',
    keywords: ['japan', 'יפן', 'japanese', 'nikkei', 'ניקיי', 'טוקיו', 'tokyo', 'מדד', 'index'] },
  { symbol: 'EWJ',   name: 'iShares MSCI Japan ETF',
    keywords: ['japan', 'יפן', 'japanese', 'nikkei', 'ניקיי', 'טוקיו', 'tokyo', 'ishares', 'קרן סל'] },
  { symbol: 'DXJ',   name: 'WisdomTree Japan Hedged Equity ETF',
    keywords: ['japan', 'יפן', 'japanese', 'wisdomtree', 'hedged', 'מגודר', 'קרן סל'] },

  // ── China ────────────────────────────────────────────────
  { symbol: '^HSI',  name: 'Hang Seng – מדד הונג קונג',
    keywords: ['hongkong', 'hong kong', 'הונג קונג', 'china', 'סין', 'hang seng', 'מדד', 'index'] },
  { symbol: 'MCHI',  name: 'iShares MSCI China ETF',
    keywords: ['china', 'סין', 'chinese', 'shanghai', 'שנגחאי', 'beijing', 'בייג׳ינג', 'ishares', 'קרן סל'] },
  { symbol: 'FXI',   name: 'iShares China Large-Cap ETF',
    keywords: ['china', 'סין', 'chinese', 'large cap', 'ishares', 'קרן סל'] },
  { symbol: 'KWEB',  name: 'KraneShares CSI China Internet ETF',
    keywords: ['china', 'סין', 'chinese', 'internet', 'אינטרנט', 'tech', 'טכנולוגיה', 'kraneshares', 'קרן סל'] },

  // ── India ────────────────────────────────────────────────
  { symbol: '^BSESN', name: 'BSE Sensex – מדד הודו',
    keywords: ['india', 'הודו', 'indian', 'sensex', 'סנסקס', 'mumbai', 'מומביי', 'מדד', 'index'] },
  { symbol: 'INDA',  name: 'iShares MSCI India ETF',
    keywords: ['india', 'הודו', 'indian', 'sensex', 'סנסקס', 'mumbai', 'מומביי', 'ishares', 'קרן סל'] },
  { symbol: 'INDY',  name: 'iShares India 50 ETF',
    keywords: ['india', 'הודו', 'indian', 'nifty', 'ניפטי', 'ishares', 'קרן סל'] },

  // ── South Korea ──────────────────────────────────────────
  { symbol: '^KS11', name: 'KOSPI – מדד דרום קוריאה',
    keywords: ['korea', 'קוריאה', 'south korea', 'דרום קוריאה', 'kospi', 'korean', 'מדד', 'index'] },
  { symbol: 'EWY',   name: 'iShares MSCI South Korea ETF',
    keywords: ['korea', 'קוריאה', 'south korea', 'דרום קוריאה', 'korean', 'samsung', 'סמסונג', 'ishares', 'קרן סל'] },

  // ── Other markets ────────────────────────────────────────
  { symbol: '^AXJO', name: 'ASX 200 – מדד אוסטרליה',
    keywords: ['australia', 'אוסטרליה', 'australian', 'asx', 'מדד', 'index'] },
  { symbol: 'EWA',   name: 'iShares MSCI Australia ETF',
    keywords: ['australia', 'אוסטרליה', 'australian', 'asx', 'ishares', 'קרן סל'] },
  { symbol: 'EWT',   name: 'iShares MSCI Taiwan ETF',
    keywords: ['taiwan', 'טייוואן', 'taiwanese', 'tsmc', 'טי אס אם סי', 'ishares', 'קרן סל'] },
  { symbol: 'EWC',   name: 'iShares MSCI Canada ETF',
    keywords: ['canada', 'קנדה', 'canadian', 'toronto', 'tsx', 'ishares', 'קרן סל'] },
  { symbol: 'EWZ',   name: 'iShares MSCI Brazil ETF',
    keywords: ['brazil', 'ברזיל', 'brazilian', 'emerging', 'שווקים מתפתחים', 'ishares', 'קרן סל'] },

  // ── Bonds ────────────────────────────────────────────────
  { symbol: 'AGG',   name: 'iShares Core US Aggregate Bond ETF',
    keywords: ['bond', 'bonds', 'אג״ח', 'אגח', 'אגרות חוב', 'fixed income', 'ishares', 'קרן סל'] },
  { symbol: 'BND',   name: 'Vanguard Total Bond Market ETF',
    keywords: ['bond', 'bonds', 'אג״ח', 'אגח', 'אגרות חוב', 'fixed income', 'vanguard', 'ואנגארד', 'קרן סל'] },
  { symbol: 'TLT',   name: 'iShares 20+ Year Treasury Bond ETF',
    keywords: ['bond', 'treasury', 'אג״ח', 'אגרות חוב', 'אוצר', 'long term', 'ארוך', 'ishares', 'קרן סל'] },
  { symbol: 'IEF',   name: 'iShares 7-10 Year Treasury ETF',
    keywords: ['bond', 'treasury', 'אג״ח', 'אגרות חוב', 'אוצר', 'medium term', 'בינוני', 'ishares', 'קרן סל'] },
  { symbol: 'SHY',   name: 'iShares 1-3 Year Treasury ETF',
    keywords: ['bond', 'treasury', 'אג״ח', 'אגרות חוב', 'אוצר', 'short term', 'קצר', 'ishares', 'קרן סל'] },

  // ── Commodities ──────────────────────────────────────────
  { symbol: 'GLD',   name: 'SPDR Gold ETF',
    keywords: ['gold', 'זהב', 'commodity', 'סחורה', 'מתכת', 'spdr', 'קרן סל'] },
  { symbol: 'IAU',   name: 'iShares Gold Trust',
    keywords: ['gold', 'זהב', 'commodity', 'סחורה', 'מתכת', 'ishares', 'קרן סל'] },
  { symbol: 'SLV',   name: 'iShares Silver Trust',
    keywords: ['silver', 'כסף', 'כסף מתכת', 'commodity', 'סחורה', 'מתכת', 'ishares', 'קרן סל'] },
  { symbol: 'GDX',   name: 'VanEck Gold Miners ETF',
    keywords: ['gold', 'זהב', 'miners', 'כרייה', 'מכרות', 'vaneck', 'קרן סל'] },

  // ── Sector ETFs ──────────────────────────────────────────
  { symbol: 'XLK',   name: 'Technology Select Sector SPDR',
    keywords: ['tech', 'technology', 'טכנולוגיה', 'הייטק', 'היי טק', 'sector', 'ענף', 'קרן סל'] },
  { symbol: 'VGT',   name: 'Vanguard Information Technology ETF',
    keywords: ['tech', 'technology', 'טכנולוגיה', 'הייטק', 'vanguard', 'ואנגארד', 'קרן סל'] },
  { symbol: 'XLE',   name: 'Energy Select Sector SPDR',
    keywords: ['energy', 'אנרגיה', 'oil', 'נפט', 'גז', 'sector', 'ענף', 'קרן סל'] },
  { symbol: 'XLF',   name: 'Financial Select Sector SPDR',
    keywords: ['finance', 'financial', 'banks', 'בנקים', 'בנקאות', 'פיננסים', 'פיננסי', 'sector', 'ענף', 'קרן סל'] },
  { symbol: 'XLV',   name: 'Health Care Select Sector SPDR',
    keywords: ['health', 'healthcare', 'בריאות', 'רפואה', 'פארמה', 'תרופות', 'pharma', 'sector', 'ענף', 'קרן סל'] },
  { symbol: 'XLY',   name: 'Consumer Discretionary Select Sector SPDR',
    keywords: ['consumer', 'retail', 'צרכנות', 'קמעונאות', 'קמעוניות', 'sector', 'ענף', 'קרן סל'] },
  { symbol: 'VNQ',   name: 'Vanguard Real Estate ETF',
    keywords: ['real estate', 'נדלן', 'נדל״ן', 'נדל"ן', 'ריט', 'reit', 'vanguard', 'ואנגארד', 'קרן סל'] },

  // ── Popular Stocks ───────────────────────────────────────
  { symbol: 'AAPL',  name: 'Apple Inc.',
    keywords: ['apple', 'אפל', 'tech', 'iphone', 'אייפון', 'מק', 'mac', 'מניה'] },
  { symbol: 'MSFT',  name: 'Microsoft Corporation',
    keywords: ['microsoft', 'מיקרוסופט', 'מייקרוסופט', 'tech', 'windows', 'חלונות', 'אופיס', 'office', 'azure', 'מניה'] },
  { symbol: 'GOOGL', name: 'Alphabet (Google)',
    keywords: ['google', 'alphabet', 'גוגל', 'אלפבית', 'tech', 'youtube', 'יוטיוב', 'מניה'] },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',
    keywords: ['amazon', 'אמזון', 'e-commerce', 'מסחר אלקטרוני', 'cloud', 'aws', 'מניה'] },
  { symbol: 'NVDA',  name: 'NVIDIA Corporation',
    keywords: ['nvidia', 'נבידיה', 'נויידיה', 'gpu', 'ai', 'בינה מלאכותית', 'chip', 'מעבד', 'tech', 'מניה'] },
  { symbol: 'TSLA',  name: 'Tesla Inc.',
    keywords: ['tesla', 'טסלה', 'ev', 'חשמלית', 'מכונית חשמלית', 'electric', 'car', 'musk', 'מאסק', 'אילון מאסק', 'מניה'] },
  { symbol: 'META',  name: 'Meta Platforms (Facebook)',
    keywords: ['meta', 'מטא', 'facebook', 'פייסבוק', 'social media', 'רשת חברתית', 'instagram', 'אינסטגרם', 'whatsapp', 'וואטסאפ', 'מניה'] },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway B',
    keywords: ['berkshire', 'ברקשייר', 'hathaway', 'buffett', 'באפט', 'וורן באפט', 'warren', 'מניה'] },
  { symbol: 'JPM',   name: 'JPMorgan Chase & Co.',
    keywords: ['jpmorgan', 'jp morgan', 'ג\'יי פי מורגן', 'ג׳יי פי מורגן', 'bank', 'בנק', 'finance', 'פיננסים', 'מניה'] },
  { symbol: 'V',     name: 'Visa Inc.',
    keywords: ['visa', 'ויזה', 'payment', 'תשלום', 'credit card', 'כרטיס אשראי', 'מניה'] },

  // ── Israeli / Tel Aviv ───────────────────────────────────
  { symbol: 'EIS',        name: 'iShares MSCI Israel ETF',
    keywords: ['israel', 'ישראל', 'tel aviv', 'תל אביב', 'tase', 'בורסה', 'קרן סל'] },
  { symbol: '^TA125.TA',  name: 'תל אביב 125 – מדד הדגל',
    keywords: ['תל אביב', 'ta125', 'ת"א 125', 'תא 125', 'ישראל', 'israel', 'tase', 'בורסה', 'מדד', 'מדד ישראלי'] },
  { symbol: '^TA35.TA',   name: 'תל אביב 35 – מדד הבכורה',
    keywords: ['תל אביב', 'ta35', 'ת"א 35', 'תא 35', 'ישראל', 'israel', 'tase', 'בורסה', 'מדד', 'מדד ישראלי'] },
  { symbol: '^TA90.TA',   name: 'תל אביב 90 – מדד חברות ביניים',
    keywords: ['תל אביב', 'ta90', 'ת"א 90', 'תא 90', 'ישראל', 'tase', 'בורסה', 'מדד'] },
  { symbol: '^TELBND.TA', name: 'תל בונד – מדד אג"ח תל אביב',
    keywords: ['תל בונד', 'telbond', 'אג"ח', 'אגח', 'אגרות חוב', 'ישראל', 'israel', 'tase', 'בורסה'] },
]

/**
 * Search symbols by query string (matches symbol, name, or keywords).
 * Supports partial Hebrew typing – keyword.startsWith(query) scores higher than keyword.includes(query).
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
    else if (entry.keywords.some((k) => k === q)) score = 38
    else if (entry.keywords.some((k) => k.startsWith(q))) score = 28
    else if (entry.keywords.some((k) => k.includes(q))) score = 18
    else if (entry.keywords.some((k) => q.includes(k) && k.length >= 2)) score = 8

    return { ...entry, score }
  }).filter((e) => e.score > 0)

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
