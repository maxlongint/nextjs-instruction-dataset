import { db } from '../db';
import { questions, type Question, type NewQuestion } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class QuestionService {
  // 获取项目的所有问题
  static async getQuestionsByProject(projectId: number): Promise<Question[]> {
    try {
      return await db.select().from(questions)
        .where(eq(questions.projectId, projectId))
        .orderBy(questions.createdAt);
    } catch (error) {
      console.error('获取问题列表失败:', error);
      throw new Error('获取问题列表失败');
    }
  }

  // 获取数据集的所有问题
  static async getQuestionsByDataset(datasetId: number): Promise<Question[]> {
    try {
      return await db.select().from(questions)
        .where(eq(questions.datasetId, datasetId))
        .orderBy(questions.createdAt);
    } catch (error) {
      console.error('获取问题列表失败:', error);
      throw new Error('获取问题列表失败');
    }
  }

  // 根据ID获取问题
  static async getQuestionById(id: number): Promise<Question | null> {
    try {
      const result = await db.select().from(questions).where(eq(questions.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('获取问题详情失败:', error);
      throw new Error('获取问题详情失败');
    }
  }

  // 创建新问题
  static async createQuestion(questionData: NewQuestion): Promise<Question> {
    try {
      const result = await db.insert(questions).values({
        ...questionData,
        createdAt: new Date().toISOString(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('创建问题失败:', error);
      throw new Error('创建问题失败');
    }
  }

  // 批量创建问题
  static async createQuestions(questionsData: NewQuestion[]): Promise<Question[]> {
    try {
      const questionsWithTimestamp = questionsData.map(q => ({
        ...q,
        createdAt: new Date().toISOString(),
      }));
      
      const result = await db.insert(questions).values(questionsWithTimestamp).returning();
      return result;
    } catch (error) {
      console.error('批量创建问题失败:', error);
      throw new Error('批量创建问题失败');
    }
  }

  // 更新问题
  static async updateQuestion(id: number, questionData: Partial<NewQuestion>): Promise<Question> {
    try {
      const result = await db.update(questions)
        .set(questionData)
        .where(eq(questions.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('问题不存在');
      }
      
      return result[0];
    } catch (error) {
      console.error('更新问题失败:', error);
      throw new Error('更新问题失败');
    }
  }

  // 删除问题
  static async deleteQuestion(id: number): Promise<void> {
    try {
      const result = await db.delete(questions).where(eq(questions.id, id));
      if (result.changes === 0) {
        throw new Error('问题不存在');
      }
    } catch (error) {
      console.error('删除问题失败:', error);
      throw new Error('删除问题失败');
    }
  }

  // 批量删除问题
  static async deleteQuestions(ids: number[]): Promise<void> {
    try {
      for (const id of ids) {
        await db.delete(questions).where(eq(questions.id, id));
      }
    } catch (error) {
      console.error('批量删除问题失败:', error);
      throw new Error('批量删除问题失败');
    }
  }

  // 获取问题统计信息
  static async getQuestionStats(projectId?: number, datasetId?: number) {
    try {
      let allQuestions: Question[];
      
      if (projectId && datasetId) {
        allQuestions = await db.select().from(questions).where(and(
          eq(questions.projectId, projectId),
          eq(questions.datasetId, datasetId)
        ));
      } else if (projectId) {
        allQuestions = await db.select().from(questions).where(eq(questions.projectId, projectId));
      } else if (datasetId) {
        allQuestions = await db.select().from(questions).where(eq(questions.datasetId, datasetId));
      } else {
        allQuestions = await db.select().from(questions);
      }
      
      const stats = {
        total: allQuestions.length,
        generated: allQuestions.filter(q => q.status === 'generated').length,
        answered: allQuestions.filter(q => q.status === 'answered').length,
        exported: allQuestions.filter(q => q.status === 'exported').length,
      };

      return stats;
    } catch (error) {
      console.error('获取问题统计失败:', error);
      throw new Error('获取问题统计失败');
    }
  }

  // 更新问题状态
  static async updateQuestionStatus(id: number, status: string): Promise<Question> {
    try {
      const result = await db.update(questions)
        .set({ status })
        .where(eq(questions.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('问题不存在');
      }
      
      return result[0];
    } catch (error) {
      console.error('更新问题状态失败:', error);
      throw new Error('更新问题状态失败');
    }
  }

  // 批量更新问题状态
  static async updateQuestionsStatus(ids: number[], status: string): Promise<void> {
    try {
      for (const id of ids) {
        await db.update(questions)
          .set({ status })
          .where(eq(questions.id, id));
      }
    } catch (error) {
      console.error('批量更新问题状态失败:', error);
      throw new Error('批量更新问题状态失败');
    }
  }
}