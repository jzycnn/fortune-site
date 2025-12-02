// api/ai.js
const QWEN_API_KEY = process.env.QWEN_API_KEY;

export default async function (request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST' }), { status: 405 });
  }

  try {
    const { type, data } = await request.json();
    if (!['bazi', 'palm', 'astrology', 'tarot'].includes(type)) {
      return new Response(JSON.stringify({ error: '类型错误' }), { status: 400 });
    }
    if (!QWEN_API_KEY) {
      return new Response(JSON.stringify({ error: '未配置 AI 密钥' }), { status: 500 });
    }

    let messages = [];
    let model = 'qwen-vl-max';

    switch (type) {
      case 'bazi':
        if (!data.birth || !data.hour) return new Response(JSON.stringify({ error: '信息不全' }), { status: 400 });
        messages = [{ role: 'user', content: `精通子平术的命理宗师。用户出生 ${data.birth}，时辰 ${data.hour}。请排八字，分析日主强弱、五行、性格、事业。要求：专业、温暖、强调主观能动性。` }];
        break;
      case 'palm':
        if (data.image) {
          messages = [{
            role: 'user',
            content: [
              { image: `data:image/jpeg;base64,${data.image}` },
              { text: '你是资深手相大师。请分析此掌纹的生命线、感情线、事业线，并给出性格与人生建议。语气温暖积极，避免迷信。' }
            ]
          }];
        } else {
          messages = [{ role: 'user', content: '你是手相大师。请做通用掌纹解读，讲解生命线、感情线、事业线的意义，并鼓励用户“相由心生”。' }];
        }
        break;
      case 'astrology':
        if (!data.birthday) return new Response(JSON.stringify({ error: '缺少生日' }), { status: 400 });
        messages = [{ role: 'user', content: `专业占星师。用户生日 ${data.birthday}。请分析太阳/月亮/上升星座及近期运势。语气如知心朋友。` }];
        break;
      case 'tarot':
        if (!data.question) return new Response(JSON.stringify({ error: '请提问' }), { status: 400 });
        messages = [{ role: 'user', content: `塔罗贤者。问题：“${data.question}”。请抽三张牌（过去、现在、未来）并解读。` }];
        break;
    }

    const resp = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: { messages },
        parameters: { max_tokens: 800 }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Qwen Error:', err);
      return new Response(JSON.stringify({ error: 'AI 分析失败' }), { status: 502 });
    }

    const result = await resp.json();
    const content = result.output?.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ analysis: content }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500 });
  }
}
