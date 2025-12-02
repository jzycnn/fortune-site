// script.js
// 所有请求发送至 /api/ai，由 EdgeOne 边缘函数代理
const API_ENDPOINT = '/api/ai';

/**
 * 调用 AI 算命服务
 * @param {string} type - 'bazi' | 'palm' | 'astrology' | 'tarot'
 * @param {object} data - 请求参数
 * @returns {Promise<{analysis: string}>}
 */
export async function callFortune(type, data) {
  const resp = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type, data })
  });

  if (!resp.ok) {
    let msg = `服务暂时不可用 (${resp.status})`;
    try {
      const err = await resp.json();
      msg = err.error || msg;
    } catch (e) {}
    throw new Error(msg);
  }

  const json = await resp.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}
