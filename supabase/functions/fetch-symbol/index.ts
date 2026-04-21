import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const YAHOO_URLS = (sym: string) => [
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=25y&interval=1d&includeAdjustedClose=true`,
  `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=25y&interval=1d&includeAdjustedClose=true`,
]

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json',
}

async function fetchYahoo(sym: string): Promise<Response> {
  const urls = YAHOO_URLS(sym)
  let lastErr = ''
  for (const url of urls) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1000 * 2 ** (attempt - 1)))
      const res = await fetch(url, { headers: YF_HEADERS })
      if (res.ok) return res
      lastErr = `${res.status}`
      if (res.status === 404) break
    }
  }
  throw new Error(`Yahoo Finance failed after retries: ${lastErr}`)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'symbol required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const sym = symbol.toUpperCase()

    // ── Fetch from Yahoo Finance (with retry + fallback) ───────
    const yRes = await fetchYahoo(sym)

    const yData = await yRes.json()
    const result = yData?.chart?.result?.[0]
    if (!result) {
      return new Response(JSON.stringify({ error: `Symbol "${sym}" not found on Yahoo Finance` }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const timestamps  = result.timestamp ?? []
    const quote       = result.indicators?.quote?.[0] ?? {}
    const adjCloseArr = result.indicators?.adjclose?.[0]?.adjclose ?? []

    const rows = timestamps.map((ts: number, i: number) => ({
      symbol,
      date:      new Date(ts * 1000).toISOString().slice(0, 10),
      open:      quote.open?.[i]   ?? null,
      high:      quote.high?.[i]   ?? null,
      low:       quote.low?.[i]    ?? null,
      close:     quote.close?.[i]  ?? null,
      adj_close: adjCloseArr[i]    ?? quote.close?.[i] ?? null,
      volume:    quote.volume?.[i] ?? null,
    })).filter((r: any) => r.close != null)

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: 'No price data returned' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Upsert to Supabase ─────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const BATCH = 500
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await supabase
        .from('historical_prices')
        .upsert(rows.slice(i, i + BATCH), { onConflict: 'symbol,date' })
      if (error) throw new Error(error.message)
    }

    return new Response(
      JSON.stringify({ success: true, symbol: sym, rows: rows.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )

  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
