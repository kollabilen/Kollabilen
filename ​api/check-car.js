export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ fel: 'Metoden tillåts inte' });
    }

    const { regNr, adUrl, language } = req.body || {};

    if (!regNr) {
        return res.status(400).json({ fel: 'Registreringsnummer krävs' });
    }

    const cleanReg = regNr.replace(/\s+/g, '').toUpperCase();
    const selectedLang = language || 'Svenska';

    try {
        let rawCarData = null;
        try {
            const carDataRes = await fetch(`https://regcheck.org.uk/api/reg.json/SE/${cleanReg}`, {
                headers: { 'User-Agent': 'KollaBilen/1.0' }
            });
            if (carDataRes.ok) {
                rawCarData = await carDataRes.json();
            }
        } catch (e) {
            console.log('Ingen databasträff, kör AI.');
        }

        const systemInstruction = `Du är en bilexpert för kollabilen.se. Generera hela rapporten på ${selectedLang}.
Analysera bilmodellen, kända problem, ägandekostnader och köpråd för reg: ${cleanReg}. Använd snygga rubriker.`;

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
                    { role: 'user', content: `Analysera bil: ${cleanReg}. Extra info: ${JSON.stringify(rawCarData || {})}` }
                ],
                temperature: 0.7
            })
        });

        if (!openAiRes.ok) {
            const errorData = await openAiRes.json();
            return res.status(openAiRes.status).json({ fel: 'OpenAI API-fel', detaljer: errorData });
        }

        const aiData = await openAiRes.json();
        const resultText = aiData.choices[0]?.message?.content || 'Ingen rapport genererades.';

        return res.status(200).json({ resultat: resultText, bilData: rawCarData });

    } catch (error) {
        return res.status(500).json({ fel: 'Serverfel', detaljer: error.message });
    }
}
