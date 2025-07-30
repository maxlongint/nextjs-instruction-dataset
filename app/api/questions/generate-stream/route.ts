import { NextRequest, NextResponse } from 'next/server';
import { AI_SERVICE } from '../../lib/services/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少提示',
        },
        { status: 400 }
      );
    }

    const stream = await AI_SERVICE.generateStream(prompt);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('生成问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '生成问题失败',
      },
      { status: 500 }
    );
  }
}