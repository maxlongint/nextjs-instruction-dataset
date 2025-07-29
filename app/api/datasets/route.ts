import { NextRequest, NextResponse } from 'next/server';
import { DatasetService } from '../../lib/services/dataset-service';

// GET - 获取指定项目的数据集列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: '项目ID不能为空',
        },
        { status: 400 }
      );
    }

    const datasets = await DatasetService.getDatasetsByProject(parseInt(projectId));

    return NextResponse.json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    console.error('获取数据集列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: '获取数据集列表失败',
      },
      { status: 500 }
    );
  }
}

// POST - 上传数据集文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const segmentDelimiter = formData.get('segmentDelimiter') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '请选择要上传的文件',
        },
        { status: 400 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: '项目ID不能为空',
        },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = ['text/plain', 'text/markdown', 'application/json'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|md|json)$/i)) {
      return NextResponse.json(
        {
          success: false,
          error: '只支持 .txt、.md、.json 格式的文件',
        },
        { status: 400 }
      );
    }

    // 检查文件大小 (限制为10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: '文件大小不能超过10MB',
        },
        { status: 400 }
      );
    }

    // 保存文件并创建数据集记录
    const { filePath, content } = await DatasetService.saveUploadedFile(
      file,
      parseInt(projectId)
    );

    const dataset = await DatasetService.createDataset({
      projectId: parseInt(projectId),
      name: name || file.name,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      content,
      segmentDelimiter: segmentDelimiter || '\n\n', // 默认使用双换行符
    });

    return NextResponse.json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    console.error('上传数据集失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '上传数据集失败',
      },
      { status: 500 }
    );
  }
}