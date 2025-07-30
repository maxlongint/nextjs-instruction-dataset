import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { questions } from '../../../lib/db/schema';

export async function DELETE(request: NextRequest) {
  try {
    console.log('开始清空问题记录...');
    
    // 删除所有问题记录
    const result = await db.delete(questions);
    
    console.log('问题记录清空完成');
    
    return NextResponse.json({
      success: true,
      message: '问题记录已清空',
      deletedCount: result.rowsAffected || 0
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