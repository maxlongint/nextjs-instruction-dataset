'use client';

import { useEffect } from 'react';
import { FiFolder, FiFileText, FiHelpCircle, FiMessageSquare, FiTrendingUp, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjects, useDatasets, useQuestions, useAnswers } from './lib/store';

export default function HomePage() {
  const projects = useProjects().projects;
  const datasets = useDatasets().datasets;
  const questions = useQuestions().questions;
  const answers = useAnswers().answers;

  useEffect(() => {
    // 初始化数据已在store中自动完成
  }, []);

  // 统计数据
  const stats = {
    totalProjects: projects.length,
    totalDatasets: datasets.length,
    totalQuestions: questions.length,
    totalAnswers: answers.length,
    recentActivity: Math.max(projects.length, datasets.length, questions.length, answers.length)
  };

  // 获取最近的项目
  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // 获取最近的问题
  const recentQuestions = questions
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="h-full p-6 overflow-hidden overflow-y-auto">
      <div className="space-y-8 pl-1 py-1">
      {/* 页面头部 - 欢迎横幅区域 */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold mb-2">欢迎使用指令数据集生成平台</h1>
          <p className="text-blue-100 text-lg mb-6">
            智能化的问答数据集生成工具，帮助您快速构建高质量的训练数据
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="secondary" size="lg">
              <Link href="/projects">
                开始创建项目
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-blue-500 text-white border-blue-400 hover:bg-blue-400">
              <Link href="/questions">
                生成问题
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计卡片区域 - 显示项目、数据集、问题、答案的统计信息 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>项目总数</CardDescription>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiFolder className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                <Link href="/projects">
                  查看所有项目 →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>数据集总数</CardDescription>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDatasets}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FiFileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="link" className="p-0 h-auto text-green-600 hover:text-green-800">
                <Link href="/projects">
                  管理数据集 →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>生成问题</CardDescription>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiHelpCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="link" className="p-0 h-auto text-purple-600 hover:text-purple-800">
                <Link href="/questions">
                  生成更多问题 →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription>生成答案</CardDescription>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiMessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Button asChild variant="link" className="p-0 h-auto text-orange-600 hover:text-orange-800">
                <Link href="/answers">
                  生成更多答案 →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 - 响应式网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* 左侧 - 最近项目列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近项目</CardTitle>
              <Button asChild variant="link" className="p-0 h-auto">
                <Link href="/projects">
                  查看全部
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FiFolder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有创建任何项目</p>
                <Button asChild>
                  <Link href="/projects">
                    <FiFolder className="mr-2 h-4 w-4" />
                    创建第一个项目
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Card key={project.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <Link href={`/projects/${project.id}`} className="block">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <CardDescription className="mt-1 line-clamp-2">
                              {project.description || '暂无描述'}
                            </CardDescription>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <FiClock className="mr-1 h-3 w-3" />
                              更新于 {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FiFolder className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 右侧 - 最近生成的问题列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>最近生成的问题</CardTitle>
              <Button asChild variant="link" className="p-0 h-auto text-purple-600 hover:text-purple-800">
                <Link href="/questions">
                  查看全部
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuestions.length === 0 ? (
              <div className="text-center py-8">
                <FiHelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有生成任何问题</p>
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/questions">
                    <FiHelpCircle className="mr-2 h-4 w-4" />
                    开始生成问题
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuestions.map((question) => {
                  const hasAnswer = answers.some(answer => answer.questionId === question.id);
                  return (
                    <Card key={question.id} className="border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {question.generatedQuestion}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <FiClock className="mr-1 h-3 w-3" />
                              {new Date(question.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                          <div className="ml-3 flex items-center">
                            {hasAnswer ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <FiCheckCircle className="mr-1 h-3 w-3" />
                                已答案
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                待答案
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快速操作区域 - 提供常用功能的快捷入口 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="hover:bg-gray-50 transition-colors cursor-pointer group">
              <CardContent className="p-4">
                <Link href="/projects" className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <FiFolder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">创建项目</p>
                    <CardDescription>新建数据集项目</CardDescription>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:bg-gray-50 transition-colors cursor-pointer group">
              <CardContent className="p-4">
                <Link href="/questions" className="flex items-center">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <FiHelpCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">生成问题</p>
                    <CardDescription>从数据集生成问题</CardDescription>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:bg-gray-50 transition-colors cursor-pointer group">
              <CardContent className="p-4">
                <Link href="/answers" className="flex items-center">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <FiMessageSquare className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">生成答案</p>
                    <CardDescription>为问题生成答案</CardDescription>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-500">数据分析</p>
                    <CardDescription className="text-gray-400">即将推出</CardDescription>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 页面底部 - 使用提示和帮助信息 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start">
            <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <FiUsers className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-blue-900">使用提示</h3>
              <div className="mt-2 text-sm text-blue-800">
                <p className="mb-2">
                  <strong>第一步：</strong>创建项目并上传数据集文件
                </p>
                <p className="mb-2">
                  <strong>第二步：</strong>在问题生成页面选择数据集片段并生成问题
                </p>
                <p>
                  <strong>第三步：</strong>在答案生成页面为问题生成对应的答案
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
