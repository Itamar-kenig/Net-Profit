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

    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (!apiKey) return ok({ success: false, error: 'GEMINI_API_KEY not configured in Supabase secrets' })

    const prompt = `כתוב הסבר קצר ומועיל בעברית על הנכס הפיננסי: ${symbol}

כלול (3-4 משפטים בלבד):
- סוג הנכס (קרן סל / מניה / מדד / אג"ח / סחורה)
- מה הוא עוקב אחריו או מה החברה עושה
- מאפיין עיקרי אחד שכדאי לדעת

ענה בעברית בלבד, ללא כותרות, ישירות לתוכן.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.4 },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return ok({ success: false, error: `Gemini API ${res.status}: ${errText}` })
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return ok({ success: true, info: text })
  } catch (e: any) {
    return ok({ success: false, error: e.message })
  }
})
