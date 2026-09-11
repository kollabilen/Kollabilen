module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metod tillåts inte' });
  }

  const { regNr, adText, imageBase64, language } = req.body || {};

  if (!regNr) {
    return res.status(400).json({ error: 'Registreringsnummer krävs' });
  }

  const cleanReg = regNr.replace(/\s+/g, '').toUpperCase();
  const selectedLang = language || 'Svenska';

  try {
    // 1. محاولة جلب بيانات من داتا بيز مفتوحة
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

    // 2. تعليمات النظام لـ OpenAI
    const systemInstruction = `
Du är en professionell bilexpert för kollabilen.se.
Generera hela rapporten på följande språk: ${selectedLang}.

VIKTIGA REGLER OCH JURIDISK SÄKERHET:
1. Visa ALDRIG personnamn eller personnummer. Om bild/data innehåller namn, ignorera det helt.
2. Om en bild eller annonstext bifogas, läs av och analysera bilmodell, pris, miltal och specifikationer noggrant.
3. Strukturera rapporten tydligt med rubriker:
   - Sammanfattning & Bilmodell
   - Pris och Miltalsbedömning
   - Kända modellproblem & Besiktningspunkter
   - Uppskattade ägandekostnader
   - Köpråd och Slutsats
`;

    // 3. تجهيز طلب OpenAI لدعم الصورة والنص معاً (GPT-4o-mini Vision)
    const userContent = [
      {
        type: 'text',
        text: `Registreringsnummer: ${cleanReg}
Språk: ${selectedLang}
${adText ? 'Angiven annonstext/detaljer: ' + adText : ''}
${rawCarData ? 'Hämtad fordonsdata: ' + JSON.stringify(rawCarData) : ''}

Skapa en komplett och professionell bilrapport för köparen på ${selectedLang}.`
      }
    ];

    if (imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: imageBase64
        }
      });
    }

    // 4. إرسال الطلب إلى OpenAI
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
          { role: 'user', content: userContent }
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
};
