export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ fel: 'Endast POST-förfrågningar tillåts' });
    }

    const { regNr, link, language } = req.body;

    if (!regNr) {
        return res.status(400).json({ fel: 'Registreringsnummer saknas' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ fel: 'API-nyckel saknas på servern' });
    }

    const targetLanguage = language || 'Svenska';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Du är en professionell bilexpert. Ge en kort, strukturerad och hjälpsam analys av bilen baserat på registreringsnumret och eventuell annonslänk. Svara helt på språket: ${targetLanguage}.`
                    },
                    {
                        role: 'user',
                        content: `Registreringsnummer: ${regNr}. ${link ? 'Annonslänk: ' + link : ''}`
                    }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ fel: data.error?.message || 'Ett fel uppstod vid kommunikation med OpenAI' });
        }

        const aiResponse = data.choices[0].message.content;
        return res.status(200).json({ resultat: aiResponse });

    } catch (error) {
        return res.status(500).json({ fel: 'Internt serverfel: ' + error.message });
    }
}
