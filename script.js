// script.js
document.addEventListener('DOMContentLoaded', () => {
  // 八字
  const baziBtn = document.getElementById('baziBtn');
  if (baziBtn) {
    baziBtn.addEventListener('click', () => {
      const birth = document.getElementById('birth')?.value;
      const hour = document.getElementById('hour')?.value;
      if (!birth || !hour) return alert('请填写完整信息');
      callAI('bazi', { birth, hour });
    });
  }

  // 手相
  const palmInput = document.getElementById('palmImage');
  const palmBtn = document.getElementById('palmBtn');
  const preview = document.getElementById('palmPreview');

  palmInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        preview.src = reader.result;
        preview.style.display = 'block';
        palmBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  palmBtn?.addEventListener('click', () => {
    const base64 = preview.src.split(',')[1];
    if (!base64) return;
    callAI('palm', { image: base64 });
  });

  // 星座
  const astroBtn = document.getElementById('astroBtn');
  if (astroBtn) {
    astroBtn.addEventListener('click', () => {
      const birthday = document.getElementById('birthday')?.value;
      if (!birthday) return alert('请输入生日');
      callAI('astrology', { birthday });
    });
  }

  // 塔罗
  const tarotBtn = document.getElementById('tarotBtn');
  if (tarotBtn) {
    tarotBtn.addEventListener('click', () => {
      const question = document.getElementById('question')?.value?.trim();
      if (!question) return alert('请提出一个问题');
      callAI('tarot', { question });
    });
  }
});

async function callAI(type, data) {
  const btnMap = {
    bazi: 'baziBtn',
    palm: 'palmBtn',
    astrology: 'astroBtn',
    tarot: 'tarotBtn'
  };
  const btn = document.getElementById(btnMap[type]);
  const originalText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = '🔮 解命中...';
  }

  const resultEl = document.getElementById('result');
  resultEl.innerHTML = '';

  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });

    const result = await res.json();
    if (!res.ok || result.error) throw new Error(result.error || 'AI 服务异常');

    resultEl.textContent = result.analysis;
  } catch (err) {
    resultEl.innerHTML = `<p style="color:#c3272b;">❌ ${err.message}</p>`;
    console.error(err);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}
