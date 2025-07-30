'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw, 
  FiDownload, 
  FiEye,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiExternalLink
} from 'react-icons/fi';

interface GenerationResult {
  success: boolean;
  questionId?: number;
  question?: string;
  error?: string;
  segmentIndex: number;
  content: string;
}

interface GenerationSummary {
  total: number;
  successful: number;
  failed: number;
  retried?: number;
  questions: Array<{
    id: number;
    content: string;
    generatedQuestion: string;
    segmentIndex: number;
  }>;
}

interface GenerationResultsProps {
  results: GenerationResult[];
  summary: GenerationSummary;
  isGenerating: boolean;
  onRetryFailed?: () => void;
  onExportResults?: () => void;
  onViewQuestion?: (questionId: number) => void;
  onEditQuestion?: (questionId: number) => void;
  onDeleteQuestion?: (questionId: number) => void;
}

export default function GenerationResults({
  results,
  summary,
  isGenerating,
  onRetryFailed,
  onExportResults,
  onViewQuestion,
  onEditQuestion,
  onDeleteQuestion
}: GenerationResultsProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // 过滤结果
  const filteredResults = results.filter(result => {
    switch (selectedTab) {
      case 'success':
        return result.success;
      case 'failed':
        return !result.success;
      default:
        return true;
    }
  });

  // 切换展开状态
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // 复制内容到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加一个toast提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 获取内容预览
  const getContentPreview = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  if (results.length === 0 && !isGenerating) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <div className="mb-4">
              <FiEye className="mx-auto h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无生成结果</h3>
            <p className="text-sm text-gray-500">
              选择段落并开始生成问题后，结果将在这里显示
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 结果统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>生成结果统计</span>
            <div className="flex items-center space-x-2">
              {summary.failed > 0 && onRetryFailed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryFailed}
                  disabled={isGenerating}
                >
                  <FiRefreshCw className="mr-1 h-4 w-4" />
                  重试失败项
                </Button>
              )}
              {onExportResults && summary.successful > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportResults}
                >
                  <FiDownload className="mr-1 h-4 w-4" />
                  导出结果
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-500">总计</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
              <div className="text-sm text-gray-500">成功</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-500">失败</div>
            </div>
            {summary.retried !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.retried}</div>
                <div className="text-sm text-gray-500">重试</div>
              </div>
            )}
          </div>
          
          {/* 成功率进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>成功率</span>
              <span>{Math.round((summary.successful / summary.total) * 100)}%</span>
            </div>
            <Progress 
              value={(summary.successful / summary.total) * 100} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* 结果列表 */}
      <Card>
        <CardHeader>
          <CardTitle>详细结果</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={selectedTab === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('all')}
            >
              全部 ({results.length})
            </Button>
            <Button
              variant={selectedTab === 'success' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('success')}
            >
              <FiCheckCircle className="mr-1 h-4 w-4" />
              成功 ({summary.successful})
            </Button>
            <Button
              variant={selectedTab === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('failed')}
            >
              <FiXCircle className="mr-1 h-4 w-4" />
              失败 ({summary.failed})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                没有符合条件的结果
              </div>
            ) : (
              filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* 状态和段落索引 */}
                      <div className="flex items-center mb-2">
                        {result.success ? (
                          <FiCheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <FiXCircle className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          段落 #{result.segmentIndex + 1}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? '生成成功' : '生成失败'}
                        </span>
                      </div>

                      {/* 原始内容预览 */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">原始内容:</div>
                        <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                          {expandedItems.has(index) 
                            ? result.content 
                            : getContentPreview(result.content)
                          }
                          {result.content.length > 100 && (
                            <button
                              onClick={() => toggleExpanded(index)}
                              className="ml-2 text-blue-600 hover:text-blue-700 text-xs"
                            >
                              {expandedItems.has(index) ? '收起' : '展开'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 生成的问题或错误信息 */}
                      {result.success ? (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">生成的问题:</div>
                          <div className="text-sm font-medium text-gray-900 bg-white p-2 rounded border">
                            {result.question}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">错误信息:</div>
                          <div className="text-sm text-red-700 bg-white p-2 rounded border">
                            {result.error}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-1 ml-4">
                      {result.success && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(result.question || '')}
                            title="复制问题"
                          >
                            <FiCopy className="h-4 w-4" />
                          </Button>
                          {onViewQuestion && result.questionId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewQuestion(result.questionId!)}
                              title="查看详情"
                            >
                              <FiExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          {onEditQuestion && result.questionId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditQuestion(result.questionId!)}
                              title="编辑问题"
                            >
                              <FiEdit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDeleteQuestion && result.questionId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteQuestion(result.questionId!)}
                              title="删除问题"
                              className="text-red-600 hover:text-red-700"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(result.content)}
                        title="复制原始内容"
                      >
                        <FiCopy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      {summary.successful > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/questions'}
              >
                <FiExternalLink className="mr-2 h-4 w-4" />
                查看所有问题
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/answers'}
              >
                <FiExternalLink className="mr-2 h-4 w-4" />
                生成对应答案
              </Button>
              {onExportResults && (
                <Button
                  variant="outline"
                  onClick={onExportResults}
                >
                  <FiDownload className="mr-2 h-4 w-4" />
                  导出为JSON
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}