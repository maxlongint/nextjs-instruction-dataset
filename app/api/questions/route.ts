import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '../../lib/services/question-service';

// GET - 获取问题列表（支持分页和数据集筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const datasetId = searchParams.get('datasetId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: '项目ID不能为空',
        },
        { status: 400 }
      );
    }

    // 获取问题列表（支持分页和数据集筛选）
    const result = await QuestionService.getQuestionsWithPagination({
      projectId: parseInt(projectId),
      datasetId: datasetId ? parseInt(datasetId) : undefined,
      page,
      limit
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取问题列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取问题列表失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建问题（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, datasetId, prompt, content, generatedQuestion } = body;

    if (projectId && datasetId && prompt && content && generatedQuestion) {
      // 创建单个问题

      if (!projectId || !datasetId || !prompt || !content || !generatedQuestion) {
        return NextResponse.json(
          {
            success: false,
            error: '缺少必要参数',
          },
          { status: 400 }
        );
      }

      const question = await QuestionService.createQuestion(body);

      return NextResponse.json({
        success: true,
        data: question,
      });
    } else if (Array.isArray(body)) {
      // 批量创建问题
      if (body.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: '问题数据不能为空',
          },
          { status: 400 }
        );
      }

      const questions = await QuestionService.createQuestions(body);

      return NextResponse.json({
        success: true,
        data: questions,
      });
    }
  } catch (error) {
    console.error('创建问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建问题失败',
      },
      { status: 500 }
    );
  }
}