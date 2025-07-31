import { NextRequest, NextResponse } from 'next/server';
import { DatasetService } from '../../../../lib/services/dataset-service';

// GET - 获取数据集内容片段
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await DatasetService.getDatasetContentSegments(id, page, limit);

    return NextResponse.json({
      success: true,
      data: {
        segments: result.segments,
        total: result.total,
        hasMore: result.hasMore
      },
    });
  } catch (error) {
    console.error('获取数据集片段失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取数据集片段失败',
      },
      { status: 500 }
    );
  }
}