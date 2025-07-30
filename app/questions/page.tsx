'use client';

import { useState, useEffect } from 'react';
import { FiPlay, FiSettings, FiDownload, FiEdit, FiTrash2, FiCpu } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PromptSettingsModal from '@/components/questions/prompt-settings-modal';

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

  // 获取AI配置
  const fetchAIConfig = async () => {
    try {
      const response = await fetch('/api/settings?type=ai');
      const result = await response.json();
      if (result.success) {
        setAiConfig(result.data);
        
        // 优先从本地存储恢复模型选择，其次使用配置中的模型，最后不选择任何模型
        const savedModel = localStorage.getItem('selectedModel');
        const modelToUse = savedModel || result.data.model || '';
        setSelectedModel(modelToUse);
        
        // 如果有配置，自动获取模型列表
        if (result.data.platform && result.data.apiUrl) {
          await fetchModels(result.data);
        }
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
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
    fetchAIConfig();
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

    if (!selectedModel) {
      alert('请选择AI模型');
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
          model: selectedModel, // 添加选中的模型
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
          {/* 生成按钮 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                已选择 {selectedSegments.length} 个分段，当前模型: {selectedModel || '未选择'}
              </div>
              <button 
                onClick={handleGenerateQuestions}
                disabled={generating || !selectedProject || !selectedDataset || selectedSegments.length === 0 || !selectedModel}
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