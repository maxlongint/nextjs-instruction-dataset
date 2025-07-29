import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '../../lib/services/project-service';
import { initDatabase } from '../../lib/db';

// 初始化数据库
initDatabase().catch(console.error);

// GET - 获取所有项目
export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects();
    
    // 为每个项目添加统计信息
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const stats = await ProjectService.getProjectStats(project.id);
        return {
          ...project,
          ...stats,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: projectsWithStats,
    });
  } catch (error) {
    console.error('获取项目列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取项目列表失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建新项目
export async function POST(request: NextRequest) {
  try {
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

    const project = await ProjectService.createProject({
      name: name.trim(),
      description: description?.trim() || null,
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('创建项目失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '创建项目失败',
      },
      { status: 500 }
    );
  }
}