'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiSettings, FiDownload, FiEdit, FiTrash2, FiCpu, FiPause, FiClock, FiCheckCircle, FiXCircle, FiRefreshCw, FiInfo, FiAlertTriangle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import PromptSettingsModal from '@/components/questions/prompt-settings-modal';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { FeedbackProvider, useFeedback, useErrorHandler, useAsyncOperation } from '@/components/common/feedback-system';

interface Project {
  id: number;
  name: string;
  description: string | null;
}

interface Dataset {
  id: number;
  projectId: number;
  name: string;
  fileName: string;
}

interface Question {
  id: number;
  projectId: number;
  datasetId: number;
  prompt: string;
  content: string;
  generatedQuestion: string;
  status: string;
  createdAt: string;
}

interface Segment {
  id: number;
  content: string;
  segmentId?: string;
}

interface AIConfig {
  platform: string;
  apiUrl: string;
  apiKey: string;
  model?: string;
}

interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  percentage: number;
}

interface GenerationResult {
  success: boolean;
  questionId?: number;
  question?: string;
  error?: string;
  segmentIndex: number;
  content: string;
}

interface GenerationSummary {
  total: number;
  successful: number;
  failed: number;
  retried?: number;
  questions: Array<{
    id: number;
    content: string;
    generatedQuestion: string;
    segmentIndex: number;
  }>;
}

interface SystemStatus {
  aiConfigured: boolean;
  hasProjects: boolean;
  hasDatasets: boolean;
  message: string;
}

function QuestionsPageContent() {
  const feedback = useFeedback();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  const { executeWithFeedback } = useAsyncOperation();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [prompt, setPrompt] = useState('基于以下内容，请生成一个相关的问题：\n\n{content}');
  const [loading, setLoading] = useState(false);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedSegments, setExpandedSegments] = useState<number[]>([]);
  
  // 模型相关状态
  const [aiConfig, setAiConfig] = useState<AIConfig>({ platform: '', apiUrl: '', apiKey: '', model: '' });
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [modelsLoading, setModelsLoading] = useState(false);

  // 并发控制状态
  const [concurrencyLimit, setConcurrencyLimit] = useState([3]);
  const [enableRetry, setEnableRetry] = useState(true);
  const [maxRetries, setMaxRetries] = useState([2]);

  // 生成进度状态
  const [progress, setProgress] = useState<GenerationProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    current: '',
    percentage: 0
  });
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const [generationSummary, setGenerationSummary] = useState<GenerationSummary | null>(null);
  
  // 生成结果详情状态
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);
  const [generationStats, setGenerationStats] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const pageSize = 30;
  
  // 结果区域数据集选择状态
  const [resultDatasetFilter, setResultDatasetFilter] = useState('all');
  
  // 高级设置弹框状态
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // 验证和警告状态
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  
  // 系统状态
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    aiConfigured: false,
    hasProjects: false,
    hasDatasets: false,
    message: '正在检查系统状态...'
  });

  // 获取AI配置
  const fetchAIConfig = async () => {
    try {
      const response = await fetch('/api/settings?type=ai');
      const result = await response.json();
      console.log('获取AI配置结果:', result);
      
      if (result.success && result.data) {
        setAiConfig(result.data);
        
        // 优先从本地存储恢复模型选择，其次使用配置中的模型，最后不选择任何模型
        const savedModel = localStorage.getItem('selectedModel');
        const modelToUse = savedModel || result.data.model || '';
        setSelectedModel(modelToUse);
        
        // 如果有配置，自动获取模型列表
        // 本地模型不需要API密钥
        const isLocalModel = result.data.apiUrl && (
          result.data.apiUrl.includes('localhost') || 
          result.data.apiUrl.includes('127.0.0.1') ||
          result.data.apiUrl.includes('0.0.0.0') ||
          result.data.platform === 'local' ||
          result.data.platform === 'ollama'
        );
        
        if (result.data.platform && result.data.apiUrl && (isLocalModel || result.data.apiKey)) {
          await fetchModels(result.data);
        }
      } else {
        console.log('AI配置获取失败或数据为空:', result);
        // 设置默认的空配置
        setAiConfig({ platform: '', apiUrl: '', apiKey: '', model: '' });
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
      // 设置默认的空配置
      setAiConfig({ platform: '', apiUrl: '', apiKey: '', model: '' });
    }
  };

  // 获取保存的提示词设置
  const fetchPromptSettings = async () => {
    try {
      const response = await fetch('/api/prompt-templates?type=current&category=question');
      const result = await response.json();
      
      if (result.success && result.data.template) {
        setPrompt(result.data.template);
      }
    } catch (error) {
      console.error('获取提示词设置失败:', error);
    }
  };

  // 获取模型列表
  const fetchModels = async (config?: AIConfig) => {
    const configToUse = config || aiConfig;
    if (!configToUse.platform || !configToUse.apiUrl) {
      return;
    }

    try {
      setModelsLoading(true);
      const response = await fetch('/api/models/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: configToUse.platform,
          apiUrl: configToUse.apiUrl,
          apiKey: configToUse.apiKey,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAvailableModels(result.models);
        // 不自动选择默认模型，只有当前选中的模型不在列表中时才清空选择
        if (selectedModel && !result.models.includes(selectedModel)) {
          setSelectedModel('');
        }
      } else {
        console.error('获取模型列表失败:', result.error);
        setAvailableModels([]);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      setAvailableModels([]);
    } finally {
      setModelsLoading(false);
    }
  };

  // 处理模型切换并保存
  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    
    // 保存选择的模型到本地存储
    try {
      localStorage.setItem('selectedModel', model);
      
      // 同时更新AI配置中的模型设置
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ai',
          config: {
            ...aiConfig,
            model: model,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiConfig(prev => ({ ...prev, model }));
      }
    } catch (error) {
      console.error('保存模型选择失败:', error);
    }
  };

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    }
  };

  // 获取数据集列表
  const fetchDatasets = async (projectId: string) => {
    if (!projectId) {
      setDatasets([]);
      setSegments([]);
      setShowSegments(false);
      return;
    }

    try {
      const response = await fetch(`/api/datasets?projectId=${projectId}`);
      const result = await response.json();
      if (result.success) {
        setDatasets(result.data);
      }
    } catch (error) {
      console.error('获取数据集列表失败:', error);
    }
  };

  // 获取数据集分段
  const fetchSegments = async (datasetId: string) => {
    if (!datasetId) {
      setSegments([]);
      setShowSegments(false);
      return;
    }

    try {
      setSegmentsLoading(true);
      const response = await fetch(`/api/datasets/${datasetId}/segments?limit=50`);
      const result = await response.json();
      if (result.success) {
        setSegments(result.data.segments);
        setShowSegments(true);
      }
    } catch (error) {
      console.error('获取数据集分段失败:', error);
    } finally {
      setSegmentsLoading(false);
    }
  };

  // 获取问题列表
  const fetchQuestions = async (projectId?: string, page: number = 1, datasetId?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (projectId) {
        params.append('projectId', projectId);
      } else {
        params.append('projectId', '1'); // 默认获取第一个项目的问题
      }
      
      if (datasetId && datasetId !== 'all') {
        params.append('datasetId', datasetId);
      }
      
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      
      const response = await fetch(`/api/questions?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setQuestions(result.data.questions || result.data);
        setTotalQuestions(result.data.total || result.data.length);
        setTotalPages(Math.ceil((result.data.total || result.data.length) / pageSize));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('获取问题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取生成结果历史
  const fetchGenerationHistory = async (projectId?: string, datasetId?: string) => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (datasetId) params.append('datasetId', datasetId);
      params.append('limit', '20');
      
      const response = await fetch(`/api/questions/generation-results?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setGenerationHistory(result.data.results);
        setGenerationStats(result.data.statistics);
      }
    } catch (error) {
      console.error('获取生成历史失败:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 获取单个问题详情
  const fetchQuestionDetail = async (questionId: number) => {
    try {
      const response = await fetch('/api/questions/generation-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });
      
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error('获取问题详情失败:', error);
    }
    return null;
  };

  // 检查系统状态
  const checkSystemStatus = useCallback(async () => {
    try {
      // 支持本地模型的AI配置检查
      // 本地模型只需要 platform 和 apiUrl，不需要 apiKey
      const isLocalModel = aiConfig.apiUrl && (
        aiConfig.apiUrl.includes('localhost') || 
        aiConfig.apiUrl.includes('127.0.0.1') ||
        aiConfig.apiUrl.includes('0.0.0.0') ||
        aiConfig.platform === 'local' ||
        aiConfig.platform === 'ollama'
      );
      
      const hasAI = !!(aiConfig.platform && aiConfig.apiUrl && (isLocalModel || aiConfig.apiKey));
      const hasProj = projects.length > 0;
      const hasData = datasets.length > 0;
      
      console.log('AI配置检查:', {
        apiUrl: aiConfig.apiUrl,
        apiKey: aiConfig.apiKey ? '已配置' : '未配置',
        platform: aiConfig.platform,
        model: aiConfig.model,
        isLocalModel,
        hasAI
      });
      
      let statusMessage = '';
      if (!hasAI) {
        if (!aiConfig.platform) {
          statusMessage = '⚠️ 未配置AI平台，将使用演示模式生成问题';
        } else if (!aiConfig.apiUrl) {
          statusMessage = '⚠️ 未配置API地址，将使用演示模式生成问题';
        } else if (!isLocalModel && !aiConfig.apiKey) {
          statusMessage = '⚠️ 云端模型需要配置API密钥，将使用演示模式生成问题';
        } else {
          statusMessage = '⚠️ AI配置不完整，将使用演示模式生成问题';
        }
      } else if (!hasProj) {
        statusMessage = '📁 请先创建项目';
      } else if (!hasData) {
        // 检查是否已选择项目但未选择数据集
        if (selectedProject && datasets.length > 0) {
          statusMessage = '📄 请选择数据集';
        } else if (selectedProject && datasets.length === 0) {
          statusMessage = '📄 当前项目暂无数据集，请先上传数据集';
        } else {
          statusMessage = '📄 请选择项目和数据集';
        }
      } else {
        statusMessage = isLocalModel 
          ? '✅ 本地AI模型配置完整，可以开始生成问题' 
          : '✅ 云端AI模型配置完整，可以开始生成问题';
      }
      
      setSystemStatus({
        aiConfigured: hasAI,
        hasProjects: hasProj,
        hasDatasets: hasData,
        message: statusMessage
      });
    } catch (error) {
      console.error('检查系统状态失败:', error);
    }
  }, [aiConfig, projects, datasets, selectedProject]);

  useEffect(() => {
    fetchAIConfig();
    fetchProjects();
    fetchQuestions();
    fetchPromptSettings();
  }, []);

  // 当配置变化时检查系统状态
  useEffect(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

  useEffect(() => {
    if (selectedProject) {
      resetSelections(); // 重置数据集和分段选择
      fetchDatasets(selectedProject);
      fetchQuestions(selectedProject, 1, resultDatasetFilter); // 重置到第一页
      fetchGenerationHistory(selectedProject); // 获取生成历史
      setCurrentPage(1); // 重置页码
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedDataset) {
      fetchSegments(selectedDataset);
      fetchGenerationHistory(selectedProject, selectedDataset); // 获取特定数据集的生成历史
    }
  }, [selectedDataset, selectedProject]);

  // 结果区域数据集筛选变化时重新获取问题
  useEffect(() => {
    if (selectedProject) {
      fetchQuestions(selectedProject, 1, resultDatasetFilter);
      setCurrentPage(1);
    }
  }, [resultDatasetFilter]);

  // 简单的本地验证
  const validateConfig = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基础验证
    if (selectedSegments.length === 0) {
      errors.push('请至少选择一个段落');
    }

    if (!prompt.trim()) {
      errors.push('请输入提示词');
    }

    if (!selectedProject) {
      errors.push('请选择项目');
    }

    if (!selectedDataset) {
      errors.push('请选择数据集');
    }

    // 警告检查
    if (selectedSegments.length > 50) {
      warnings.push(`选择了 ${selectedSegments.length} 个段落，生成时间可能较长`);
    }

    if (concurrencyLimit[0] > 10) {
      warnings.push('并发数过高可能导致API限制，建议设置为10以下');
    }

    if (prompt.length > 2000) {
      warnings.push('提示词过长可能影响生成效果');
    }

    // 检查段落内容长度
    if (selectedSegments.length > 0) {
      const selectedSegmentContents = selectedSegments.map(index => segments[index]?.content).filter(Boolean);
      const longSegments = selectedSegmentContents.filter(s => s.length > 4000);
      if (longSegments.length > 0) {
        warnings.push(`有 ${longSegments.length} 个段落内容过长，可能影响生成质量`);
      }
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  }, [selectedSegments, prompt, selectedProject, selectedDataset, concurrencyLimit, segments]);

  // 配置变化时验证
  useEffect(() => {
    validateConfig();
  }, [validateConfig]);

  // 处理分段选择
  const handleSegmentSelect = (segmentId: number) => {
    setSelectedSegments(prev => {
      if (prev.includes(segmentId)) {
        return prev.filter(id => id !== segmentId);
      } else {
        return [...prev, segmentId];
      }
    });
  };

  // 重置选择状态
  const resetSelections = () => {
    setSelectedDataset('');
    setSegments([]);
    setSelectedSegments([]);
    setShowSegments(false);
    setExpandedSegments([]);
  };

  // 全选/取消全选分段
  const handleSelectAllSegments = () => {
    if (selectedSegments.length === segments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(segments.map((_, index) => index));
    }
  };

  // 处理分段展开/折叠
  const handleToggleSegmentExpand = (index: number) => {
    setExpandedSegments(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // 展开/折叠所有分段
  const handleExpandAllSegments = () => {
    const allExpanded = expandedSegments.length === segments.length;
    if (allExpanded) {
      setExpandedSegments([]);
    } else {
      setExpandedSegments(segments.map((_, index) => index));
    }
  };

  // 获取分段内容预览
  const getSegmentPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchQuestions(selectedProject, page, resultDatasetFilter);
    }
  };

  // 生成问题 - 使用并发控制
  const handleGenerateQuestions = async () => {
    // 基础验证
    if (!selectedProject || !selectedDataset || !prompt.trim()) {
      handleError('请选择项目、数据集并输入提示词', '配置不完整');
      return;
    }

    if (selectedSegments.length === 0) {
      handleError('请至少选择一个分段', '未选择分段');
      return;
    }

    // 如果没有选择模型，给出友好提示但不阻止生成（使用模拟生成器）
    if (!selectedModel) {
      handleWarning('未配置AI模型，将使用模拟生成器进行演示', '使用演示模式');
    }

    if (validationErrors.length > 0) {
      handleError('请先解决配置错误', '配置验证失败');
      return;
    }

    // 获取选中的分段内容，并为每个分段替换提示词中的{content}
    const selectedSegmentContents = selectedSegments.map(index => {
      if (index >= 0 && index < segments.length) {
        const content = segments[index].content;
        const processedPrompt = prompt.replace('{content}', content);
        return {
          content: content,
          prompt: processedPrompt
        };
      }
      return null;
    }).filter(item => item !== null && item.content.trim().length > 0);

    if (selectedSegmentContents.length === 0) {
      handleError('选中的分段内容为空', '分段内容错误');
      return;
    }

    // 为每个分段生成替换了内容的提示词
    const segmentsWithPrompts = selectedSegmentContents.map(content => ({
      content,
      prompt: prompt.trim().replace('{content}', content)
    }));
    
    try {
      setGenerating(true);
      setProgress({
        total: selectedSegmentContents.length,
        completed: 0,
        failed: 0,
        current: '准备开始生成...',
        percentage: 0
      });
      setGenerationResults([]);
      setGenerationSummary(null);

      // 使用 Server-Sent Events 实现实时进度更新
      const response = await fetch('/api/questions/generate-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: parseInt(selectedProject),
          datasetId: parseInt(selectedDataset),
          prompt: prompt.trim(),
          segments: segmentsWithPrompts, // 发送包含替换后提示词的数据
          model: selectedModel || 'mock', // 如果没有模型，使用mock标识
          concurrencyLimit: concurrencyLimit[0],
          enableRetry,
          maxRetries: maxRetries[0]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('生成请求失败:', errorText);
        
        // 提供更友好的错误信息
        let friendlyError = '生成问题时发生错误';
        if (response.status === 500) {
          friendlyError = '服务器内部错误，请检查AI配置或稍后重试';
        } else if (response.status === 400) {
          friendlyError = '请求参数有误，请检查配置';
        }
        
        throw new Error(friendlyError);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                // 实时更新进度
                setProgress(data.data);
              } else if (data.type === 'complete') {
                // 生成完成
                setGenerationResults(data.data.results || []);
                setGenerationSummary(data.data.summary);
                setProgress({
                  total: data.data.summary.total,
                  completed: data.data.summary.successful,
                  failed: data.data.summary.failed,
                  current: '🎉 生成完成！',
                  percentage: 100
                });

                // 刷新问题列表和生成历史
                await fetchQuestions(selectedProject, currentPage, resultDatasetFilter);
                await fetchGenerationHistory(selectedProject, selectedDataset);
                
                // 清空选中的分段
                setSelectedSegments([]);

                // 根据实际结果显示成功或警告消息
                const { successful, failed } = data.data.summary;
                if (failed === 0) {
                  handleSuccess(`成功生成了 ${successful} 个问题`, '生成完成');
                } else if (successful > 0) {
                  handleWarning(`生成完成：成功 ${successful} 个，失败 ${failed} 个`, '部分生成成功');
                } else {
                  handleError('所有问题生成都失败了', '生成失败');
                }
                
                break;
              } else if (data.type === 'error') {
                // 处理错误
                let errorMsg = data.error || '生成失败';
                
                if (errorMsg.includes('AI配置不完整')) {
                  errorMsg = '请先在系统设置中配置AI模型，或者当前正在使用演示模式生成问题';
                  handleWarning(errorMsg, '配置提示');
                } else {
                  handleError(errorMsg, '生成问题失败');
                }
                break;
              }
            } catch (parseError) {
              console.error('解析SSE数据失败:', parseError);
            }
          }
        }
      }

    } catch (error) {
      console.error('生成问题失败:', error);
      handleError(error instanceof Error ? error.message : '生成问题时发生未知错误', '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  // 删除问题
  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('确定要删除这个问题吗？')) return;

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchQuestions(selectedProject, currentPage, resultDatasetFilter); // 重新获取问题列表
        await fetchGenerationHistory(selectedProject, selectedDataset); // 刷新生成历史
        handleSuccess('问题删除成功', '删除完成');
      } else {
        handleError('删除失败: ' + result.error, '删除失败');
      }
    } catch (error) {
      console.error('删除问题失败:', error);
      handleError('删除问题失败', '删除失败');
    }
  };

  // 查看问题详情
  const handleViewQuestionDetail = async (questionId: number) => {
    try {
      const detail = await fetchQuestionDetail(questionId);
      if (detail) {
        // 显示问题详情（可以用模态框或者其他方式）
        const message = `
问题详情：
- 内容长度: ${detail.metadata.contentLength} 字符
- 问题长度: ${detail.metadata.questionLength} 字符  
- 提示词长度: ${detail.metadata.promptLength} 字符
- 创建时间: ${new Date(detail.metadata.createdAt).toLocaleString('zh-CN')}
- 更新时间: ${new Date(detail.metadata.updatedAt).toLocaleString('zh-CN')}
        `;
        alert(message);
      }
    } catch (error) {
      console.error('获取问题详情失败:', error);
      handleError('获取问题详情失败', '详情获取失败');
    }
  };

  // 获取项目和数据集名称
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '未知项目';
  };

  const getDatasetName = (datasetId: number) => {
    const dataset = datasets.find(d => d.id === datasetId);
    return dataset?.name || '未知数据集';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">问题生成</h1>
          <p className="text-gray-600 mt-1">从数据集片段生成训练问题</p>
          {/* 系统状态提示 */}
          <div className="mt-2">
            <span className={`text-sm px-3 py-1 rounded-full ${
              systemStatus.aiConfigured 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {systemStatus.message}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* 模型选择器 */}
          <div className="flex items-center space-x-2">
            <FiCpu className="h-4 w-4 text-gray-500" />
            <Select 
              value={selectedModel} 
              onValueChange={handleModelChange}
              disabled={modelsLoading || availableModels.length === 0}
            >
              <SelectTrigger className="w-80">
                <SelectValue placeholder={
                  modelsLoading ? "加载模型中..." : 
                  availableModels.length === 0 ? "请先配置AI设置" : 
                  "选择模型"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {modelsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          <PromptSettingsModal 
            prompt={prompt}
            onPromptChange={setPrompt}
          />
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FiDownload className="mr-2 h-4 w-4" />
            导出数据
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* 左侧：数据集选择和分段选择 */}
        <div className="flex flex-col space-y-6 flex-1 lg:flex-1 h-full">
          {/* 数据集选择 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据集选择</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择项目
                </label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="请选择项目" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择数据集
                </label>
                <div className="flex space-x-3">
                  <Select 
                    value={selectedDataset} 
                    onValueChange={setSelectedDataset}
                    disabled={!selectedProject}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="请选择数据集" />
                    </SelectTrigger>
                    <SelectContent>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id.toString()}>
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDataset && (
                    <button
                      onClick={() => fetchSegments(selectedDataset)}
                      disabled={segmentsLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {segmentsLoading ? '加载中...' : '查看分段'}
                    </button>
            )}
          </div>
        </div>
      </div>
    </div>

          {/* 分段选择 */}
          {showSegments && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  分段选择 ({selectedSegments.length}/{segments.length})
                </h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    已展开 {expandedSegments.length}/{segments.length}
                  </span>
                  <button
                    onClick={handleExpandAllSegments}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {expandedSegments.length === segments.length ? '📁 折叠全部' : '📂 展开全部'}
                  </button>
                  <button
                    onClick={handleSelectAllSegments}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  >
                    {selectedSegments.length === segments.length ? '取消全选' : '全选'}
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                {segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg transition-colors ${
                      selectedSegments.includes(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* 分段头部 - 可点击选中checkbox */}
                    <div 
                      className="p-3 cursor-pointer"
                      onClick={() => handleSegmentSelect(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedSegments.includes(index)}
                          onChange={() => handleSegmentSelect(index)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          {segment.segmentId && (
                            <div className="text-xs text-gray-500 mb-1">
                              ID: {segment.segmentId}
                            </div>
                          )}
                          {expandedSegments.includes(index) ? (
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {segment.content}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700">
                              {getSegmentPreview(segment.content)}
                            </div>
                          )}
                          {expandedSegments.includes(index) && (
                            <div className="mt-2 text-xs text-gray-400">
                              字符数: {segment.content.length}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            selectedSegments.includes(index) 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {selectedSegments.includes(index) ? '✅ 已选中' : '📄 点击选择'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSegmentExpand(index);
                            }}
                            className={`px-2 py-1 rounded text-xs transition-colors ${
                              expandedSegments.includes(index) 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {expandedSegments.includes(index) ? '📁 折叠' : '📂 展开'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：生成按钮和生成结果 */}
        <div className="flex flex-col space-y-6 flex-1 lg:flex-1 h-full">
          {/* 生成配置和控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiSettings className="mr-2 h-5 w-5" />
                生成配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 基础信息 */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  已选择 {selectedSegments.length} 个分段，当前模型: {selectedModel || '未选择'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedSettings(true)}
                  className="flex items-center"
                >
                  <FiSettings className="mr-1 h-3 w-3" />
                  高级设置
                </Button>
              </div>

              {/* 当前设置摘要 */}
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                并发数: {concurrencyLimit[0]} | 重试: {enableRetry ? `启用(${maxRetries[0]}次)` : '禁用'}
              </div>

              {/* 验证信息 */}
              {(validationErrors.length > 0 || validationWarnings.length > 0) && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-center text-red-600 text-sm">
                      <FiXCircle className="mr-1 h-4 w-4" />
                      {error}
                    </div>
                  ))}
                  {validationWarnings.map((warning, index) => (
                    <div key={index} className="flex items-center text-yellow-600 text-sm">
                      <FiAlertTriangle className="mr-1 h-4 w-4" />
                      {warning}
                    </div>
                  ))}
                </div>
              )}

              {/* 生成按钮 */}
              <Button
                onClick={handleGenerateQuestions}
                disabled={generating || validationErrors.length > 0 || !selectedProject || !selectedDataset || selectedSegments.length === 0}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2 h-4 w-4" />
                    开始生成问题
                  </>
                )}
              </Button>

              {/* 生成进度 */}
              {generating && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>生成进度</span>
                    <span>{progress.completed + progress.failed}/{progress.total}</span>
                  </div>
                  <Progress value={progress.percentage} className="w-full" />
                  <div className="text-sm text-gray-600">
                    {progress.current}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <FiCheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      成功: {progress.completed}
                    </span>
                    <span className="flex items-center">
                      <FiXCircle className="mr-1 h-3 w-3 text-red-500" />
                      失败: {progress.failed}
                    </span>
                  </div>
                </div>
              )}

              {/* 生成结果摘要 */}
              {generationSummary && (
                <div className="space-y-3 p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800">生成完成</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FiCheckCircle className="mr-1 h-4 w-4 text-green-500" />
                      成功: {generationSummary.successful}
                    </div>
                    <div className="flex items-center">
                      <FiXCircle className="mr-1 h-4 w-4 text-red-500" />
                      失败: {generationSummary.failed}
                    </div>
                  </div>
                  
                  {generationSummary.retried && (
                    <div className="flex items-center text-sm">
                      <FiRefreshCw className="mr-1 h-4 w-4 text-blue-500" />
                      重试: {generationSummary.retried}
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    总计生成 {generationSummary.questions.length} 个问题
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 生成结果 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 上方：数据集筛选 */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
              <div className="flex items-center space-x-4">
                {/* 数据集筛选 */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">筛选数据集:</label>
                  <Select 
                    value={resultDatasetFilter} 
                    onValueChange={setResultDatasetFilter}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="全部数据集" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部数据集</SelectItem>
                      {datasets.map((dataset) => (
                        <SelectItem key={dataset.id} value={dataset.id.toString()}>
                          {dataset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 统计信息 */}
                {generationStats && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FiCheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      总计: {generationStats.total}
                    </span>
                    {generationStats.recent > 0 && (
                      <span className="flex items-center">
                        <FiClock className="mr-1 h-3 w-3 text-blue-500" />
                        最近7天: {generationStats.recent}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* 下方：问题列表 */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">加载中...</span>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
                  {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      暂无生成的问题
                    </div>
                  ) : (
                    questions.map((question) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-1">
                              {getProjectName(question.projectId)} / {getDatasetName(question.datasetId)}
                            </div>
                            <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                              内容片段: {question.content}
                            </div>
                            <div className="font-medium text-gray-900">
                              {question.generatedQuestion}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              question.status === 'answered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {question.status === 'answered' ? '已答案' : '待答案'}
                            </span>
                            <button 
                              onClick={() => handleViewQuestionDetail(question.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="查看详情"
                            >
                              <FiInfo className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="编辑">
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="删除"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          生成时间: {new Date(question.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 分页控件 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                    <div className="text-sm text-gray-600">
                      共 {totalQuestions} 条记录，第 {currentPage} / {totalPages} 页
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                      >
                        <FiChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      
                      {/* 页码按钮 */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                      >
                        下一页
                        <FiChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 高级设置弹框 */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-96 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">高级设置</h3>
              <button
                onClick={() => setShowAdvancedSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 并发控制 */}
              <div>
                <Label>并发数: {concurrencyLimit[0]}</Label>
                <Slider
                  value={concurrencyLimit}
                  onValueChange={setConcurrencyLimit}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  并发数越高生成越快，但可能触发API限制
                </p>
              </div>

              {/* 重试机制 */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enableRetry"
                  checked={enableRetry}
                  onCheckedChange={(checked) => setEnableRetry(checked === true)}
                />
                <Label htmlFor="enableRetry">启用重试机制</Label>
              </div>

              {enableRetry && (
                <div>
                  <Label>最大重试次数: {maxRetries[0]}</Label>
                  <Slider
                    value={maxRetries}
                    onValueChange={setMaxRetries}
                    max={5}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    失败时自动重试，提高生成成功率
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowAdvancedSettings(false)}
                className="px-4 py-2"
              >
                确定
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <ErrorBoundary>
      <FeedbackProvider>
        <QuestionsPageContent />
      </FeedbackProvider>
    </ErrorBoundary>
  );
}
