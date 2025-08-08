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
import { datasetService, questionService, answerService, projectService } from '../lib/data-service';
import { Project, Dataset, Question, Answer } from '../types';

interface QuestionWithAnswer extends Question {
  answer?: Answer;
}

export default function AnswersPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDataset, setSelectedDataset] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [prompt, setPrompt] = useState('请基于以下问题提供详细的答案：\n\n{question}');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteAnswerId, setDeleteAnswerId] = useState<number | null>(null);

  // 可用的AI模型列表
  const availableModels = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: '快速响应，适合日常问答' },
    { value: 'gpt-4', label: 'GPT-4', description: '更强推理能力，适合复杂问题' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', description: '平衡性能与成本' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', description: '快速轻量，适合简单任务' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet', description: '平衡性能，适合多数场景' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', description: '最强性能，适合复杂推理' }
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

  // 获取问题列表 - 使用模拟数据
  const fetchQuestions = async (projectId?: string, datasetId?: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } finally {
      setLoading(false);
    }
  };

  // 获取答案列表 - 使用模拟数据
  const fetchAnswers = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const answers = answerService.getAll();
      setAnswers(answers);
    } catch (error) {
      console.error('获取答案列表失败:', error);
    }
  };

  // 合并问题和答案数据
  const mergeQuestionsAndAnswers = () => {
    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      console.error('合并问题和答案失败: questions或answers不是数组', { questions, answers });
      setQuestionsWithAnswers([]);
      return;
    }
    
    const merged = questions.map(question => {
      const answer = answers.find(a => a.questionId === question.id);
      return {
        ...question,
        answer
      };
    });
    setQuestionsWithAnswers(merged);
  };

  useEffect(() => {
    fetchProjects();
    fetchAnswers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchDatasets(selectedProject);
      setSelectedDataset('');
      setQuestions([]);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedDataset) {
      fetchQuestions(selectedProject, selectedDataset);
    }
  }, [selectedProject, selectedDataset]);

  useEffect(() => {
    mergeQuestionsAndAnswers();
  }, [questions, answers]);

  // 生成答案 - 使用模拟生成器
  const handleGenerateAnswers = async () => {
    if (selectedQuestions.length === 0 || !prompt.trim()) {
      setSuccessMessage('请选择问题并输入提示词');
      setShowSuccessDialog(true);
      return;
    }

    try {
      setGenerating(true);
      setGeneratingProgress({ current: 0, total: selectedQuestions.length });
      
      let successCount = 0;
      
      for (let i = 0; i < selectedQuestions.length; i++) {
        const questionId = selectedQuestions[i];
        const question = questions.find(q => q.id === questionId);
        
        if (question) {
          // 更新进度
          setGeneratingProgress({ current: i + 1, total: selectedQuestions.length });
          
          // 模拟异步生成延迟
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
          
          // 根据选择的模型生成不同风格的答案
          const getModelSpecificAnswer = (model: string, question: string) => {
            const baseAnswers = {
              'gpt-3.5-turbo': [
                `根据问题"${question}"，我认为这个问题涉及到多个重要方面。首先，我们需要理解问题的核心概念和背景。其次，需要分析相关的理论基础和实践应用。最后，结合具体情况给出合理的解释和建议。`,
                `对于"${question}"这个问题，可以从以下几个角度来分析：1）理论层面的解释；2）实际应用中的表现；3）可能存在的问题和解决方案。通过综合分析，我们可以得出较为全面的答案。`
              ],
              'gpt-4': [
                `这是一个深度问题："${question}"。让我从多个维度进行详细分析：\n\n1. 概念解析：首先需要明确核心概念的定义和内涵\n2. 理论基础：分析相关的理论框架和学术观点\n3. 实践应用：探讨在实际场景中的应用和表现\n4. 批判思考：评估可能存在的局限性和改进空间\n\n综合以上分析，我认为这个问题的关键在于...`,
                `针对"${question}"这个复杂问题，我将采用系统性思维进行深入分析。通过梳理问题的多个层面和相互关系，我们可以构建一个更加完整和准确的理解框架。`
              ],
              'gpt-4-turbo': [
                `关于"${question}"，这是一个需要平衡多个因素的问题。基于当前的理论研究和实践经验，我认为可以从效率、准确性和可行性三个维度来分析。通过优化这些关键要素，我们能够找到最佳的解决方案。`,
                `"${question}"涉及到复杂的系统性思考。让我从成本效益、技术可行性和长期影响等角度进行综合评估，以提供一个既实用又前瞻的答案。`
              ],
              'claude-3-haiku': [
                `简洁回答"${question}"：这个问题的核心在于理解基本概念和应用场景。通过分析关键要素，我们可以得出实用的结论和建议。`,
                `对于"${question}"，我的观点是：重点关注实际应用价值，结合具体情况制定合适的策略。`
              ],
              'claude-3-sonnet': [
                `关于"${question}"这个问题，我认为需要从平衡的角度来思考。一方面要考虑理论的严谨性，另一方面要注重实践的可操作性。通过综合分析各种因素，我们可以找到一个既符合理论要求又具有实际价值的答案。`,
                `"${question}"是一个值得深入探讨的问题。基于我的理解，这个问题涉及多个相互关联的要素。通过系统性的分析和评估，我们可以得出更加全面和准确的结论。`
              ],
              'claude-3-opus': [
                `这是一个极具挑战性的问题："${question}"。让我从哲学、实践和未来发展三个层面进行深度剖析：\n\n**哲学层面**：探讨问题的本质和深层含义\n**实践层面**：分析当前的应用状况和效果\n**未来发展**：预测可能的发展趋势和影响\n\n通过这种多维度的分析框架，我们可以获得对这个问题更加深刻和全面的理解。`,
                `"${question}"代表了一个复杂的认知挑战。基于深度学习和推理能力，我将从多个角度进行细致的分析，包括历史背景、现状评估、问题识别、解决方案设计和未来展望等方面。`
              ]
            };
            
            const modelAnswers = baseAnswers[model as keyof typeof baseAnswers] || baseAnswers['gpt-3.5-turbo'];
            return modelAnswers[Math.floor(Math.random() * modelAnswers.length)];
          };
          
          const generatedAnswer = getModelSpecificAnswer(selectedModel, question.generatedQuestion);
          const processedPrompt = prompt.replace('{question}', question.generatedQuestion);
          
          // 创建新答案
          answerService.create({
            questionId: questionId,
            prompt: processedPrompt,
            generatedAnswer: generatedAnswer,
            type: 'generated',
            status: 'approved',
            usageCount: 0,
            sources: [`AI模型: ${availableModels.find(m => m.value === selectedModel)?.label || selectedModel}`],
            updatedAt: new Date().toISOString()
          });
          
          successCount++;
        }
      }
      
      setGeneratingProgress({ current: selectedQuestions.length, total: selectedQuestions.length });
      setSuccessMessage(`成功生成 ${successCount} 个答案！`);
      setShowSuccessDialog(true);
      
      await fetchAnswers(); // 重新获取答案列表
      await fetchQuestions(selectedProject, selectedDataset); // 重新获取问题列表
      setSelectedQuestions([]); // 清空选择
      
    } catch (error) {
      console.error('生成答案失败:', error);
      setSuccessMessage('生成答案失败');
      setShowSuccessDialog(true);
    } finally {
      setGenerating(false);
      setGeneratingProgress({ current: 0, total: 0 });
    }
  };

  // 删除答案 - 使用模拟数据
  const handleDeleteAnswer = (answerId: number) => {
    setDeleteAnswerId(answerId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAnswer = async () => {
    if (!deleteAnswerId) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = answerService.delete(deleteAnswerId);
      
      if (success) {
        await fetchAnswers(); // 重新获取答案列表
        setSuccessMessage('答案删除成功');
        setShowSuccessDialog(true);
      } else {
        setSuccessMessage('删除失败: 答案不存在');
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error('删除答案失败:', error);
      setSuccessMessage('删除答案失败');
      setShowSuccessDialog(true);
    } finally {
      setDeleteAnswerId(null);
      setShowDeleteDialog(false);
    }
  };

  // 切换问题选择
  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const unansweredQuestions = questionsWithAnswers.filter(q => !q.answer);
    if (selectedQuestions.length === unansweredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(unansweredQuestions.map(q => q.id));
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">答案生成</h1>
            <p className="text-gray-600 mt-1">为生成的问题创建对应答案</p>
          </div>
          {/* 页面操作按钮组 */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
            {/* 模型选择器 */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                AI模型:
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 md:w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-64">
                  {availableModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500 leading-tight">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
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
                导出问答对
              </Button>
            </div>
          </div>
        </header>

        {/* 主内容区域 - 响应式布局：移动端垂直堆叠，桌面端左右分栏 */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
          {/* 左侧面板：项目选择和问题列表 */}
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

            {/* 问题列表区域 */}
            {selectedProject && selectedDataset && (
              <section className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* 问题列表头部 */}
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div className="flex items-center">
                    <FiList className="mr-2 h-4 w-4 text-blue-500" />
                    <h4 className="text-md font-semibold text-gray-900">问题列表</h4>
                  </div>
                  {/* 全选按钮 */}
                  <Button
                    onClick={toggleSelectAll}
                    variant="ghost"
                    size="sm"
                    className="text-sm"
                  >
                    {selectedQuestions.length === questionsWithAnswers.filter(q => !q.answer).length ? '取消全选' : '全选'}
                  </Button>
                </div>

                {/* 问题列表内容 */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm text-gray-600">加载中...</span>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                    {questionsWithAnswers.length === 0 ? (
                      <div className="text-center py-8 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">该数据集暂无问题数据</p>
                      </div>
                    ) : (
                      questionsWithAnswers.map((item) => (
                        <article
                          key={item.id}
                          className={`border rounded-lg p-3 text-sm transition-colors shadow-sm ${
                            item.answer ? 'bg-green-50 border-green-200 hover:bg-green-100' : 'bg-white hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!item.answer && (
                              <Checkbox
                                checked={selectedQuestions.includes(item.id)}
                                onCheckedChange={() => toggleQuestionSelection(item.id)}
                                className="mt-0.5"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium line-clamp-2">
                                {item.generatedQuestion}
                              </div>
                              {item.answer && (
                                <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                                  <FiCheck className="mr-1 h-3 w-3" />
                                  已生成答案
                                </Badge>
                              )}
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

          {/* 右侧面板：答案列表和管理 */}
          <main className="flex flex-col w-full lg:flex-1 min-h-0">
            {/* 答案管理区域 */}
            <section className="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* 答案管理头部 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">答案列表</h3>
                  <p className="text-sm text-gray-600 mt-1">查看和管理已生成的答案</p>
                </div>
                {/* 生成答案按钮 */}
                <Button
                  onClick={handleGenerateAnswers}
                  disabled={generating || selectedQuestions.length === 0}
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
                      生成答案 {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}
                    </>
                  )}
                </Button>
              </div>

              {/* 答案列表内容 */}
              <div className="flex-1 min-h-0 p-4 overflow-y-auto">
                {/* 生成进度指示器 */}
                {generating && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">正在生成答案...</span>
                      <span className="text-sm text-blue-700">{generatingProgress.current} / {generatingProgress.total}</span>
                    </div>
                    <Progress 
                      value={generatingProgress.total > 0 ? (generatingProgress.current / generatingProgress.total) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                )}

                {/* 答案列表或空状态 */}
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
                    ) : questionsWithAnswers.length === 0 ? (
                      <div className="text-center py-12 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                        <FiFileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-gray-500 font-medium">该数据集暂无问题数据</p>
                        <p className="text-sm text-gray-400 mt-1">请先生成问题或选择其他数据集</p>
                      </div>
                    ) : (
                      questionsWithAnswers.map((item) => (
                        <article
                          key={item.id}
                          className={`border rounded-lg shadow-sm overflow-hidden transition-all ${
                            item.answer ? 'border-green-200' : 'border-gray-200'
                          }`}
                        >
                          {/* 问题信息区域 */}
                          <div className="flex items-start p-4 pb-3">
                            <div className="flex items-start gap-3 flex-1">
                              {!item.answer && (
                                <Checkbox
                                  checked={selectedQuestions.includes(item.id)}
                                  onCheckedChange={() => toggleQuestionSelection(item.id)}
                                  className="mt-1"
                                />
                              )}
                              <div className="flex-1">
                                {/* 项目和数据集标签 */}
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {getProjectName(item.projectId)} / {getDatasetName(item.datasetId)}
                                  </Badge>
                                  {item.answer ? (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                      <FiCheck className="mr-1 h-3 w-3" />
                                      已生成答案
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                      待生成
                                    </Badge>
                                  )}
                                </div>
                                {/* 问题内容 */}
                                <div className="font-medium mb-2 text-gray-900">
                                  {item.generatedQuestion}
                                </div>
                              </div>
                            </div>
                            
                            {/* 删除按钮 */}
                            {item.answer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAnswer(item.answer!.id)}
                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 -mr-2 -mt-2"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          {/* 答案内容区域 */}
                          {item.answer && (
                            <div className="px-4 pb-4">
                              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm text-gray-600 font-medium">答案:</div>
                                  {item.answer.sources && item.answer.sources.length > 0 && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {item.answer.sources[0]}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-gray-800">{item.answer.generatedAnswer}</div>
                              </div>
                            </div>
                          )}
                          
                          {/* 时间信息区域 */}
                          <footer className="border-t bg-gray-50 py-2 px-4 text-xs text-gray-500">
                            问题生成时间: {new Date(item.createdAt).toLocaleString('zh-CN')}
                            {item.answer && (
                              <span className="ml-4">
                                答案生成时间: {new Date(item.answer.createdAt).toLocaleString('zh-CN')}
                              </span>
                            )}
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
              <DialogTitle>答案提示词配置</DialogTitle>
              <DialogDescription>
                配置生成答案时使用的提示词模板
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt-template">提示词模板</Label>
                <Textarea
                  id="prompt-template"
                  className="mt-2 min-h-[160px] resize-none"
                  placeholder="请输入答案生成的提示词模板..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <FiInfo className="mr-2 h-4 w-4" />
                支持使用 <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded">{'{question}'}</code> 作为问题占位符
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
              确定要删除这个答案吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAnswer}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}