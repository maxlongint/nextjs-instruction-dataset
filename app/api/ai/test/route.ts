import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '../../../lib/services/ai-service';

// POST - 测试AI连接
export async function POST(request: NextRequest) {
  try {
    const result = await AIService.testConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      latency: result.latency,
    });
  } catch (error) {
    console.error('测试AI连接失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : '测试AI连接失败',
      },
      { status: 500 }
    );
  }
}

// GET - 获取支持的模型列表
export async function GET(request: NextRequest) {
  try {
    const models = AIService.getSupportedModels();
    
    return NextResponse.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('获取模型列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取模型列表失败',
      },
      { status: 500 }
    );
  }
}