import { NextRequest, NextResponse } from 'next/server';
import { AnswerService } from '../../../lib/services/answer-service';

// GET - 获取单个答案详情
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
          error: '无效的答案ID',
        },
        { status: 400 }
      );
    }

    const answer = await AnswerService.getAnswerById(id);
    if (!answer) {
      return NextResponse.json(
        {
          success: false,
          error: '答案不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    console.error('获取答案详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取答案详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新答案
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
          error: '无效的答案ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { generatedAnswer } = body;

    const updateData: any = {};
    if (generatedAnswer !== undefined) {
      updateData.generatedAnswer = generatedAnswer;
    }

    const answer = await AnswerService.updateAnswer(id, updateData);

    return NextResponse.json({
      success: true,
      data: answer,
    });
  } catch (error) {
    console.error('更新答案失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新答案失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除答案
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
          error: '无效的答案ID',
        },
        { status: 400 }
      );
    }

    await AnswerService.deleteAnswer(id);

    return NextResponse.json({
      success: true,
      message: '答案删除成功',
    });
  } catch (error) {
    console.error('删除答案失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除答案失败',
      },
      { status: 500 }
    );
  }
}