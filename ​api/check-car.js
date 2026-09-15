export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metod tillåts inte' });
  }

  const { regNr, adUrl, language } = req.body;

  if (!regNr) {
    return res.status(400).json({ error: 'Registreringsnummer krävs' });
  }

  const cleanReg = regNr.replace(/\s+/g, '').toUpperCase();
  const selectedLang = language || 'Svenska';

  try {
    // 1. جلب بيانات السيارة المتاحة
    let rawCarData = null;
    try {
      const regCheckUser = process.env.REGCHECK_USERNAME || 'demo';
      const carDataRes = await fetch(`https://regcheck.org.uk/api/reg.json/${cleanReg}/${regCheckUser}`, {
        headers: { 'User-Agent': 'KollaBilen/1.0' }
      });
      if (carDataRes.ok) {
        rawCarData = await carDataRes.json();
      }
    } catch (e) {
      console.log('Ingen databasträff, använder AI-analys.');
    }

    // 2. قراءة رابط Blocket عبر Jina Reader
    let adContent = '';
    if (adUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const jinaRes = await fetch(`https://r.jina.ai/${adUrl}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'KollaBilen/1.0' }
        });
        clearTimeout(timeoutId);

        if (jinaRes.ok) {
          const fullText = await jinaRes.text();
          adContent = fullText.substring(0, 2000);
        }
      } catch (e) {
        console.log('Kunde inte läsa annonslänk.');
      }
    }

    // 3. توجيهات الذكاء الاصطناعي
    const systemInstruction = `
Du är en professionell och erfaren bilexpert för kollabilen.se i Sverige.
Generera hela rapporten på följande språk: ${selectedLang}.

VIKTIGA REGLER OCH JURIDISK SÄKERHET:
1. Visa ALDRIG personnamn, personnummer eller adresser.
2. Använd tydliga rubriker (exempelvis ## Specifikationer, ## Modellfel, ## Köpråd).
3. Om annonsinnehåll finns, analysera det angivna priset i förhållande till skick och mätarställning.
4. Fokusera på:
   - Tekniska specifikationer (motor, drivmedel, växellåda)
   - Kända modellproblem och vanliga fel för denna bilmodell
   - Besiktningspunkter att kontrollera vid provkörning
   - Ägandekostnader (skatt, förbrukning)
   - Slutgiltigt köpråd / Betyg (1-5)
`;

    const userPrompt = `
Registreringsnummer: ${cleanReg}
Målspråk: ${selectedLang}
${adUrl ? 'Annonslänk: ' + adUrl : ''}
${adContent ? 'Läst annonsinnehåll från Blocket/Riddermark: ' + adContent : ''}
${rawCarData ? 'Hämtad fordonsdata: ' + JSON.stringify(rawCarData) : ''}

Skapa en komplett, strukturerad och pedagogisk bilrapport för köparen på ${selectedLang}.
`;

    // 4. الاتصال بـ OpenAI API
    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4
      })
    });

    const aiData = await openAiRes.json();

    if (!openAiRes.ok) {
      return res.status(500).json({ error: aiData.error?.message || 'AI-systemfel' });
    }

    const report = aiData.choices[0].message.content;
    return res.status(200).json({ report });

  } catch (error) {
    return res.status(500).json({ error: 'Internt serverfel: ' + error.message });
  }
}
