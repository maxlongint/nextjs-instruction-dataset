import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '../../lib/services/settings-service';

// GET - 获取设置列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const type = searchParams.get('type');

    if (key) {
      // 获取特定设置
      const setting = await SettingsService.getSettingByKey(key);
      return NextResponse.json({
        success: true,
        data: setting,
      });
    } else if (type === 'ai') {
      // 获取AI配置
      const config = await SettingsService.getAIConfig();
      return NextResponse.json({
        success: true,
        data: config,
      });
    } else if (type === 'app') {
      // 获取应用配置
      const config = await SettingsService.getAppConfig();
      return NextResponse.json({
        success: true,
        data: config,
      });
    } else {
      // 获取所有设置
      const settings = await SettingsService.getAllSettings();
      return NextResponse.json({
        success: true,
        data: settings,
      });
    }
  } catch (error) {
    console.error('获取设置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取设置失败',
      },
      { status: 500 }
    );
  }
}

// POST - 创建或更新设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, config, key, value, description } = body;

    if (type === 'ai') {
      // 保存AI配置
      await SettingsService.saveAIConfig(config);
      return NextResponse.json({
        success: true,
        message: 'AI配置保存成功',
      });
    } else if (type === 'app') {
      // 保存应用配置
      await SettingsService.saveAppConfig(config);
      return NextResponse.json({
        success: true,
        message: '应用配置保存成功',
      });
    } else if (key && value !== undefined) {
      // 保存单个设置
      const setting = await SettingsService.upsertSetting(key, value, description);
      return NextResponse.json({
        success: true,
        data: setting,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '保存设置失败',
      },
      { status: 500 }
    );
  }
}

// DELETE - 重置设置
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const key = searchParams.get('key');

    if (action === 'reset') {
      // 重置所有设置
      await SettingsService.resetAllSettings();
      return NextResponse.json({
        success: true,
        message: '设置重置成功',
      });
    } else if (key) {
      // 删除特定设置
      await SettingsService.deleteSetting(key);
      return NextResponse.json({
        success: true,
        message: '设置删除成功',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必要参数',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('删除设置失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除设置失败',
      },
      { status: 500 }
    );
  }
}