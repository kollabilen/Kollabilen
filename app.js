document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn') || document.querySelector('button');
    const regInput = document.getElementById('regInput') || document.querySelector('input');
    const resultDiv = document.getElementById('result') || document.createElement('div');

    if (searchBtn) {
        searchBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const regValue = regInput ? regInput.value.trim() : '';

            if (!regValue) {
                alert('Vänligen ange ett giltigt registreringsnummer');
                return;
            }

            searchBtn.disabled = true;
            searchBtn.innerText = 'Söker...';
            resultDiv.innerHTML = '<p>Genererar AI-bilrapport, vänligen vänta...</p>';

            try {
                const response = await fetch('/api/check-car', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        regNr: regValue,
                        language: 'Svenska'
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    resultDiv.innerHTML = `<div class="report">${data.resultat.replace(/\n/g, '<br>')}</div>`;
                } else {
                    resultDiv.innerHTML = `<p style="color: red;">Ett fel uppstod: ${data.fel || 'Kunde inte hämta rapporten'}</p>`;
                }
            } catch (err) {
                resultDiv.innerHTML = `<p style="color: red;">Nätverksfel: Kunde inte ansluta till servern.</p>`;
            } finally {
                searchBtn.disabled = false;
                searchBtn.innerText = 'Kolla Bilen';
            }
        });
    }
});
