'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiUpload, FiFile, FiEdit, FiTrash2, FiDownload, FiRefreshCw, FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';
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
import { projectService, datasetService } from '../../lib/data-service';
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
  const { datasets, addDataset, updateDataset, deleteDataset } = useDatasets();

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

  const pageSize = 20;

  useEffect(() => {
    // 初始化数据已在store中完成，这里不需要额外操作
  }, []);

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
    <div className="space-y-6">
      {/* 项目头部信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description || '暂无描述'}</p>
            <div className="flex items-center mt-3 text-sm text-gray-500">
              <span>创建时间: {new Date(project.createdAt).toLocaleString('zh-CN')}</span>
              <span className="mx-2">•</span>
              <span>数据集数量: {projectDatasets.length}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              返回项目列表
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：数据集管理 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
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
                  className={`border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedDataset?.id === dataset.id
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
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 px-6 py-4">
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
                </div>
              )}
            </div>
          </div>
          <div className="p-6">

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
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
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
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    {segments.map((segment) => (
                      <div
                        key={segment.id}
                        className={`group border transition-all duration-200 rounded-xl shadow-sm hover:shadow-md ${
                          selectedSegments.includes(segment.id)
                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200 ring-opacity-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          {/* 分段标题栏 */}
                          <div className={`flex items-center justify-between px-4 py-3 border-b ${
                            selectedSegments.includes(segment.id) ? 'border-blue-200 bg-blue-100/50' : 'border-gray-100'
                          }`}>
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={`segment-${segment.id}`}
                                checked={selectedSegments.includes(segment.id)}
                                onCheckedChange={() => handleSegmentSelect(segment.id)}
                                className={`h-4 w-4 ${selectedSegments.includes(segment.id) ? 'text-blue-600' : 'text-gray-400'}`}
                              />
                              <Label
                                htmlFor={`segment-${segment.id}`}
                                className={`text-sm font-medium cursor-pointer ${
                                  selectedSegments.includes(segment.id) ? 'text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                <span className="flex items-center">
                                  <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 mr-2">
                                    {segment.segmentId}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {segment.content.length} 字符
                                  </span>
                                </span>
                              </Label>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleSegmentSelect(segment.id)}
                                className="p-1 rounded-full hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                              >
                                {selectedSegments.includes(segment.id) ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                          
                          {/* 分段内容 */}
                          <div className="p-4">
                            <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                              {segment.content}
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
              您确定要删除数据集 "{datasetToDelete?.name}" 吗？此操作不可撤销，相关的问题和答案也会被删除。
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
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">编辑数据集</h3>
              <button 
                onClick={() => setShowEditDialog(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据集名称
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入数据集名称"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="请输入数据集描述"
                />
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setShowEditDialog(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={!editForm.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
