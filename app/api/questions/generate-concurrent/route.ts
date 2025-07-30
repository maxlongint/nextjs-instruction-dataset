import { NextRequest, NextResponse } from 'next/server';
import { ConcurrentAIService, GenerationProgress } from '../../../lib/services/concurrent-ai-service';

// POST - 并发生成问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectId, 
      datasetId, 
      prompt, 
      segments, 
      model,
      concurrencyLimit,
      enableRetry = true,
      maxRetries = 2
    } = body;

    // 验证必要参数
    if (!projectId || !datasetId || !prompt || !segments || segments.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数：projectId, datasetId, prompt, segments',
        },
        { status: 400 }
      );
    }

    // 验证生成配置
    const validation = ConcurrentAIService.validateGenerationConfig({
      segments,
      prompt,
      projectId: parseInt(projectId),
      datasetId: parseInt(datasetId),
      model,
      concurrencyLimit
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: '配置验证失败',
          details: validation.errors
        },
        { status: 400 }
      );
    }


    try {
      let result;
      
      if (enableRetry) {
        // 使用重试机制生成
        result = await ConcurrentAIService.generateQuestionsWithRetry(
          segments,
          prompt,
          parseInt(projectId),
          parseInt(datasetId),
          model,
          {
            concurrencyLimit,
            maxRetries,
            retryDelay: 1000
          }
        );
      } else {
        // 普通并发生成
        result = await ConcurrentAIService.generateQuestionsWithConcurrency(
          segments,
          prompt,
          parseInt(projectId),
          parseInt(datasetId),
          model,
          concurrencyLimit
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          summary: result.summary,
          results: result.results,
          validation: {
            warnings: validation.warnings
          }
        },
        message: `生成完成！成功: ${result.summary.successful}, 失败: ${result.summary.failed}`,
      });

    } catch (error) {
      console.error('并发生成问题失败:', error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '生成过程中发生错误',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('处理生成请求失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '请求处理失败',
      },
      { status: 500 }
    );
  }
}

// GET - 获取生成状态和配置信息
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'validate':
        const segments = searchParams.get('segments') ? JSON.parse(searchParams.get('segments') as string) : [];
        const prompt = searchParams.get('prompt') || '';
        const projectId = parseInt(searchParams.get('projectId') || '0');
        const datasetId = parseInt(searchParams.get('datasetId') || '0');
        const model = searchParams.get('model') || '';
        const concurrency = parseInt(searchParams.get('concurrencyLimit') || '3');

        const validation = ConcurrentAIService.validateGenerationConfig({
          segments,
          prompt,
          projectId,
          datasetId,
          model,
          concurrencyLimit: concurrency
        });

        return NextResponse.json({
          success: true,
          data: validation
        });

      default:
        return NextResponse.json(
          { success: false, error: '不支持的操作' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('获取生成信息失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取信息失败',
      },
      { status: 500 }
    );
  }
}