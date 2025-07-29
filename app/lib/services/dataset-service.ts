import { db } from '../db';
import { datasets, type Dataset, type NewDataset } from '../db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export class DatasetService {
  // 获取项目的所有数据集
  static async getDatasetsByProject(projectId: number): Promise<Dataset[]> {
    try {
      return await db.select().from(datasets)
        .where(eq(datasets.projectId, projectId))
        .orderBy(datasets.createdAt);
    } catch (error) {
      console.error('获取数据集列表失败:', error);
      throw new Error('获取数据集列表失败');
    }
  }

  // 根据ID获取数据集
  static async getDatasetById(id: number): Promise<Dataset | null> {
    try {
      const result = await db.select().from(datasets).where(eq(datasets.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('获取数据集详情失败:', error);
      throw new Error('获取数据集详情失败');
    }
  }

  // 创建新数据集
  static async createDataset(datasetData: NewDataset): Promise<Dataset> {
    try {
      const result = await db.insert(datasets).values({
        ...datasetData,
        createdAt: new Date().toISOString(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('创建数据集失败:', error);
      throw new Error('创建数据集失败');
    }
  }

  // 更新数据集
  static async updateDataset(id: number, datasetData: Partial<NewDataset>): Promise<Dataset> {
    try {
      const result = await db.update(datasets)
        .set(datasetData)
        .where(eq(datasets.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('数据集不存在');
      }
      
      return result[0];
    } catch (error) {
      console.error('更新数据集失败:', error);
      throw new Error('更新数据集失败');
    }
  }

  // 删除数据集
  static async deleteDataset(id: number): Promise<void> {
    try {
      // 先获取数据集信息以删除文件
      const dataset = await this.getDatasetById(id);
      if (dataset) {
        // 删除文件
        try {
          if (fs.existsSync(dataset.filePath)) {
            fs.unlinkSync(dataset.filePath);
          }
        } catch (fileError) {
          console.warn('删除文件失败:', fileError);
        }
      }

      const result = await db.delete(datasets).where(eq(datasets.id, id));
      if (result.changes === 0) {
        throw new Error('数据集不存在');
      }
    } catch (error) {
      console.error('删除数据集失败:', error);
      throw new Error('删除数据集失败');
    }
  }

  // 保存上传的文件
  static async saveUploadedFile(
    file: File,
    projectId: number
  ): Promise<{ filePath: string; content: string }> {
    try {
      // 确保上传目录存在
      const uploadDir = path.join(process.cwd(), 'uploads', projectId.toString());
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = path.join(uploadDir, fileName);

      // 读取文件内容
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 保存文件
      fs.writeFileSync(filePath, buffer);

      // 读取文本内容
      let content = '';
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch (readError) {
        console.warn('读取文件内容失败:', readError);
        content = '无法读取文件内容';
      }

      return { filePath, content };
    } catch (error) {
      console.error('保存文件失败:', error);
      throw new Error('保存文件失败');
    }
  }

  // 读取数据集内容
  static async getDatasetContent(id: number): Promise<string> {
    try {
      const dataset = await this.getDatasetById(id);
      if (!dataset) {
        throw new Error('数据集不存在');
      }

      if (dataset.content) {
        return dataset.content;
      }

      // 如果数据库中没有内容，尝试从文件读取
      if (fs.existsSync(dataset.filePath)) {
        const content = fs.readFileSync(dataset.filePath, 'utf-8');
        // 更新数据库中的内容
        await this.updateDataset(id, { content });
        return content;
      }

      return '文件不存在或无法读取';
    } catch (error) {
      console.error('读取数据集内容失败:', error);
      throw new Error('读取数据集内容失败');
    }
  }

  // 分页获取数据集内容片段
  static async getDatasetContentSegments(
    id: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ segments: Array<{id: number, datasetId: number, content: string, startIndex: number, endIndex: number, createdAt: string}>; total: number; hasMore: boolean }> {
    try {
      const dataset = await this.getDatasetById(id);
      if (!dataset) {
        throw new Error('数据集不存在');
      }

      const content = await this.getDatasetContent(id);
      const delimiter = dataset.segmentDelimiter || '\n\n';
      
      // 根据分段标识符分割内容
      const segments = content.split(delimiter).filter(segment => segment.trim() !== '');
      
      // 创建分段对象数组
      const segmentObjects = segments.map((segment, index) => {
        const startIndex = index * 100; // 简化的索引计算
        const endIndex = startIndex + segment.length;
        
        return {
          id: index + 1,
          datasetId: id,
          content: segment.trim(),
          startIndex,
          endIndex,
          createdAt: new Date().toISOString()
        };
      });

      const total = segmentObjects.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSegments = segmentObjects.slice(startIndex, endIndex);
      const hasMore = endIndex < total;

      return {
        segments: paginatedSegments,
        total,
        hasMore
      };
    } catch (error) {
      console.error('获取数据集片段失败:', error);
      throw new Error('获取数据集片段失败');
    }
  }
}