import { useState } from 'react'

// Common symbols the user can add quickly
const QUICK_SYMBOLS = ['^GSPC', '^IXIC', '^DJI', 'SPY', 'QQQ', 'VOO', 'GLD']

export default function SearchBar({ onAdd }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const sym = value.trim().toUpperCase()
    if (sym) {
      onAdd(sym)
      setValue('')
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          placeholder="הזן סימול (לדוג' AAPL, SPY, ^GSPC)"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-400 text-gray-950 font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          הוסף
        </button>
      </form>

      {/* Quick-add chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-gray-500 text-xs self-center">מהיר:</span>
        {QUICK_SYMBOLS.map((sym) => (
          <button
            key={sym}
            onClick={() => onAdd(sym)}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-full border border-gray-700 hover:border-green-600 transition-colors"
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  )
}
