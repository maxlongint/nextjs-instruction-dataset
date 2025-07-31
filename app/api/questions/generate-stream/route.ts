import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

// 模拟生成器，用于演示模式
const mockGenerator = async (prompt: string, content: string) => {
  // 简单地从内容中提取一个问题
  const contentPreview = content.slice(0, 100).trim();
  const question = `关于"${contentPreview}..."的问题是什么？`;
  
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return question;
};

// 实际调用AI模型生成问题
const generateQuestionWithAI = async (
  prompt: string, 
  content: string, 
  model: string, 
  platform: string, 
  apiUrl: string, 
  apiKey: string
) => {
  try {
    // 根据不同平台调用不同的API
    if (platform === 'openai') {
      // OpenAI API调用
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: '你是一个专业的问题生成助手，根据提供的内容生成相关的问题。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const result = await response.json();
      return result.choices[0].message.content.trim();
    } else if (platform === 'azure') {
      // Azure OpenAI API调用
      const response = await fetch(`${apiUrl}/openai/deployments/${model}/chat/completions?api-version=2023-05-15`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: '你是一个专业的问题生成助手，根据提供的内容生成相关的问题。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const result = await response.json();
      return result.choices[0].message.content.trim();
    } else if (platform === 'ollama' || platform === 'local') {
      // Ollama或本地模型API调用
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          temperature: 0.7,
          max_tokens: 200
        })
      });

      const result = await response.json();
      return result.response.trim();
    } else {
      // 默认使用模拟生成器
      return await mockGenerator(prompt, content);
    }
  } catch (error) {
    console.error('AI生成问题失败:', error);
    throw new Error(`AI生成问题失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

// 并发控制函数
const concurrentProcess = async (
  items: any[], 
  processFunction: (item: any) => Promise<any>, 
  concurrencyLimit: number,
  onProgress: (result: any) => void
) => {
  const results: any[] = [];
  const inProgress = new Set();
  let index = 0;
  
  return new Promise<any[]>((resolve, reject) => {
    const startNext = async () => {
      if (index >= items.length && inProgress.size === 0) {
        resolve(results);
        return;
      }
      
      while (index < items.length && inProgress.size < concurrencyLimit) {
        const currentIndex = index++;
        const item = items[currentIndex];
        
        // 创建一个异步函数
        const processTask = async () => {
          try {
            const result = await processFunction(item);
            results[currentIndex] = result;
            onProgress(result);
          } catch (error) {
            results[currentIndex] = { error, item };
            onProgress({ error, item });
          } finally {
            inProgress.delete(processPromise);
            startNext();
          }
        };
        
        // 执行异步函数并保存Promise引用
        const processPromise = processTask();
        inProgress.add(processPromise);
      }
    };
    
    startNext();
  });
};

export async function POST(request: NextRequest) {
  // 创建一个可读流，用于发送SSE事件
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json();
        const { 
          projectId, 
          datasetId, 
          prompt, 
          segments, 
          model = 'mock', 
          concurrencyLimit = 3, 
          enableRetry = true, 
          maxRetries = 2,
          datasetName = '未命名数据集'
        } = body;

        if (!projectId || !datasetId || !prompt || !segments || segments.length === 0) {
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: '缺少必要参数'
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorEvent));
          controller.close();
          return;
        }

        // 获取AI配置
        let aiConfig = { platform: '', apiUrl: '', apiKey: '', model: '' };
        try {
          const settingsResponse = await fetch('http://localhost:3000/api/settings?type=ai', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          });
          const settingsResult = await settingsResponse.json();
          
          if (settingsResult.success && settingsResult.data) {
            aiConfig = settingsResult.data;
          }
        } catch (error) {
          console.error('获取AI配置失败:', error);
          // 继续使用模拟生成器
        }

        // 检查AI配置是否完整
        const isLocalModel = aiConfig.apiUrl && (
          aiConfig.apiUrl.includes('localhost') || 
          aiConfig.apiUrl.includes('127.0.0.1') ||
          aiConfig.apiUrl.includes('0.0.0.0') ||
          aiConfig.platform === 'local' ||
          aiConfig.platform === 'ollama'
        );
        
        const hasValidConfig = aiConfig.platform && aiConfig.apiUrl && (isLocalModel || aiConfig.apiKey);
        
        if (!hasValidConfig) {
          console.log('AI配置不完整，使用模拟生成器');
        }

        // 初始化进度
        const total = segments.length;
        let completed = 0;
        let failed = 0;
        let retried = 0;
        
        // 发送初始进度事件
        const initialProgressEvent = `data: ${JSON.stringify({
          type: 'progress',
          data: {
            total,
            completed,
            failed,
            current: '准备开始生成...',
            percentage: 0
          }
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialProgressEvent));

        // 处理单个分段的函数
        const processSegment = async (segment: any, retryCount = 0) => {
          try {
            const { content, prompt: segmentPrompt, segmentId, index } = segment;
            
            // 发送当前处理状态
            const progressEvent = `data: ${JSON.stringify({
              type: 'progress',
              data: {
                total,
                completed,
                failed,
                current: `正在处理第 ${index + 1}/${total} 个分段${retryCount > 0 ? ` (重试 ${retryCount}/${maxRetries})` : ''}...`,
                percentage: Math.round(((completed + failed) / total) * 100)
              }
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(progressEvent));
            
            // 生成问题
            let generatedQuestion;
            if (hasValidConfig && model !== 'mock') {
              try {
                generatedQuestion = await generateQuestionWithAI(
                  segmentPrompt,
                  content,
                  model,
                  aiConfig.platform,
                  aiConfig.apiUrl,
                  aiConfig.apiKey
                );
              } catch (error) {
                console.error('AI生成失败，使用模拟生成器:', error);
                generatedQuestion = await mockGenerator(segmentPrompt, content);
              }
            } else {
              generatedQuestion = await mockGenerator(segmentPrompt, content);
            }
            
            // 保存到数据库，确保包含数据集信息
            const [savedQuestion] = await db.insert(questions).values({
              uid: uuidv4(),
              projectId,
              datasetId,
              prompt: segmentPrompt,
              content,
              generatedQuestion,
              status: 'generated',
              wordCount: content.length
              // 数据集ID已经包含在datasetId字段中，确保在查询时可以按数据集筛选
            }).returning();
            
            completed++;
            
            return {
              success: true,
              questionId: savedQuestion.id,
              question: generatedQuestion,
              segmentIndex: index,
              content
            };
          } catch (error) {
            console.error('处理分段失败:', error);
            
            // 如果启用了重试且未达到最大重试次数
            if (enableRetry && retryCount < maxRetries) {
              retried++;
              console.log(`重试第 ${segment.index + 1} 个分段，重试次数: ${retryCount + 1}`);
              return processSegment(segment, retryCount + 1);
            }
            
            failed++;
            return {
              success: false,
              error: error instanceof Error ? error.message : '未知错误',
              segmentIndex: segment.index,
              content: segment.content
            };
          }
        };

        // 处理进度更新
        const handleProgress = (result: any) => {
          const progressEvent = `data: ${JSON.stringify({
            type: 'progress',
            data: {
              total,
              completed,
              failed,
              current: `已完成 ${completed}/${total} 个问题，失败 ${failed} 个`,
              percentage: Math.round(((completed + failed) / total) * 100)
            }
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(progressEvent));
        };

        // 并发处理所有分段
        const results = await concurrentProcess(
          segments,
          processSegment,
          concurrencyLimit,
          handleProgress
        );

        // 发送完成事件
        const completeEvent = `data: ${JSON.stringify({
          type: 'complete',
          data: {
            results,
            summary: {
              total,
              successful: completed,
              failed,
              retried,
              questions: results.filter(r => r.success).map(r => ({
                id: r.questionId,
                content: r.content,
                generatedQuestion: r.question,
                segmentIndex: r.segmentIndex
              }))
            }
          }
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(completeEvent));
        
      } catch (error) {
        console.error('生成问题流处理失败:', error);
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : '生成问题失败'
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(errorEvent));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}