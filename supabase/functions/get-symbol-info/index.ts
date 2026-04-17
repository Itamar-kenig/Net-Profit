const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ok = (body: object) =>
  new Response(JSON.stringify(body), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()
    if (!symbol) return ok({ success: false, error: 'symbol required' })

    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) return ok({ success: false, error: 'GROQ_API_KEY not configured in Supabase secrets' })

    const prompt = `כתוב הסבר קצר ומועיל בעברית על הנכס הפיננסי: ${symbol}

כלול (3-4 משפטים בלבד):
- סוג הנכס (קרן סל / מניה / מדד / אג"ח / סחורה)
- מה הוא עוקב אחריו או מה החברה עושה
- מאפיין עיקרי אחד שכדאי לדעת

ענה בעברית בלבד, ללא כותרות, ישירות לתוכן. סיים כל משפט לפני שאתה עוצר.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.4,
        stream: false,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return ok({ success: false, error: `Groq API ${res.status}: ${errText}` })
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content ?? ''

    return ok({ success: true, info: text })
  } catch (e: any) {
    return ok({ success: false, error: e.message })
  }
})
