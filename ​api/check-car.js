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
    // 1. Hämtar fordonsdata från öppna databaser
    let rawCarData = null;
    try {
      const carDataRes = await fetch(`https://regcheck.org.uk/api/reg.json/${cleanReg}`, {
        headers: { 'User-Agent': 'KollaBilen/1.0' }
      });
      if (carDataRes.ok) {
        rawCarData = await carDataRes.json();
      }
    } catch (e) {
      console.log('Ingen direkt databasträff, använder AI-analys.');
    }

    // 2. Hämtar annonsinnehåll via Jina Reader om länk finns
    let adContent = '';
    if (adUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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

    // 3. Systeminstruktioner för OpenAI baserat på valt språk
    const systemInstruction = `
Du är en professionell bilexpert för kollabilen.se.
Generera hela rapporten på följande språk: ${selectedLang}.

VIKTIGA REGLER OCH JURIDISK SÄKERHET:
1. Visa ALDRIG personnamn eller personnummer. Om data innehåller namn, ignorera det helt.
2. Om annonsinnehåll finns, analysera det angivna priset i förhållande till bilens skick och marknadsvärde.
3. Fokusera på bilens tekniska specifikationer, kända modellproblem, besiktningspunkter, uppskattade ägandekostnader och köpråd.
`;

    const userPrompt = `
Registreringsnummer: ${cleanReg}
Språk: ${selectedLang}
${adUrl ? 'Annonslänk: ' + adUrl : ''}
${adContent ? 'Läst annonsinnehåll: ' + adContent : ''}
${rawCarData ? 'Hämtad fordonsdata: ' + JSON.stringify(rawCarData) : ''}

Skapa en komplett bilrapport för köparen på ${selectedLang}.
`;

    // 4. Anrop till OpenAI GPT-4o-mini
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
        temperature: 0.5
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
