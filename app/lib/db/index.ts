import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// 确保数据库目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'database.sqlite');
const sqlite = new Database(dbPath);

// 启用外键约束
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// 初始化数据库表
export async function initDatabase() {
  try {
    // 创建表的SQL语句
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createDatasetsTable = `
      CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        content TEXT,
        segment_delimiter TEXT DEFAULT '\n\n',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      );
    `;

    const createQuestionsTable = `
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL,
        dataset_id INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        content TEXT NOT NULL,
        generated_question TEXT NOT NULL,
        status TEXT DEFAULT 'generated',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
      );
    `;

    const createAnswersTable = `
      CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL,
        prompt TEXT NOT NULL,
        generated_answer TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 执行创建表语句
    sqlite.exec(createProjectsTable);
    sqlite.exec(createDatasetsTable);
    sqlite.exec(createQuestionsTable);
    sqlite.exec(createAnswersTable);
    sqlite.exec(createSettingsTable);

    // 数据库迁移：为现有的datasets表添加segment_delimiter字段
    // 数据库迁移：为现有的datasets表添加segment_delimiter字段
    try {
      const addSegmentDelimiterColumn = `
        ALTER TABLE datasets ADD COLUMN segment_delimiter TEXT DEFAULT '\n\n';
      `;
      sqlite.exec(addSegmentDelimiterColumn);
      console.log('已添加segment_delimiter字段到datasets表');
    } catch (error) {
      // 如果字段已存在，会抛出错误，这是正常的
      if (!(error as any)?.message?.includes('duplicate column name')) {
        console.warn('添加segment_delimiter字段时出现警告:', (error as any)?.message);
      }
    }

    // 插入默认系统设置
    const insertDefaultSettings = sqlite.prepare(`
      INSERT OR IGNORE INTO settings (key, value, description) VALUES (?, ?, ?)
    `);

    insertDefaultSettings.run('ai_model_url', '', 'AI模型API地址');
    insertDefaultSettings.run('ai_model_key', '', 'AI模型API密钥');
    insertDefaultSettings.run('ai_model_name', 'gpt-3.5-turbo', '默认AI模型名称');
    insertDefaultSettings.run('max_tokens', '2000', '最大生成token数');
    insertDefaultSettings.run('temperature', '0.7', '生成温度参数');

    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
}

// 导出数据库实例
export { sqlite };