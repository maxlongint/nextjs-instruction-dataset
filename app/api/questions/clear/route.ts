import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questions } from '../../../lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const datasetId = searchParams.get('datasetId');
    
    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: '项目ID不能为空',
        },
        { status: 400 }
      );
    }
    
    console.log(`开始清空问题记录... 项目ID: ${projectId}${datasetId ? `, 数据集ID: ${datasetId}` : ''}`);
    
    // 构建查询条件
    let whereClause;
    if (datasetId) {
      whereClause = and(
        eq(questions.projectId, parseInt(projectId)),
        eq(questions.datasetId, parseInt(datasetId))
      );
    } else {
      whereClause = eq(questions.projectId, parseInt(projectId));
    }
    
    // 获取要删除的问题数量
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions)
      .where(whereClause);
    
    const count = Number(countResult[0]?.count || 0);
    
    // 删除问题
    await db.delete(questions).where(whereClause);
    
    console.log(`问题记录清空完成，共删除 ${count} 条记录`);
    
    return NextResponse.json({
      success: true,
      message: '问题记录已清空',
      data: {
        count
      }
    });
    
  } catch (error) {
    console.error('清空问题记录失败:', error);
    
    return NextResponse.json({
      success: false,
      error: '清空问题记录失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}