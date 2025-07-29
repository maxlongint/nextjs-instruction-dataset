import { NextRequest, NextResponse } from 'next/server';
import { QuestionService } from '../../../lib/services/question-service';

// GET - 获取单个问题详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: '无效的问题ID',
        },
        { status: 400 }
      );
    }

    const question = await QuestionService.getQuestionById(id);
    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: '问题不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('获取问题详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取问题详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新问题
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: '无效的问题ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { generatedQuestion, status } = body;

    const updateData: any = {};
    if (generatedQuestion !== undefined) {
      updateData.generatedQuestion = generatedQuestion;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    const question = await QuestionService.updateQuestion(id, updateData);

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error('更新问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新问题失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除问题
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: '无效的问题ID',
        },
        { status: 400 }
      );
    }

    await QuestionService.deleteQuestion(id);

    return NextResponse.json({
      success: true,
      message: '问题删除成功',
    });
  } catch (error) {
    console.error('删除问题失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除问题失败',
      },
      { status: 500 }
    );
  }
}