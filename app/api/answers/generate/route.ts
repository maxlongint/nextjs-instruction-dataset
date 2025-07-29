import { NextRequest, NextResponse } from 'next/server';
import { AnswerService } from '../../../lib/services/answer-service';
import { QuestionService } from '../../../lib/services/question-service';
import { AIService } from '../../../lib/services/ai-service';

// POST - 生成答案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionIds, prompt, context } = body;

    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0 || !prompt) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }

    // 获取问题详情
    const questions = [];
    for (const questionId of questionIds) {
      const question = await QuestionService.getQuestionById(parseInt(questionId));
      if (question) {
        questions.push({
          id: question.id,
          content: question.content,
        });
      }
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '未找到有效的问题',
        },
        { status: 404 }
      );
    }

    // 调用AI服务批量生成答案
    const generatedAnswers = await AIService.generateAnswers(questions, prompt, context);

    // 保存生成的答案到数据库
    const answersToCreate = generatedAnswers.map(item => ({
      questionId: item.questionId,
      prompt,
      generatedAnswer: item.answer,
    }));

    const answers = await AnswerService.createAnswers(answersToCreate);

    return NextResponse.json({
      success: true,
      data: answers,
      message: `成功生成 ${answers.length} 个答案`,
    });
  } catch (error) {
    console.error('生成答案失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '生成答案失败',
      },
      { status: 500 }
    );
  }
}