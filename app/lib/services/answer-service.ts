import { db } from '../db';
import { answers, type Answer, type NewAnswer } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export class AnswerService {
  // 获取所有答案
  static async getAllAnswers(): Promise<Answer[]> {
    try {
      return await db.select().from(answers)
        .orderBy(answers.createdAt);
    } catch (error) {
      console.error('获取答案列表失败:', error);
      throw new Error('获取答案列表失败');
    }
  }

  // 获取问题的答案
  static async getAnswerByQuestion(questionId: number): Promise<Answer | null> {
    try {
      const result = await db.select().from(answers).where(eq(answers.questionId, questionId));
      return result[0] || null;
    } catch (error) {
      console.error('获取答案失败:', error);
      throw new Error('获取答案失败');
    }
  }

  // 根据ID获取答案
  static async getAnswerById(id: number): Promise<Answer | null> {
    try {
      const result = await db.select().from(answers).where(eq(answers.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('获取答案详情失败:', error);
      throw new Error('获取答案详情失败');
    }
  }

  // 创建新答案
  static async createAnswer(answerData: NewAnswer): Promise<Answer> {
    try {
      const result = await db.insert(answers).values(answerData).returning();
      return result[0];
    } catch (error) {
      console.error('创建答案失败:', error);
      throw new Error('创建答案失败');
    }
  }

  // 批量创建答案
  static async createAnswers(answersData: NewAnswer[]): Promise<Answer[]> {
    try {
      const result = await db.insert(answers).values(answersData).returning();
      return result;
    } catch (error) {
      console.error('批量创建答案失败:', error);
      throw new Error('批量创建答案失败');
    }
  }

  // 更新答案
  static async updateAnswer(id: number, answerData: Partial<NewAnswer>): Promise<Answer> {
    try {
      const result = await db.update(answers)
        .set(answerData)
        .where(eq(answers.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error('答案不存在');
      }
      
      return result[0];
    } catch (error) {
      console.error('更新答案失败:', error);
      throw new Error('更新答案失败');
    }
  }

  // 删除答案
  static async deleteAnswer(id: number): Promise<void> {
    try {
      const result = await db.delete(answers).where(eq(answers.id, id));
      if (result.changes === 0) {
        throw new Error('答案不存在');
      }
    } catch (error) {
      console.error('删除答案失败:', error);
      throw new Error('删除答案失败');
    }
  }

  // 批量删除答案
  static async deleteAnswers(ids: number[]): Promise<void> {
    try {
      for (const id of ids) {
        await db.delete(answers).where(eq(answers.id, id));
      }
    } catch (error) {
      console.error('批量删除答案失败:', error);
      throw new Error('批量删除答案失败');
    }
  }

  // 获取答案统计信息
  static async getAnswerStats() {
    try {
      const allAnswers = await db.select().from(answers);
      
      const stats = {
        total: allAnswers.length,
      };

      return stats;
    } catch (error) {
      console.error('获取答案统计失败:', error);
      throw new Error('获取答案统计失败');
    }
  }

  // 获取问答对数据（用于导出）
  static async getQuestionAnswerPairs() {
    try {
      const allAnswers = await this.getAllAnswers();
      
      return allAnswers.map(answer => ({
        questionId: answer.questionId,
        answer: answer.generatedAnswer,
        prompt: answer.prompt,
        createdAt: answer.createdAt,
      }));
    } catch (error) {
      console.error('获取问答对失败:', error);
      throw new Error('获取问答对失败');
    }
  }
}