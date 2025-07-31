import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '../../../lib/services/project-service';

// GET - 获取单个项目
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
          error: '无效的项目ID',
        },
        { status: 400 }
      );
    }

    const project = await ProjectService.getProjectById(id);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: '项目不存在',
        },
        { status: 404 }
      );
    }

    const stats = await ProjectService.getProjectStats(id);

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        ...stats,
      },
    });
  } catch (error) {
    console.error('获取项目详情失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取项目详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新项目
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
          error: '无效的项目ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: '项目名称不能为空',
        },
        { status: 400 }
      );
    }

    const project = await ProjectService.updateProject(id, {
      name: name.trim(),
      description: description?.trim() || null,
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '更新项目失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除项目
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
          error: '无效的项目ID',
        },
        { status: 400 }
      );
    }

    await ProjectService.deleteProject(id);

    return NextResponse.json({
      success: true,
      message: '项目删除成功',
    });
  } catch (error) {
    console.error('删除项目失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除项目失败',
      },
      { status: 500 }
    );
  }
}