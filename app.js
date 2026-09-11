document.addEventListener('DOMContentLoaded', () => {
    const carForm = document.getElementById('carForm');
    const regInput = document.getElementById('regInput');
    const linkInput = document.getElementById('linkInput');
    const langSelect = document.getElementById('langSelect');
    const searchBtn = document.getElementById('searchBtn');
    const resultDiv = document.getElementById('result');

    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const regValue = regInput.value.trim();
        const linkValue = linkInput ? linkInput.value.trim() : '';
        const langValue = langSelect ? langSelect.value : 'Svenska';

        if (!regValue) return;

        searchBtn.disabled = true;
        searchBtn.innerText = 'Söker...';
        resultDiv.innerHTML = '<p style="color: #38bdf8; text-align: center; font-weight: 500;">Genererar AI-bilrapport, vänligen vänta...</p>';

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
                resultDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">Ett fel uppstod: ${data.fel || 'Kunde inte hämta rapporten'}</p>`;
            }
        } catch (err) {
            resultDiv.innerHTML = `<p style="color: #ef4444; text-align: center;">Anslutningsfel: Kunde inte nå servern.</p>`;
        } finally {
            searchBtn.disabled = false;
            searchBtn.innerText = 'Kolla Bilen';
        }
    });
});
