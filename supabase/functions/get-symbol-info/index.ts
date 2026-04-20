const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ok = (body: object) =>
  new Response(JSON.stringify(body), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const CHAT_SYSTEM = `אתה יועץ פיננסי בשם איתמר. עונה תמיד בעברית.

כלל עליון: אתה עונה אך ורק על שאלות פיננסיות — מניות, קרנות סל, מדדים, השקעות, כלכלה, שוק ההון. על כל שאלה אחרת — ענה בדיוק משפט אחד קצר, שנון ועוקצני שמבהיר שאתה עוסק רק בכסף. לא יותר ממשפט אחד. לא שתיים. אחד.

לשאלות פיננסיות:
- ענה על בסיס עובדות מוכרות ומידע אמין בלבד.
- אם אינך בטוח בנתון — אמור "איני בטוח בנתון המדויק" במפורש.
- אל תמציא מחירים, תשואות, נתונים סטטיסטיים או תאריכים.
- ענה בצורה ענינית, ברורה וישירה. הומור מותר לעיתים נדירות בלבד.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const apiKey = Deno.env.get('GROQ_API_KEY')
    if (!apiKey) return ok({ success: false, error: 'GROQ_API_KEY not configured in Supabase secrets' })

    // ── Chat mode ──────────────────────────────────────────────
    if (body.messages) {
      const today = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' })
      const systemWithDate = `${CHAT_SYSTEM}\n\nהיום: ${today}. השתמש בידע שלך בביטחון לעובדות ידועות. לנתונים שמשתנים תכופות (מחירי מניות, דירוגי עשירים, שערי חליפין) — ציין שהנתון מבוסס על הידע שלך ועשוי להשתנות, והמלץ לבדוק ב-Bloomberg, Forbes או Yahoo Finance לנתון עדכני.`
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'compound-beta-mini',
          messages: [{ role: 'system', content: systemWithDate }, ...body.messages],
          max_tokens: 500,
          temperature: 0.7,
          stream: false,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return ok({ success: false, error: `Groq API ${res.status}: ${errText}` })
      }
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content ?? ''
      return ok({ success: true, reply })
    }

    // ── Symbol info mode (existing) ────────────────────────────
    const { symbol } = body
    if (!symbol) return ok({ success: false, error: 'symbol required' })

    const prompt = `כתוב הסבר קצר ומועיל בעברית על הנכס הפיננסי: ${symbol}

כלול (3-4 משפטים בלבד):
- סוג הנכס (קרן סל / מניה / מדד / אג"ח / סחורה)
- מה הוא עוקב אחריו או מה החברה עושה
- מאפיין עיקרי אחד שכדאי לדעת

ענה בעברית בלבד, ללא כותרות, ישירות לתוכן. סיים כל משפט לפני שאתה עוצר.`

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
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
