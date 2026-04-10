import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { buildChartData } from '../utils/finance'

const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#34d399', '#fb923c']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getFullYear()}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm shadow-xl">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
          <span className="text-gray-300">{entry.dataKey}:</span>
          <span className="font-semibold" style={{ color: entry.color }}>
            {entry.value >= 0 ? '+' : ''}
            {entry.value?.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export default function ComparisonChart({ symbols, pricesMap }) {
  const chartData = buildChartData(symbols, pricesMap)

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500 border border-gray-800">
        אין נתונים להצגה – הוסף סימולים ווודא שהנתונים נטענו ל-Supabase.
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-gray-200 font-semibold mb-4 text-lg">תשואה מצטברת</h2>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            interval="preserveStartEnd"
            minTickGap={60}
          />
          <YAxis
            tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v}%`}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={65}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontSize: 13 }}
            formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
          />
          <ReferenceLine y={0} stroke="#374151" strokeDasharray="4 4" />
          {symbols.map((sym, i) => (
            <Line
              key={sym}
              type="monotone"
              dataKey={sym}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
