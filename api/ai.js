const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

export default async function (request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, data } = await request.json();

    const validTypes = ['bazi', 'palm', 'astrology', 'tarot'];
    if (!validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: '不支持的算命类型' }), { status: 400 });
    }

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: '服务器未配置 AI 密钥' }), { status: 500 });
    }

    let prompt = '';
    switch (type) {
      case 'bazi':
        if (!data?.birth || !data?.hour)
          return new Response(JSON.stringify({ error: '缺少出生日期或时辰' }), { status: 400 });
        prompt = `你是一位精通子平术的命理宗师。用户出生日期为 ${data.birth}，时辰为${data.hour}。请排出八字，并分析日主强弱、五行平衡、性格特质、事业建议。要求：专业、温暖、避免迷信，强调主观能动性。`;
        break;
      case 'palm':
        prompt = `你是一位经验丰富的手相大师。虽然无法看到实际掌纹，但请基于传统手相学理论，为用户提供通用而深刻的解读。重点讲解生命线、感情线、事业线的象征意义，并鼓励用户“相由心生”，命运掌握在自己手中。语气亲切、积极。`;
        break;
      case 'astrology':
        if (!data?.birthday)
          return new Response(JSON.stringify({ error: '缺少生日信息' }), { status: 400 });
        prompt = `你是一位专业占星师。用户生日是 ${data.birthday}。请计算其太阳、月亮、上升星座（若信息不足可合理假设），并给出性格特征与近期（未来1-3个月）运势分析。语气如知心朋友，避免危言耸听。`;
        break;
      case 'tarot':
        if (!data?.question)
          return new Response(JSON.stringify({ error: '请提出一个问题' }), { status: 400 });
        prompt = `你是一位智慧的塔罗贤者。用户的问题是：“${data.question}”。请抽取三张塔罗牌（过去、现在、未来），并结合牌义给出深刻、温暖且有启发性的解读。`;
        break;
    }

    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!resp.ok) {
      console.error('DeepSeek error:', await resp.text());
      return new Response(JSON.stringify({ error: 'AI 服务暂时不可用' }), { status: 502 });
    }

    const result = await resp.json();
    const content = result.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ analysis: content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Function error:', error.message);
    return new Response(JSON.stringify({ error: '内部服务器错误' }), { status: 500 });
  }
}
