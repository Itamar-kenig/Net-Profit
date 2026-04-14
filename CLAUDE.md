# Net Profit – CLAUDE.md

## מה האתר עושה
השוואת תשואות היסטוריות של מניות, מדדים וקרנות סל, עם חישוב רווח נקי אחרי דמי ניהול.

---

## ארכיטקטורה כללית

```
משתמש → React (Vite) → Supabase (PostgreSQL)
                           ↑
                    Python (yfinance) / Supabase Edge Function (Deno)
```

---

## Frontend – React + Vite + Tailwind

### קבצים ראשיים

| קובץ | תפקיד |
|---|---|
| `src/App.jsx` | ניהול state מרכזי, fetch מ-Supabase / demo mode |
| `src/lib/supabase.js` | יצירת Supabase client (עם fallback credentials מקודדים לבולט) |
| `src/utils/finance.js` | כל הלוגיקה הפיננסית |
| `src/utils/mockData.js` | נתוני demo כשאין Supabase |
| `src/utils/symbolsDb.js` | מאגר ~50 סימולים עם מילות חיפוש בעברית ואנגלית |

### קומפוננטות

| קובץ | תפקיד |
|---|---|
| `src/components/SearchBar.jsx` | חיפוש autocomplete + quick-add chips (localStorage) |
| `src/components/ComparisonChart.jsx` | גרף קווי של תשואה מצטברת (Recharts) + בחירת תקופה |
| `src/components/StatsTable.jsx` | טבלת השוואה עם CAGR, תשואות, דמי ניהול, Net Profit |

### זרימת נתונים
1. משתמש מוסיף סימול דרך `SearchBar` (autocomplete מ-`symbolsDb.js`)
2. `App.jsx` שולח query ל-Supabase: `SELECT date, adj_close, close FROM historical_prices WHERE symbol = '...'`
3. אם הסימול לא קיים ב-DB — קריאה ל-Edge Function `fetch-symbol` שמושכת מ-Yahoo Finance ושומרת ב-Supabase
4. הנתונים עוברים ל-`finance.js` לחישוב CAGR / Net Profit
5. `buildChartData()` ממזג סדרות מרובות ל-format של Recharts (downsampling חודשי + נקודה אחרונה תמיד)
6. `ComparisonChart` ו-`StatsTable` מציגים את התוצאות

### Quick Symbols (localStorage)
- ברירת מחדל: `['^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ', 'VOO', 'GLD']`
- שמורים ב-`localStorage` תחת מפתח `np-quick`
- ניתן להוסיף/להסיר דרך ה-UI

### Demo Mode
כשאין `VITE_SUPABASE_URL` אמיתי — `isDemoMode()` מחזיר `true` ו-`App.jsx` טוען נתונים מ-`mockData.js` (Geometric Brownian Motion).

---

## Backend – Python

| קובץ | תפקיד |
|---|---|
| `scripts/fetch_historical_data.py` | מושך OHLCV מ-Yahoo Finance דרך yfinance ומבצע upsert ל-Supabase |
| `scripts/requirements.txt` | yfinance, supabase, pandas, python-dotenv |

**מה הסקריפט עושה:**
1. קורא `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` מ-`.env` / GitHub Secrets
2. לכל סימול ברשימה (35+) — מושך מ-**1970** עד היום
3. מושך פעמיים: `auto_adjust=False` לקבלת `close` גולמי, `auto_adjust=True` לקבלת `adj_close` מתואם (כולל דיבידנדים)
4. upsert בבאצ׳ים של 500 שורות לטבלת `historical_prices`
5. safe לריצה חוזרת — `UNIQUE(symbol, date)`

**חשוב:** `close` = מחיר גולמי (ללא דיבידנדים), `adj_close` = מחיר מתואם (כולל דיבידנדים מושקעים).

---

## Supabase Edge Function

| קובץ | תפקיד |
|---|---|
| `supabase/functions/fetch-symbol/index.ts` | Deno function — מושכת סימול חדש מ-Yahoo Finance API ושומרת ב-Supabase |

**זרימה:** `App.jsx` → `supabase.functions.invoke('fetch-symbol', { body: { symbol } })` → Yahoo Finance v8 API → upsert ל-`historical_prices`.
שומרת `close` (גולמי) ו-`adj_close` (מתואם) בנפרד.

---

## GitHub Actions

| קובץ | תפקיד |
|---|---|
| `.github/workflows/fetch-historical-data.yml` | הרצה ידנית + שבועית (יום שני 06:00 UTC) של `fetch_historical_data.py` |

Secrets נדרשים: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`.

---

## Database – Supabase (PostgreSQL)

### טבלה: `historical_prices`

| עמודה | סוג | הערה |
|---|---|---|
| `id` | BIGSERIAL | מפתח ראשי |
| `symbol` | TEXT | לדוג׳ `^GSPC`, `SPY` |
| `date` | DATE | תאריך מסחר |
| `open/high/low` | NUMERIC | מחירים יומיים |
| `close` | NUMERIC | מחיר סגירה **גולמי** (ללא דיבידנדים) |
| `adj_close` | NUMERIC | מחיר **מתואם** – כולל דיבידנדים ופיצולים (preferred לחישובים) |
| `volume` | BIGINT | נפח מסחר |

**Indexes:** על `symbol`, `date`, `(symbol, date DESC)`
**RLS:** קריאה פתוחה לכל (anon key) / כתיבה רק ל-service_role
**Limit:** query limit מוגדר ל-10,000 שורות

### Migration
`supabase/migrations/20240101000000_create_historical_prices.sql`

---

## לוגיקה פיננסית (`src/utils/finance.js`)

| פונקציה | מה היא מחשבת |
|---|---|
| `filterPrices(prices, period, customStart, customEnd)` | מסנן סדרה לפי תקופה (1D/1W/1M/3M/6M/YTD/1Y/3Y/5Y/10Y/ALL/custom) |
| `calcCAGRFromSeries(prices)` | תשואה שנתית מורכבת מסדרת מחירים (משתמש ב-`adj_close`) |
| `calcNetProfit({investment, grossCAGR, fee, years})` | רווח ברוטו vs נטו אחרי דמי ניהול |
| `buildChartData(symbols, pricesMap)` | מיזוג סדרות לגרף + downsampling חודשי; מיישר לתאריך התחלה משותף (המאוחר מבין הסימולים) |
| `calcYearlyReturns(prices)` | תשואה לכל שנה קלנדרית בסדרה |
| `calcMonthlyReturns(prices)` | תשואה לכל חודש קלנדרי בסדרה |
| `getFee(symbol)` | דמי ניהול ידועים לפי סימול (SPY=0.0945%, QQQ=0.2%, ...) |
| `calcCumulativeReturns(prices)` | סדרת תשואה מצטברת רבייסד ל-0% |

**נוסחת Net Profit:**
```
grossValue = investment × (1 + CAGR%)^years
netValue   = investment × (1 + CAGR% - fee%)^years
feeCost    = grossValue - netValue
```

---

## טבלת סיכום (StatsTable) – עמודות

| עמודה | הסבר |
|---|---|
| סימול | שם הסימול עם צבע מזהה |
| תשואה | תשואת מחיר גולמית (ללא דיבידנדים) – מבוסס על `close` |
| תשואה כוללת | תשואה כוללת כולל דיבידנדים – מבוסס על `adj_close` |
| דמי ניהול % | דמי ניהול שנתיים ידועים (קריאה בלבד, מ-`getFee`) |
| CAGR ברוטו | תשואה שנתית מורכבת לפני דמי ניהול |
| CAGR נטו | CAGR אחרי הפחתת דמי ניהול |
| רווח ברוטו | רווח דולרי לפי CAGR ברוטו על פני התקופה |
| רווח נטו | רווח דולרי לאחר דמי ניהול |
| עלות דמי ניהול | ההפרש בין רווח ברוטו לנטו |

**תשואות שנתיות/חודשיות:** ניתן לפתוח breakdowns מפורטים דרך כפתורים בכותרת הטבלה.

**תאריך התחלה משותף:** כשמשווים מספר סימולים, כל החישובים מתחילים מתאריך ההנפקה של הסימול **המאוחר ביותר** (השוואה הוגנת).

---

## משתני סביבה

| משתנה | שימוש |
|---|---|
| `VITE_SUPABASE_URL` | Frontend – כתובת Supabase |
| `VITE_SUPABASE_ANON_KEY` | Frontend – מפתח ציבורי (קריאה בלבד) |
| `SUPABASE_URL` | Python – כתובת Supabase |
| `SUPABASE_SERVICE_KEY` | Python – מפתח service_role (כתיבה) |
| `VITE_DEMO_MODE=true` | אופציונלי – כפיית demo mode |

**הערה:** `src/lib/supabase.js` ו-`src/utils/mockData.js` מכילים fallback credentials מקודדים כדי שהפרויקט יעבוד ב-Bolt ללא env vars.

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
