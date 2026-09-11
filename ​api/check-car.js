module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metod tillåts inte' });
  }

  const { brand, model, details, language } = req.body || {};

  if (!brand || !model) {
    return res.status(400).json({ error: 'Märke och modell krävs' });
  }

  const selectedLang = language || 'Arabiska';

  try {
    const systemInstruction = `
أنت خبير سيارات متخصص في السوق السويدي لموقع kollabilen.se.
قم بتوليد تقرير شريف ودقيق للسيارة باللغة التالية: ${selectedLang}.
اكتب التقرير بشكل نقاط واضحة ومباشرة تشمل:
1. تقييم السيارة والموديل بشكل عام.
2. تقييم السعر والمسافة (إذا تم توفيرها).
3. أبرز المشاكل والعيوب الشائعة لهذا الموديل التي يجب الانتباه لها عند الشراء.
4. النصيحة النهائية للمشتري.
`;

    const userPrompt = `
الماركة: ${brand}
الموديل والسنة: ${model}
تفاصيل إضافية (السعر والممشى): ${details || 'غير محدد'}
اللغة المطلوب التقرير بها: ${selectedLang}
`;

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
      return res.status(500).json({ error: aiData.error?.message || 'خطأ في مفتاح OpenAI API' });
    }

    const report = aiData.choices[0].message.content;
    return res.status(200).json({ report });

  } catch (error) {
    return res.status(500).json({ error: 'خطأ داخلي في السيرفر: ' + error.message });
  }
};
