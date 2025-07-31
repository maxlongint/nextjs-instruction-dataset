// 项目相关类型定义
export interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewProject {
  name: string;
  description?: string;
}

// 数据集相关类型定义
export interface Dataset {
  id: number;
  projectId: number;
  name: string;
  description?: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  type?: 'text' | 'csv' | 'json';
  size?: number;
  content?: string;
  segmentDelimiter: string;
  segmentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewDataset {
  projectId: number;
  name: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  type?: 'text' | 'csv' | 'json';
  size?: number;
  content?: string;
  segmentDelimiter?: string;
  segmentCount?: number;
}

// 问题相关类型定义
export interface Question {
  id: number;
  uid?: string;
  projectId: number;
  datasetId: number;
  prompt: string;
  content: string;
  generatedQuestion: string;
  wordCount?: number;
  status: 'generated' | 'answered' | 'exported';
  createdAt: string;
}

export interface NewQuestion {
  projectId: number;
  datasetId: number;
  prompt: string;
  content: string;
  generatedQuestion: string;
  wordCount?: number;
  status?: 'generated' | 'answered' | 'exported';
}

// 答案相关类型定义
export interface Answer {
  id: number;
  questionId: number;
  prompt: string;
  generatedAnswer: string;
  createdAt: string;
}

export interface NewAnswer {
  questionId: number;
  prompt: string;
  generatedAnswer: string;
}

// 问题模板类型定义
export interface QuestionTemplate {
  id: number;
  name: string;
  description?: string;
  template: string;
  category?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewQuestionTemplate {
  name: string;
  description?: string;
  template: string;
  category?: string;
  isDefault?: boolean;
}

// 问题生成任务类型定义
export interface QuestionGenerationTask {
  id: number;
  projectId: number;
  datasetId: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalQuestions: number;
  completedQuestions: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewQuestionGenerationTask {
  projectId: number;
  datasetId: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  totalQuestions?: number;
  completedQuestions?: number;
}

// 提示词模板类型定义
export interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  template: string;
  category: 'question' | 'answer' | 'general' | 'basic' | 'professional';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewPromptTemplate {
  name: string;
  description?: string;
  template: string;
  category?: 'question' | 'answer' | 'general' | 'basic' | 'professional';
  isDefault?: boolean;
}

// 系统设置类型定义
export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface NewSetting {
  key: string;
  value: string;
  description?: string;
}

// 通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页相关类型
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 文件上传相关类型
export interface FileUploadResult {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// 生成配置类型
export interface GenerationConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// 导出配置类型
export interface ExportConfig {
  format: 'json' | 'csv' | 'xlsx';
  includeAnswers: boolean;
  includeMetadata: boolean;
}

// 数据集分段类型定义
export interface Segment {
  id: number;
  content: string;
  segmentId?: string;
}