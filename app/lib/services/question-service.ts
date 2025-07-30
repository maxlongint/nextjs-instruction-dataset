import { db } from '../db';
import { questions, type Question, type NewQuestion } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';

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
        .orderBy(desc(questions.createdAt));
    } catch (error) {
      console.error('获取问题列表失败:', error);
      throw new Error('获取问题列表失败');
    }
  }

  // 获取问题列表（支持分页和数据集筛选）
  static async getQuestionsWithPagination(params: {
    projectId: number;
    datasetId?: number;
    page: number;
    limit: number;
  }): Promise<{
    questions: Question[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const { projectId, datasetId, page, limit } = params;
      const offset = (page - 1) * limit;

      // 构建查询条件
      const whereCondition = datasetId 
        ? and(eq(questions.projectId, projectId), eq(questions.datasetId, datasetId))
        : eq(questions.projectId, projectId);

      // 获取总数
      const totalResult = await db.select({ count: count() }).from(questions)
        .where(whereCondition);
      const total = totalResult[0].count;

      // 获取分页数据
      const questionsList = await db.select().from(questions)
        .where(whereCondition)
        .orderBy(desc(questions.createdAt))
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(total / limit);

      return {
        questions: questionsList,
        total,
        page,
        limit,
        totalPages
      };
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
      console.log('准备插入问题数据:', questionData);
      const result = await db.insert(questions).values(questionData).returning();
      console.log('插入结果:', result);
      return result[0];
    } catch (error) {
      console.error('创建问题失败:', error);
      console.error('问题数据:', questionData);
      throw new Error('创建问题失败');
    }
  }

  // 批量创建问题
  static async createQuestions(questionsData: NewQuestion[]): Promise<Question[]> {
    try {
      const result = await db.insert(questions).values(questionsData).returning();
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
      await db.delete(questions).where(eq(questions.id, ids));
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
      await db.update(questions)
        .set({ status })
        .where(eq(questions.id, ids));
    } catch (error) {
      console.error('批量更新问题状态失败:', error);
      throw new Error('批量更新问题状态失败');
    }
  }
}