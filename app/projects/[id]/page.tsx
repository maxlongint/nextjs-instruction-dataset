'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiUpload, FiFile, FiEdit, FiTrash2, FiRefreshCw, FiChevronLeft, FiChevronRight, FiSearch, FiZap } from 'react-icons/fi';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { datasetService } from '../../lib/data-service';
import { useProjects, useDatasets } from '../../lib/store';
import { Project, Dataset } from '../../types';

interface Segment {
  id: number;
  content: string;
  segmentId: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { projects } = useProjects();
  const { addDataset, updateDataset, deleteDataset } = useDatasets();

  const [project, setProject] = useState<Project | null>(null);
  const [projectDatasets, setProjectDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<number[]>([]);
  const [showSegments, setShowSegments] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSegments, setTotalSegments] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteSegmentDialog, setShowDeleteSegmentDialog] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<Segment | null>(null);
  const [showSmartSegmentDialog, setShowSmartSegmentDialog] = useState(false);
  const [smartSegmentModel, setSmartSegmentModel] = useState('gpt-3.5-turbo');
  const [smartSegmentPrompt, setSmartSegmentPrompt] = useState('请将以下文本智能分段，根据内容的逻辑结构和语义关系进行合理分割：\n\n{content}');
  const [smartSegmenting, setSmartSegmenting] = useState(false);
  const [smartSegmentProgress, setSmartSegmentProgress] = useState(0);

  const pageSize = 20;

  // AI模型选项配置
  const modelOptions = [
    {
      value: 'gpt-3.5-turbo',
      label: 'GPT-3.5 Turbo',
      description: '快速响应，适合日常分段'
    },
    {
      value: 'gpt-4',
      label: 'GPT-4',
      description: '更强推理能力，适合复杂文本'
    },
    {
      value: 'gpt-4-turbo',
      label: 'GPT-4 Turbo',
      description: '平衡性能与成本'
    },
    {
      value: 'claude-3-haiku',
      label: 'Claude 3 Haiku',
      description: '快速轻量，适合简单分段'
    },
    {
      value: 'claude-3-sonnet',
      label: 'Claude 3 Sonnet',
      description: '平衡性能，适合多数场景'
    },
    {
      value: 'claude-3-opus',
      label: 'Claude 3 Opus',
      description: '最强性能，适合复杂分析'
    }
  ];


  useEffect(() => {
    if (projectId && projects.length > 0) {
      const foundProject = projects.find(p => p.id.toString() === projectId);
      if (foundProject) {
        setProject(foundProject);
        fetchDatasets();
      } else {
        router.push('/projects');
      }
    }
  }, [projectId, projects, router]);

  // 获取数据集列表
  const fetchDatasets = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const datasets = datasetService.getAll(parseInt(projectId));
      setProjectDatasets(datasets);
    } catch (error) {
      console.error('获取数据集列表失败:', error);
    }
  };

  // 获取分段列表
  const fetchSegments = async (dataset: Dataset, page: number = 1) => {
    if (!dataset || !dataset.content) {
      setSegments([]);
      setShowSegments(false);
      return;
    }

    try {
      setLoadingSegments(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      const delimiter = dataset.segmentDelimiter || '\n\n';
      const allSegments = dataset.content.split(delimiter)
        .filter(segment => segment.trim().length > 0)
        .map((content, index) => ({
          id: index,
          content: content.trim(),
          segmentId: `segment-${index + 1}`
        }));

      // 搜索过滤
      const filteredSegments = searchTerm
        ? allSegments.filter(segment =>
          segment.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : allSegments;

      // 分页
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSegments = filteredSegments.slice(startIndex, endIndex);

      setSegments(paginatedSegments);
      setTotalSegments(filteredSegments.length);
      setTotalPages(Math.ceil(filteredSegments.length / pageSize));
      setCurrentPage(page);
      setShowSegments(true);
    } catch (error) {
      console.error('获取分段列表失败:', error);
    } finally {
      setLoadingSegments(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert('请上传 .txt 或 .md 格式的文件');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 读取文件内容
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file, 'utf-8');
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // 创建数据集
      const newDataset = addDataset({
        projectId: parseInt(projectId),
        name: file.name,
        fileName: file.name,
        filePath: `/uploads/${file.name}`,
        fileSize: file.size,
        description: `上传的${file.type}文件`,
        type: 'text',
        size: file.size,
        content: content,
        segmentDelimiter: '\n\n',
        segmentCount: content.split('\n\n').filter(s => s.trim().length > 0).length,
        status: 'ready',
        uploadProgress: 100,
        encoding: 'UTF-8',
        language: 'zh-CN',
        tags: ['上传文件'],
        isPublic: false,
        downloadCount: 0
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      await fetchDatasets();
      alert(`数据集 "${newDataset.name}" 上传成功！`);

    } catch (error) {
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // 重置文件输入
      event.target.value = '';
    }
  };

  // 处理数据集选择
  const handleDatasetSelect = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    setSelectedSegments([]);
    setCurrentPage(1);
    setSearchTerm('');
    fetchSegments(dataset, 1);
  };

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
      setSelectedSegments(segments.map(segment => segment.id));
    }
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && selectedDataset) {
      fetchSegments(selectedDataset, page);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (selectedDataset) {
      setCurrentPage(1);
      fetchSegments(selectedDataset, 1);
    }
  };

  // 处理数据集编辑
  const handleEditDataset = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setEditForm({
      name: dataset.name,
      description: dataset.description || ''
    });
    setShowEditDialog(true);
  };

  // 保存数据集编辑
  const handleSaveEdit = async () => {
    if (!editingDataset) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      updateDataset(editingDataset.id, {
        name: editForm.name,
        description: editForm.description
      });

      await fetchDatasets();
      setShowEditDialog(false);
      setEditingDataset(null);
      alert('数据集信息更新成功');
    } catch (error) {
      console.error('更新数据集失败:', error);
      alert('更新数据集失败');
    }
  };

  // 处理数据集删除
  const handleDeleteDataset = (dataset: Dataset) => {
    setDatasetToDelete(dataset);
    setShowDeleteDialog(true);
  };

  // 确认删除数据集
  const confirmDeleteDataset = async () => {
    if (!datasetToDelete) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      deleteDataset(datasetToDelete.id);

      await fetchDatasets();

      // 如果删除的是当前选中的数据集，清空选择
      if (selectedDataset?.id === datasetToDelete.id) {
        setSelectedDataset(null);
        setSegments([]);
        setShowSegments(false);
      }

      setShowDeleteDialog(false);
      setDatasetToDelete(null);
      alert('数据集删除成功');
    } catch (error) {
      console.error('删除数据集失败:', error);
      alert('删除数据集失败');
    }
  };

  // 重新分段
  const handleResegment = async () => {
    if (!selectedDataset) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // 重新计算分段
      const delimiter = selectedDataset.segmentDelimiter || '\n\n';
      const newSegmentCount = selectedDataset.content.split(delimiter)
        .filter(s => s.trim().length > 0).length;

      updateDataset(selectedDataset.id, {
        segmentCount: newSegmentCount
      });

      await fetchDatasets();
      await fetchSegments(selectedDataset, 1);

      alert('重新分段完成');
    } catch (error) {
      console.error('重新分段失败:', error);
      alert('重新分段失败');
    }
  };

  // 智能分段
  const handleSmartSegment = async () => {
    if (!selectedDataset || !smartSegmentPrompt.trim()) {
      alert('请填写提示词');
      return;
    }

    try {
      setSmartSegmenting(true);
      setSmartSegmentProgress(0);

      // 模拟智能分段进度
      const progressInterval = setInterval(() => {
        setSmartSegmentProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await new Promise(resolve => setTimeout(resolve, 2000));

      // 根据选择的模型生成不同的分段策略
      const getModelSpecificSegments = (model: string, content: string) => {
        const sentences = content.split(/[。！？\n\n]+/).filter(s => s.trim().length > 0);
        
        switch (model) {
          case 'gpt-3.5-turbo':
            // 基础分段：每3-4句为一段
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 3);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
            
          case 'gpt-4':
            // 智能分段：根据语义相关性分段
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 4);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
            
          case 'gpt-4-turbo':
            // 高效分段：平衡长度和语义
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 3.5);
              if (!segments[Math.floor(segmentIndex)]) segments[Math.floor(segmentIndex)] = '';
              segments[Math.floor(segmentIndex)] += sentence.trim() + '。';
              return segments;
            }, []);
            
          case 'claude-3-haiku':
            // 简单分段：每2-3句为一段
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 2);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
            
          case 'claude-3-sonnet':
            // 平衡分段：每3-5句为一段
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 4);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
            
          case 'claude-3-opus':
            // 深度分段：根据复杂语义结构分段
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 5);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
            
          default:
            return sentences.reduce((segments: string[], sentence, index) => {
              const segmentIndex = Math.floor(index / 3);
              if (!segments[segmentIndex]) segments[segmentIndex] = '';
              segments[segmentIndex] += sentence.trim() + '。';
              return segments;
            }, []);
        }
      };

      // 生成智能分段
      const smartSegments = getModelSpecificSegments(smartSegmentModel, selectedDataset.content);
      const newContent = smartSegments.filter(s => s.trim().length > 0).join('\n\n');

      clearInterval(progressInterval);
      setSmartSegmentProgress(100);

      // 更新数据集内容
      updateDataset(selectedDataset.id, {
        content: newContent,
        segmentCount: smartSegments.length,
        size: new Blob([newContent]).size,
        segmentDelimiter: '\n\n'
      });

      // 更新选中的数据集对象
      const updatedDataset = { 
        ...selectedDataset, 
        content: newContent, 
        segmentCount: smartSegments.length,
        segmentDelimiter: '\n\n'
      };
      setSelectedDataset(updatedDataset);

      await fetchDatasets();
      await fetchSegments(updatedDataset, 1);

      setShowSmartSegmentDialog(false);
      alert(`智能分段完成！使用 ${modelOptions.find(m => m.value === smartSegmentModel)?.label} 生成了 ${smartSegments.length} 个分段`);

    } catch (error) {
      console.error('智能分段失败:', error);
      alert('智能分段失败');
    } finally {
      setSmartSegmenting(false);
      setSmartSegmentProgress(0);
    }
  };

  // 处理分段删除
  const handleDeleteSegment = (segment: Segment) => {
    setSegmentToDelete(segment);
    setShowDeleteSegmentDialog(true);
  };

  // 确认删除分段
  const confirmDeleteSegment = async () => {
    if (!segmentToDelete || !selectedDataset) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // 获取当前数据集的所有分段
      const delimiter = selectedDataset.segmentDelimiter || '\n\n';
      const allSegments = selectedDataset.content.split(delimiter)
        .filter(segment => segment.trim().length > 0);

      // 删除指定分段
      const updatedSegments = allSegments.filter((_, index) => index !== segmentToDelete.id);
      const updatedContent = updatedSegments.join(delimiter);

      // 更新数据集内容
      updateDataset(selectedDataset.id, {
        content: updatedContent,
        segmentCount: updatedSegments.length,
        size: new Blob([updatedContent]).size
      });

      // 更新选中的数据集对象
      const updatedDataset = { ...selectedDataset, content: updatedContent, segmentCount: updatedSegments.length };
      setSelectedDataset(updatedDataset);

      // 重新获取数据集列表和分段
      await fetchDatasets();
      await fetchSegments(updatedDataset, 1);

      // 清空选择状态
      setSelectedSegments([]);

      setShowDeleteSegmentDialog(false);
      setSegmentToDelete(null);
      alert('分段删除成功');
    } catch (error) {
      console.error('删除分段失败:', error);
      alert('删除分段失败');
    }
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载项目信息中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-hidden flex flex-col">
      {/* 项目头部信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description || '暂无描述'}</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span>创建时间: {new Date(project.createdAt).toLocaleString('zh-CN')}</span>
              <span className="mx-2">•</span>
              <span>数据集数量: {projectDatasets.length}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回项目列表
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* 左侧：数据集管理 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 w-1/3 h-full overflow-hidden overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">数据集管理</h2>
            <div className="relative">
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <button
                disabled={uploading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiUpload className="mr-2 h-4 w-4" />
                {uploading ? '上传中...' : '上传文件'}
              </button>
            </div>
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">上传进度</span>
                <span className="text-sm text-blue-700">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* 数据集列表 */}
          <div className="space-y-3">
            {projectDatasets.length === 0 ? (
              <div className="text-center py-8">
                <FiFile className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有上传任何数据集</p>
                <p className="text-sm text-gray-400">支持上传 .txt 和 .md 格式的文件</p>
              </div>
            ) : (
              projectDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${selectedDataset?.id === dataset.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-50'
                    }`}
                  onClick={() => handleDatasetSelect(dataset)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {dataset.description || '暂无描述'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span>分段数: {dataset.segmentCount}</span>
                        <span className="mx-2">•</span>
                        <span>大小: {Math.round(dataset.size / 1024)}KB</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDataset(dataset);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDataset(dataset);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右侧：分段预览和选择 */}
        <div className="ml-6 flex-1 flex flex-col lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-900">数据集分段</h2>
                {selectedDataset && (
                  <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {selectedDataset.name}
                  </span>
                )}
              </div>
              {selectedDataset && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleResegment}
                    className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FiRefreshCw className="mr-2 h-4 w-4" />
                    重新分段
                  </button>
                  <button
                    onClick={() => setShowSmartSegmentDialog(true)}
                    className="flex items-center px-3 py-2 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <FiZap className="mr-2 h-4 w-4" />
                    智能分段
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 p-4 md:p-6 overflow-hidden overflow-y-auto">

            {!selectedDataset ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                  <FiFile className="h-8 w-8" />
                </div>
                <p className="text-gray-700 text-lg font-medium mb-2">请选择一个数据集</p>
                <p className="text-gray-500 max-w-md mx-auto">从左侧列表中选择一个数据集，查看和管理其分段内容</p>
              </div>
            ) : (
              <>
                {/* 搜索和操作栏 */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <FiSearch className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="搜索分段内容..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                          className="pl-10 pr-4 py-2 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                      >
                        <span className="flex items-center justify-center">
                          <FiSearch className="mr-2 h-4 w-4" />
                          搜索
                        </span>
                      </button>
                    </div>

                    {showSegments && segments.length > 0 && (
                      <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">
                            已选择 <span className="text-blue-600 font-semibold">{selectedSegments.length}</span> / {segments.length} 个分段
                          </span>
                        </div>
                        <button
                          onClick={handleSelectAllSegments}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                        >
                          {selectedSegments.length === segments.length ? '取消全选' : '全选'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 分段列表 */}
                {loadingSegments ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">加载分段中...</span>
                  </div>
                ) : showSegments && segments.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          className={`group relative border transition-all duration-200 rounded-lg shadow-sm hover:shadow-md ${selectedSegments.includes(segment.id)
                              ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                              : 'bg-white border-gray-200 hover:border-blue-200'
                            }`}
                        >
                          {/* 分段内容主体 */}
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                id={`segment-${segment.id}`}
                                checked={selectedSegments.includes(segment.id)}
                                onCheckedChange={() => handleSegmentSelect(segment.id)}
                                className="mt-1 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                {/* 分段标识和字符数 */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                                      第 {segment.id + 1} 段
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {segment.content.length} 字符
                                    </span>
                                  </div>
                                  {/* 删除按钮 */}
                                  <button
                                    onClick={() => handleDeleteSegment(segment)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600"
                                    title="删除分段"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                {/* 分段文本内容 */}
                                <div className="text-sm text-gray-800 leading-relaxed">
                                  <p className="whitespace-pre-wrap">{segment.content}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 分页 */}
                    {totalPages > 1 && (
                      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md">
                          显示 <span className="text-blue-600 font-semibold">{((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalSegments)}</span>
                          ，共 <span className="text-blue-600 font-semibold">{totalSegments}</span> 个分段
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage <= 1}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-200">
                            {currentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage >= totalPages}
                            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : showSegments ? (
                  <div className="text-center py-12">
                    <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">没有找到匹配的分段</p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        handleSearch();
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      清除搜索条件
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiFile className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">点击数据集名称查看分段内容</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除数据集</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除数据集 &quot;{datasetToDelete?.name}&quot; 吗？此操作不可撤销，相关的问题和答案也会被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDataset} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 编辑数据集对话框 */}
      {/* 编辑数据集对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑数据集</DialogTitle>
            <DialogDescription>
              修改数据集的基本信息
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="dataset-name" className="text-sm font-medium">
                数据集名称
              </Label>
              <Input
                id="dataset-name"
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="请输入数据集名称"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="dataset-description" className="text-sm font-medium">
                描述
              </Label>
              <Textarea
                id="dataset-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="请输入数据集描述"
                rows={3}
                className="mt-2 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editForm.name.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除分段确认对话框 */}
      <AlertDialog open={showDeleteSegmentDialog} onOpenChange={setShowDeleteSegmentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除分段</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除分段 &quot;{segmentToDelete?.segmentId}&quot; 吗？此操作不可撤销，该分段的内容将从数据集中永久移除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteSegmentDialog(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSegment} 
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 智能分段配置弹框 */}
      <Dialog open={showSmartSegmentDialog} onOpenChange={setShowSmartSegmentDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FiZap className="mr-2 h-5 w-5 text-purple-600" />
              智能分段配置
            </DialogTitle>
            <DialogDescription>
              使用AI模型智能分析文本结构，自动进行语义化分段
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* AI模型选择 */}
            <div>
              <Label htmlFor="smart-segment-model" className="text-sm font-medium">
                选择AI模型
              </Label>
              <Select value={smartSegmentModel} onValueChange={setSmartSegmentModel}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="选择AI模型" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {modelOptions.map((model) => (
                    <SelectItem key={model.value} value={model.value} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-gray-500 leading-tight">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 提示词配置 */}
            <div>
              <Label htmlFor="smart-segment-prompt" className="text-sm font-medium">
                分段提示词
              </Label>
              <Textarea
                id="smart-segment-prompt"
                className="mt-2 min-h-[120px] resize-none"
                placeholder="请输入智能分段的提示词模板..."
                value={smartSegmentPrompt}
                onChange={(e) => setSmartSegmentPrompt(e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-2 flex items-center">
                <span className="inline-flex items-center">
                  💡 支持使用 <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-xs">{'{content}'}</code> 作为内容占位符
                </span>
              </div>
            </div>

            {/* 智能分段进度 */}
            {smartSegmenting && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900 flex items-center">
                    <FiZap className="mr-2 h-4 w-4" />
                    正在进行智能分段...
                  </span>
                  <span className="text-sm text-purple-700">{smartSegmentProgress}%</span>
                </div>
                <Progress value={smartSegmentProgress} className="h-2" />
                <div className="text-xs text-purple-600 mt-2">
                  使用 {modelOptions.find(m => m.value === smartSegmentModel)?.label} 分析文本结构中...
                </div>
              </div>
            )}

            {/* 数据集信息 */}
            {selectedDataset && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">当前数据集信息</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>名称: {selectedDataset.name}</div>
                  <div>当前分段数: {selectedDataset.segmentCount}</div>
                  <div>文本长度: {selectedDataset.content.length} 字符</div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSmartSegmentDialog(false)}
              disabled={smartSegmenting}
            >
              取消
            </Button>
            <Button
              onClick={handleSmartSegment}
              disabled={smartSegmenting || !smartSegmentPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {smartSegmenting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  分段中...
                </>
              ) : (
                <>
                  <FiZap className="mr-2 h-4 w-4" />
                  开始智能分段
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
