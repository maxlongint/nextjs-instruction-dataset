'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import ProjectFormModal from '@/components/projects/project-form-modal';
import ConfirmModal from '@/components/common/confirm-modal';
import { projectService, datasetService } from '../lib/data-service';
import { Project } from '../types';

interface ProjectWithDatasetCount extends Project {
  datasetCount: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithDatasetCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithDatasetCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 获取项目列表
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = projectService.getAll();
      
      // 为每个项目计算数据集数量
      const projectsWithCount = projectsData.map(project => ({
        ...project,
        datasetCount: datasetService.getAll(project.id).length
      }));
      
      setProjects(projectsWithCount);
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
      
      const newProject = projectService.create({
        name: data.name,
        description: data.description,
        status: 'active',
        priority: 'medium',
        category: '默认分类',
        tags: [],
        ownerId: 1, // 默认所有者
        memberIds: [1],
        progress: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90天后
        estimatedHours: 40,
        actualHours: 0,
        budget: 10000
      });
      
      if (newProject) {
        setIsCreateModalOpen(false);
        fetchProjects(); // 重新获取项目列表
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
      
      const updatedProject = projectService.update(selectedProject.id, {
        name: data.name,
        description: data.description || undefined
      });
      
      if (updatedProject) {
        setIsEditModalOpen(false);
        setSelectedProject(null);
        fetchProjects(); // 重新获取项目列表
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
      
      const success = projectService.delete(selectedProject.id);
      
      if (success) {
        setIsDeleteModalOpen(false);
        setSelectedProject(null);
        fetchProjects(); // 重新获取项目列表
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      alert('删除项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 打开编辑模态框
  const openEditModal = (project: ProjectWithDatasetCount) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  // 打开删除确认模态框
  const openDeleteModal = (project: ProjectWithDatasetCount) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="h-full p-6 overflow-hidden overflow-y-auto">
      <div className="space-y-6">
        {/* 页面头部区域 */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">项目管理</h1>
            <p className="text-gray-600 mt-1">管理您的指令微调项目和数据集</p>
          </div>
          {/* 新建项目按钮 */}
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FiPlus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </header>

        {/* 加载状态 */}
        {loading ? (
          <div className="py-12">
            <Loading size="lg" text="加载中..." />
          </div>
        ) : (
          <>
            {/* 项目卡片网格 */}
            <section className="grid grid-cols-1 2xl:grid-cols-3 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardHeader>
                    {/* 卡片头部 */}
                    <div className="flex items-start justify-between">
                      <CardTitle className="truncate">
                        {project.name}
                      </CardTitle>
                      {/* 操作按钮组 */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(project);
                          }}
                          className="p-1 h-auto text-gray-400 hover:text-green-600"
                          title="编辑项目"
                        >
                          <FiEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(project);
                          }}
                          className="p-1 h-auto text-gray-400 hover:text-red-600"
                          title="删除项目"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* 项目描述 */}
                    <CardDescription className="mb-4 line-clamp-2">
                      {project.description || '暂无描述'}
                    </CardDescription>
                    
                    {/* 项目统计信息 */}
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline">数据集: {project.datasetCount} 个</Badge>
                      <span className="text-gray-500">创建于: {new Date(project.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          </>
        )}

        {/* 空状态展示 */}
        {!loading && projects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FiPlus className="h-full w-full" />
              </div>
              <CardTitle className="mt-2 text-sm">暂无项目</CardTitle>
              <CardDescription className="mt-1">开始创建您的第一个项目</CardDescription>
              <div className="mt-6">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <FiPlus className="mr-2 h-4 w-4" />
                  新建项目
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 模态框组件 */}
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
    </div>
  );
}
