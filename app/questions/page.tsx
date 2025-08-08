'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiSettings, FiTrash2, FiCheck, FiList, FiFileText, FiInfo } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { datasetService, questionService, projectService } from '../lib/data-service';
import { Project, Dataset, Question } from '../types';

interface Segment {
  id: number;
  content: string;
  segmentId: string;
}

export default function QuestionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [prompt, setPrompt] = useState('请基于以下内容生成一个问题：\n\n{content}');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);

  // AI模型选项配置
  const modelOptions = [
    {
      value: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      description: '快速响应，适合日常问答'
    },
    {
      value: 'gpt-4',
      label: 'GPT-4',
      description: '更强推理能力，适合复杂问题'
    },
    {
      value: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      description: '平衡性能与成本'
    },
    {
      value: 'claude-3-haiku',
      label: 'Claude 3 Haiku',
      description: '快速轻量，适合简单任务'
    },
    {
      value: 'claude-3-sonnet',
      label: 'Claude 3 Sonnet',
      description: '平衡性能，适合多数场景'
    },
    {
      value: 'claude-3-opus',
      label: 'Claude 3 Opus',
      description: '最强性能，适合复杂推理'
    }
  ];

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
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const datasets = datasetService.getAll(parseInt(projectId));
      setDatasets(datasets);
    } catch (error) {
      console.error('获取数据集列表失败:', error);
    }
  };

  // 获取分段列表 - 使用模拟数据
  const fetchSegments = async (datasetId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataset = datasetService.getById(parseInt(datasetId));
      if (dataset && dataset.content) {
        const delimiter = dataset.segmentDelimiter || '\n\n';
        const segmentTexts = dataset.content.split(delimiter).filter(s => s.trim().length > 0);
        
        const segments = segmentTexts.map((content, index) => ({
          id: index,
          content: content.trim(),
          segmentId: `segment-${index + 1}`
        }));
        
        setSegments(segments);
      } else {
        setSegments([]);
      }
    } catch (error) {
      console.error('获取分段列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取问题列表 - 使用模拟数据
  const fetchQuestions = async (projectId?: string, datasetId?: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let questions = questionService.getAll();
      
      if (projectId) {
        questions = questions.filter(q => q.projectId === parseInt(projectId));
      }
      if (datasetId) {
        questions = questions.filter(q => q.datasetId === parseInt(datasetId));
      }
      
      setQuestions(questions);
    } catch (error) {
      console.error('获取问题列表失败:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchDatasets(selectedProject);
      setSelectedDataset('');
      setSegments([]);
      setQuestions([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedDataset) {
      fetchSegments(selectedDataset);
      fetchQuestions(selectedProject, selectedDataset);
    }
  }, [selectedProject, selectedDataset]);

  // 生成问题 - 使用模拟生成器
  const handleGenerateQuestions = async () => {
    if (selectedSegments.length === 0 || !prompt.trim()) {
      setSuccessMessage('请选择分段并输入提示词');
      setShowSuccessDialog(true);
      return;
    }

    try {
      setGenerating(true);
      setGeneratingProgress({ current: 0, total: selectedSegments.length });
      
      let successCount = 0;
      
      for (let i = 0; i < selectedSegments.length; i++) {
        const segmentId = selectedSegments[i];
        const segment = segments.find(s => s.id === segmentId);
        
        if (segment) {
          // 更新进度
          setGeneratingProgress({ current: i + 1, total: selectedSegments.length });
          
          // 模拟异步生成延迟
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
          
          // 模拟生成成功率（90%）
          const isSuccess = Math.random() > 0.1;
          
          if (isSuccess) {
            // 根据选择的模型生成不同风格的问题
            const getModelSpecificQuestion = (model: string, content: string) => {
              const contentPreview = content.substring(0, 20);
              const baseQuestions = {
                'gpt-3.5-turbo': [
                  `关于"${contentPreview}..."的核心观点是什么？`,
                  `请解释"${contentPreview}..."中提到的主要概念。`,
                  `根据内容分析，${contentPreview}...的重要性体现在哪里？`
                ],
                'gpt-4': [
                  `请深入分析"${contentPreview}..."中体现的深层逻辑关系。`,
                  `从多个维度评价"${contentPreview}..."的理论价值和实践意义。`,
                  `如何批判性地理解"${contentPreview}..."所阐述的观点？`
                ],
                'gpt-4-turbo': [
                  `请高效分析"${contentPreview}..."的关键信息和核心要点。`,
                  `如何平衡理解"${contentPreview}..."的理论深度与实用性？`,
                  `从成本效益角度，"${contentPreview}..."的价值体现在哪里？`
                ],
                'claude-3-haiku': [
                  `简述"${contentPreview}..."的要点。`,
                  `"${contentPreview}..."的主要内容是什么？`,
                  `请概括"${contentPreview}..."的核心信息。`
                ],
                'claude-3-sonnet': [
                  `请平衡分析"${contentPreview}..."的各个方面。`,
                  `如何全面理解"${contentPreview}..."的内容和意义？`,
                  `从多角度解读"${contentPreview}..."的价值。`
                ],
                'claude-3-opus': [
                  `请进行深度哲学思考："${contentPreview}..."体现了什么本质规律？`,
                  `从认知科学角度，"${contentPreview}..."揭示了哪些深层机制？`,
                  `如何从系统性思维理解"${contentPreview}..."的复杂内涵？`
                ]
              };
              
              const modelQuestions = baseQuestions[model as keyof typeof baseQuestions] || baseQuestions['gpt-3.5-turbo'];
              return modelQuestions[Math.floor(Math.random() * modelQuestions.length)];
            };
            
            const generatedQuestion = getModelSpecificQuestion(selectedModel, segment.content);
            const processedPrompt = prompt.replace('{content}', segment.content);
            
            // 创建新问题
            const newQuestion = questionService.create({
              uid: `q_${Date.now()}`,
              projectId: parseInt(selectedProject),
              datasetId: parseInt(selectedDataset),
              segmentId: segment.id,
              generatedQuestion: generatedQuestion,
              prompt: processedPrompt,
              type: 'generated',
              status: 'approved',
              usageCount: 0,
              sources: [`AI模型: ${modelOptions.find(m => m.value === selectedModel)?.label || selectedModel}`],
              updatedAt: new Date().toISOString()
            });
            
            successCount++;
          }
        }
      }
      
      setGeneratingProgress({ current: selectedSegments.length, total: selectedSegments.length });
      setSuccessMessage(`成功生成 ${successCount} 个问题！`);
      setShowSuccessDialog(true);
      
      await fetchQuestions(selectedProject, selectedDataset); // 重新获取问题列表
      setSelectedSegments([]); // 清空选择
      
    } catch (error) {
      console.error('生成问题失败:', error);
      setSuccessMessage('生成问题失败');
      setShowSuccessDialog(true);
    } finally {
      setGenerating(false);
      setGeneratingProgress({ current: 0, total: 0 });
    }
  };

  // 删除问题 - 使用模拟数据
  const handleDeleteQuestion = (questionId: number) => {
    setDeleteQuestionId(questionId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!deleteQuestionId) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = questionService.delete(deleteQuestionId);
      
      if (success) {
        await fetchQuestions(selectedProject, selectedDataset); // 重新获取问题列表
        setSuccessMessage('问题删除成功');
        setShowSuccessDialog(true);
      } else {
        setSuccessMessage('删除失败: 问题不存在');
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('删除问题失败:', error);
      setSuccessMessage('删除问题失败');
      setShowSuccessDialog(true);
    } finally {
      setDeleteQuestionId(null);
      setShowDeleteDialog(false);
    }
  };

  // 切换分段选择
  const toggleSegmentSelection = (segmentId: number) => {
    setSelectedSegments(prev => 
      prev.includes(segmentId) 
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSegments.length === segments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(segments.map(s => s.id));
    }
  };

  // 获取项目名称
  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || '未知项目';
  };

  // 获取数据集名称
  const getDatasetName = (datasetId: number) => {
    const dataset = datasets.find(d => d.id === datasetId);
    return dataset?.name || '未知数据集';
  };

  return (
    <>
      <div className="h-full p-6 overflow-hidden flex flex-col gap-6">
        {/* 页面头部区域 */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">问题生成</h1>
            <p className="text-gray-600 mt-1">基于数据集内容生成相关问题</p>
          </div>
          {/* 页面操作按钮组 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
            {/* AI模型选择器 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">AI模型:</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 md:w-52">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent className="w-64">
                  {modelOptions.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="py-1">
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500 leading-tight">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowPromptModal(true)}
              variant="outline"
              className="flex items-center"
            >
              <FiSettings className="mr-2 h-4 w-4" />
              提示词配置
            </Button>
            <Button
              variant="secondary"
              className="flex items-center"
            >
              导出问题
            </Button>
          </div>
        </header>

        {/* 主内容区域 - 响应式布局：移动端垂直堆叠，桌面端左右分栏 */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          {/* 左侧面板：项目选择和分段列表 */}
          <aside className="flex flex-col w-full lg:w-1/3">
            {/* 项目和数据集选择区域 */}
            <section className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">项目和数据集选择</h3>              
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
                {selectedProject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择数据集
                    </label>
                    <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                      <SelectTrigger className="w-full">
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
                  </div>
                )}
              </div>
            </section>

            {/* 分段列表区域 */}
            {selectedProject && selectedDataset && (
              <section className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* 分段列表头部 */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center">
                    <FiList className="mr-2 h-4 w-4 text-blue-500" />
                    <h4 className="text-md font-semibold text-gray-900">分段列表</h4>
                  </div>
                  {/* 全选按钮 */}
                  <Button
                    onClick={toggleSelectAll}
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                  >
                    {selectedSegments.length === segments.length ? '取消全选' : '全选'}
                  </Button>
                </div>

                {/* 分段列表内容 */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm text-gray-600">加载中...</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                    {segments.length === 0 ? (
                      <div className="text-center py-8 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">该数据集暂无分段数据</p>
                      </div>
                    ) : (
                      segments.map((segment) => (
                        <article
                          key={segment.id}
                          className={`border rounded-lg p-3 text-sm transition-colors shadow-sm ${
                            selectedSegments.includes(segment.id) ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedSegments.includes(segment.id)}
                              onCheckedChange={() => toggleSegmentSelection(segment.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium mb-1 text-xs text-gray-500">
                                {segment.segmentId}
                              </div>
                              <div className="line-clamp-3">
                                {segment.content}
                              </div>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </section>
            )}
          </aside>

          {/* 右侧面板：问题列表和管理 */}
          <main className="flex flex-col w-full lg:flex-1 min-h-0">
            {/* 问题管理区域 */}
            <section className="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* 问题管理头部 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">问题列表</h3>
                  <p className="text-sm text-gray-600 mt-1">查看和管理已生成的问题</p>
                </div>
                {/* 生成问题按钮 */}
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={generating || selectedSegments.length === 0}
                  className="flex items-center"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      生成中...
                    </>
                  ) : (
                    <>
                      <FiPlay className="mr-2 h-4 w-4" />
                      生成问题 {selectedSegments.length > 0 && `(${selectedSegments.length})`}
                    </>
                  )}
                </Button>
              </div>

              {/* 问题列表内容 */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto">
                {/* 生成进度指示器 */}
                {generating && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">正在生成问题...</span>
                      <span className="text-sm text-blue-700">{generatingProgress.current} / {generatingProgress.total}</span>
                    </div>
                    <Progress 
                      value={generatingProgress.total > 0 ? (generatingProgress.current / generatingProgress.total) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                )}

                {/* 问题列表或空状态 */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">加载中...</span>
                  </div>
                ) : (
                  <div className="space-y-4 flex-1 min-h-0 pr-2">
                    {!selectedProject ? (
                      <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">请先选择项目</p>
                        <p className="text-sm text-gray-400 mt-1">从左侧选择一个项目开始</p>
                      </div>
                    ) : !selectedDataset ? (
                      <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">请选择数据集</p>
                        <p className="text-sm text-gray-400 mt-1">从左侧选择一个数据集继续</p>
                      </div>
                    ) : questions.length === 0 ? (
                      <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">该数据集暂无问题数据</p>
                        <p className="text-sm text-gray-400 mt-1">请先选择分段并生成问题</p>
                      </div>
                    ) : (
                      questions.map((question) => (
                        <article
                          key={question.id}
                          className="border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md"
                        >
                          {/* 问题信息区域 */}
                          <div className="flex items-start justify-between p-4">
                            <div className="flex-1">
                              {/* 项目和数据集标签 */}
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs font-normal">
                                  {getProjectName(question.projectId)} / {getDatasetName(question.datasetId)}
                                </Badge>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <FiCheck className="mr-1 h-3 w-3" />
                                  已生成
                                </Badge>
                                {/* 显示使用的AI模型 */}
                                {question.sources && question.sources.length > 0 && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    {question.sources[0]}
                                  </Badge>
                                )}
                              </div>
                              {/* 问题内容 */}
                              <div className="font-medium text-gray-900 mb-2">
                                {question.generatedQuestion}
                              </div>
                            </div>
                            
                            {/* 删除按钮 */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 -mr-2 -mt-2"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          {/* 时间信息区域 */}
                          <footer className="border-t bg-gray-50 py-2 px-4 text-xs text-gray-500">
                            生成时间: {new Date(question.createdAt).toLocaleString('zh-CN')}
                            <span className="ml-4">
                              分段ID: segment-{question.segmentId + 1}
                            </span>
                          </footer>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* 提示词配置弹框 */}
        <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>问题提示词配置</DialogTitle>
              <DialogDescription>
                配置生成问题时使用的提示词模板
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt-template">提示词模板</Label>
                <Textarea
                  id="prompt-template"
                  className="mt-2 min-h-[160px] resize-none"
                  placeholder="请输入问题生成的提示词模板..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <FiInfo className="mr-2 h-4 w-4" />
                支持使用 <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">{'{content}'}</code> 作为内容占位符
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPromptModal(false)}
              >
                取消
              </Button>
              <Button
                onClick={() => setShowPromptModal(false)}
              >
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 成功提示对话框 */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>操作成功</AlertDialogTitle>
            <AlertDialogDescription>
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这个问题吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteQuestion}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
