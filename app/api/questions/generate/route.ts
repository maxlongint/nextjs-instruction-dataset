import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '../../../lib/services/question-service';
import { DatasetService } from '../../../lib/services/dataset-service';
import { AIService } from '../../../lib/services/ai-service';

// POST - 生成问题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { datasetId, prompt, count = 5 } = body;

    if (!datasetId || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }

    // 获取数据集内容
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

    // 调用AI服务生成问题
    const generatedQuestions = await AIService.generateQuestions(
      dataset.content || '',
      prompt,
      count
    );

    // 保存生成的问题到数据库
    const questionsToCreate = generatedQuestions.map(content => ({
      projectId: dataset.projectId,
      content,
      datasetId: parseInt(datasetId),
      prompt,
      generatedQuestion: content,
    }));

    const questions = await QuestionService.createQuestions(questionsToCreate);

    return NextResponse.json({
      success: true,
      data: questions,
      message: `成功生成 ${questions.length} 个问题`,
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