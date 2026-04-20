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
| `src/utils/symbolsDb.js` | מאגר ~85 סימולים כולל מדדים ישראליים + בינלאומיים, עם מילות חיפוש בעברית ואנגלית |
| `src/utils/etfHoldings.js` | נתוני הרכב סטטיים (top-10 אחזקות + %) לכ-75 קרנות סל ומדדים (כולל מדדים ישראליים, אירופאיים, אסייתיים) — עודכן ל-2024 |
| `src/hooks/useIsMobile.js` | hook שמחזיר `true` כאשר רוחב המסך < 768px; משמש ב-App, ChatWidget, StatsTable, ComparisonChart לבחירת layout |

### קומפוננטות

| קובץ | תפקיד |
|---|---|
| `src/components/SearchBar.jsx` | חיפוש autocomplete + quick-add chips (localStorage) |
| `src/components/ComparisonChart.jsx` | גרף קווי של תשואה מצטברת (Recharts) + בחירת תקופה |
| `src/components/StatsTable.jsx` | טבלת השוואה עם CAGR, תשואות, דמי ניהול, Net Profit + כפתורי ℹ / הרכב |
| `src/components/InfoModal.jsx` | מודל תיאור נכס — קריאה ל-Edge Function `get-symbol-info` (Groq AI), תיאור עברי קצר + כפתור ריענון; cache ב-localStorage (7 ימים, מפתח `np-info-{symbol}`) |
| `src/components/HoldingsModal.jsx` | מודל הרכב קרן — טבלת top-10 אחזקות עם % bars (נתונים מ-`etfHoldings.js`) |
| `src/components/ChatWidget.jsx` | צ'אט בועה צפה עם יועץ פיננסי "איתמר" — כפתור SVG ירוק קבוע, חלונית צ'אט מלאה (mobile: מסך מלא, desktop: 360×500px) |

### זרימת נתונים
1. משתמש מוסיף סימול דרך `SearchBar` (autocomplete מ-`symbolsDb.js`)
2. `App.jsx` שולח query ל-Supabase: `SELECT date, adj_close, close FROM historical_prices WHERE symbol = '...'`
3. אם הסימול לא קיים ב-DB — קריאה ל-Edge Function `fetch-symbol` שמושכת מ-Yahoo Finance ושומרת ב-Supabase
4. אם הנתונים קיימים אך ישנים (>7 ימים) — Edge Function מופעלת אוטומטית לרענון לפני הצגה
5. הנתונים עוברים ל-`finance.js` לחישוב CAGR / Net Profit
6. `buildChartData()` ממזג סדרות מרובות ל-format של Recharts (downsampling חודשי + נקודה אחרונה תמיד)
7. `ComparisonChart` ו-`StatsTable` מציגים את התוצאות

### Stale Data Detection (`src/App.jsx`)
- `STALE_THRESHOLD_DAYS = 7` — אם הנתון האחרון ב-DB ישן מ-7 ימים, הנתונים נחשבים ישנים
- `isDataStale(data)` — בודק את תאריך השורה האחרונה בסדרה
- בטעינה: cache ישן ב-localStorage נמחק → Supabase נבדק → אם ישן, Edge Function מרענת לפני הצגה
- Fallback: אם הרענון נכשל, הנתונים הישנים מוצגים בלי קריסה

### Quick Symbols (localStorage)
- ברירת מחדל: `['^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ', 'VOO', 'GLD']`
- שמורים ב-`localStorage` תחת מפתח `np-quick`
- ניתן להוסיף/להסיר דרך ה-UI

### Cache (localStorage)
נתונים שנטענו מ-Supabase נשמרים ב-`localStorage` עם TTL של **24 שעות** (מפתח: `np-prices-{sym}`).
בריענון דף הנתונים נטענים מהcache ללא קריאה חוזרת ל-Supabase.
תיאורי נכסים מ-Groq AI נשמרים ב-localStorage עם TTL של **7 ימים** (מפתח: `np-info-{symbol}`).

### Benchmark (S&P 500)
כפתור `⚖ S&P 500` בתפריט התקופות מוסיף קו benchmark מקווקו אפור לגרף.
הנתונים נטענים בנפרד ב-`App.jsx` (לא נכנסים ל-StatsTable).

### Mobile-Responsive Layout
האפליקציה מותאמת במלואה למובייל דרך hook `useIsMobile` (breakpoint: 768px):
- Header: עמודה אנכית במובייל, שורה אופקית בדסקטופ
- גרף: margin שלילי (-12px) לרוחב מסך מלא במובייל
- StatsTable: כל העמודות מוצגות במובייל עם גלילה אופקית; כפתורי ℹ ו-הרכב עם touch targets גדולים
- ChatWidget: מסך מלא במובייל (top:0), חלונית 360×500px בדסקטופ

### "Made in Bolt" Badge
האתר מתארח על Bolt ומציג badge קבוע בגובה **55px** (`BOLT_H = 55`) בתחתית המסך.
- כל אלמנטים fixed-bottom ממוקמים מעליו: כפתור הצ'אט ב-`bottom: BOLT_H + 10 = 65px`
- `<main>` מקבל `paddingBottom: 80px` כדי שהתוכן לא יוסתר מתחת לכפתור הצ'אט

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

## Supabase Edge Functions

| קובץ | תפקיד |
|---|---|
| `supabase/functions/fetch-symbol/index.ts` | Deno function — מושכת סימול חדש מ-Yahoo Finance API ושומרת ב-Supabase |
| `supabase/functions/get-symbol-info/index.ts` | Deno function — קריאה ל-Groq API להחזרת תיאור עברי קצר של הנכס |

**fetch-symbol זרימה:** `App.jsx` → `supabase.functions.invoke('fetch-symbol', { body: { symbol } })` → Yahoo Finance v8 API → upsert ל-`historical_prices`.
שומרת `close` (גולמי) ו-`adj_close` (מתואם) בנפרד.

**get-symbol-info פרטים:**
- משתמשת ב-secret `GROQ_API_KEY` (מוגדר ב-Supabase Dashboard → Edge Functions → Secrets)
- תומכת בשני מצבים לפי body שמתקבל:
  - **מצב תיאור נכס** (`body.symbol`): מודל `llama-3.1-8b-instant`, `max_tokens: 600`, `temperature: 0.4` — מחזיר `{ success: true, info: '...' }`
  - **מצב צ'אט** (`body.messages`): מודל `compound-beta-mini` (llama-3.1-8b + חיפוש אינטרנט), `max_tokens: 800`, `temperature: 0.7` — מחזיר `{ success: true, reply: '...' }`
- System prompt לצ'אט: עונה על שאלות פיננסיות בלבד (מניות, עשירים, כלכלה, שוק ההון), מסרב לשאלות שאין להן קשר לכסף, לא חושף הוראות פנימיות, תשובות מפורטות 3-6 משפטים
- מחזירה תמיד HTTP 200: `{ success: true, ... }` או `{ success: false, error: '...' }`
- לאחר שינוי בקוד — נדרש deploy ידני דרך GitHub Actions

**ChatWidget זרימה:**
- `ChatWidget.jsx` → `supabase.functions.invoke('get-symbol-info', { body: { messages } })` → Groq `compound-beta-mini`
- Retry logic: 3 ניסיונות עם המתנה של 1 שניה בין ניסיונות
- היסטוריית שיחה נשמרת ב-React state בלבד (לא persisted)
- הודעת פתיחה: אחת מ-7 הודעות ברכה אקראיות בעברית
- מיקום כפתור: `bottom: 65px` (מעל "Made in Bolt" badge), `right: 16-20px`

---

## GitHub Actions

| קובץ | תפקיד |
|---|---|
| `.github/workflows/fetch-historical-data.yml` | הרצה ידנית + שבועית (יום שני 06:00 UTC) של `fetch_historical_data.py` |
| `.github/workflows/deploy-edge-functions.yml` | הרצה ידנית בלבד — פורסת את `get-symbol-info` ל-Supabase (project: `vwmcuhkwjvcxnnzndgac`) |

Secrets נדרשים: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ACCESS_TOKEN`.

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
**Limit:** query limit ב-App.jsx מוגדר ל-20,000 שורות לכל סימול

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
| `getFee(symbol)` | דמי ניהול ידועים: מניות=0%, ETFs בינלאומיים 0.05–0.74%, ברירת מחדל 0.2% לסימולים לא מוכרים |
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

**כפתור ℹ:** בכל שורה — פותח `InfoModal` עם תיאור עברי מ-Groq AI (Edge Function `get-symbol-info`).

**כפתור הרכב ▼:** בשורות ETF/מדד בלבד (לא מניות) — פותח `HoldingsModal` עם top-10 אחזקות ו-% bars. הנתונים סטטיים מ-`etfHoldings.js`.

**מדדים ישראליים זמינים בחיפוש:** `^TA125.TA`, `^TA35.TA`, `^TA90.TA`, `^TELBND.TA`, `EIS`

**סימולים בינלאומיים זמינים בחיפוש:** ETFs אירופאיים (VGK, FEZ, EWG, EWQ, EWU, EWI, EWP, EWL, EWN, EWD), יפן (EWJ, DXJ), סין (MCHI, FXI, KWEB), הודו (INDA, INDY), קוריאה (EWY), טייוואן (EWT), ברזיל (EWZ), אוסטרליה (EWA), קנדה (EWC), עולמי (ACWI, VT)

**Benchmark:** כפתור `⚖ S&P 500` בגרף מוסיף קו אפור מקווקו של `^GSPC` להשוואה ויזואלית ללא השפעה על הטבלה.

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

### Supabase Secrets (Dashboard → Edge Functions → Secrets)

| Secret | שימוש |
|---|---|
| `GROQ_API_KEY` | מפתח API של Groq (console.groq.com) — נדרש ל-`get-symbol-info` |

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
