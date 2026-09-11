async function testAiConnection() {
  const brand = document.getElementById('brand').value.trim();
  const model = document.getElementById('model').value.trim();
  const details = document.getElementById('details').value.trim();
  const language = document.getElementById('language').value;
  const searchBtn = document.getElementById('searchBtn');
  const output = document.getElementById('output');

  if (!brand || !model) {
    alert('يرجى إدخال الماركة والموديل على الأقل.');
    return;
  }

  searchBtn.disabled = true;
  searchBtn.innerText = 'جاري الاتصال بالذكاء الاصطناعي...';
  output.style.display = 'block';
  output.innerText = 'جاري إرسال البيانات وتوليد التقرير...';

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
      output.innerText = 'خطأ من السيرفر: ' + (data.error || 'فشل توليد التقرير');
    }
  } catch (err) {
    output.innerText = 'Connection Error: يتعذر الاتصال بالسيرفر حالياً.';
  } finally {
    searchBtn.disabled = false;
    searchBtn.innerText = 'فحص السيارة الأن';
  }
}
