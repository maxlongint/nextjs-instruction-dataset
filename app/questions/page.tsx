'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiSettings, FiDownload, FiCpu, FiCheckCircle, FiXCircle, FiRefreshCw, FiInfo, FiAlertTriangle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
import { Loading } from '@/components/ui/loading';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { projectService, datasetService, questionService, templateService } from '../lib/data-service';
import { Project, Dataset, Question, Segment } from '../types';

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

export default function QuestionsPage() {
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
  
  // 问题详情对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<{
    question?: string;
    content?: string;
    prompt?: string;
    metadata?: {
      contentLength?: number;
      questionLength?: number;
      promptLength?: number;
      createdAt?: string;
      updatedAt?: string;
    };
    datasetName?: string;
  } | null>(null);
  
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

  // 获取AI配置 - 使用模拟配置
  const fetchAIConfig = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const savedConfig = localStorage.getItem('aiConfig');
      const defaultConfig = {
        platform: 'mock',
        apiUrl: 'http://localhost:11434',
        apiKey: '',
        model: 'mock-model'
      };
      
      const config = savedConfig ? JSON.parse(savedConfig) : defaultConfig;
      setAiConfig(config);
      
      const savedModel = localStorage.getItem('selectedModel') || config.model || 'mock-model';
      setSelectedModel(savedModel);
      
      await fetchModels(config);
    } catch (error) {
      console.error('获取AI配置失败:', error);
      setAiConfig({ platform: 'mock', apiUrl: '', apiKey: '', model: 'mock-model' });
    }
  };

  // 获取保存的提示词设置 - 使用模拟数据
  const fetchPromptSettings = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const templates = templateService.getPromptTemplates('question');
      const defaultTemplate = templates.find(t => t.isDefault);
      if (defaultTemplate) {
        setPrompt(defaultTemplate.template);
      }
    } catch (error) {
      console.error('获取提示词设置失败:', error);
    }
  };

  // 获取模型列表 - 使用模拟数据
  const fetchModels = async (config?: AIConfig) => {
    const configToUse = config || aiConfig;
    if (!configToUse.platform) {
      return;
    }

    try {
      setModelsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockModels = [
        'mock-model',
        'gpt-3.5-turbo',
        'gpt-4',
        'claude-3-haiku',
        'llama2:7b',
        'qwen:7b'
      ];
      
      setAvailableModels(mockModels);
      
      if (selectedModel && !mockModels.includes(selectedModel)) {
        setSelectedModel('');
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
      setAvailableModels([]);
    } finally {
      setModelsLoading(false);
    }
  };

  // 处理模型切换并保存 - 使用本地存储
  const handleModelChange = async (model: string) => {
    setSelectedModel(model);
    
    try {
      localStorage.setItem('selectedModel', model);
      
      const updatedConfig = { ...aiConfig, model };
      localStorage.setItem('aiConfig', JSON.stringify(updatedConfig));
      setAiConfig(updatedConfig);
    } catch (error) {
      console.error('保存模型选择失败:', error);
    }
  };

  // 获取项目列表 - 使用模拟数据
  const fetchProjects = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const projects = projectService.getAll();
      setProjects(projects);
    } catch (error) {
      console.error('获取项目列表失败:', error);
    }
  };

  // 获取数据集列表 - 使用模拟数据
  const fetchDatasets = async (projectId: string) => {
    if (!projectId) {
      setDatasets([]);
      setSegments([]);
      setShowSegments(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const datasets = datasetService.getAll(parseInt(projectId));
      setDatasets(datasets);
    } catch (error) {
      console.error('获取数据集列表失败:', error);
    }
  };

  // 获取数据集分段 - 使用模拟数据
  const fetchSegments = async (datasetId: string) => {
    if (!datasetId) {
      setSegments([]);
      setShowSegments(false);
      return;
    }

    try {
      setSegmentsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const dataset = datasetService.getById(parseInt(datasetId));
      if (dataset && dataset.content) {
        const delimiter = dataset.segmentDelimiter || '\n\n';
        const segments = dataset.content.split(delimiter)
          .filter(segment => segment.trim().length > 0)
          .slice(0, 50)
          .map((content, index) => ({
            id: index,
            content: content.trim(),
            segmentId: `segment-${index + 1}`
          }));
        
        setSegments(segments);
        setShowSegments(true);
      }
    } catch (error) {
      console.error('获取数据集分段失败:', error);
    } finally {
      setSegmentsLoading(false);
    }
  };

  // 获取问题列表 - 使用模拟数据
  const fetchQuestions = async (projectId?: string, page: number = 1, datasetId?: string) => {
    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const targetProjectId = projectId ? parseInt(projectId) : 1;
      let questions = questionService.getAll(targetProjectId);
      
      if (datasetId && datasetId !== 'all') {
        questions = questions.filter((q: Question) => q.datasetId === parseInt(datasetId));
      }
      
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedQuestions = questions.slice(startIndex, endIndex);
      
      setQuestions(paginatedQuestions);
      setTotalQuestions(questions.length);
      setTotalPages(Math.ceil(questions.length / pageSize));
      setCurrentPage(page);
    } catch (error) {
      console.error('获取问题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取单个问题详情 - 使用模拟数据
  const fetchQuestionDetail = async (questionId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const question = questionService.getById(questionId);
      if (question) {
        return {
          question: question,
          metadata: {
            contentLength: question.content.length,
            questionLength: question.generatedQuestion.length,
            promptLength: question.prompt.length,
            createdAt: question.createdAt,
            updatedAt: question.createdAt
          }
        };
      }
    } catch (error) {
      console.error('获取问题详情失败:', error);
    }
    return null;
  };

  // 检查系统状态
  const checkSystemStatus = useCallback(async () => {
    try {
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
      
      let statusMessage = '';
      if (!hasAI) {
        statusMessage = '⚠️ 未配置AI平台，将使用演示模式生成问题';
      } else if (!hasProj) {
        statusMessage = '📁 请先创建项目';
      } else if (!hasData) {
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

  // 重置选择状态
  const resetSelections = () => {
    setSelectedDataset('');
    setSegments([]);
    setSelectedSegments([]);
    setShowSegments(false);
    setExpandedSegments([]);
  };

  useEffect(() => {
    fetchAIConfig();
    fetchProjects();
    fetchQuestions();
    fetchPromptSettings();
  }, []);

  useEffect(() => {
    checkSystemStatus();
  }, [checkSystemStatus]);

  useEffect(() => {
    if (selectedProject) {
      resetSelections();
      fetchDatasets(selectedProject);
      setCurrentPage(1);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedDataset) {
      fetchSegments(selectedDataset);
    }
  }, [selectedDataset]);

  useEffect(() => {
    if (selectedProject && resultDatasetFilter) {
      fetchQuestions(selectedProject, 1, resultDatasetFilter);
      setCurrentPage(1);
    }
  }, [resultDatasetFilter]);

  // 简单的本地验证
  const validateConfig = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

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

    if (selectedSegments.length > 50) {
      warnings.push(`选择了 ${selectedSegments.length} 个段落，生成时间可能较长`);
    }

    if (concurrencyLimit[0] > 10) {
      warnings.push('并发数过高可能导致API限制，建议设置为10以下');
    }

    if (prompt.length > 2000) {
      warnings.push('提示词过长可能影响生成效果');
    }

    setValidationErrors(errors);
    setValidationWarnings(warnings);
  }, [selectedSegments, prompt, selectedProject, selectedDataset, concurrencyLimit]);

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

  // 生成问题 - 使用模拟生成器
  const handleGenerateQuestions = async () => {
    if (!selectedProject || !selectedDataset || !prompt.trim()) {
      alert('请选择项目、数据集并输入提示词');
      return;
    }

    if (selectedSegments.length === 0) {
      alert('请至少选择一个分段');
      return;
    }

    if (validationErrors.length > 0) {
      alert('请先解决配置错误');
      return;
    }

    const selectedSegmentContents = selectedSegments.map(index => {
      if (index >= 0 && index < segments.length) {
        const content = segments[index].content;
        const segmentId = segments[index].segmentId || `segment-${index}`;
        const processedPrompt = prompt.replace('{content}', content);
        return {
          content: content,
          prompt: processedPrompt,
          segmentId: segmentId,
          index: index
        };
      }
      return null;
    }).filter((item): item is { content: string; prompt: string; segmentId: string; index: number } => 
      item !== null && item.content.trim().length > 0
    );

    if (selectedSegmentContents.length === 0) {
      alert('选中的分段内容为空');
      return;
    }
    
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

      const results: GenerationResult[] = [];
      let successful = 0;
      let failed = 0;

      for (let i = 0; i < selectedSegmentContents.length; i++) {
        const segment = selectedSegmentContents[i];
        
        setProgress({
          total: selectedSegmentContents.length,
          completed: i,
          failed: failed,
          current: `正在生成第 ${i + 1} 个问题...`,
          percentage: Math.round((i / selectedSegmentContents.length) * 100)
        });

        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          const mockQuestions = [
            `关于"${segment.content.substring(0, 20)}..."的核心观点是什么？`,
            `请解释"${segment.content.substring(0, 15)}..."中提到的主要概念。`,
            `根据内容分析，${segment.content.substring(0, 10)}...的重要性体现在哪里？`,
            `如何理解文中关于"${segment.content.substring(0, 12)}..."的描述？`,
            `请总结"${segment.content.substring(0, 18)}..."的关键要点。`
          ];
          
          const generatedQuestion = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
          
        const newQuestion = questionService.create({
          uid: `q_${Date.now()}`,
          projectId: parseInt(selectedProject),
          datasetId: parseInt(selectedDataset),
          segmentId: segment.segmentId,
          prompt: `基于以下内容生成问题：\n\n${segment.content}`,
          content: segment.content,
          generatedQuestion: `基于"${segment.content.substring(0, 20)}..."的问题`,
          wordCount: segment.content.length,
          status: 'generated',
          type: 'short_answer',
          difficulty: 'medium',
          category: '自动生成',
          tags: ['自动生成'],
          points: 10,
          timeLimit: 300,
          hints: [],
          explanation: '',
          references: [],
          isPublic: false,
          usageCount: 0,
          updatedAt: new Date().toISOString()
        });

          results.push({
            success: true,
            questionId: newQuestion.id,
            question: generatedQuestion,
            segmentIndex: segment.index,
            content: segment.content
          });
          
          successful++;
        } else {
          results.push({
            success: false,
            error: '模拟生成失败',
            segmentIndex: segment.index,
            content: segment.content
          });
          
          failed++;
        }
      }

      const summary: GenerationSummary = {
        total: selectedSegmentContents.length,
        successful,
        failed,
        questions: results.filter(r => r.success).map(r => ({
          id: r.questionId!,
          content: r.content,
          generatedQuestion: r.question!,
          segmentIndex: r.segmentIndex
        }))
      };

      setGenerationResults(results);
      setGenerationSummary(summary);
      setProgress({
        total: selectedSegmentContents.length,
        completed: successful,
        failed: failed,
        current: '🎉 生成完成！',
        percentage: 100
      });

      setResultDatasetFilter(selectedDataset);
      
      await fetchQuestions(selectedProject, 1, selectedDataset);
      
      setSelectedSegments([]);

      const datasetName = datasets.find(d => d.id.toString() === selectedDataset)?.name || '当前数据集';
      
      if (failed === 0) {
        alert(`成功为"${datasetName}"生成了 ${successful} 个问题`);
      } else if (successful > 0) {
        alert(`为"${datasetName}"生成完成：成功 ${successful} 个，失败 ${failed} 个`);
      } else {
        alert(`为"${datasetName}"生成问题全部失败`);
      }

    } catch (error) {
      console.error('生成问题失败:', error);
      alert('生成问题时发生未知错误');
    } finally {
      setGenerating(false);
    }
  };

  // 查看问题详情
  const handleViewQuestionDetail = async (questionId: number) => {
    try {
      const detail = await fetchQuestionDetail(questionId);
      if (detail) {
        const datasetName = getDatasetName(detail.question.datasetId);
        
        setCurrentQuestionDetail({
          question: detail.question.generatedQuestion,
          content: detail.question.content,
          prompt: detail.question.prompt,
          metadata: {
            contentLength: detail.metadata.contentLength,
            questionLength: detail.metadata.questionLength,
            promptLength: detail.metadata.promptLength,
            createdAt: detail.metadata.createdAt,
            updatedAt: detail.metadata.updatedAt
          },
          datasetName
        });
        
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error('获取问题详情失败:', error);
      alert('获取问题详情失败');
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
    <div className="h-full p-6 flex flex-col overflow-hidden">
        {/* 页面头部区域 */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">问题生成</h1>
            <p className="text-gray-600 mt-1">从数据集片段生成训练问题</p>
            {/* 系统状态指示器 */}
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
          {/* 模型选择区域 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
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
          </div>
        </header>

        {/* 主内容区域 - 响应式布局：移动端垂直堆叠，桌面端左右分栏 */}
        <div className="mt-6 flex-1 flex flex-col 2xl:flex-row overflow-hidden">
          {/* 左侧面板：数据集选择和分段选择 */}
          <aside className="flex flex-col w-1/2 h-full overflow-hidden">
            {/* 数据集选择区域 */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">数据集选择</h3>
              
              <div className="space-y-4">
                {/* 项目选择 */}
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

                {/* 数据集选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择数据集
                  </label>
                  <div className="flex gap-3">
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
            </section>

            {/* 分段选择区域 */}
            {showSegments && (
              <section className="mt-6 flex-1 bg-white rounded-lg border border-gray-200 p-4 flex flex-col min-h-0 overflow-hidden">
                {/* 分段选择头部 */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    分段选择 ({selectedSegments.length}/{segments.length})
                  </h3>
                  {/* 分段操作按钮组 */}
                  <div className="flex items-center gap-2">
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
                
                {/* 分段列表 */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {segments.map((segment, index) => (
                    <article
                      key={index}
                      className={`border rounded-lg transition-colors ${
                        selectedSegments.includes(index)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => handleSegmentSelect(index)}
                      >
                        <div className="flex items-start gap-3">
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
                          {/* 分段状态和操作按钮 */}
                          <div className="flex items-center gap-2">
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
                    </article>
                  ))}
                </div>
              </section>
            )}
          </aside>

          {/* 右侧面板：生成配置和结果 */}
          <main className="flex-1 flex flex-col ml-6 h-full">
            {/* 生成配置区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiSettings className="mr-2 h-5 w-5" />
                  生成配置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  并发数: {concurrencyLimit[0]} | 重试: {enableRetry ? `启用(${maxRetries[0]}次)` : '禁用'}
                </div>

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
                    
                    <div className="text-sm text-gray-600">
                      总计生成 {generationSummary.questions.length} 个问题
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 生成结果区域 */}
            <section className="mt-6 bg-white rounded-lg border border-gray-200 p-4 flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">筛选数据集:</label>
                    <Select 
                      value={resultDatasetFilter} 
                      onValueChange={(value) => {
                        setResultDatasetFilter(value);
                        if (selectedProject) {
                          fetchQuestions(selectedProject, 1, value);
                          setCurrentPage(1);
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="全部数据集" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部数据集</SelectItem>
                        {datasets.map((dataset) => (
                          <SelectItem key={dataset.id} value={dataset.id.toString()}>
                            {dataset.name}
                            {dataset.id.toString() === selectedDataset && " (当前)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (selectedProject) {
                          fetchQuestions(selectedProject, currentPage, resultDatasetFilter);
                        }
                      }}
                      className="flex items-center"
                    >
                      <FiRefreshCw className="mr-1 h-3 w-3" />
                      刷新
                    </Button>
                  </div>
                  
                  <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <FiDownload className="mr-2 h-4 w-4" />
                    导出数据
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="py-8">
                  <Loading size="md" text="加载中..." />
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
                        <article
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm text-gray-500">
                                {getProjectName(question.projectId)} / {getDatasetName(question.datasetId)}
                              </div>
                              <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                数据集: {getDatasetName(question.datasetId)}
                              </div>
                            </div>
                            <div className="font-medium text-gray-900">
                              {question.generatedQuestion}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-gray-400">
                              生成时间: {new Date(question.createdAt).toLocaleString('zh-CN')}
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleViewQuestionDetail(question.id)}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                              >
                                <FiInfo className="inline mr-1 h-3 w-3" />
                                详情
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                      <div className="text-sm text-gray-600">
                        共 {totalQuestions} 条记录，第 {currentPage} / {totalPages} 页
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        >
                          <FiChevronLeft className="h-4 w-4" />
                          上一页
                        </Button>
                        
                        <div className="flex items-center gap-1">
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
            </section>
          </main>
        </div>

        {/* 问题详情对话框 */}
        <AlertDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">问题详情</AlertDialogTitle>
              <AlertDialogDescription className="text-base text-gray-700">
                {currentQuestionDetail?.datasetName && (
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      数据集: {currentQuestionDetail.datasetName}
                    </span>
                  </div>
                )}
                
                {currentQuestionDetail?.question && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">生成的问题:</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800">
                      {currentQuestionDetail.question}
                    </div>
                  </div>
                )}
                
                {currentQuestionDetail?.content && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">原始内容:</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 max-h-40 overflow-y-auto">
                      {currentQuestionDetail.content}
                    </div>
                  </div>
                )}
                
                {currentQuestionDetail?.prompt && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">使用的提示词:</h3>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-800 max-h-40 overflow-y-auto">
                      {currentQuestionDetail.prompt}
                    </div>
                  </div>
                )}
                
                {currentQuestionDetail?.metadata && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">元数据:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">内容长度:</span>
                        <span className="font-medium">{currentQuestionDetail.metadata.contentLength} 字符</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">问题长度:</span>
                        <span className="font-medium">{currentQuestionDetail.metadata.questionLength} 字符</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">提示词长度:</span>
                        <span className="font-medium">{currentQuestionDetail.metadata.promptLength} 字符</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">创建时间:</span>
                        <span className="font-medium">
                          {currentQuestionDetail.metadata.createdAt && 
                            new Date(currentQuestionDetail.metadata.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>关闭</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

                <div className="flex items-center gap-2">
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
