'use client';

import { useEffect } from 'react';
import { FiFolder, FiFileText, FiHelpCircle, FiMessageSquare, FiTrendingUp, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
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
    <div className="space-y-8">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">欢迎使用指令数据集生成平台</h1>
        <p className="text-blue-100 text-lg">
          智能化的问答数据集生成工具，帮助您快速构建高质量的训练数据
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link 
            href="/projects" 
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            开始创建项目
          </Link>
          <Link 
            href="/questions" 
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-400 transition-colors"
          >
            生成问题
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">项目总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiFolder className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/projects" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              查看所有项目 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">数据集总数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDatasets}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/projects" 
              className="text-sm text-green-600 hover:text-green-800 transition-colors"
            >
              管理数据集 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">生成问题</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiHelpCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/questions" 
              className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
            >
              生成更多问题 →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">生成答案</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnswers}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiMessageSquare className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/answers" 
              className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
            >
              生成更多答案 →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近项目 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最近项目</h2>
            <Link 
              href="/projects" 
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              查看全部
            </Link>
          </div>
          
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FiFolder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有创建任何项目</p>
              <Link 
                href="/projects" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiFolder className="mr-2 h-4 w-4" />
                创建第一个项目
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description || '暂无描述'}
                      </p>
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
              ))}
            </div>
          )}
        </div>

        {/* 最近问题 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">最近生成的问题</h2>
            <Link 
              href="/questions" 
              className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
            >
              查看全部
            </Link>
          </div>
          
          {recentQuestions.length === 0 ? (
            <div className="text-center py-8">
              <FiHelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有生成任何问题</p>
              <Link 
                href="/questions" 
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FiHelpCircle className="mr-2 h-4 w-4" />
                开始生成问题
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentQuestions.map((question) => {
                const hasAnswer = answers.some(answer => answer.questionId === question.id);
                return (
                  <div
                    key={question.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
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
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <FiCheckCircle className="mr-1 h-3 w-3" />
                            已答案
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            待答案
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/projects"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FiFolder className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">创建项目</p>
              <p className="text-sm text-gray-600">新建数据集项目</p>
            </div>
          </Link>

          <Link
            href="/questions"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <FiHelpCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">生成问题</p>
              <p className="text-sm text-gray-600">从数据集生成问题</p>
            </div>
          </Link>

          <Link
            href="/answers"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <FiMessageSquare className="h-5 w-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">生成答案</p>
              <p className="text-sm text-gray-600">为问题生成答案</p>
            </div>
          </Link>

          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-500">数据分析</p>
              <p className="text-sm text-gray-400">即将推出</p>
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
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
      </div>
    </div>
  );
}