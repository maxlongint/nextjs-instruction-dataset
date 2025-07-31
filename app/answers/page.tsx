'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiSettings, FiDownload, FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectService, datasetService, questionService, answerService } from '../lib/data-service';
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
  const [prompt, setPrompt] = useState('请基于以下问题提供详细的答案：\n\n{question}');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState({ current: 0, total: 0 });

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
      alert('请选择问题并输入提示词');
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
          
          // 生成模拟答案
          const mockAnswers = [
            `根据问题"${question.generatedQuestion}"，我认为这个问题涉及到多个重要方面。首先，我们需要理解问题的核心概念和背景。其次，需要分析相关的理论基础和实践应用。最后，结合具体情况给出合理的解释和建议。`,
            `对于"${question.generatedQuestion}"这个问题，可以从以下几个角度来分析：1）理论层面的解释；2）实际应用中的表现；3）可能存在的问题和解决方案。通过综合分析，我们可以得出较为全面的答案。`,
            `这是一个很好的问题。"${question.generatedQuestion}"涉及到的知识点比较广泛，需要我们从多个维度来思考。基于相关理论和实践经验，我认为关键在于理解其本质特征和运作机制。`,
            `针对"${question.generatedQuestion}"，我的理解是这样的：首先需要明确问题的定义和范围，然后分析其重要性和影响因素，最后提出相应的观点和建议。这样可以确保答案的完整性和准确性。`,
            `关于"${question.generatedQuestion}"这个问题，我认为需要从系统性的角度来回答。通过分析问题的各个组成部分及其相互关系，我们可以更好地理解问题的本质，并给出有价值的见解。`
          ];
          
          const generatedAnswer = mockAnswers[Math.floor(Math.random() * mockAnswers.length)];
          const processedPrompt = prompt.replace('{question}', question.generatedQuestion);
          
          // 创建新答案
          answerService.create({
            questionId: questionId,
            prompt: processedPrompt,
            generatedAnswer: generatedAnswer
          });
          
          successCount++;
        }
      }
      
      setGeneratingProgress({ current: selectedQuestions.length, total: selectedQuestions.length });
      alert(`成功生成 ${successCount} 个答案！`);
      
      await fetchAnswers(); // 重新获取答案列表
      await fetchQuestions(selectedProject, selectedDataset); // 重新获取问题列表
      setSelectedQuestions([]); // 清空选择
      
    } catch (error) {
      console.error('生成答案失败:', error);
      alert('生成答案失败');
    } finally {
      setGenerating(false);
      setGeneratingProgress({ current: 0, total: 0 });
    }
  };

  // 删除答案 - 使用模拟数据
  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('确定要删除这个答案吗？')) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const success = answerService.delete(answerId);
      
      if (success) {
        await fetchAnswers(); // 重新获取答案列表
        alert('答案删除成功');
      } else {
        alert('删除失败: 答案不存在');
      }
    } catch (error) {
      console.error('删除答案失败:', error);
      alert('删除答案失败');
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
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">答案生成</h1>
          <p className="text-gray-600 mt-1">为生成的问题创建对应答案</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowPromptModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiSettings className="mr-2 h-4 w-4" />
            提示词配置
          </button>
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <FiDownload className="mr-2 h-4 w-4" />
            导出问答对
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：项目和数据集选择 + 问题列表 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">项目和数据集选择</h3>
          
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

          {/* 问题列表 */}
          {selectedProject && selectedDataset && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">问题列表</h4>
                <button 
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {selectedQuestions.length === questionsWithAnswers.filter(q => !q.answer).length ? '取消全选' : '全选'}
                </button>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">加载中...</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {questionsWithAnswers.length === 0 ? (
                    <div className="text-center py-4 text-sm text-gray-500">
                      该数据集暂无问题数据
                    </div>
                  ) : (
                    questionsWithAnswers.map((item) => (
                      <div
                        key={item.id}
                        className={`border border-gray-200 rounded p-3 text-sm transition-colors ${
                          item.answer ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {!item.answer && (
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(item.id)}
                              onChange={() => toggleQuestionSelection(item.id)}
                              className="mt-0.5 h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {item.generatedQuestion}
                            </div>
                            {item.answer && (
                              <div className="mt-1 text-xs text-green-600">
                                ✓ 已生成答案
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧：答案列表和结果 */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">答案列表</h3>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleGenerateAnswers}
                disabled={generating || selectedQuestions.length === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <FiPlay className="mr-2 h-4 w-4" />
                    生成答案 ({selectedQuestions.length})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 生成进度 */}
          {generating && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">正在生成答案...</span>
                <span className="text-sm text-blue-700">{generatingProgress.current} / {generatingProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${generatingProgress.total > 0 ? (generatingProgress.current / generatingProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {!selectedProject ? (
                <div className="text-center py-8 text-gray-500">
                  请先选择项目
                </div>
              ) : !selectedDataset ? (
                <div className="text-center py-8 text-gray-500">
                  请选择数据集
                </div>
              ) : questionsWithAnswers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  该数据集暂无问题数据
                </div>
              ) : (
                questionsWithAnswers.map((item) => (
                  <div
                    key={item.id}
                    className={`border border-gray-200 rounded-lg p-4 transition-colors ${
                      item.answer ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3 flex-1">
                        {!item.answer && (
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(item.id)}
                            onChange={() => toggleQuestionSelection(item.id)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">
                            {getProjectName(item.projectId)} / {getDatasetName(item.datasetId)}
                          </div>
                          <div className="font-medium text-gray-900 mb-2">
                            {item.generatedQuestion}
                          </div>
                          {item.answer && (
                            <div className="bg-white rounded p-3 border border-green-200">
                              <div className="text-sm text-gray-600 mb-1">答案:</div>
                              <div className="text-gray-800">{item.answer.generatedAnswer}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {item.answer ? (
                          <>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              <FiCheck className="inline h-3 w-3 mr-1" />
                              已答案
                            </span>
                            <button 
                              onClick={() => handleDeleteAnswer(item.answer!.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            待答案
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      问题生成时间: {new Date(item.createdAt).toLocaleString('zh-CN')}
                      {item.answer && (
                        <span className="ml-4">
                          答案生成时间: {new Date(item.answer.createdAt).toLocaleString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 提示词配置弹框 */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">答案提示词配置</h3>
              <button 
                onClick={() => setShowPromptModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <textarea
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="请输入答案生成的提示词模板..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                支持使用 {'{question}'} 作为问题占位符
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => setShowPromptModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}