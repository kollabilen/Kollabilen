export default async function handler(req, res) {

  // Only POST requests are allowed
  if (req.method !== "POST") {

    return res.status(405).json({
      error: "Method not allowed"
    });

  }


  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {

    console.error(
      "OPENAI_API_KEY is missing."
    );

    return res.status(500).json({
      error:
        "OPENAI_API_KEY saknas i Vercel Environment Variables."
    });

  }


  try {

    const body = req.body || {};


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
    } = body;


    // Validate required fields
    if (
      !brand ||
      !model ||
      !year ||
      !price ||
      mileage === undefined ||
      mileage === null ||
      !fuel ||
      !transmission
    ) {

      return res.status(400).json({
        error:
          "Alla obligatoriska biluppgifter måste fyllas i."
      });

    }


    let outputLanguage = "Swedish";


    if (language === "ar") {
      outputLanguage = "Arabic";
    }

    if (language === "en") {
      outputLanguage = "English";
    }


    const adInformation =
      adUrl && adUrl.trim()
        ? `
Annonslänk:
${adUrl}

Observera: länken är endast extra information. Bedöm inte innehållet på sidan som om du faktiskt har läst den om den inte är tillgänglig.
`
        : "Ingen annonslänk angavs.";


    const prompt = `Du är en erfaren bilexpert som hjälper en person att avgöra om en begagnad bil är värd att köpa.

Analysera bilen utifrån informationen nedan.

BILINFORMATION:

Märke: ${brand}
Modell: ${model}
Årsmodell: ${year}
Pris: ${price} SEK
Miltal: ${mileage} mil
Bränsle: ${fuel}
Växellåda: ${transmission}

${adInformation}

VIKTIGT:

- Var realistisk.
- Hitta inte på specifika fel på just detta exemplar.
- Förklara vanliga problem som kan förekomma på denna modell/motor/växellåda.
- Om information saknas, säg tydligt att den saknas.
- Gör ingen falsk garanti om bilens skick.
- Priset ska bedömas ungefärligt utifrån bilens ålder, miltal och specifikation.
- Förklara vilka saker köparen bör kontrollera före köp.
- Lyft fram dyra potentiella reparationer.
- Nämn viktiga servicepunkter.
- Om bilen har diesel, bensin, hybrid eller eldrift: ta hänsyn till typiska problem för drivlinan.
- Ta hänsyn till automatisk eller manuell växellåda.
- Ge ett tydligt slutomdöme.

SVARA PÅ ${outputLanguage}.

Använd denna struktur:

1. SNABB BEDÖMNING
Ge en kort sammanfattning.

2. ÄR PRISET RIMLIGT?
Bedöm priset och förklara varför.

3. VANLIGA PROBLEM
Lista de viktigaste problemen som kan förekomma på denna bilmodell/drivlina.

4. DYRA RISKER
Vilka fel kan bli dyra att reparera?

5. SERVICE OCH UNDERHÅLL
Vad bör köparen kontrollera kring service och underhåll?

6. VAD SKA JAG KONTROLLERA?
Ge en praktisk checklista inför provkörning och köp.

7. KÖP ELLER AVSTÅ?
Ge ett tydligt råd baserat på den information som finns.

8. SLUTBETYG
Ge ett betyg från 1 till 10 och förklara kort varför.
`;


    const openAIResponse = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },

        body: JSON.stringify({

          model: "gpt-5.6-luna",

          instructions:
            "Du är en noggrann och realistisk expert på begagnade bilar. Ge praktiska råd och var tydlig med osäkerheter.",

          input: prompt,

          max_output_tokens: 2500

        })
      }
    );


    const openAIText =
      await openAIResponse.text();


    let openAIData;


    try {

      openAIData =
        JSON.parse(openAIText);

    } catch (parseError) {

      console.error(
        "OpenAI returned invalid JSON:",
        openAIText
      );

      return res.status(502).json({
        error:
          "OpenAI returnerade ett ogiltigt svar."
      });

    }


    if (!openAIResponse.ok) {

      console.error(
        "OpenAI API error:",
        openAIData
      );

      const apiError =
        openAIData?.error?.message ||
        "OpenAI API error.";

      return res.status(
        openAIResponse.status
      ).json({
        error: apiError
      });

    }


    // The Responses API normally provides output_text
    let report =
      openAIData.output_text;


    // Fallback if output_text is not available
    if (!report && Array.isArray(openAIData.output)) {

      const textParts = [];


      for (
        const outputItem
        of openAIData.output
      ) {

        if (
          Array.isArray(
            outputItem.content
          )
        ) {

          for (
            const contentItem
            of outputItem.content
          ) {

            if (
              contentItem.type === "output_text" &&
              contentItem.text
            ) {

              textParts.push(
                contentItem.text
              );

            }

          }

        }

      }


      report =
        textParts.join("\n\n");

    }


    if (!report) {

      console.error(
        "OpenAI response did not contain text:",
        openAIData
      );

      return res.status(502).json({
        error:
          "AI:n returnerade inget analysresultat."
      });

    }


    return res.status(200).json({
      report: report
    });


  } catch (error) {

    console.error(
      "Server error:",
      error
    );


    return res.status(500).json({
      error:
        "Ett internt serverfel uppstod."
    });

  }

}
