import { db } from '../db';
import { projects, datasets, type Project, type NewProject, type Dataset } from '../db/schema';
import { eq } from 'drizzle-orm';

export class ProjectService {
  // 获取所有项目
  static async getAllProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects).orderBy(projects.createdAt);
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw new Error('获取项目列表失败');
    }
  }

  // 根据ID获取项目
  static async getProjectById(id: number): Promise<Project | null> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('获取项目详情失败:', error);
      throw new Error('获取项目详情失败');
    }
  }

  // 创建新项目
  static async createProject(projectData: NewProject): Promise<Project> {
    try {
      const result = await db.insert(projects).values({
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('创建项目失败:', error);
      throw new Error('创建项目失败');
    }
  }

  // 更新项目
  static async updateProject(id: number, projectData: Partial<NewProject>): Promise<Project> {
    try {
      const result = await db.update(projects)
        .set({
          ...projectData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projects.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('项目不存在');
      }
      
      return result[0];
    } catch (error) {
      console.error('更新项目失败:', error);
      throw new Error('更新项目失败');
    }
  }

  // 删除项目
  static async deleteProject(id: number): Promise<void> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, id));
      if (result.changes === 0) {
        throw new Error('项目不存在');
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      throw new Error('删除项目失败');
    }
  }

  // 获取项目的数据集数量
  static async getProjectDatasetCount(projectId: number): Promise<number> {
    try {
      const result = await db.select().from(datasets).where(eq(datasets.projectId, projectId));
      return result.length;
    } catch (error) {
      console.error('获取数据集数量失败:', error);
      return 0;
    }
  }

  // 获取项目统计信息
  static async getProjectStats(projectId: number) {
    try {
      const datasetCount = await this.getProjectDatasetCount(projectId);
      // 这里可以添加更多统计信息，如问题数量、答案数量等
      return {
        datasetCount,
        questionCount: 0, // 暂时设为0，后续实现
        answerCount: 0,   // 暂时设为0，后续实现
      };
    } catch (error) {
      console.error('获取项目统计失败:', error);
      throw new Error('获取项目统计失败');
    }
  }
}