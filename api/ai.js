// api/ai.js
// Vercel Edge Function for Qwen-VL-Max AI Fortune Telling

const QWEN_API_KEY = process.env.QWEN_API_KEY;

export default async function (request) {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    // 验证类型
    const validTypes = ['bazi', 'palm', 'astrology', 'tarot'];
    if (!validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: '无效的占卜类型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 检查 API Key 是否配置
    if (!QWEN_API_KEY) {
      console.error('QWEN_API_KEY 环境变量未设置');
      return new Response(JSON.stringify({ error: '服务器未配置 AI 密钥' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 构建 prompt
    let messages = [];
    const model = 'qwen-vl-max'; // 支持多模态

    switch (type) {
      case 'bazi':
        if (!data.birth || !data.hour) {
          return new Response(JSON.stringify({ error: '请提供出生日期和时辰' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        messages = [{
          role: 'user',
          content: `你是一位精通子平术的命理宗师。用户出生日期：${data.birth}，出生时辰：${data.hour}。请排出八字（年柱、月柱、日柱、时柱），分析日主强弱、五行平衡、性格特质、事业方向，并给出趋吉避凶的建议。要求：专业、温暖、强调主观能动性，避免宿命论。`
        }];
        break;

      case 'palm':
        if (data.image) {
          // 图片以 base64 形式传入
          messages = [{
            role: 'user',
            content: [
              { image: `data:image/jpeg;base64,${data.image}` },
              { text: '你是一位资深手相大师。请分析此掌纹的生命线、感情线、智慧线（事业线），解读其长度、深浅、分叉等特征，并结合整体掌形，给出性格倾向与人生建议。语气温暖积极，强调“相由心生”，避免恐吓或绝对化结论。' }
            ]
          }];
        } else {
          messages = [{
            role: 'user',
            content: '你是一位手相大师。请做通用掌纹解读，讲解生命线、感情线、智慧线的基本含义，并鼓励用户：掌纹会随心念改变，命运掌握在自己手中。'
          }];
        }
        break;

      case 'astrology':
        if (!data.birthday) {
          return new Response(JSON.stringify({ error: '请提供生日' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        messages = [{
          role: 'user',
          content: `你是一位专业占星师。用户生日是 ${data.birthday}。请推算其太阳、月亮、上升星座（若时间未知，上升按正午估算），并分析近期（未来一个月）在事业、感情、健康方面的运势。语气如知心朋友，给予希望与行动建议。`
        }];
        break;

      case 'tarot':
        if (!data.question?.trim()) {
          return new Response(JSON.stringify({ error: '请提出一个具体问题' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        messages = [{
          role: 'user',
          content: `你是一位塔罗贤者。用户的问题是：“${data.question}”。请抽取三张塔罗牌（代表过去、现在、未来），说明每张牌的名称、正逆位、象征意义，并整合解读对问题的启示。最后给出一句温暖的指引。`
        }];
        break;
    }

    // 调用 Qwen API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
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
      signal: AbortSignal.timeout(30000) // 30秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Qwen API Error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用，请稍后再试' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await response.json();
    const content = result.output?.choices?.[0]?.message?.content?.trim() || '';

    if (!content) {
      return new Response(JSON.stringify({ error: 'AI 返回内容为空' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ analysis: content }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Server Error:', err);
    return new Response(JSON.stringify({ error: '服务器内部错误' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
