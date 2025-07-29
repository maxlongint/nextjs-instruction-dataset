'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiSettings, FiDownload, FiEdit, FiTrash2 } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import PromptSettingsModal from '../components/questions/prompt-settings-modal';

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
  const fetchQuestions = async (projectId?: string) => {
    try {
      setLoading(true);
      const url = projectId 
        ? `/api/questions?projectId=${projectId}`
        : '/api/questions?projectId=1'; // 默认获取第一个项目的问题
      
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

  useEffect(() => {
    fetchProjects();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      resetSelections(); // 重置数据集和分段选择
      fetchDatasets(selectedProject);
      fetchQuestions(selectedProject);
    }
  }, [selectedProject]);

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
  };

  // 全选/取消全选分段
  const handleSelectAllSegments = () => {
    if (selectedSegments.length === segments.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(segments.map((_, index) => index));
    }
  };

  // 生成问题
  const handleGenerateQuestions = async () => {
    if (!selectedProject || !selectedDataset || !prompt.trim()) {
      alert('请选择项目、数据集并输入提示词');
      return;
    }

    if (selectedSegments.length === 0) {
      alert('请至少选择一个分段');
      return;
    }

    try {
      setGenerating(true);
      
      const selectedSegmentContents = selectedSegments.map(index => segments[index].content);
      
      const response = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject,
          datasetId: selectedDataset,
          prompt: prompt.trim(),
          segments: selectedSegmentContents,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`成功生成 ${result.data.total} 个问题！`);
        await fetchQuestions(selectedProject); // 重新获取问题列表
        setSelectedSegments([]); // 清空选择
      } else {
        alert('生成问题失败: ' + result.error);
      }
    } catch (error) {
      console.error('生成问题失败:', error);
      alert('生成问题失败');
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
        await fetchQuestions(selectedProject); // 重新获取问题列表
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (error) {
      console.error('删除问题失败:', error);
      alert('删除问题失败');
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
        </div>
        <div className="flex items-center space-x-3">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-900">
                  分段选择 ({selectedSegments.length}/{segments.length})
                </h3>
                <button
                  onClick={handleSelectAllSegments}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {selectedSegments.length === segments.length ? '取消全选' : '全选'}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                {segments.map((segment, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedSegments.includes(index)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSegmentSelect(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedSegments.includes(index)}
                        onChange={() => handleSegmentSelect(index)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        {segment.segmentId && (
                          <div className="text-xs text-gray-500 mb-1">
                            ID: {segment.segmentId}
                          </div>
                        )}
                        <div className="text-sm text-gray-700 line-clamp-3">
                          {segment.content}
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
          {/* 生成按钮 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                已选择 {selectedSegments.length} 个分段，点击右上角设置提示词
              </div>
              <button 
                onClick={handleGenerateQuestions}
                disabled={generating || !selectedProject || !selectedDataset || selectedSegments.length === 0}
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
                    开始生成问题
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 生成结果 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">生成结果</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">加载中...</span>
              </div>
            ) : (
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
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}