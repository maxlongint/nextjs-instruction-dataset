import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 项目表
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 数据集表
export const datasets = sqliteTable('datasets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  content: text('content'),
  segmentDelimiter: text('segment_delimiter').default('\n\n'), // 分段标识符，默认双换行符
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 问题模板表（保留现有表）
export const questionTemplates = sqliteTable('question_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  template: text('template').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 问题生成任务表（保留现有表）
export const questionGenerationTasks = sqliteTable('question_generation_tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  datasetId: integer('dataset_id').notNull().references(() => datasets.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'), // pending, running, completed, failed
  totalQuestions: integer('total_questions').default(0),
  completedQuestions: integer('completed_questions').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 问题生成记录表
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid'), // 保留现有字段
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  datasetId: integer('dataset_id').notNull().references(() => datasets.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  content: text('content').notNull(),
  generatedQuestion: text('generated_question').notNull(),
  wordCount: integer('word_count'), // 保留现有字段
  status: text('status').default('generated'), // generated, answered, exported
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 答案生成记录表
export const answers = sqliteTable('answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionId: integer('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  generatedAnswer: text('generated_answer').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 系统设置表
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 提示词模板表
export const promptTemplates = sqliteTable('prompt_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  template: text('template').notNull(),
  category: text('category').default('question'), // question, answer, general
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 导出类型定义
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type PromptTemplate = typeof promptTemplates.$inferSelect;
export type NewPromptTemplate = typeof promptTemplates.$inferInsert;
export type QuestionTemplate = typeof questionTemplates.$inferSelect;
export type NewQuestionTemplate = typeof questionTemplates.$inferInsert;
export type QuestionGenerationTask = typeof questionGenerationTasks.$inferSelect;
export type NewQuestionGenerationTask = typeof questionGenerationTasks.$inferInsert;
