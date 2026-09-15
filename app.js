const translations = {
  Svenska: {
    dir: 'ltr',
    subtitle: 'Sök på registreringsnummer och få en direkt AI-analys inför ditt bilköp.',
    lblReg: 'Registreringsnummer',
    phReg: 't.ex. ABC 123',
    lblUrl: 'Länk till annons (Valfritt - Blocket / Riddermark)',
    phUrl: 'Klistra in länk här...',
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
    subtitle: 'ابحث برقم السيارة واحصل على تحليل مباشر بالذكاء الاصطناعي قبل الشراء.',
    lblReg: 'رقم السيارة (Registreringsnummer)',
    phReg: 'مثال: ABC 123',
    lblUrl: 'رابط الإعلان (اختياري - Blocket / Riddermark)',
    phUrl: 'الصق الرابط هنا...',
    lblLang: 'اختر لغة التقرير والواجهة',
    btnSearch: 'فحص السيارة',
    badgeInfo: 'احصل على تقرير السيارة - بدون تسجيل أو تسجيل دخول',
    disclaimer: '* إخلاء مسؤولية: تقدم هذه الخدمة استشارة ناتجة عن الذكاء الاصطناعي بناءً على البيانات المتاحة ولا تستبدل الفحص الميكانيكي اليدوي. لا يتم حفظ أو عرض أي بيانات شخصية.',
    reportTitle: 'تقرير السيارة',
    footer: 'تطوير <strong>Marven</strong> | kollabilen.se',
    alertReg: 'يرجى إدخال رقم السيارة.',
    btnAnalyzing: 'جاري التحليل...',
    loading: 'جاري جلب البيانات وتوليد التقرير...'
  },
  Engelska: {
    dir: 'ltr',
    subtitle: 'Search by license plate and get an instant AI analysis before buying.',
    lblReg: 'Registration Number',
    phReg: 'e.g. ABC 123',
    lblUrl: 'Ad link (Optional - Blocket / Riddermark)',
    phUrl: 'Paste link here...',
    lblLang: 'Select language for report',
    btnSearch: 'Check Car',
    badgeInfo: 'Get car report - Completely free without registration',
    disclaimer: '* Disclaimer: This service provides AI-generated advice based on available data and does not replace a manual mechanical inspection. No personal data is stored or displayed.',
    reportTitle: 'Vehicle Report',
    footer: 'Developed by <strong>Marven</strong> | kollabilen.se',
    alertReg: 'Please enter a registration number.',
    btnAnalyzing: 'Analyzing...',
    loading: 'Fetching data and generating AI report...'
  }
};

function updateBadgeText(val) {
  const badge = document.getElementById('badge-text');
  if (badge) {
    badge.innerText = val.trim() ? val.toUpperCase() : 'ABC 123';
  }
}

function changeUiLanguage() {
  const lang = document.getElementById('language').value;
  const t = translations[lang] || translations.Svenska;

  document.documentElement.dir = t.dir;
  document.getElementById('ui-subtitle').innerText = t.subtitle;
  document.getElementById('ui-lbl-reg').innerText = t.lblReg;
  document.getElementById('regNr').placeholder = t.phReg;
  document.getElementById('ui-lbl-url').innerText = t.lblUrl;
  document.getElementById('adUrl').placeholder = t.phUrl;
  document.getElementById('ui-lbl-lang').innerText = t.lblLang;
  document.getElementById('searchBtn').innerText = t.btnSearch;
  document.getElementById('ui-badge-info').innerText = t.badgeInfo;
  document.getElementById('ui-disclaimer').innerText = t.disclaimer;
  document.getElementById('ui-report-title').innerText = t.reportTitle;
  document.getElementById('ui-footer').innerHTML = t.footer;
}

function formatMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h4 style="color:#60a5fa; margin-top:15px; margin-bottom:5px;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="color:#0077ff; margin-top:20px; margin-bottom:8px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '• $1')
    .replace(/\n/g, '<br>');
}

async function analyzeCar() {
  const regNrInput = document.getElementById('regNr');
  const adUrlInput = document.getElementById('adUrl');
  const langInput = document.getElementById('language');
  const searchBtn = document.getElementById('searchBtn');
  const resultBox = document.getElementById('result-box');
  const output = document.getElementById('output');

  const regNr = regNrInput.value.trim();
  const adUrl = adUrlInput.value.trim();
  const language = langInput.value;
  const t = translations[language] || translations.Svenska;

  if (!regNr) {
    alert(t.alertReg);
    return;
  }

  searchBtn.disabled = true;
  searchBtn.innerText = t.btnAnalyzing;
  resultBox.style.display = 'block';
  output.innerHTML = `<em>${t.loading}</em>`;

  try {
    const response = await fetch('/api/check-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regNr, adUrl, language })
    });

    const data = await response.json();

    if (response.ok) {
      output.innerHTML = formatMarkdown(data.report);
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
