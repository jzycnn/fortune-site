// script.js
// 所有请求都发往 /api/ai（由 EdgeOne 路由到边缘函数）
const API_ENDPOINT = '/api/ai';

export async function callFortune(type, data) {
  const resp = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, data })
  });
  
  if (!resp.ok) {
    throw new Error(`AI 推演失败: ${resp.status}`);
  }
  
  return await resp.json();
}
