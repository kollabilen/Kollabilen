document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const searchBtn = document.getElementById('searchBtn') || document.querySelector('button');
    const regInput = document.getElementById('regInput') || document.querySelector('input');
    
    let resultDiv = document.getElementById('result');
    if (!resultDiv) {
        resultDiv = document.createElement('div');
        resultDiv.id = 'result';
        resultDiv.style.marginTop = '20px';
        resultDiv.style.padding = '15px';
        const container = document.querySelector('main') || document.body;
        container.appendChild(resultDiv);
    }

    async function handleSearch(e) {
        if (e) e.preventDefault();

        const regValue = regInput ? regInput.value.trim() : '';

        if (!regValue) {
            alert('Vänligen ange ett giltigt registreringsnummer');
            return;
        }

        if (searchBtn) {
            searchBtn.disabled = true;
            searchBtn.innerText = 'Söker...';
        }
        resultDiv.innerHTML = '<p style="color: #3b82f6; font-weight: bold;">Genererar AI-bilrapport, vänligen vänta...</p>';

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
                resultDiv.innerHTML = `<div class="report" style="line-height: 1.6; text-align: left;">${data.resultat.replace(/\n/g, '<br>')}</div>`;
            } else {
                resultDiv.innerHTML = `<p style="color: red;">Ett fel uppstod: ${data.fel || 'Kunde inte hämta rapporten'}</p>`;
            }
        } catch (err) {
            resultDiv.innerHTML = `<p style="color: red;">Nätverksfel: Kunde inte ansluta till servern.</p>`;
        } finally {
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerText = 'Kolla Bilen';
            }
        }
    }

    if (form) {
        form.addEventListener('submit', handleSearch);
    } else if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
});
