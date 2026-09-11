const translations = {
  Svenska: {
    dir: 'ltr',
    subtitle: 'Sök på registreringsnummer och få en direkt AI-analys inför ditt bilköp.',
    lblReg: 'Registreringsnummer',
    phReg: 't.ex. ABC 123',
    lblImage: 'Ladda upp skärmdump av annonsen (Valfritt)',
    lblDetails: 'Eller klistra in annonstext / detaljer (Valfritt)',
    phDetails: 'Klistra in texten från Blocket/Riddermark här (modell, pris, miltal...)...',
    lblLang: 'Välj språk för rapporten',
    btnSearch: 'Kolla Bilen',
    badgeInfo: 'Hämta bilrapport - Helt utan registrering eller inloggning',
    disclaimer: '* Ansvarsfriskrivning: Denna tjänst erbjuder AI-genererad rådgivning baserad på tillgänglig data och ersätter inte en manuell mekanisk besiktning. Inga personuppgifter lagras eller visas.',
    reportTitle: 'Fordonsrapport',
    footer: 'Utvecklad av <strong>Marven</strong> | kollabilen.se',
    alertReg: 'Vänligen ange ett registreringsnummer.',
    btnAnalyzing: 'Analyserar...',
    loading: 'Hämtar data och genererar AI-rapport...'
  },
  Arabiska: {
    dir: 'rtl',
    subtitle: 'ابحث برقم السيارة واحصل على تحلیل مباشر بالذكاء الاصطناعي قبل الشراء.',
    lblReg: 'رقم السيارة (Registreringsnummer)',
    phReg: 'مثال: ABC 123',
    lblImage: 'ارفع صورة شاشة للإعلان (اختياري)',
    lblDetails: 'أو الصق نص الإعلان / التفاصيل (اختياري)',
    phDetails: 'الصق النص من Blocket أو Riddermark هنا (الموديل، السعر، الكيلومترات...)...',
    lblLang: 'اختر لغة التقرير والواجهة',
    btnSearch: 'فحص السيارة',
    badgeInfo: 'احصل على تقرير السيارة - بدون تسجيل أو تسجيل دخول',
    disclaimer: '* إخلاء مسؤولية: تقدم هذه الخدمة استشارة ناتجة عن الذكاء الاصطناعي بناءً على البيانات المتاحة ولا تستبدل الفحص الميكانيكي اليدوي. لا يتم حفظ أو عرض أي بيانات شخصية.',
    reportTitle: 'تقرير السيارة',
    footer: 'تطوير <strong>Marven</strong> | kollabilen.se',
    alertReg: 'يرجى إدخال رقم السيارة.',
    btnAnalyzing: 'جاري التحليل...',
    loading: 'جاري جلب البيانات وقراءة الصورة لتوليد التقرير...'
  },
  Engelska: {
    dir: 'ltr',
    subtitle: 'Search by license plate and get an instant AI analysis before buying.',
    lblReg: 'Registration Number',
    phReg: 'e.g. ABC 123',
    lblImage: 'Upload screenshot of the ad (Optional)',
    lblDetails: 'Or paste ad text / details (Optional)',
    phDetails: 'Paste the text from Blocket/Riddermark here (model, price, mileage...)...',
    lblLang: 'Select language for report',
    btnSearch: 'Check Car',
    badgeInfo: 'Get car report - Completely free without registration',
    disclaimer: '* Disclaimer: This service provides AI-generated advice based on available data and does not replace a manual mechanical inspection. No personal data is stored or displayed.',
    reportTitle: 'Vehicle Report',
    footer: 'Developed by <strong>Marven</strong> | kollabilen.se',
    alertReg: 'Please enter a registration number.',
    btnAnalyzing: 'Analyzing...',
    loading: 'Fetching data and processing image for AI report...'
  }
};

function changeUiLanguage() {
  const lang = document.getElementById('language').value;
  const t = translations[lang] || translations.Svenska;

  document.documentElement.dir = t.dir;
  document.getElementById('ui-subtitle').innerText = t.subtitle;
  document.getElementById('ui-lbl-reg').innerText = t.lblReg;
  document.getElementById('regNr').placeholder = t.phReg;
  document.getElementById('ui-lbl-image').innerText = t.lblImage;
  document.getElementById('ui-lbl-details').innerText = t.lblDetails;
  document.getElementById('adText').placeholder = t.phDetails;
  document.getElementById('ui-lbl-lang').innerText = t.lblLang;
  document.getElementById('searchBtn').innerText = t.btnSearch;
  document.getElementById('ui-badge-info').innerText = t.badgeInfo;
  document.getElementById('ui-disclaimer').innerText = t.disclaimer;
  document.getElementById('ui-report-title').innerText = t.reportTitle;
  document.getElementById('ui-footer').innerHTML = t.footer;
}

// تحويل ملف الصورة إلى صيغة Base64
function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

async function analyzeCar() {
  const regNrInput = document.getElementById('regNr');
  const adTextInput = document.getElementById('adText');
  const imageInput = document.getElementById('adImage');
  const langInput = document.getElementById('language');
  const searchBtn = document.getElementById('searchBtn');
  const resultBox = document.getElementById('result-box');
  const output = document.getElementById('output');

  const regNr = regNrInput.value.trim();
  const adText = adTextInput.value.trim();
  const language = langInput.value;
  const t = translations[language] || translations.Svenska;

  if (!regNr) {
    alert(t.alertReg);
    return;
  }

  let imageBase64 = null;
  if (imageInput.files && imageInput.files[0]) {
    try {
      imageBase64 = await convertFileToBase64(imageInput.files[0]);
    } catch (e) {
      console.log('Kunde inte läsa bilden.');
    }
  }

  searchBtn.disabled = true;
  searchBtn.innerText = t.btnAnalyzing;
  resultBox.style.display = 'block';
  output.innerText = t.loading;

  try {
    const response = await fetch('/api/check-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNr, adText, imageBase64, language })
    });

    const data = await response.json();

    if (response.ok) {
      output.innerHTML = data.report.replace(/\n/g, '<br>');
    } else {
      output.innerText = 'Error: ' + (data.error || 'Failed to generate report.');
    }
  } catch (err) {
    output.innerText = 'Connection error. Please try again.';
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerText = t.btnSearch;
  }
}
