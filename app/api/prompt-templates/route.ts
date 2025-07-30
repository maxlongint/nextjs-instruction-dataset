import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promptTemplates, settings } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

// 获取提示词模板列表或当前设置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'list' 或 'current'
    const category = searchParams.get('category') || 'question';

    if (type === 'current') {
      // 获取当前使用的提示词设置
      const currentSetting = await db
        .select()
        .from(settings)
        .where(eq(settings.key, `prompt_template_${category}`))
        .limit(1);

      if (currentSetting.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            template: currentSetting[0].value,
            isCustom: true
          }
        });
      } else {
        // 返回默认模板
        const defaultTemplate = category === 'question' 
          ? '基于以下内容，请生成一个相关的问题：\n\n{content}'
          : '请为以下问题提供详细的答案：\n\n{content}';
        
        return NextResponse.json({
          success: true,
          data: {
            template: defaultTemplate,
            isCustom: false
          }
        });
      }
    } else {
      // 获取模板列表
      const templates = await db
        .select()
        .from(promptTemplates)
        .where(eq(promptTemplates.category, category))
        .orderBy(desc(promptTemplates.isDefault), desc(promptTemplates.updatedAt));

      return NextResponse.json({
        success: true,
        data: templates
      });
    }
  } catch (error) {
    console.error('获取提示词模板失败:', error);
    return NextResponse.json({
      success: false,
      error: '获取提示词模板失败'
    }, { status: 500 });
  }
}

// 保存提示词设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { template, category = 'question', saveAsTemplate = false, templateName, templateDescription } = body;

    if (!template || !template.trim()) {
      return NextResponse.json({
        success: false,
        error: '提示词模板不能为空'
      }, { status: 400 });
    }

    // 保存当前设置
    const settingKey = `prompt_template_${category}`;
    
    // 检查是否已存在该设置
    const existingSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, settingKey))
      .limit(1);

    if (existingSetting.length > 0) {
      // 更新现有设置
      await db
        .update(settings)
        .set({
          value: template.trim(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(settings.key, settingKey));
    } else {
      // 创建新设置
      await db.insert(settings).values({
        key: settingKey,
        value: template.trim(),
        description: `${category === 'question' ? '问题' : '答案'}生成提示词模板`,
        updatedAt: new Date().toISOString()
      });
    }

    // 如果需要保存为模板
    if (saveAsTemplate && templateName) {
      await db.insert(promptTemplates).values({
        name: templateName,
        description: templateDescription || '',
        template: template.trim(),
        category,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: '提示词设置保存成功'
    });
  } catch (error) {
    console.error('保存提示词设置失败:', error);
    return NextResponse.json({
      success: false,
      error: '保存提示词设置失败'
    }, { status: 500 });
  }
}

// 删除提示词模板
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少模板ID'
      }, { status: 400 });
    }

    await db
      .delete(promptTemplates)
      .where(eq(promptTemplates.id, parseInt(id)));

    return NextResponse.json({
      success: true,
      message: '模板删除成功'
    });
  } catch (error) {
    console.error('删除提示词模板失败:', error);
    return NextResponse.json({
      success: false,
      error: '删除提示词模板失败'
    }, { status: 500 });
  }
}