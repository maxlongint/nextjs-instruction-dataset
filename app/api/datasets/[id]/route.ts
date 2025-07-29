import { NextRequest, NextResponse } from 'next/server';
import { DatasetService } from '../../../lib/services/dataset-service';

// GET - 获取单个数据集详情
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
          error: '无效的数据集ID',
        },
        { status: 400 }
      );
    }

    const dataset = await DatasetService.getDatasetById(id);
    if (!dataset) {
      return NextResponse.json(
        {
          success: false,
          error: '数据集不存在',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    console.error('获取数据集详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取数据集详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新数据集
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
          error: '无效的数据集ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: '数据集名称不能为空',
        },
        { status: 400 }
      );
    }

    const dataset = await DatasetService.updateDataset(id, {
      name: name.trim(),
    });

    return NextResponse.json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    console.error('更新数据集失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新数据集失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除数据集
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
          error: '无效的数据集ID',
        },
        { status: 400 }
      );
    }

    await DatasetService.deleteDataset(id);

    return NextResponse.json({
      success: true,
      message: '数据集删除成功',
    });
  } catch (error) {
    console.error('删除数据集失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除数据集失败',
      },
      { status: 500 }
    );
  }
}