import { NextRequest, NextResponse } from 'next/server';
import { AnswerService } from '../../lib/services/answer-service';

// GET - 获取答案列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (questionId) {
      // 获取特定问题的答案
      const answer = await AnswerService.getAnswerByQuestion(parseInt(questionId));
      return NextResponse.json({
        success: true,
        data: answer,
      });
    } else {
      // 获取所有答案
      const answers = await AnswerService.getAllAnswers();
      return NextResponse.json({
        success: true,
        data: answers,
      });
    }
  } catch (error) {
    console.error('获取答案列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取答案列表失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建答案（单个或批量）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers: answersData, single } = body;

    if (single) {
      // 创建单个答案
      const { questionId, prompt, generatedAnswer } = answersData;

      if (!questionId || !prompt || !generatedAnswer) {
        return NextResponse.json(
          {
            success: false,
            error: '缺少必要参数',
          },
          { status: 400 }
        );
      }

      const answer = await AnswerService.createAnswer({
        questionId,
        prompt,
        generatedAnswer,
      });

      return NextResponse.json({
        success: true,
        data: answer,
      });
    } else {
      // 批量创建答案
      if (!Array.isArray(answersData) || answersData.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: '答案数据不能为空',
          },
          { status: 400 }
        );
      }

      const answers = await AnswerService.createAnswers(answersData);

      return NextResponse.json({
        success: true,
        data: answers,
      });
    }
  } catch (error) {
    console.error('创建答案失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建答案失败',
      },
      { status: 500 }
    );
  }
}