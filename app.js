const translations = {
    'Svenska': {
        subtitle: 'Sök på registreringsnummer och få en direkt AI-analys inför ditt bilköp.',
        regLabel: 'Registreringsnummer',
        regPlaceholder: 't.ex. ABC 123',
        linkLabel: 'Länk till annons (Valfritt - Blocket / Riddermark)',
        linkPlaceholder: 'Klistra in länk...',
        langLabel: 'Välj språk för rapporten',
        buttonText: 'Kolla Bilen',
        loadingText: 'Söker...',
        generatingText: 'Genererar AI-bilrapport, vänligen vänta...',
        footerNote: 'Hämta bilrapport - Helt utan registrering eller inloggning',
        disclaimer: '* Ansvarsfriskrivning: Denna tjänst ger AI-genererade råd baserade på tillgängliga data och ersätter inte en manuell mekanisk besiktning. Inga personuppgifter lagras eller visas.',
        errorConn: 'Anslutningsfel: Kunde inte nå servern.',
        errorGen: 'Kunde inte hämta rapporten'
    },
    'English': {
        subtitle: 'Search by license plate and get an instant AI analysis before buying.',
        regLabel: 'Registration Number',
        regPlaceholder: 'e.g. ABC 123',
        linkLabel: 'Ad link (Optional - Blocket / Riddermark)',
        linkPlaceholder: 'Paste link here...',
        langLabel: 'Select language for report',
        buttonText: 'Check Car',
        loadingText: 'Searching...',
        generatingText: 'Generating AI car report, please wait...',
        footerNote: 'Get car report - Completely free without registration',
        disclaimer: '* Disclaimer: This service provides AI-generated advice based on available data and does not replace a manual mechanical inspection. No personal data is stored or displayed.',
        errorConn: 'Connection error: Could not reach server.',
        errorGen: 'Could not fetch report'
    },
    'العربية': {
        subtitle: 'ابحث عن طريق رقم اللوحة واحصل على تحليل AI instant قبل الشراء.',
        regLabel: 'رقم التسجيل',
        regPlaceholder: 'مثال: ABC 123',
        linkLabel: 'رابط الإعلان (اختياري - Blocket / Riddermark)',
        linkPlaceholder: 'ألصق الرابط هنا...',
        langLabel: 'اختر لغة التقرير',
        buttonText: 'فحص السيارة',
        loadingText: 'جاري البحث...',
        generatingText: 'جاري إنشاء تقرير AI للسيارة، يرجى الانتظار...',
        footerNote: 'احصل على تقرير السيارة - مجانًا تمامًا بدون تسجيل',
        disclaimer: '* إخلاء مسؤولية: تقدم هذه الخدمة نصائح بذكاء اصطناعي بناءً على البيانات المتاحة ولا تستبدل الفحص الميكانيكي اليدوي. لا يتم تخزين أو عرض بيانات شخصية.',
        errorConn: 'خطأ في الاتصال: تعذر الوصول إلى الخادم.',
        errorGen: 'تعذر جلب التقرير'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const carForm = document.getElementById('carForm');
    const regInput = document.getElementById('regInput');
    const linkInput = document.getElementById('linkInput');
    const langSelect = document.getElementById('langSelect');
    const searchBtn = document.getElementById('searchBtn');
    const resultDiv = document.getElementById('result');

    const uiSubtitle = document.getElementById('uiSubtitle');
    const uiRegLabel = document.getElementById('uiRegLabel');
    const uiLinkLabel = document.getElementById('uiLinkLabel');
    const uiLangLabel = document.getElementById('uiLangLabel');
    const uiFooterNote = document.getElementById('uiFooterNote');
    const uiDisclaimer = document.getElementById('uiDisclaimer');

    function updateLanguage(lang) {
        const t = translations[lang] || translations['Svenska'];
        
        uiSubtitle.textContent = t.subtitle;
        uiRegLabel.textContent = t.regLabel;
        regInput.placeholder = t.regPlaceholder;
        uiLinkLabel.textContent = t.linkLabel;
        linkInput.placeholder = t.linkPlaceholder;
        uiLangLabel.textContent = t.langLabel;
        searchBtn.textContent = t.buttonText;
        uiFooterNote.textContent = t.footerNote;
        uiDisclaimer.textContent = t.disclaimer;

        if (lang === 'العربية') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }

    langSelect.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });

    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const regValue = regInput.value.trim();
        const linkValue = linkInput ? linkInput.value.trim() : '';
        const langValue = langSelect ? langSelect.value : 'Svenska';
        const t = translations[langValue] || translations['Svenska'];

        if (!regValue) return;

        searchBtn.disabled = true;
        searchBtn.innerText = t.loadingText;
        resultDiv.innerHTML = `<p style="color: #38bdf8; text-align: center; font-weight: 500;">${t.generatingText}</p>`;

        try {
            const response = await fetch('/api/check-car', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    regNr: regValue,
                    link: linkValue,
                    language: langValue
                })
            });

            const data = await response.json();

            if (response.ok) {
                resultDiv.innerHTML = `<div class="report">${data.resultat.replace(/\n/g, '<br>')}</div>`;
            } else {
                resultDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">${data.fel || t.errorGen}</p>`;
            }
        } catch (err) {
            resultDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">${t.errorConn}</p>`;
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerText = t.buttonText;
        }
    });
});
