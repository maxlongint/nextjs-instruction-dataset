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
      // 直接使用SettingsService获取AI配置，避免在服务器端使用fetch
      const config = await SettingsService.getAIConfig();
      
      // 检查AI配置是否完整
      // 本地模型（如ollama）不需要apiKey，只需要platform和apiUrl
      const isLocalModel = config.apiUrl && (
        config.apiUrl.includes('localhost') || 
        config.apiUrl.includes('127.0.0.1') ||
        config.apiUrl.includes('0.0.0.0') ||
        config.platform === 'local' ||
        config.platform === 'ollama'
      );
      
      const hasValidConfig = config.platform && config.apiUrl && (isLocalModel || config.apiKey);
      
      if (!hasValidConfig) {
        console.log('AI配置不完整，使用模拟生成器进行演示');
        return this.generateMockQuestions(datasetContent, prompt, count);
      }

      const fullPrompt = `${prompt}\n\n数据集内容：\n${datasetContent}\n\n请生成${count}个相关问题，每个问题占一行。`;

      const aiResponse = await this.callAI({
        prompt: fullPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      // 解析生成的问题
      const questions = aiResponse.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, count);

      return questions;
    } catch (error) {
      console.error('生成问题失败:', error);
      // 如果AI调用失败，回退到模拟生成器
      console.log('AI调用失败，使用模拟生成器作为备选方案');
      return this.generateMockQuestions(datasetContent, prompt, count);
    }
  }

  // 模拟问题生成器（用于演示和测试）
  private static generateMockQuestions(
    datasetContent: string,
    prompt: string,
    count: number = 5
  ): string[] {
    const contentLength = datasetContent.length;
    const contentPreview = datasetContent.substring(0, 100);
    
    const mockQuestions = [
      `基于提供的内容，主要讨论了什么主题？`,
      `从这段内容中可以提取出哪些关键信息？`,
      `这段内容的核心观点是什么？`,
      `如何理解这段内容中的重要概念？`,
      `这段内容与哪些相关领域有关联？`,
      `从这段内容中可以学到什么？`,
      `这段内容的实际应用价值是什么？`,
      `如何将这段内容的知识运用到实践中？`,
      `这段内容存在哪些值得深入思考的问题？`,
      `基于这段内容，可以提出哪些进一步的研究方向？`
    ];

    // 根据内容长度和类型调整问题
    const selectedQuestions = mockQuestions.slice(0, count).map((question, index) => {
      if (contentLength < 50) {
        return `针对这个简短的内容片段：${question}`;
      } else if (contentLength > 500) {
        return `针对这段详细的内容：${question}`;
      }
      return question;
    });

    // 添加延迟模拟真实AI调用
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(selectedQuestions);
      }, 1000 + Math.random() * 2000); // 1-3秒随机延迟
    }) as any;
  }

  // 生成答案
  static async generateAnswer(
    question: string,
    prompt: string,
    context?: string
  ): Promise<string> {
    try {
      // 直接使用SettingsService获取AI配置，避免在服务器端使用fetch
      const config = await SettingsService.getAIConfig();
      
      // 检查AI配置是否完整
      const isLocalModel = config.apiUrl && (
        config.apiUrl.includes('localhost') || 
        config.apiUrl.includes('127.0.0.1') ||
        config.apiUrl.includes('0.0.0.0') ||
        config.platform === 'local' ||
        config.platform === 'ollama'
      );
      
      const hasValidConfig = config.platform && config.apiUrl && (isLocalModel || config.apiKey);
      
      if (!hasValidConfig) {
        throw new Error('AI配置不完整，请先在系统设置中配置API地址和密钥');
      }

      let fullPrompt = `${prompt}\n\n问题：${question}`;
      
      if (context) {
        fullPrompt += `\n\n相关上下文：\n${context}`;
      }

      fullPrompt += '\n\n请提供详细的答案：';

      const aiResponse = await this.callAI({
        prompt: fullPrompt,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      });

      return aiResponse.content.trim();
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
      const isOpenAI = config.apiUrl.includes('openai.com') || (config.model && config.model.startsWith('gpt'));
      
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
      const openaiResponse = await fetch(`${config.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
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

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        throw new Error(`OpenAI API错误: ${openaiResponse.status} - ${errorData.error?.message || openaiResponse.statusText}`);
      }

      const data = await openaiResponse.json();
      
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
      // 检查是否为ollama
      const isOllama = config.platform === 'ollama' || config.apiUrl.includes('11434');
      
      if (isOllama) {
        // Ollama API调用
        const ollamaResponse = await fetch(`${config.apiUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            prompt: request.prompt,
            stream: false,
            options: {
              temperature: request.temperature || config.temperature,
              num_predict: request.maxTokens || config.maxTokens,
            }
          }),
        });

        if (!ollamaResponse.ok) {
          const errorData = await ollamaResponse.json().catch(() => ({}));
          throw new Error(`Ollama API错误: ${ollamaResponse.status} - ${errorData.error || ollamaResponse.statusText}`);
        }

        const data = await ollamaResponse.json();
        
        return {
          content: data.response || '',
          usage: {
            promptTokens: data.prompt_eval_count || 0,
            completionTokens: data.eval_count || 0,
            totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
          },
        };
      } else {
        // 其他AI服务的通用调用方式
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (config.apiKey) {
          headers['Authorization'] = `Bearer ${config.apiKey}`;
        }
        
        const genericResponse = await fetch(config.apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.model,
            prompt: request.prompt,
            max_tokens: request.maxTokens || config.maxTokens,
            temperature: request.temperature || config.temperature,
          }),
        });

        if (!genericResponse.ok) {
          const errorData = await genericResponse.json().catch(() => ({}));
          throw new Error(`AI API错误: ${genericResponse.status} - ${errorData.error?.message || genericResponse.statusText}`);
        }

        const data = await genericResponse.json();
        
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
      }
    } catch (error) {
      console.error('通用AI API调用失败:', error);
      throw error;
    }
  }

  // 测试AI连接
  static async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    try {
      const config = await SettingsService.getAIConfig();
      
      // 检查AI配置是否完整
      const isLocalModel = config.apiUrl && (
        config.apiUrl.includes('localhost') || 
        config.apiUrl.includes('127.0.0.1') ||
        config.apiUrl.includes('0.0.0.0') ||
        config.platform === 'local' ||
        config.platform === 'ollama'
      );
      
      const hasValidConfig = config.platform && config.apiUrl && (isLocalModel || config.apiKey);
      
      if (!hasValidConfig) {
        return {
          success: false,
          message: 'AI配置不完整，请先配置API地址和密钥',
        };
      }

      const startTime = Date.now();
      
      const testResponse = await this.callAI({
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