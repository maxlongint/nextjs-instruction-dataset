import pLimit from 'p-limit';
import { AIService } from './ai-service';
import { SettingsService } from './settings-service';

export interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  percentage: number;
}

export interface GenerationResult {
  success: boolean;
  questionId?: number;
  question?: string;
  error?: string;
  segmentIndex: number;
  content: string;
}

export class ConcurrentAIService {
  private static progressCallback: ((progress: GenerationProgress) => void) | null = null;
  
  // 设置进度回调
  static setProgressCallback(callback: (progress: GenerationProgress) => void) {
    this.progressCallback = callback;
  }

  // 清除进度回调
  static clearProgressCallback() {
    this.progressCallback = null;
  }

  // 并发生成问题
  static async generateQuestionsWithConcurrency(
    segments: string[] | Array<{content: string, prompt: string}>,
    prompt: string,
    projectId: number,
    datasetId: number,
    model?: string,
    concurrencyLimit?: number
  ): Promise<{
    results: GenerationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      questions: Array<{
        id: number;
        content: string;
        generatedQuestion: string;
        segmentIndex: number;
      }>;
    };
  }> {
    // 获取并发数配置
    const finalConcurrencyLimit = concurrencyLimit || (await this.getConcurrencyLimit());
    const limit = pLimit(finalConcurrencyLimit);

    const results: GenerationResult[] = [];
    let completed = 0;
    let failed = 0;

    // 更新进度
    const updateProgress = (current: string = '') => {
      if (this.progressCallback) {
        this.progressCallback({
          total: segments.length,
          completed,
          failed,
          current,
          percentage: Math.round((completed + failed) / segments.length * 100)
        });
      }
    };

    // 初始化进度
    updateProgress('开始生成问题...');

    // 创建并发任务
    const tasks = segments.map((segment, index) =>
      limit(async () => {
        try {
          // 处理不同的数据格式
          const content = typeof segment === 'string' ? segment : segment.content;
          const segmentPrompt = typeof segment === 'string' ? prompt : segment.prompt;
          
          // 开始处理当前段落
          updateProgress(`正在处理第 ${index + 1} 个段落...`);
          
          // 生成问题 - 使用替换后的提示词
          const questions = await AIService.generateQuestions(content, segmentPrompt, 1);
          
          if (questions.length === 0) {
            throw new Error('未生成任何问题');
          }

          const question = questions[0];
          
          // 保存到数据库 - 使用替换后的提示词
          const savedQuestion = await this.saveQuestion({
            projectId,
            datasetId,
            content,
            prompt: segmentPrompt,
            generatedQuestion: question,
            model
          });

          completed++;
          const result: GenerationResult = {
            success: true,
            questionId: savedQuestion.id,
            question,
            segmentIndex: index,
            content
          };
          
          results.push(result);
          
          // 更新进度 - 显示具体完成的段落
          updateProgress(`✅ 第 ${index + 1} 个段落完成 (${completed}/${segments.length})`);
          
          return result;
        } catch (error) {
          failed++;
          const content = typeof segment === 'string' ? segment : segment.content;
          const result: GenerationResult = {
            success: false,
            error: error instanceof Error ? error.message : '生成失败',
            segmentIndex: index,
            content
          };
          
          results.push(result);
          
          // 更新进度 - 显示失败的段落
          updateProgress(`❌ 第 ${index + 1} 个段落失败 (成功:${completed}, 失败:${failed})`);
          
          return result;
        }
      })
    );

    // 等待所有任务完成
    await Promise.all(tasks);

    // 最终进度更新
    updateProgress('生成完成');

    // 整理成功的问题
    const successfulResults = results.filter(r => r.success);
    const questions = successfulResults.map(r => ({
      id: r.questionId!,
      content: r.content,
      generatedQuestion: r.question!,
      segmentIndex: r.segmentIndex
    }));

    return {
      results,
      summary: {
        total: segments.length,
        successful: completed,
        failed,
        questions
      }
    };
  }

  // 保存问题到数据库
  private static async saveQuestion(questionData: {
    projectId: number;
    datasetId: number;
    content: string;
    prompt: string;
    generatedQuestion: string;
    model?: string;
  }) {
    try {
      const { QuestionService } = await import('./question-service');
      
      const question = await QuestionService.createQuestion({
        projectId: questionData.projectId,
        datasetId: questionData.datasetId,
        prompt: questionData.prompt,
        content: questionData.content,
        generatedQuestion: questionData.generatedQuestion,
        status: 'generated'
      });

      return question;
    } catch (error) {
      console.error('保存问题失败:', error);
      throw new Error('保存问题失败');
    }
  }

  // 获取并发数配置
  private static async getConcurrencyLimit(): Promise<number> {
    try {
      const aiConfig = await SettingsService.getAIConfig();
      return aiConfig.concurrency || 3;
    } catch (error) {
      console.error('获取并发数配置失败:', error);
      // 默认并发数
      return 3;
    }
  }

  // 批量生成问题（带重试机制）
  static async generateQuestionsWithRetry(
    segments: string[] | Array<{content: string, prompt: string}>,
    prompt: string,
    projectId: number,
    datasetId: number,
    model?: string,
    options: {
      concurrencyLimit?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<{
    results: GenerationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      retried: number;
      questions: Array<{
        id: number;
        content: string;
        generatedQuestion: string;
        segmentIndex: number;
      }>;
    };
  }> {
    const { concurrencyLimit, maxRetries = 2, retryDelay = 1000 } = options;
    
    // 第一次尝试
    let result = await this.generateQuestionsWithConcurrency(
      segments,
      prompt,
      projectId,
      datasetId,
      model,
      concurrencyLimit
    );

    // 收集失败的段落进行重试
    const failedResults = result.results.filter(r => !r.success);
    let retryCount = 0;
    let totalRetried = 0;

    while (failedResults.length > 0 && retryCount < maxRetries) {
      retryCount++;
      totalRetried += failedResults.length;
      
      if (this.progressCallback) {
        this.progressCallback({
          total: segments.length,
          completed: result.summary.successful,
          failed: failedResults.length,
          current: `第 ${retryCount} 次重试，重试 ${failedResults.length} 个失败项...`,
          percentage: Math.round(result.summary.successful / segments.length * 100)
        });
      }

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // 提取失败的段落内容
      const failedSegments = failedResults.map(r => r.content);
      
      // 重试生成
      const retryResult = await this.generateQuestionsWithConcurrency(
        failedSegments,
        prompt,
        projectId,
        datasetId,
        model,
        Math.min(concurrencyLimit || 3, 2) // 重试时降低并发数
      );

      // 更新结果
      retryResult.results.forEach((retryRes, index) => {
        const originalIndex = failedResults[index].segmentIndex;
        const resultIndex = result.results.findIndex(r => r.segmentIndex === originalIndex);
        if (resultIndex !== -1) {
          result.results[resultIndex] = {
            ...retryRes,
            segmentIndex: originalIndex
          };
        }
      });

      // 更新汇总
      result.summary.successful = result.results.filter(r => r.success).length;
      result.summary.failed = result.results.filter(r => !r.success).length;
      result.summary.questions = result.results
        .filter(r => r.success)
        .map(r => ({
          id: r.questionId!,
          content: r.content,
          generatedQuestion: r.question!,
          segmentIndex: r.segmentIndex
        }));

      // 更新失败列表
      failedResults.splice(0, failedResults.length, ...result.results.filter(r => !r.success));
    }

    return {
      ...result,
      summary: {
        ...result.summary,
        retried: totalRetried
      }
    };
  }


  // 验证生成配置
  static validateGenerationConfig(config: {
    segments: string[];
    prompt: string;
    projectId: number;
    datasetId: number;
    model?: string;
    concurrencyLimit?: number;
  }): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必填项检查
    if (!config.segments || config.segments.length === 0) {
      errors.push('请至少选择一个段落');
    }

    if (!config.prompt || config.prompt.trim().length === 0) {
      errors.push('请输入提示词');
    }

    if (!config.projectId) {
      errors.push('请选择项目');
    }

    if (!config.datasetId) {
      errors.push('请选择数据集');
    }

    // 警告检查
    if (config.segments && config.segments.length > 50) {
      warnings.push(`选择了 ${config.segments.length} 个段落，生成时间可能较长`);
    }

    if (config.concurrencyLimit && config.concurrencyLimit > 10) {
      warnings.push('并发数过高可能导致API限制，建议设置为10以下');
    }

    if (config.prompt && config.prompt.length > 2000) {
      warnings.push('提示词过长可能影响生成效果');
    }

    // 检查段落内容长度
    if (config.segments) {
      const longSegments = config.segments.filter(s => s.length > 4000);
      if (longSegments.length > 0) {
        warnings.push(`有 ${longSegments.length} 个段落内容过长，可能影响生成质量`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}