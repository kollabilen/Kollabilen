export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({
error: "Metod tillåts inte"
});
}

const {
brand,
model,
year,
price,
mileage,
fuel,
transmission,
adUrl,
language
} = req.body || {};

if (!brand || !model || !year || !price || !mileage) {

return res.status(400).json({
  error: "Bilmärke, modell, årsmodell, pris och miltal krävs."
});

}

const selectedLang = language || "Svenska";

const systemInstruction = `
Du är en professionell bilrådgivare för webbplatsen kollabilen.se.

Din uppgift är att analysera en bil inför ett eventuellt köp.

Svara ENDAST på språket:
${selectedLang}

Viktiga regler:

1. Hitta aldrig på specifika fordonsdata som användaren inte har angett.

2. Om du saknar viktig information, säg tydligt att informationen saknas.

3. Bedöm priset försiktigt. Du får ge en ungefärlig bedömning baserad på din allmänna kunskap, men presentera inte ett exakt marknadsvärde som ett faktum.

4. Förklara vanliga problem och svaga punkter för den aktuella modellen/motorn när du har tillräcklig information.

5. Ge konkreta saker som köparen bör kontrollera före köp.

6. Diskutera ungefärliga underhålls- och reparationsrisker, men lova aldrig en viss kostnad.

7. Om användaren har angett en annonslänk ska du inte påstå att du har läst annonsen om inget annonsinnehåll faktiskt har skickats till dig.

8. Ge en tydlig sammanfattning:
   
   - Prisbedömning
   - Risknivå
   - Fördelar
   - Nackdelar
   - Viktiga kontroller
   - Köpråd

9. Använd tydliga rubriker och punktlistor.

10. Avsluta med en enkel rekommendation:
    "Bra köp", "Köp med försiktighet" eller "Var försiktig".

11. Detta är rådgivning och inte en professionell fordonsbesiktning.
    `;

const userPrompt = `
Analysera följande bil:

Bilmärke: ${brand}
Modell: ${model}
Årsmodell: ${year}
Pris: ${price} SEK
Miltal: ${mileage} mil
Bränsle: ${fuel}
Växellåda: ${transmission}

Annonslänk:
${adUrl || "Ingen annonslänk angiven."}

Skapa en tydlig och användbar rapport för en person som funderar på att köpa bilen.

Bedöm särskilt:

1. Vad som är bra med bilen.
2. Vanliga problem för modellen och motorn.
3. Vad som bör kontrolleras före köp.
4. Om priset verkar lågt, normalt eller högt baserat på tillgänglig information.
5. Risker kopplade till bilens ålder och miltal.
6. Potentiella framtida underhållskostnader.
7. Om bilen passar som köp för en vanlig privatperson.
8. En slutlig rekommendation.
   `;

try {

const apiKey = process.env.OPENAI_API_KEY;


if (!apiKey) {

  return res.status(500).json({
    error: "OPENAI_API_KEY saknas i Vercel Environment Variables."
  });

}


const openAiRes = await fetch(
  "https://api.openai.com/v1/responses",
  {
    method: "POST",

    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      model: "gpt-5.6-luna",

      instructions: systemInstruction,

      input: userPrompt,

      max_output_tokens: 2500

    })
  }
);


const aiData = await openAiRes.json();


if (!openAiRes.ok) {

  console.error("OpenAI error:", aiData);

  return res.status(500).json({
    error:
      aiData?.error?.message ||
      "OpenAI kunde inte generera rapporten."
  });

}


const report = aiData.output_text;


if (!report) {

  console.error("Unexpected OpenAI response:", aiData);

  return res.status(500).json({
    error: "OpenAI returnerade ingen rapport."
  });

}


return res.status(200).json({
  report
});

} catch (error) {

console.error("Server error:", error);

return res.status(500).json({
  error: "Internt serverfel: " + error.message
});

}

}
