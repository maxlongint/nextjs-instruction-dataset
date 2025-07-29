'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import ProjectFormModal from '../components/projects/project-form-modal';
import ConfirmModal from '../components/common/confirm-modal';

interface Project {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  datasetCount: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
      } else {
        console.error('获取项目列表失败:', result.error);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 创建项目
  const handleCreateProject = async (data: { name: string; description: string }) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsCreateModalOpen(false);
        fetchProjects(); // 重新获取项目列表
      } else {
        console.error('创建项目失败:', result.error);
        alert('创建项目失败: ' + result.error);
      }
    } catch (error) {
      console.error('创建项目失败:', error);
      alert('创建项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 更新项目
  const handleUpdateProject = async (data: { name: string; description: string }) => {
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsEditModalOpen(false);
        setSelectedProject(null);
        fetchProjects(); // 重新获取项目列表
      } else {
        console.error('更新项目失败:', result.error);
        alert('更新项目失败: ' + result.error);
      }
    } catch (error) {
      console.error('更新项目失败:', error);
      alert('更新项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除项目
  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedProject(null);
        fetchProjects(); // 重新获取项目列表
      } else {
        console.error('删除项目失败:', result.error);
        alert('删除项目失败: ' + result.error);
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      alert('删除项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  // 打开删除确认模态框
  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
          <p className="text-gray-600 mt-1">管理您的指令微调项目和数据集</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          新建项目
        </button>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      ) : (
        <>
          {/* 项目列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(project);
                      }}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="编辑项目"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(project);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="删除项目"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || '暂无描述'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>数据集: {project.datasetCount} 个</span>
                  <span>创建于: {new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 空状态 */}
      {!loading && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FiPlus className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
          <p className="mt-1 text-sm text-gray-500">开始创建您的第一个项目</p>
          <div className="mt-6">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              新建项目
            </button>
          </div>
        </div>
      )}

      {/* 模态框 */}
      <ProjectFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        title="新建项目"
        isLoading={isSubmitting}
      />

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSubmit={handleUpdateProject}
        initialData={selectedProject ? {
          name: selectedProject.name,
          description: selectedProject.description || ''
        } : undefined}
        title="编辑项目"
        isLoading={isSubmitting}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        title="删除项目"
        message={`确定要删除项目"${selectedProject?.name}"吗？此操作将同时删除该项目下的所有数据集和生成的问答数据，且无法恢复。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
}