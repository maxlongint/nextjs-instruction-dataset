// 项目相关类型定义
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  ownerId: number;
  memberIds: number[];
  progress: number; // 0-100
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewProject {
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  tags?: string[];
  ownerId?: number;
  memberIds?: number[];
  progress?: number;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  budget?: number;
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
  type: 'text' | 'csv' | 'json' | 'pdf' | 'docx' | 'xlsx';
  size?: number;
  content?: string;
  segmentDelimiter: string;
  segmentCount?: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  uploadProgress?: number;
  encoding?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  lastAccessedAt?: string;
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
  type?: 'text' | 'csv' | 'json' | 'pdf' | 'docx' | 'xlsx';
  size?: number;
  content?: string;
  segmentDelimiter?: string;
  segmentCount?: number;
  status?: 'uploading' | 'processing' | 'ready' | 'error';
  uploadProgress?: number;
  encoding?: string;
  language?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
  isPublic?: boolean;
}

// 问题相关类型定义
export interface Question {
  id: number;
  uid?: string;
  projectId: number;
  datasetId: number;
  segmentId?: string;
  prompt: string;
  content: string;
  generatedQuestion: string;
  wordCount?: number;
  status: 'draft' | 'generated' | 'reviewed' | 'answered' | 'exported' | 'archived';
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  tags: string[];
  points?: number;
  timeLimit?: number; // 秒
  hints?: string[];
  explanation?: string;
  references?: string[];
  reviewerId?: number;
  reviewedAt?: string;
  reviewComments?: string;
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  ratingCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface NewQuestion {
  projectId: number;
  datasetId: number;
  segmentId?: string;
  prompt: string;
  content: string;
  generatedQuestion: string;
  wordCount?: number;
  status?: 'draft' | 'generated' | 'reviewed' | 'answered' | 'exported' | 'archived';
  type?: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_blank';
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  category?: string;
  tags?: string[];
  points?: number;
  timeLimit?: number;
  hints?: string[];
  explanation?: string;
  references?: string[];
  isPublic?: boolean;
}

// 答案相关类型定义
export interface Answer {
  id: number;
  questionId: number;
  segmentId?: string;
  prompt: string;
  generatedAnswer: string;
  content?: string;
  type: 'generated' | 'manual' | 'imported';
  status: 'draft' | 'generated' | 'reviewed' | 'approved' | 'rejected';
  isCorrect?: boolean;
  confidence?: number; // 0-1
  wordCount?: number;
  language?: string;
  sources?: string[];
  reviewerId?: number;
  reviewedAt?: string;
  reviewComments?: string;
  rating?: number;
  ratingCount?: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewAnswer {
  questionId: number;
  segmentId?: string;
  prompt: string;
  generatedAnswer: string;
  content?: string;
  type?: 'generated' | 'manual' | 'imported';
  status?: 'draft' | 'generated' | 'reviewed' | 'approved' | 'rejected';
  isCorrect?: boolean;
  confidence?: number;
  wordCount?: number;
  language?: string;
  sources?: string[];
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

// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  department?: string;
  position?: string;
  phone?: string;
  bio?: string;
  skills: string[];
  preferences: UserPreferences;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  projectUpdates: boolean;
  questionGenerated: boolean;
  answerReviewed: boolean;
  systemMaintenance: boolean;
}

export interface DashboardSettings {
  defaultView: 'grid' | 'list' | 'kanban';
  itemsPerPage: number;
  showCompletedTasks: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface NewUser {
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  role?: 'admin' | 'manager' | 'member' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
  department?: string;
  position?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
}

// 统计数据类型定义
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalQuestions: number;
  answeredQuestions: number;
  totalDatasets: number;
  totalUsers: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type: 'project_created' | 'question_generated' | 'answer_created' | 'dataset_uploaded' | 'user_joined';
  title: string;
  description: string;
  userId: number;
  userName: string;
  userAvatar?: string;
  entityId?: number;
  entityType?: 'project' | 'question' | 'answer' | 'dataset';
  createdAt: string;
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

// 搜索和过滤类型定义
export interface SearchFilters {
  query?: string;
  status?: string[];
  category?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  userId?: number;
  projectId?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// 批量操作类型定义
export interface BulkOperation {
  action: 'delete' | 'export' | 'archive' | 'activate' | 'update_status' | 'assign_tags';
  itemIds: number[];
  params?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: string[];
  message: string;
}