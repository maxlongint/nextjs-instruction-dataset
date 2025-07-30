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

interface Project {
  id: number;
  name: string;
  description: string | null;
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

interface Answer {
  id: number;
  questionId: number;
  prompt: string;
  generatedAnswer: string;
  createdAt: string;
}

interface QuestionWithAnswer extends Question {
  answer?: Answer;
}

export default function AnswersPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionsWithAnswers, setQuestionsWithAnswers] = useState<QuestionWithAnswer[]>([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [prompt, setPrompt] = useState('请基于以下问题提供详细的答案：\n\n{question}');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  // 获取问题列表
  const fetchQuestions = async (projectId?: string) => {
    try {
      setLoading(true);
      const url = projectId 
        ? `/api/questions?projectId=${projectId}`
        : '/api/questions?projectId=1';
      
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error('获取问题列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取答案列表
  const fetchAnswers = async () => {
    try {
      const response = await fetch('/api/answers');
      const result = await response.json();
      if (result.success) {
        setAnswers(result.data);
      }
    } catch (error) {
      console.error('获取答案列表失败:', error);
    }
  };

  // 合并问题和答案数据
  const mergeQuestionsAndAnswers = () => {
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
    fetchQuestions();
    fetchAnswers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchQuestions(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    mergeQuestionsAndAnswers();
  }, [questions, answers]);

  // 生成答案
  const handleGenerateAnswers = async () => {
    if (selectedQuestions.length === 0 || !prompt.trim()) {
      alert('请选择问题并输入提示词');
      return;
    }

    try {
      setGenerating(true);
      
      const response = await fetch('/api/answers/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
          prompt: prompt.trim(),
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`成功生成 ${result.data.total} 个答案！`);
        await fetchAnswers(); // 重新获取答案列表
        await fetchQuestions(selectedProject); // 重新获取问题列表
        setSelectedQuestions([]); // 清空选择
      } else {
        alert('生成答案失败: ' + result.error);
      }
    } catch (error) {
      console.error('生成答案失败:', error);
      alert('生成答案失败');
    } finally {
      setGenerating(false);
    }
  };

  // 删除答案
  const handleDeleteAnswer = async (answerId: number) => {
    if (!confirm('确定要删除这个答案吗？')) return;

    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchAnswers(); // 重新获取答案列表
      } else {
        alert('删除失败: ' + result.error);
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

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">答案生成</h1>
          <p className="text-gray-600 mt-1">为生成的问题创建对应答案</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <FiDownload className="mr-2 h-4 w-4" />
          导出问答对
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：问题选择和提示词配置 */}
        <div className="space-y-6">
          {/* 项目选择 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">项目选择</h3>
            
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
          </div>

          {/* 提示词配置 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">答案提示词配置</h3>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <FiSettings className="h-4 w-4" />
              </button>
            </div>
            
            <textarea
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="请输入答案生成的提示词模板..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                支持使用 {'{question}'} 作为问题占位符
              </div>
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
        </div>

        {/* 右侧：问题列表和答案结果 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">问题列表</h3>
            <button 
              onClick={toggleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {selectedQuestions.length === questionsWithAnswers.filter(q => !q.answer).length ? '取消全选' : '全选'}
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">加载中...</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questionsWithAnswers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无问题数据
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
                            {getProjectName(item.projectId)}
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
    </div>
  );
}