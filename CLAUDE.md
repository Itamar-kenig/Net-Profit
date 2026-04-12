# Net Profit – CLAUDE.md

## מה האתר עושה
השוואת תשואות היסטוריות של מניות, מדדים וקרנות סל, עם חישוב רווח נקי אחרי דמי ניהול.

---

## ארכיטקטורה כללית

```
משתמש → React (Vite) → Supabase (PostgreSQL)
                           ↑
                    Python (yfinance)
```

---

## Frontend – React + Vite + Tailwind

### קבצים ראשיים

| קובץ | תפקיד |
|---|---|
| `src/App.jsx` | ניהול state מרכזי, fetch מ-Supabase / demo mode |
| `src/lib/supabase.js` | יצירת Supabase client מ-env vars |
| `src/utils/finance.js` | כל הלוגיקה הפיננסית |
| `src/utils/mockData.js` | נתוני demo כשאין Supabase |

### קומפוננטות

| קובץ | תפקיד |
|---|---|
| `src/components/SearchBar.jsx` | חיפוש סימול + כפתורי quick-add |
| `src/components/ComparisonChart.jsx` | גרף קווי של תשואה מצטברת (Recharts) |
| `src/components/StatsTable.jsx` | טבלה עם CAGR, YTD, דמי ניהול עריכים, Net Profit |

### זרימת נתונים
1. משתמש מוסיף סימול (לדוג׳ `^GSPC`)
2. `App.jsx` שולח query ל-Supabase: `SELECT date, adj_close FROM historical_prices WHERE symbol = '^GSPC'`
3. הנתונים עוברים ל-`finance.js` לחישוב CAGR / YTD / Net Profit
4. `buildChartData()` ממזג סדרות מרובות ל-format של Recharts (downsampling חודשי)
5. `ComparisonChart` ו-`StatsTable` מציגים את התוצאות

### Demo Mode
כשאין `VITE_SUPABASE_URL` אמיתי — `isDemoMode()` מחזיר `true` ו-`App.jsx` טוען נתונים מ-`mockData.js` (Geometric Brownian Motion).

---

## Backend – Python

| קובץ | תפקיד |
|---|---|
| `scripts/fetch_historical_data.py` | מושך OHLCV מ-Yahoo Finance דרך yfinance ומבצע upsert ל-Supabase |
| `scripts/requirements.txt` | yfinance, supabase, pandas, python-dotenv |

**מה הסקריפט עושה:**
1. קורא `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` מ-`.env`
2. לכל סימול (^GSPC, ^IXIC, SPY, QQQ, VOO, VTI, GLD, AGG, ^DJI, ^RUT) — מושך מ-2000 עד היום
3. upsert בבאצ׳ים של 500 שורות לטבלת `historical_prices`
4. safe לריצה חוזרת — `UNIQUE(symbol, date)`

---

## Database – Supabase (PostgreSQL)

### טבלה: `historical_prices`

| עמודה | סוג | הערה |
|---|---|---|
| `id` | BIGSERIAL | מפתח ראשי |
| `symbol` | TEXT | לדוג׳ `^GSPC`, `SPY` |
| `date` | DATE | תאריך מסחר |
| `open/high/low/close` | NUMERIC | מחירים יומיים |
| `adj_close` | NUMERIC | מחיר מתואם (preferred) |
| `volume` | BIGINT | נפח מסחר |

**Indexes:** על `symbol`, `date`, `(symbol, date DESC)`
**RLS:** קריאה פתוחה לכל (anon key) / כתיבה רק ל-service_role

### Migration
`supabase/migrations/20240101000000_create_historical_prices.sql`

---

## לוגיקה פיננסית (`src/utils/finance.js`)

| פונקציה | מה היא מחשבת |
|---|---|
| `calcCAGRFromSeries(prices)` | תשואה שנתית מורכבת מסדרת מחירים |
| `calcYTD(prices)` | תשואה מ-1 לינואר השנה |
| `calcNetProfit({investment, grossCAGR, fee, years})` | רווח ברוטו vs נטו אחרי דמי ניהול |
| `buildChartData(symbols, pricesMap)` | מיזוג סדרות לגרף + downsampling חודשי |
| `getFee(symbol)` | דמי ניהול ידועים לפי סימול (SPY=0.0945%, QQQ=0.2%, ...) |

**נוסחת Net Profit:**
```
grossValue = investment × (1 + CAGR%)^years
netValue   = investment × (1 + CAGR% - fee%)^years
feeCost    = grossValue - netValue
```

---

## משתני סביבה

| משתנה | שימוש |
|---|---|
| `VITE_SUPABASE_URL` | Frontend – כתובת Supabase |
| `VITE_SUPABASE_ANON_KEY` | Frontend – מפתח ציבורי (קריאה בלבד) |
| `SUPABASE_URL` | Python – כתובת Supabase |
| `SUPABASE_SERVICE_KEY` | Python – מפתח service_role (כתיבה) |
| `VITE_DEMO_MODE=true` | אופציונלי – כפיית demo mode |

---

## הרצה מקומית

```bash
# Frontend
npm install
npm run dev          # → http://localhost:5173

# Backend (טעינת נתונים)
cd scripts
pip install -r requirements.txt
python fetch_historical_data.py
```

---

## תלויות עיקריות

| ספריה | גרסה | שימוש |
|---|---|---|
| react | ^18.2 | UI |
| vite | ^5.1 | build tool |
| recharts | ^2.10 | גרפים |
| @supabase/supabase-js | ^2.39 | DB client |
| tailwindcss | ^3.4 | עיצוב |
| yfinance | >=0.2.36 | נתוני מניות |
| supabase (py) | >=2.3 | DB client Python |
