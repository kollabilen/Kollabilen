const translations = {
Svenska: {
dir: "ltr",
subtitle: "Skriv in bilens uppgifter och få en AI-analys inför ditt bilköp.",
lblBrand: "Bilmärke",
phBrand: "t.ex. Volvo",
lblModel: "Modell",
phModel: "t.ex. V60 D4",
lblYear: "Årsmodell",
lblPrice: "Pris (kr)",
lblMileage: "Miltal",
lblFuel: "Bränsle",
lblTransmission: "Växellåda",
lblAd: "Annonslänk (valfritt)",
phAd: "https://...",
lblLang: "Välj språk för rapporten",
btnSearch: "Analysera bilen",
badgeInfo: "AI-analys av bilens pris, skick, vanliga problem och köprisker",
disclaimer: "* AI-genererad information är endast vägledande och ersätter inte en professionell mekanisk besiktning. Priser och marknadsvärden är uppskattningar.",
reportTitle: "Bilrapport",
footer: "Utvecklad av <strong>Marven</strong> | kollabilen.se",
alertBrand: "Vänligen ange bilmärke.",
alertModel: "Vänligen ange bilmodell.",
alertYear: "Vänligen ange årsmodell.",
alertPrice: "Vänligen ange pris.",
alertMileage: "Vänligen ange miltal.",
btnAnalyzing: "Analyserar...",
loading: "AI analyserar bilen..."
},

Arabiska: {
dir: "rtl",
subtitle: "أدخل معلومات السيارة واحصل على تحليل بالذكاء الاصطناعي قبل الشراء.",
lblBrand: "ماركة السيارة",
phBrand: "مثال: Volvo",
lblModel: "الموديل",
phModel: "مثال: V60 D4",
lblYear: "سنة الصنع",
lblPrice: "السعر (كرونة)",
lblMileage: "عدد الكيلومترات",
lblFuel: "نوع الوقود",
lblTransmission: "ناقل الحركة",
lblAd: "رابط الإعلان (اختياري)",
phAd: "https://...",
lblLang: "اختر لغة التقرير",
btnSearch: "حلل السيارة",
badgeInfo: "تحليل بالذكاء الاصطناعي للسعر والمشاكل الشائعة ومخاطر الشراء",
disclaimer: "* المعلومات الناتجة عن الذكاء الاصطناعي إرشادية فقط ولا تستبدل الفحص الميكانيكي الاحترافي. الأسعار والقيم السوقية تقديرية.",
reportTitle: "تقرير السيارة",
footer: "تطوير <strong>Marven</strong> | kollabilen.se",
alertBrand: "يرجى إدخال ماركة السيارة.",
alertModel: "يرجى إدخال موديل السيارة.",
alertYear: "يرجى إدخال سنة الصنع.",
alertPrice: "يرجى إدخال السعر.",
alertMileage: "يرجى إدخال عدد الكيلومترات.",
btnAnalyzing: "جاري التحليل...",
loading: "الذكاء الاصطناعي يقوم بتحليل السيارة..."
},

Engelska: {
dir: "ltr",
subtitle: "Enter the car details and get an AI analysis before buying.",
lblBrand: "Car Brand",
phBrand: "e.g. Volvo",
lblModel: "Model",
phModel: "e.g. V60 D4",
lblYear: "Model Year",
lblPrice: "Price (SEK)",
lblMileage: "Mileage",
lblFuel: "Fuel",
lblTransmission: "Transmission",
lblAd: "Ad link (optional)",
phAd: "https://...",
lblLang: "Select report language",
btnSearch: "Analyze Car",
badgeInfo: "AI analysis of price, common problems and buying risks",
disclaimer: "* AI-generated information is for guidance only and does not replace a professional mechanical inspection. Prices and market values are estimates.",
reportTitle: "Car Report",
footer: "Developed by <strong>Marven</strong> | kollabilen.se",
alertBrand: "Please enter the car brand.",
alertModel: "Please enter the car model.",
alertYear: "Please enter the model year.",
alertPrice: "Please enter the price.",
alertMileage: "Please enter the mileage.",
btnAnalyzing: "Analyzing...",
loading: "AI is analyzing the car..."
}
};

function changeUiLanguage() {
const lang = document.getElementById("language").value;
const t = translations[lang] || translations.Svenska;

document.documentElement.dir = t.dir;

document.getElementById("ui-subtitle").innerText = t.subtitle;

document.getElementById("ui-lbl-brand").innerText = t.lblBrand;
document.getElementById("brand").placeholder = t.phBrand;

document.getElementById("ui-lbl-model").innerText = t.lblModel;
document.getElementById("model").placeholder = t.phModel;

document.getElementById("ui-lbl-year").innerText = t.lblYear;
document.getElementById("ui-lbl-price").innerText = t.lblPrice;
document.getElementById("ui-lbl-mileage").innerText = t.lblMileage;

document.getElementById("ui-lbl-fuel").innerText = t.lblFuel;
document.getElementById("ui-lbl-transmission").innerText = t.lblTransmission;

document.getElementById("ui-lbl-ad").innerText = t.lblAd;
document.getElementById("adUrl").placeholder = t.phAd;

document.getElementById("ui-lbl-lang").innerText = t.lblLang;

document.getElementById("searchBtn").innerText = t.btnSearch;

document.getElementById("ui-badge-info").innerText = t.badgeInfo;
document.getElementById("ui-disclaimer").innerText = t.disclaimer;

document.getElementById("ui-report-title").innerText = t.reportTitle;

document.getElementById("ui-footer").innerHTML = t.footer;
}

async function analyzeCar() {

const brand = document.getElementById("brand").value.trim();
const model = document.getElementById("model").value.trim();
const year = document.getElementById("year").value.trim();
const price = document.getElementById("price").value.trim();
const mileage = document.getElementById("mileage").value.trim();

const fuel = document.getElementById("fuel").value;
const transmission = document.getElementById("transmission").value;

const adUrl = document.getElementById("adUrl").value.trim();

const language = document.getElementById("language").value;

const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result-box");
const output = document.getElementById("output");

const t = translations[language] || translations.Svenska;

if (!brand) {
alert(t.alertBrand);
return;
}

if (!model) {
alert(t.alertModel);
return;
}

if (!year) {
alert(t.alertYear);
return;
}

if (!price) {
alert(t.alertPrice);
return;
}

if (!mileage) {
alert(t.alertMileage);
return;
}

searchBtn.disabled = true;
searchBtn.innerText = t.btnAnalyzing;

resultBox.style.display = "block";
output.innerText = t.loading;

resultBox.scrollIntoView({
behavior: "smooth",
block: "start"
});

try {

const response = await fetch("/api/check-car", {

  method: "POST",

  headers: {
    "Content-Type": "application/json"
  },

  body: JSON.stringify({

    brand,
    model,
    year,
    price,
    mileage,
    fuel,
    transmission,
    adUrl,
    language

  })

});


let data;

try {
  data = await response.json();
} catch {
  throw new Error("Servern returnerade ett ogiltigt svar.");
}


if (!response.ok) {

  throw new Error(
    data.error || "Kunde inte skapa rapporten."
  );

}


if (!data.report) {
  throw new Error("Ingen rapport returnerades från AI.");
}


output.innerHTML = data.report
  .replace(/\n/g, "<br>");

} catch (error) {

console.error(error);

output.innerText =
  "Fel: " + error.message;

} finally {

searchBtn.disabled = false;
searchBtn.innerText = t.btnSearch;

}
}
