import { NextRequest, NextResponse } from 'next/server';

interface ModelListRequest {
  platform: string;
  apiUrl: string;
  apiKey: string;
}

// 不同平台的模型列表获取逻辑
async function fetchModelsFromAPI(platform: string, apiUrl: string, apiKey: string): Promise<string[]> {
  const baseUrl = apiUrl.replace(/\/+$/, ''); // 移除末尾的斜杠
  
  try {
    switch (platform) {
      case 'openai':
        return await fetchOpenAIModels(baseUrl, apiKey);
      
      case 'anthropic':
        return await fetchAnthropicModels(baseUrl, apiKey);
      
      case 'deepseek':
        return await fetchDeepSeekModels(baseUrl, apiKey);
      
      case 'moonshot':
        return await fetchMoonshotModels(baseUrl, apiKey);
      
      case 'ollama':
        return await fetchOllamaModels(baseUrl);
      
      case 'custom':
        return await fetchCustomModels(baseUrl, apiKey);
      
      default:
        throw new Error(`不支持的平台: ${platform}`);
    }
  } catch (error) {
    console.error(`获取${platform}模型列表失败:`, error);
    throw error;
  }
}

// OpenAI API 模型获取
async function fetchOpenAIModels(baseUrl: string, apiKey: string): Promise<string[]> {
  const response = await fetch(`${baseUrl}/models`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000), // 10秒超时
  });

  if (!response.ok) {
    throw new Error(`OpenAI API错误: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.data && Array.isArray(data.data)) {
    // 过滤出GPT模型，并按名称排序
    return data.data
      .filter((model: any) => model.id && (
        model.id.includes('gpt') || 
        model.id.includes('text-davinci') || 
        model.id.includes('text-curie') ||
        model.id.includes('text-babbage') ||
        model.id.includes('text-ada')
      ))
      .map((model: any) => model.id)
      .sort();
  }
  
  throw new Error('OpenAI API返回数据格式错误');
}

// Anthropic API 模型获取
async function fetchAnthropicModels(baseUrl: string, apiKey: string): Promise<string[]> {
  // Anthropic目前没有公开的模型列表API，返回已知的模型
  // 可以尝试调用API来验证密钥是否有效
  try {
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }]
      }),
      signal: AbortSignal.timeout(10000),
    });

    // 即使请求失败，只要不是认证错误，就返回已知模型列表
    if (response.status === 401) {
      throw new Error('API密钥无效');
    }

    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  } catch (error) {
    if (error instanceof Error && error.message.includes('API密钥无效')) {
      throw error;
    }
    // 网络错误等情况下仍返回已知模型
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }
}

// DeepSeek API 模型获取
async function fetchDeepSeekModels(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API密钥无效');
      }
      throw new Error(`DeepSeek API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .filter((model: any) => model.id && model.id.includes('deepseek'))
        .map((model: any) => model.id)
        .sort();
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('API密钥无效')) {
      throw error;
    }
  }
  
  // 返回已知的DeepSeek模型
  return ['deepseek-chat', 'deepseek-coder'];
}

// Moonshot API 模型获取
async function fetchMoonshotModels(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API密钥无效');
      }
      throw new Error(`Moonshot API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data)) {
      return data.data
        .filter((model: any) => model.id && model.id.includes('moonshot'))
        .map((model: any) => model.id)
        .sort();
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('API密钥无效')) {
      throw error;
    }
  }
  
  // 返回已知的Moonshot模型
  return ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'];
}

// Ollama API 模型获取
async function fetchOllamaModels(baseUrl: string): Promise<string[]> {
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Ollama API错误: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.models && Array.isArray(data.models)) {
      return data.models
        .map((model: any) => model.name || model.model)
        .filter((name: string) => name)
        .sort();
    }
  } catch (error) {
    console.error('获取Ollama模型失败:', error);
  }
  
  // 返回常见的Ollama模型作为备选
  return [
    'llama2',
    'llama2:7b',
    'llama2:13b',
    'llama2:70b',
    'codellama',
    'codellama:7b',
    'codellama:13b',
    'mistral',
    'mistral:7b',
    'neural-chat',
    'starling-lm'
  ];
}

// 自定义API 模型获取
async function fetchCustomModels(baseUrl: string, apiKey: string): Promise<string[]> {
  // 尝试OpenAI兼容的API格式
  try {
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        return data.data
          .map((model: any) => model.id || model.name)
          .filter((name: string) => name)
          .sort();
      }
    }
  } catch (error) {
    console.error('尝试OpenAI格式失败:', error);
  }

  // 尝试其他常见格式
  try {
    const response = await fetch(`${baseUrl}/v1/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.models && Array.isArray(data.models)) {
        return data.models
          .map((model: any) => typeof model === 'string' ? model : (model.id || model.name))
          .filter((name: string) => name)
          .sort();
      }
    }
  } catch (error) {
    console.error('尝试其他格式失败:', error);
  }

  throw new Error('无法从自定义API获取模型列表，请检查API地址和密钥是否正确');
}

export async function POST(request: NextRequest) {
  try {
    const body: ModelListRequest = await request.json();
    const { platform, apiUrl, apiKey } = body;

    // 验证必需参数
    if (!platform || !apiUrl) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数: platform 或 apiUrl' },
        { status: 400 }
      );
    }

    // 获取模型列表
    const models = await fetchModelsFromAPI(platform, apiUrl, apiKey);

    return NextResponse.json({
      success: true,
      models,
      count: models.length
    });

  } catch (error) {
    console.error('获取模型列表API错误:', error);
    
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        models: [] 
      },
      { status: 500 }
    );
  }
}