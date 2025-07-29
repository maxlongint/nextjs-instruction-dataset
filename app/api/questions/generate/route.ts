import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '../../../lib/services/question-service';
import { DatasetService } from '../../../lib/services/dataset-service';
import { AIService } from '../../../lib/services/ai-service';

// POST - 生成问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, datasetId, prompt, segments, count = 1 } = body;

    if (!projectId || !datasetId || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }

    // 获取数据集信息
    const dataset = await DatasetService.getDatasetById(parseInt(datasetId));
    if (!dataset) {
      return NextResponse.json(
        {
          success: false,
          error: '数据集不存在',
        },
        { status: 404 }
      );
    }

    let contentToProcess: string[] = [];

    // 如果提供了分段，使用分段内容；否则使用整个数据集内容
    if (segments && segments.length > 0) {
      contentToProcess = segments;
    } else {
      // 获取数据集的所有分段
      const segmentsResult = await DatasetService.getDatasetContentSegments(parseInt(datasetId), 1, 100);
      contentToProcess = segmentsResult.segments.map(seg => seg.content);
    }

    if (contentToProcess.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '没有可用的内容分段',
        },
        { status: 400 }
      );
    }

    // 为每个分段生成问题
    const allQuestions: any[] = [];
    
    for (const content of contentToProcess) {
      try {
        // 调用AI服务生成问题
        const generatedQuestions = await AIService.generateQuestions(
          content,
          prompt,
          count
        );

        // 保存生成的问题到数据库
        const questionsToCreate = generatedQuestions.map(question => ({
          projectId: parseInt(projectId),
          content: content,
          datasetId: parseInt(datasetId),
          prompt,
          generatedQuestion: question,
        }));

        const questions = await QuestionService.createQuestions(questionsToCreate);
        allQuestions.push(...questions);
      } catch (error) {
        console.error('为分段生成问题失败:', error);
        // 继续处理其他分段，不中断整个流程
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        questions: allQuestions,
        total: allQuestions.length
      },
      message: `成功生成 ${allQuestions.length} 个问题`,
    });
  } catch (error) {
    console.error('生成问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成问题失败',
      },
      { status: 500 }
    );
  }
}
