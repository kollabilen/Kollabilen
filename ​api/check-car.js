export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metod tillåts inte' });
  }

  const { brand, model, details, language } = req.body || {};

  if (!brand || !model) {
    return res.status(400).json({ error: 'Märke och modell krävs' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY saknas i Vercel settings' });
  }

  const selectedLang = language || 'Svenska';

  try {
    const systemInstruction = `
Du är en bilexpert specialiserad på den svenska begagnatmarknaden för kollabilen.se.
Generera en ärlig och noggrann bilrapport på följande språk: ${selectedLang}.
Skriv rapporten i tydliga punkter som inkluderar:
1. Allmän utvärdering av bilen och modellen.
2. Bedömning av pris och miltal (om angivet).
3. Vanliga problem och kända fel för denna modell att se upp för vid köp.
4. Slutgiltigt råd till köparen.
`;

    const userPrompt = `
Märke: ${brand}
Modell och År: ${model}
Ytterligare detaljer (Pris och Miltal): ${details || 'Ej angivet'}
Önskat språk för rapporten: ${selectedLang}
`;

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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
      return res.status(openAiRes.status).json({ 
        error: aiData.error?.message || 'Fel vid anslutning till OpenAI' 
      });
    }

    const report = aiData.choices[0].message.content;
    return res.status(200).json({ report });

  } catch (error) {
    return res.status(500).json({ error: 'Internt serverfel: ' + error.message });
  }
}
