const translations = {
  sv: {
    headerSubtitle: "AI-analys innan du köper bilen",
    title: "Kolla bilen innan du köper",
    description:
      "Fyll i information om bilen och få en AI-baserad analys av vanliga problem, pris, risker, underhåll och vad du bör kontrollera.",
    formTitle: "Bilens information",
    brand: "Märke",
    model: "Modell",
    year: "Årsmodell",
    price: "Pris",
    mileage: "Miltal",
    mileageHint: "Ange mil, inte kilometer.",
    fuel: "Bränsle",
    transmission: "Växellåda",
    adUrl: "Annonslänk",
    adUrlHint: "Valfritt.",
    submit: "Analysera bilen",
    loading: "Analyserar bilen...",
    resultTitle: "Bilanalys",
    errorRequired: "Fyll i alla obligatoriska fält.",
    errorGeneric: "Ett fel uppstod. Försök igen.",
    errorServer: "Serverfel"
  },

  ar: {
    headerSubtitle: "تحليل السيارة بالذكاء الاصطناعي قبل الشراء",
    title: "افحص السيارة قبل أن تشتري",
    description:
      "أدخل معلومات السيارة واحصل على تحليل بالذكاء الاصطناعي عن المشاكل الشائعة والسعر والمخاطر والصيانة وما يجب فحصه.",
    formTitle: "معلومات السيارة",
    brand: "الماركة",
    model: "الموديل",
    year: "سنة الصنع",
    price: "السعر",
    mileage: "المسافة المقطوعة",
    mileageHint: "اكتب المسافة بالميل السويدي (mil)، وليس بالكيلومتر.",
    fuel: "نوع الوقود",
    transmission: "ناقل الحركة",
    adUrl: "رابط الإعلان",
    adUrlHint: "اختياري.",
    submit: "حلل السيارة",
    loading: "جاري تحليل السيارة...",
    resultTitle: "تحليل السيارة",
    errorRequired: "يرجى ملء جميع الحقول المطلوبة.",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    errorServer: "خطأ في الخادم"
  },

  en: {
    headerSubtitle: "AI car analysis before you buy",
    title: "Check the car before you buy",
    description:
      "Enter the car information and get an AI-based analysis of common problems, price, risks, maintenance and what you should check.",
    formTitle: "Car information",
    brand: "Brand",
    model: "Model",
    year: "Year",
    price: "Price",
    mileage: "Mileage",
    mileageHint: "Enter Swedish mil, not kilometers.",
    fuel: "Fuel",
    transmission: "Transmission",
    adUrl: "Advertisement URL",
    adUrlHint: "Optional.",
    submit: "Analyze car",
    loading: "Analyzing car...",
    resultTitle: "Car analysis",
    errorRequired: "Please fill in all required fields.",
    errorGeneric: "An error occurred. Please try again.",
    errorServer: "Server error"
  }
};


const languageSelect = document.getElementById("language");

const form = document.getElementById("carForm");

const submitButton = document.getElementById("submitButton");

const loading = document.getElementById("loading");

const loadingText = document.getElementById("loadingText");

const resultCard = document.getElementById("resultCard");

const result = document.getElementById("result");


function setLanguage(lang) {

  const t = translations[lang] || translations.sv;

  document.documentElement.lang = lang;

  document.getElementById("headerSubtitle").textContent =
    t.headerSubtitle;

  document.getElementById("title").textContent =
    t.title;

  document.getElementById("description").textContent =
    t.description;

  document.getElementById("formTitle").textContent =
    t.formTitle;

  document.getElementById("brandLabel").textContent =
    t.brand;

  document.getElementById("modelLabel").textContent =
    t.model;

  document.getElementById("yearLabel").textContent =
    t.year;

  document.getElementById("priceLabel").textContent =
    t.price;

  document.getElementById("mileageLabel").textContent =
    t.mileage;

  document.getElementById("mileageHint").textContent =
    t.mileageHint;

  document.getElementById("fuelLabel").textContent =
    t.fuel;

  document.getElementById("transmissionLabel").textContent =
    t.transmission;

  document.getElementById("adUrlLabel").textContent =
    t.adUrl;

  document.getElementById("adUrlHint").textContent =
    t.adUrlHint;

  submitButton.textContent =
    t.submit;

  loadingText.textContent =
    t.loading;

  document.getElementById("resultTitle").textContent =
    t.resultTitle;

  if (lang === "ar") {
    document.body.dir = "rtl";
  } else {
    document.body.dir = "ltr";
  }
}


languageSelect.addEventListener("change", function () {

  setLanguage(this.value);

});


form.addEventListener("submit", async function (event) {

  event.preventDefault();

  const lang = languageSelect.value;

  const t = translations[lang] || translations.sv;


  const brand =
    document.getElementById("brand").value.trim();

  const model =
    document.getElementById("model").value.trim();

  const year =
    document.getElementById("year").value.trim();

  const price =
    document.getElementById("price").value.trim();

  const mileage =
    document.getElementById("mileage").value.trim();

  const fuel =
    document.getElementById("fuel").value;

  const transmission =
    document.getElementById("transmission").value;

  const adUrl =
    document.getElementById("adUrl").value.trim();


  if (
    !brand ||
    !model ||
    !year ||
    !price ||
    !mileage ||
    !fuel ||
    !transmission
  ) {

    showError(t.errorRequired);

    return;
  }


  submitButton.disabled = true;

  loading.classList.add("show");

  resultCard.style.display = "none";

  result.className = "result";

  result.textContent = "";


  const carData = {

    brand: brand,

    model: model,

    year: Number(year),

    price: Number(price),

    mileage: Number(mileage),

    fuel: fuel,

    transmission: transmission,

    adUrl: adUrl,

    language: lang

  };


  try {

    const response = await fetch("/api/check-car", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(carData)

    });


    const responseText = await response.text();


    let data;


    try {

      data = JSON.parse(responseText);

    } catch (jsonError) {

      console.error(
        "Server response:",
        responseText
      );

      throw new Error(
        `${t.errorServer} (${response.status}): ${responseText.substring(0, 500)}`
      );

    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        `${t.errorServer} (${response.status})`
      );

    }


    if (!data.report) {

      console.error(
        "Invalid API response:",
        data
      );

      throw new Error(
        "Servern returnerade inget analysresultat."
      );

    }


    result.textContent = data.report;

    result.className = "result success";

    resultCard.style.display = "block";


    resultCard.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  } catch (error) {

    console.error("Request error:", error);

    showError(
      error.message ||
      t.errorGeneric
    );

  } finally {

    submitButton.disabled = false;

    loading.classList.remove("show");

  }

});


function showError(message) {

  resultCard.style.display = "block";

  result.className = "result error";

  result.textContent = message;

  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


setLanguage("sv");
