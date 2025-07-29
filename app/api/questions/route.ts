import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '../../lib/services/question-service';

// GET - 获取问题列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const datasetId = searchParams.get('datasetId');

    let questions;
    if (projectId && datasetId) {
      // 获取特定数据集的问题
      questions = await QuestionService.getQuestionsByDataset(parseInt(datasetId));
    } else if (projectId) {
      // 获取项目的所有问题
      questions = await QuestionService.getQuestionsByProject(parseInt(projectId));
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '项目ID不能为空',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: questions,
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
    const { questions: questionsData, single } = body;

    if (single) {
      // 创建单个问题
      const { projectId, datasetId, prompt, content, generatedQuestion } = questionsData;

      if (!projectId || !datasetId || !prompt || !content || !generatedQuestion) {
        return NextResponse.json(
          {
            success: false,
            error: '缺少必要参数',
          },
          { status: 400 }
        );
      }

      const question = await QuestionService.createQuestion({
        projectId,
        datasetId,
        prompt,
        content,
        generatedQuestion,
        status: 'generated',
      });

      return NextResponse.json({
        success: true,
        data: question,
      });
    } else {
      // 批量创建问题
      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: '问题数据不能为空',
          },
          { status: 400 }
        );
      }

      const questions = await QuestionService.createQuestions(questionsData);

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