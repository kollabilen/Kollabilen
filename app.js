async function testAiConnection() {
  const brand = document.getElementById('brand').value.trim();
  const model = document.getElementById('model').value.trim();
  const details = document.getElementById('details').value.trim();
  const language = document.getElementById('language').value;
  const searchBtn = document.getElementById('searchBtn');
  const output = document.getElementById('output');

  if (!brand || !model) {
    alert('Vänligen ange både märke och modell.');
    return;
  }

  searchBtn.disabled = true;
  searchBtn.innerText = 'Ansluter till AI...';
  output.style.display = 'block';
  output.innerText = 'Skickar data och genererar rapport...';

  try {
    const response = await fetch('/api/check-car', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, model, details, language })
    });

    const data = await response.json();

    if (response.ok) {
      output.innerText = data.report;
    } else {
      output.innerText = `Serverfel (${response.status}): ` + (data.error || JSON.stringify(data));
    }
  } catch (err) {
    output.innerText = 'Anslutningsfel i webbläsaren: ' + err.message;
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerText = 'Kontrollera bilen nu';
  }
}
