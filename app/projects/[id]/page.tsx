'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiUpload, FiFile, FiEdit, FiTrash2, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FiAlertCircle, FiX, FiRefreshCw } from 'react-icons/fi';
import ConfirmModal from '../../components/common/confirm-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  datasetCount: number;
}

interface Dataset {
  id: number;
  projectId: number;
  name: string;
  fileName: string;
  fileSize: number;
  segmentDelimiter?: string;
  createdAt: string;
}

interface Segment {
  id: number;
  datasetId: number;
  content: string;
  startIndex: number;
  endIndex: number;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<Project | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 上传对话框状态
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [segmentDelimiter, setSegmentDelimiter] = useState('\n\n'); // 默认双换行符
  const [customDelimiter, setCustomDelimiter] = useState('');

  // 错误对话框状态
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 编辑对话框状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [editName, setEditName] = useState('');
  const [editSegmentDelimiter, setEditSegmentDelimiter] = useState('\n\n');
  const [editCustomDelimiter, setEditCustomDelimiter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 重新分段对话框状态
  const [showResegmentDialog, setShowResegmentDialog] = useState(false);
  const [resegmentDelimiter, setResegmentDelimiter] = useState('\n\n');
  const [resegmentCustomDelimiter, setResegmentCustomDelimiter] = useState('');
  const [isResegmenting, setIsResegmenting] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSegments, setTotalSegments] = useState(0);
  const pageSize = 10;

  // 分段展开状态
  const [expandedSegments, setExpandedSegments] = useState<Set<number>>(new Set());

  // 预设的分段标识符选项
  const delimiterOptions = [
    { label: '双换行符', value: '\n\n', description: '段落间的双换行' },
    { label: '单换行符', value: '\n', description: '每行作为一个分段' },
    { label: '段落标记', value: '---', description: '使用---分隔' },
    { label: '章节标记', value: '###', description: '使用###分隔' },
    { label: '句号换行', value: '.\n', description: '句号后换行分隔' },
    { label: '自定义', value: 'custom', description: '输入自定义分隔符' }
  ];

  // 获取项目详情
  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setProject(result.data);
      } else {
        console.error('获取项目详情失败:', result.error);
        router.push('/projects');
      }
    } catch (error) {
      console.error('获取项目详情失败:', error);
      router.push('/projects');
    }
  };

  // 获取数据集列表
  const fetchDatasets = async () => {
    try {
      const response = await fetch(`/api/datasets?projectId=${projectId}`);
      const result = await response.json();
      
      if (result.success) {
        setDatasets(result.data);
        // 如果没有选中的数据集且有数据集，自动选中第一个
        if (!selectedDataset && result.data.length > 0) {
          setSelectedDataset(result.data[0]);
        }
      } else {
        console.error('获取数据集列表失败:', result.error);
      }
    } catch (error) {
      console.error('获取数据集列表失败:', error);
    }
  };

  // 获取分段列表
  const fetchSegments = async (datasetId: number, page: number = 1) => {
    try {
      setLoadingSegments(true);
      const response = await fetch(`/api/datasets/${datasetId}/segments?page=${page}&limit=${pageSize}`);
      const result = await response.json();
      
      if (result.success) {
        setSegments(result.data.segments);
        setTotalSegments(result.data.total);
        setTotalPages(Math.ceil(result.data.total / pageSize));
        setCurrentPage(page);
      } else {
        console.error('获取分段列表失败:', result.error);
      }
    } catch (error) {
      console.error('获取分段列表失败:', error);
    } finally {
      setLoadingSegments(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchDatasets()]);
      setLoading(false);
    };

    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // 当选中的数据集改变时，获取分段
  useEffect(() => {
    if (selectedDataset) {
      fetchSegments(selectedDataset.id, 1);
    } else {
      setSegments([]);
      setTotalSegments(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
  }, [selectedDataset]);

  // 打开上传对话框
  const handleOpenUploadDialog = () => {
    setShowUploadDialog(true);
  };

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);
  };

  // 处理文件上传
  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId.toString());
      formData.append('name', selectedFile.name);
      
      // 添加分段标识符
      const finalDelimiter = segmentDelimiter === 'custom' ? customDelimiter : segmentDelimiter;
      formData.append('segmentDelimiter', finalDelimiter);

      const response = await fetch('/api/datasets', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchDatasets(); // 重新获取数据集列表
        setShowUploadDialog(false);
        setSelectedFile(null);
        // 重置分段设置
        setSegmentDelimiter('\n\n');
        setCustomDelimiter('');
      } else {
        setErrorMessage(result.error || '上传失败');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('上传文件失败:', error);
      setErrorMessage('上传文件失败，请检查网络连接或文件格式');
      setShowErrorDialog(true);
    } finally {
      setUploading(false);
    }
  };

  // 取消上传
  const handleCancelUpload = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setSegmentDelimiter('\n\n');
    setCustomDelimiter('');
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setEditName(dataset.name);
    setEditSegmentDelimiter(dataset.segmentDelimiter || '\n\n');
    setEditCustomDelimiter('');
    setShowEditDialog(true);
  };

  // 处理编辑数据集
  const handleEditDataset = async () => {
    if (!editingDataset || !editName.trim()) return;

    try {
      setIsEditing(true);
      
      // 确定最终的分段标识符
      const finalDelimiter = editSegmentDelimiter === 'custom' ? editCustomDelimiter : editSegmentDelimiter;
      
      const response = await fetch(`/api/datasets/${editingDataset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          segmentDelimiter: finalDelimiter,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowEditDialog(false);
        setEditingDataset(null);
        setEditName('');
        setEditSegmentDelimiter('\n\n');
        setEditCustomDelimiter('');
        await fetchDatasets(); // 重新获取数据集列表
        // 如果编辑的是当前选中的数据集，重新获取分段
        if (selectedDataset?.id === editingDataset.id) {
          await fetchSegments(editingDataset.id, 1);
        }
      } else {
        setErrorMessage(result.error || '编辑失败');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('编辑数据集失败:', error);
      setErrorMessage('编辑数据集失败');
      setShowErrorDialog(true);
    } finally {
      setIsEditing(false);
    }
  };

  // 取消编辑
  // 取消编辑
  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingDataset(null);
    setEditName('');
  };

  // 打开重新分段对话框
  const handleOpenResegmentDialog = () => {
    if (!selectedDataset) return;
    setResegmentDelimiter(selectedDataset.segmentDelimiter || '\n\n');
    setResegmentCustomDelimiter('');
    setShowResegmentDialog(true);
  };

  // 处理重新分段
  const handleResegment = async () => {
    if (!selectedDataset) return;

    try {
      setIsResegmenting(true);
      
      // 确定最终的分段标识符
      const finalDelimiter = resegmentDelimiter === 'custom' ? resegmentCustomDelimiter : resegmentDelimiter;
      
      const response = await fetch(`/api/datasets/${selectedDataset.id}/resegment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          segmentDelimiter: finalDelimiter,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowResegmentDialog(false);
        setResegmentDelimiter('\n\n');
        setResegmentCustomDelimiter('');
        await fetchDatasets(); // 重新获取数据集列表
        await fetchSegments(selectedDataset.id, 1); // 重新获取分段
      } else {
        setErrorMessage(result.error || '重新分段失败');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('重新分段失败:', error);
      setErrorMessage('重新分段失败');
      setShowErrorDialog(true);
    } finally {
      setIsResegmenting(false);
    }
  };

  // 取消重新分段
  const handleCancelResegment = () => {
    setShowResegmentDialog(false);
    setResegmentDelimiter('\n\n');
    setResegmentCustomDelimiter('');
  };

  // 删除数据集
  const handleDeleteDataset = async () => {
    if (!datasetToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/datasets/${datasetToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDatasetToDelete(null);
        // 如果删除的是当前选中的数据集，清空选中状态
        if (selectedDataset?.id === datasetToDelete.id) {
          setSelectedDataset(null);
        }
        await fetchDatasets(); // 重新获取数据集列表
      } else {
        setErrorMessage(result.error || '删除失败');
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('删除数据集失败:', error);
      setErrorMessage('删除数据集失败');
      setShowErrorDialog(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    if (selectedDataset && page >= 1 && page <= totalPages) {
      fetchSegments(selectedDataset.id, page);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化分段标识符显示
  const formatDelimiterDisplay = (delimiter: string) => {
    const option = delimiterOptions.find(opt => opt.value === delimiter);
    if (option) {
      return option.label;
    }
    // 如果是自定义分隔符，显示前几个字符
    return delimiter.length > 10 ? delimiter.substring(0, 10) + '...' : delimiter;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">项目不存在</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 固定高度的上半部分 */}
      <div className="flex-shrink-0">
        {/* 页面头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/projects')}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
              <p className="text-gray-600 mt-1">{project?.description || '暂无描述'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenUploadDialog}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={uploading}
            >
              <FiUpload className="mr-2 h-4 w-4" />
              上传数据集
            </button>
          </div>
        </div>

        {/* 项目统计 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{datasets.length}</div>
            <div className="text-sm text-gray-600">数据集数量</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-orange-600">
              {formatFileSize(datasets.reduce((total, dataset) => total + dataset.fileSize, 0))}
            </div>
            <div className="text-sm text-gray-600">总文件大小</div>
          </div>
        </div>
      </div>

      {/* flex-1 的数据集管理部分 */}
      <div className="flex-1 min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">数据集管理</h3>
            {selectedDataset && (
              <button
                onClick={handleOpenResegmentDialog}
                className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                disabled={isResegmenting}
              >
                <FiRefreshCw className="mr-1.5 h-3.5 w-3.5" />
                重新分段
              </button>
            )}
          </div>
        
          <div className="flex flex-1 min-h-0">
            {/* 左侧：数据集列表 - 固定480px宽度 */}
            <div className="w-[480px] border-r border-gray-200 p-4 flex flex-col flex-shrink-0">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex-shrink-0">数据集列表</h4>
              {datasets.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FiFile className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">暂无数据集</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedDataset?.id === dataset.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {dataset.name}
                          </h5>
                          <p className="text-xs text-gray-500 truncate">
                            {dataset.fileName}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-gray-400">
                              {formatFileSize(dataset.fileSize)}
                            </p>
                            {dataset.segmentDelimiter && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {formatDelimiterDisplay(dataset.segmentDelimiter)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDialog(dataset);
                            }}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="编辑"
                          >
                            <FiEdit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDatasetToDelete(dataset);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="删除"
                          >
                            <FiTrash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：分段列表 - 自适应宽度 */}
            <div className="flex-1 p-4 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h4 className="text-sm font-medium text-gray-900">
                  分段列表 {selectedDataset && `(${selectedDataset?.name})`}
                </h4>
                {totalSegments > 0 && (
                  <span className="text-xs text-gray-500">
                    共 {totalSegments} 个分段
                  </span>
                )}
              </div>

              {!selectedDataset ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500">请选择一个数据集查看分段</p>
                </div>
              ) : loadingSegments ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">加载中...</span>
                  </div>
                </div>
              ) : segments.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-500">该数据集暂无分段</p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  {/* 分段列表 */}
                  <div className="space-y-2 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {segments.map((segment, index) => {
                      const isExpanded = expandedSegments.has(segment.id);
                      const isLongContent = segment.content.length > 200;
                      const displayContent = isExpanded || !isLongContent 
                        ? segment.content 
                        : segment.content.substring(0, 200) + '...';
                      
                      const toggleExpanded = () => {
                        const newExpanded = new Set(expandedSegments);
                        if (isExpanded) {
                          newExpanded.delete(segment.id);
                        } else {
                          newExpanded.add(segment.id);
                        }
                        setExpandedSegments(newExpanded);
                      };
                      
                      return (
                        <div
                          key={segment.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-medium text-gray-600">
                              分段 {(currentPage - 1) * pageSize + index + 1}
                            </span>
                            <span className="text-xs text-gray-400">
                              {segment.startIndex}-{segment.endIndex}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {displayContent}
                          </p>
                          {isLongContent && (
                            <button
                              onClick={toggleExpanded}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                            >
                              {isExpanded ? '收起' : '展开'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* 分页控件 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between flex-shrink-0 mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        第 {currentPage} 页，共 {totalPages} 页
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronLeft className="h-4 w-4" />
                        </button>
                        
                        {/* 页码按钮 */}
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
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-2 py-1 text-xs rounded ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 上传数据集对话框 */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">上传数据集</h3>
            </div>
            
            <div className="px-6 py-4">
              {/* 文件选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择文件
                </label>
                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">点击上传</span> 或拖拽文件到此处
                      </p>
                      <p className="text-xs text-gray-500">支持 TXT, MD, JSON 格式</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".txt,.md,.json"
                      onChange={handleFileSelect}
                    />
                  </label>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiFile className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <span className="text-sm text-gray-900">{selectedFile.name}</span>
                          <div className="text-xs text-gray-500">
                            {formatFileSize(selectedFile.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="移除文件"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 分段标识符设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分段标识符
                </label>
                <Select value={segmentDelimiter} onValueChange={setSegmentDelimiter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择分段标识符" />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {segmentDelimiter === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      自定义分隔符
                    </label>
                    <input
                      type="text"
                      value={customDelimiter}
                      onChange={(e) => setCustomDelimiter(e.target.value)}
                      placeholder="请输入自定义分隔符"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 对话框按钮 */}
            {/* 对话框按钮 */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelUpload}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={uploading}
              >
                取消
              </button>
              <button
                onClick={handleFileUpload}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploading || !selectedFile || (segmentDelimiter === 'custom' && !customDelimiter.trim())}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    上传中...
                  </>
                ) : (
                  '确认上传'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 错误提示对话框 */}
      {showErrorDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">操作失败</h3>
              </div>
              <button
                onClick={() => setShowErrorDialog(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">{errorMessage}</p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowErrorDialog(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑数据集对话框 */}
      {showEditDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">编辑数据集</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据集名称
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="请输入数据集名称"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 分段标识符设置 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分段标识符
                </label>
                <Select value={editSegmentDelimiter} onValueChange={setEditSegmentDelimiter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择分段标识符" />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {editSegmentDelimiter === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      自定义分隔符
                    </label>
                    <input
                      type="text"
                      value={editCustomDelimiter}
                      onChange={(e) => setEditCustomDelimiter(e.target.value)}
                      placeholder="请输入自定义分隔符"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              {editingDataset && (
                <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded-lg">
                  <p><span className="font-medium">文件名:</span> {editingDataset.fileName}</p>
                  <p><span className="font-medium">文件大小:</span> {formatFileSize(editingDataset.fileSize)}</p>
                  <p><span className="font-medium">创建时间:</span> {new Date(editingDataset.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isEditing}
              >
                取消
              </button>
              <button
                onClick={handleEditDataset}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isEditing || !editName.trim() || (editSegmentDelimiter === 'custom' && !editCustomDelimiter.trim())}
              >
                {isEditing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重新分段对话框 */}
      {showResegmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">重新分段</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  将对数据集 "<span className="font-medium">{selectedDataset?.name}</span>" 进行重新分段，这将删除现有的所有分段并重新生成。
                </p>
              </div>

              {/* 分段标识符设置 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分段标识符
                </label>
                <Select value={resegmentDelimiter} onValueChange={setResegmentDelimiter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择分段标识符" />
                  </SelectTrigger>
                  <SelectContent>
                    {delimiterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {resegmentDelimiter === 'custom' && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      自定义分隔符
                    </label>
                    <input
                      type="text"
                      value={resegmentCustomDelimiter}
                      onChange={(e) => setResegmentCustomDelimiter(e.target.value)}
                      placeholder="请输入自定义分隔符"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancelResegment}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isResegmenting}
              >
                取消
              </button>
              <button
                onClick={handleResegment}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResegmenting || (resegmentDelimiter === 'custom' && !resegmentCustomDelimiter.trim())}
              >
                {isResegmenting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    重新分段中...
                  </>
                ) : (
                  '确认重新分段'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDatasetToDelete(null);
        }}
        onConfirm={handleDeleteDataset}
        title="删除数据集"
        message={`确定要删除数据集"${datasetToDelete?.name}"吗？此操作将同时删除相关的问答数据，且无法恢复。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
