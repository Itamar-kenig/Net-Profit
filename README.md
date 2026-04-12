# Net Profit

אתר לניתוח והשוואת מניות, מדדים וקרנות סל (ETFs) עם דגש על תשואות היסטוריות ודמי ניהול.

## תכונות

- **גרף השוואתי** – תשואה מצטברת של מספר נכסים לאורך זמן (Recharts)
- **טבלת סטטיסטיקות** – CAGR ברוטו, YTD, דמי ניהול הניתנים לעריכה
- **חישוב Net Profit** – רווח נקי לאחר הפחתת דמי ניהול מצטברים
- **Backend Python** – משיכת נתונים היסטוריים (20+ שנה) מ-Yahoo Finance ואחסון ב-Supabase

## מבנה הפרויקט

```
├── src/
│   ├── App.jsx                        # קומפוננטת ראשית + ניהול state
│   ├── lib/supabase.js                # Supabase client
│   ├── utils/finance.js               # CAGR, YTD, Net Profit, buildChartData
│   └── components/
│       ├── SearchBar.jsx              # חיפוש סימולים + כפתורי quick-add
│       ├── ComparisonChart.jsx        # גרף קווי (Recharts)
│       └── StatsTable.jsx             # טבלת השוואה עם דמי ניהול עריכים
├── scripts/
│   ├── fetch_historical_data.py       # yfinance → Supabase upsert
│   └── requirements.txt
└── supabase/migrations/
    └── 20240101000000_create_historical_prices.sql
```

## התקנה והפעלה

### 1. משתני סביבה

```bash
cp .env.example .env
```

ערוך את `.env` עם פרטי הפרויקט שלך מ-Supabase:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...          # anon/public key – לקריאה בלבד
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...            # service_role key – לכתיבה מהסקריפט
```

### 2. מסד הנתונים (Supabase)

פתח את **SQL Editor** בפאנל Supabase והרץ:

```sql
-- תוכן הקובץ: supabase/migrations/20240101000000_create_historical_prices.sql
```

זה יצור את טבלת `historical_prices` עם RLS, indexes ו-policies.

### 3. טעינת נתונים היסטוריים (Python)

```bash
cd scripts
pip install -r requirements.txt
python fetch_historical_data.py
```

הסקריפט מושך נתוני OHLCV מ-2000 עד היום עבור:
`^GSPC, ^IXIC, ^DJI, ^RUT, SPY, QQQ, VOO, VTI, GLD, AGG`

ניתן להוסיף/להסיר סימולים ברשימת `SYMBOLS` בקובץ.

### 4. הפעלת הממשק (React)

```bash
npm install
npm run dev
```

פתח [http://localhost:5173](http://localhost:5173)

## לוגיקה פיננסית

| פונקציה | תיאור |
|---|---|
| `calcCAGRFromSeries(prices)` | תשואה שנתית מצטברת מסדרת מחירים |
| `calcYTD(prices)` | תשואה מתחילת שנה |
| `calcNetProfit({investment, grossCAGR, fee, years})` | רווח ברוטו vs נטו לאחר דמי ניהול |
| `buildChartData(symbols, pricesMap)` | מיזוג סדרות לגרף (downsampling חודשי) |

### דוגמה לחישוב Net Profit

```
השקעה: $10,000 | CAGR: 10.5% | דמי ניהול: 0.20% | תקופה: 20 שנה

ערך ברוטו:  $10,000 × (1.105)^20 = $72,265
ערך נטו:    $10,000 × (1.103)^20 = $69,832
עלות דמי:   $2,433  (3.4% מהרווח הברוטו!)
```

## טכנולוגיות

| שכבה | טכנולוגיה |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| גרפים | Recharts |
| Backend DB | Supabase (PostgreSQL) |
| נתונים | yfinance (Yahoo Finance) |
| סגנון | Dark theme, RTL, עברית |
