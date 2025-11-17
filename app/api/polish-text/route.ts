import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, templateType } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: '请提供需要优化的文字' },
        { status: 400 }
      );
    }

    // Define context for different templates
    const templateContext: Record<string, string> = {
      postcard: '明信片，温馨、简洁、充满回忆感',
      bookmark: '书签，文艺、优雅、富有诗意',
      polaroid: '拍立得相框，即时、真实、充满生活感',
      greeting: '祝福贺卡，真诚、温暖、充满祝福',
    };

    const context = templateContext[templateType] || '复古胶片风格';

    // Call AI API (using OpenAI as example, you can replace with other AI services)
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `你是一位专业的文案优化助手。请根据用户提供的原始文字，优化成更加优美、简洁、富有意境的文案。
            
要求：
1. 保留原文的核心意思和情感
2. 让文字更加优美、简洁、有诗意
3. 适合${context}的场景
4. 字数控制在50字以内
5. 避免过于夸张或做作
6. 保持真诚自然的语气
7. 直接返回优化后的文字，不要有任何额外说明`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI service error');
    }

    const aiData = await aiResponse.json();
    const polishedText = aiData.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({ polishedText });
  } catch (error) {
    console.error('Polish text error:', error);
    return NextResponse.json(
      { error: 'AI优化服务暂时不可用' },
      { status: 500 }
    );
  }
}
