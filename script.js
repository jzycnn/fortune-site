document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('[data-action="generate"]');
  buttons.forEach(btn => btn.addEventListener('click', handleGenerate));
});

async function handleGenerate(event) {
  const btn = event.target;
  const type = btn.dataset.type;
  let data = {};

  switch (type) {
    case 'bazi':
      const birth = document.getElementById('birth')?.value;
      const hour = document.getElementById('hour')?.value;
      if (!birth || !hour) return alert('⚠️ 请填写出生日期和时辰');
      data = { birth, hour };
      break;

    case 'astrology':
      const birthday = document.getElementById('birthday')?.value;
      if (!birthday) return alert('⚠️ 请输入生日');
      data = { birthday };
      break;

    case 'tarot':
      const question = document.getElementById('question')?.value?.trim();
      if (!question) return alert('⚠️ 请提出一个问题');
      data = { question };
      break;

    case 'palm':
      data = {};
      break;

    default:
      return alert('❌ 未知类型');
  }

  const resultEl = document.getElementById('result');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '🔮 解命中...';
  resultEl.innerHTML = '';

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });

    const result = await res.json();

    if (!res.ok || result.error) {
      throw new Error(result.error || 'AI 服务异常');
    }

    resultEl.textContent = result.analysis;
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = `<p style="color:#e74c3c;">❌ ${err.message}</p>`;
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}
