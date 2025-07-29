import { SettingsService } from './settings-service';

export interface AIGenerateRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIGenerateResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  // 生成问题
  static async generateQuestions(
    datasetContent: string,
    prompt: string,
    count: number = 5
  ): Promise<string[]> {
    try {
      const config = await SettingsService.getAIConfig();
      
      if (!config.apiUrl || !config.apiKey) {
        throw new Error('AI配置不完整，请先在系统设置中配置API地址和密钥');
      }

      const fullPrompt = `${prompt}\n\n数据集内容：\n${datasetContent}\n\n请生成${count}个相关问题，每个问题占一行。`;

      const response = await this.callAI({
        prompt: fullPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      // 解析生成的问题
      const questions = response.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, count);

      return questions;
    } catch (error) {
      console.error('生成问题失败:', error);
      throw error;
    }
  }

  // 生成答案
  static async generateAnswer(
    question: string,
    prompt: string,
    context?: string
  ): Promise<string> {
    try {
      const config = await SettingsService.getAIConfig();
      
      if (!config.apiUrl || !config.apiKey) {
        throw new Error('AI配置不完整，请先在系统设置中配置API地址和密钥');
      }

      let fullPrompt = `${prompt}\n\n问题：${question}`;
      
      if (context) {
        fullPrompt += `\n\n相关上下文：\n${context}`;
      }

      fullPrompt += '\n\n请提供详细的答案：';

      const response = await this.callAI({
        prompt: fullPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      return response.content.trim();
    } catch (error) {
      console.error('生成答案失败:', error);
      throw error;
    }
  }

  // 批量生成答案
  static async generateAnswers(
    questions: Array<{ id: number; content: string }>,
    prompt: string,
    context?: string
  ): Promise<Array<{ questionId: number; answer: string }>> {
    try {
      const results = [];
      
      for (const question of questions) {
        try {
          const answer = await this.generateAnswer(question.content, prompt, context);
          results.push({
            questionId: question.id,
            answer,
          });
          
          // 添加延迟以避免API限制
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`生成问题 ${question.id} 的答案失败:`, error);
          results.push({
            questionId: question.id,
            answer: `生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
          });
        }
      }

      return results;
    } catch (error) {
      console.error('批量生成答案失败:', error);
      throw error;
    }
  }

  // 调用AI API
  private static async callAI(request: AIGenerateRequest): Promise<AIGenerateResponse> {
    try {
      const config = await SettingsService.getAIConfig();
      
      // 检查是否为OpenAI API
      const isOpenAI = config.apiUrl.includes('openai.com') || config.modelName.startsWith('gpt');
      
      if (isOpenAI) {
        return await this.callOpenAI(request, config);
      } else {
        // 其他AI服务的通用调用方式
        return await this.callGenericAI(request, config);
      }
    } catch (error) {
      console.error('AI API调用失败:', error);
      throw error;
    }
  }

  // 调用OpenAI API
  private static async callOpenAI(
    request: AIGenerateRequest,
    config: any
  ): Promise<AIGenerateResponse> {
    try {
      const response = await fetch(`${config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: request.maxTokens || config.maxTokens,
          temperature: request.temperature || config.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('OpenAI API返回数据格式错误');
      }

      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenAI API调用失败:', error);
      throw error;
    }
  }

  // 调用通用AI API
  private static async callGenericAI(
    request: AIGenerateRequest,
    config: any
  ): Promise<AIGenerateResponse> {
    try {
      // 这里可以根据不同的AI服务提供商实现不同的调用方式
      // 目前提供一个通用的实现
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.modelName,
          prompt: request.prompt,
          max_tokens: request.maxTokens || config.maxTokens,
          temperature: request.temperature || config.temperature,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`AI API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // 根据不同的API响应格式进行适配
      let content = '';
      if (data.choices && data.choices[0]) {
        content = data.choices[0].text || data.choices[0].message?.content || '';
      } else if (data.content) {
        content = data.content;
      } else if (data.response) {
        content = data.response;
      } else {
        throw new Error('AI API返回数据格式不支持');
      }

      return {
        content: content.trim(),
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
      };
    } catch (error) {
      console.error('通用AI API调用失败:', error);
      throw error;
    }
  }

  // 测试AI连接
  static async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const config = await SettingsService.getAIConfig();
      
      if (!config.apiUrl || !config.apiKey) {
        return {
          success: false,
          message: 'AI配置不完整，请先配置API地址和密钥',
        };
      }

      const startTime = Date.now();
      
      const response = await this.callAI({
        prompt: '请回复"连接测试成功"',
        maxTokens: 50,
        temperature: 0.1,
      });

      const latency = Date.now() - startTime;

      return {
        success: true,
        message: `连接测试成功！响应时间: ${latency}ms`,
        latency,
      };
    } catch (error) {
      console.error('AI连接测试失败:', error);
      return {
        success: false,
        message: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      };
    }
  }

  // 获取支持的模型列表
  static getSupportedModels(): Array<{ value: string; label: string; provider: string }> {
    return [
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
      { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
      { value: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
      { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', provider: 'Anthropic' },
      { value: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'Anthropic' },
      { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
      { value: 'llama-2-70b', label: 'Llama 2 70B', provider: 'Meta' },
      { value: 'mixtral-8x7b', label: 'Mixtral 8x7B', provider: 'Mistral' },
    ];
  }

  // 验证提示词模板
  static validatePromptTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template || template.trim().length === 0) {
      errors.push('提示词模板不能为空');
    }

    if (template.length > 4000) {
      errors.push('提示词模板过长，建议控制在4000字符以内');
    }

    // 检查是否包含基本的指令
    const hasInstruction = /请|生成|创建|回答|分析/.test(template);
    if (!hasInstruction) {
      errors.push('提示词模板应包含明确的指令词（如：请、生成、创建、回答、分析等）');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // 获取默认提示词模板
  static getDefaultPrompts(): { questions: string; answers: string } {
    return {
      questions: `你是一个专业的问题生成助手。请根据提供的数据集内容，生成相关的高质量问题。

要求：
1. 问题应该具有教育价值和实用性
2. 问题难度适中，既不过于简单也不过于复杂
3. 问题应该能够帮助理解和掌握相关知识
4. 每个问题都应该是完整的、清晰的
5. 问题之间应该有一定的多样性

请严格按照要求生成问题，每个问题占一行。`,

      answers: `你是一个专业的答案生成助手。请根据提供的问题，生成准确、详细、有用的答案。

要求：
1. 答案应该准确、完整、有逻辑性
2. 答案应该易于理解，适合学习和参考
3. 如果有相关上下文，请充分利用
4. 答案应该具有实用价值
5. 保持专业性和客观性

请根据问题生成高质量的答案。`,
    };
  }
}