import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const datasetId = searchParams.get('datasetId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 构建查询条件
    const conditions = [];
    if (projectId) {
      conditions.push(eq(questions.projectId, parseInt(projectId)));
    }
    if (datasetId) {
      conditions.push(eq(questions.datasetId, parseInt(datasetId)));
    }

    // 查询生成结果
    const results = await db
      .select({
        id: questions.id,
        projectId: questions.projectId,
        datasetId: questions.datasetId,
        prompt: questions.prompt,
        content: questions.content,
        generatedQuestion: questions.generatedQuestion,
        status: questions.status,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(questions.createdAt))
      .limit(limit)
      .offset(offset);

    // 统计信息
    const totalCount = await db
      .select({ count: questions.id })
      .from(questions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // 按状态分组统计
    const statusStats = (results || []).reduce((acc, result) => {
      const status = result?.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按日期分组统计（最近7天）
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentResults = (results || []).filter(result => {
      try {
        if (!result?.createdAt) return false;
        const createdDate = new Date(result.createdAt);
        return !isNaN(createdDate.getTime()) && createdDate >= sevenDaysAgo;
      } catch {
        return false;
      }
    });

    const dailyStats = recentResults.reduce((acc, result) => {
      try {
        if (result?.createdAt) {
          const createdDate = new Date(result.createdAt);
          if (!isNaN(createdDate.getTime())) {
            const date = createdDate.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
          }
        }
      } catch {
        // 忽略无效日期
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        results: results || [],
        pagination: {
          total: totalCount?.length || 0,
          limit,
          offset,
          hasMore: (totalCount?.length || 0) > offset + limit
        },
        statistics: {
          total: results?.length || 0,
          byStatus: statusStats || {},
          byDate: dailyStats || {},
          recent: recentResults?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('获取生成结果失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取生成结果失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 获取单个生成结果的详细信息
export async function POST(request: NextRequest) {
  try {
    const { questionId } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: '缺少问题ID' },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: '问题不存在' },
        { status: 404 }
      );
    }

    const question = result[0];

    // 获取相关统计信息
    const relatedQuestions = await db
      .select({
        id: questions.id,
        generatedQuestion: questions.generatedQuestion,
        status: questions.status,
        createdAt: questions.createdAt
      })
      .from(questions)
      .where(
        and(
          eq(questions.projectId, question.projectId),
          eq(questions.datasetId, question.datasetId)
        )
      )
      .orderBy(desc(questions.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        question,
        related: relatedQuestions,
        metadata: {
          contentLength: question.content?.length || 0,
          questionLength: question.generatedQuestion?.length || 0,
          promptLength: question.prompt?.length || 0,
          createdAt: question.createdAt,
        }
      }
    });

  } catch (error) {
    console.error('获取问题详情失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取问题详情失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}