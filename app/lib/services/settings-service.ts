import { db } from '../db';
import { settings, type Setting, type NewSetting } from '../db/schema';
import { eq } from 'drizzle-orm';

export class SettingsService {
  // 获取所有设置
  static async getAllSettings(): Promise<Setting[]> {
    try {
      return await db.select().from(settings).orderBy(settings.key);
    } catch (error) {
      console.error('获取设置列表失败:', error);
      throw new Error('获取设置列表失败');
    }
  }

  // 根据key获取设置
  static async getSettingByKey(key: string): Promise<Setting | null> {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, key));
      return result[0] || null;
    } catch (error) {
      console.error('获取设置失败:', error);
      throw new Error('获取设置失败');
    }
  }

  // 根据ID获取设置
  static async getSettingById(id: number): Promise<Setting | null> {
    try {
      const result = await db.select().from(settings).where(eq(settings.id, id));
      return result[0] || null;
    } catch (error) {
      console.error('获取设置详情失败:', error);
      throw new Error('获取设置详情失败');
    }
  }

  // 创建或更新设置
  static async upsertSetting(key: string, value: string, description?: string): Promise<Setting> {
    try {
      // 先检查设置是否存在
      const existingSetting = await this.getSettingByKey(key);
      
      if (existingSetting) {
        // 更新现有设置
        const result = await db.update(settings)
          .set({ 
            value, 
            description: description || existingSetting.description,
            updatedAt: new Date().toISOString()
          })
          .where(eq(settings.key, key))
          .returning();
        return result[0];
      } else {
        // 创建新设置
        const result = await db.insert(settings).values({
          key,
          value,
          description,
          updatedAt: new Date().toISOString(),
        }).returning();
        return result[0];
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      throw new Error('保存设置失败');
    }
  }

  // 批量更新设置
  static async updateSettings(settingsData: Array<{ key: string; value: string; description?: string }>): Promise<Setting[]> {
    try {
      const results: Setting[] = [];
      
      for (const setting of settingsData) {
        const result = await this.upsertSetting(setting.key, setting.value, setting.description);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('批量更新设置失败:', error);
      throw new Error('批量更新设置失败');
    }
  }

  // 删除设置
  static async deleteSetting(key: string): Promise<void> {
    try {
      const result = await db.delete(settings).where(eq(settings.key, key));
      if (result.changes === 0) {
        throw new Error('设置不存在');
      }
    } catch (error) {
      console.error('删除设置失败:', error);
      throw new Error('删除设置失败');
    }
  }

  // 获取AI模型配置
  static async getAIConfig() {
    try {
      const configs = await Promise.all([
        this.getSettingByKey('ai_api_url'),
        this.getSettingByKey('ai_api_key'),
        this.getSettingByKey('ai_model_name'),
        this.getSettingByKey('ai_max_tokens'),
        this.getSettingByKey('ai_temperature'),
      ]);

      return {
        apiUrl: configs[0]?.value || '',
        apiKey: configs[1]?.value || '',
        modelName: configs[2]?.value || 'gpt-3.5-turbo',
        maxTokens: parseInt(configs[3]?.value || '2000'),
        temperature: parseFloat(configs[4]?.value || '0.7'),
      };
    } catch (error) {
      console.error('获取AI配置失败:', error);
      throw new Error('获取AI配置失败');
    }
  }

  // 保存AI模型配置
  static async saveAIConfig(config: {
    apiUrl?: string;
    apiKey?: string;
    modelName?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<void> {
    try {
      const settingsToUpdate = [];

      if (config.apiUrl !== undefined) {
        settingsToUpdate.push({
          key: 'ai_api_url',
          value: config.apiUrl,
          description: 'AI模型API地址'
        });
      }

      if (config.apiKey !== undefined) {
        settingsToUpdate.push({
          key: 'ai_api_key',
          value: config.apiKey,
          description: 'AI模型API密钥'
        });
      }

      if (config.modelName !== undefined) {
        settingsToUpdate.push({
          key: 'ai_model_name',
          value: config.modelName,
          description: 'AI模型名称'
        });
      }

      if (config.maxTokens !== undefined) {
        settingsToUpdate.push({
          key: 'ai_max_tokens',
          value: config.maxTokens.toString(),
          description: '最大生成令牌数'
        });
      }

      if (config.temperature !== undefined) {
        settingsToUpdate.push({
          key: 'ai_temperature',
          value: config.temperature.toString(),
          description: '生成温度参数'
        });
      }

      await this.updateSettings(settingsToUpdate);
    } catch (error) {
      console.error('保存AI配置失败:', error);
      throw new Error('保存AI配置失败');
    }
  }

  // 获取应用配置
  static async getAppConfig() {
    try {
      const configs = await Promise.all([
        this.getSettingByKey('app_theme'),
        this.getSettingByKey('app_language'),
        this.getSettingByKey('app_auto_save'),
      ]);

      return {
        theme: configs[0]?.value || 'light',
        language: configs[1]?.value || 'zh-CN',
        autoSave: configs[2]?.value === 'true',
      };
    } catch (error) {
      console.error('获取应用配置失败:', error);
      throw new Error('获取应用配置失败');
    }
  }

  // 保存应用配置
  static async saveAppConfig(config: {
    theme?: string;
    language?: string;
    autoSave?: boolean;
  }): Promise<void> {
    try {
      const settingsToUpdate = [];

      if (config.theme !== undefined) {
        settingsToUpdate.push({
          key: 'app_theme',
          value: config.theme,
          description: '应用主题'
        });
      }

      if (config.language !== undefined) {
        settingsToUpdate.push({
          key: 'app_language',
          value: config.language,
          description: '应用语言'
        });
      }

      if (config.autoSave !== undefined) {
        settingsToUpdate.push({
          key: 'app_auto_save',
          value: config.autoSave.toString(),
          description: '自动保存'
        });
      }

      await this.updateSettings(settingsToUpdate);
    } catch (error) {
      console.error('保存应用配置失败:', error);
      throw new Error('保存应用配置失败');
    }
  }

  // 重置所有设置
  static async resetAllSettings(): Promise<void> {
    try {
      // 删除所有设置记录
      await db.delete(settings);
      
      // 重新创建默认设置
      const defaultSettings = [
        { key: 'ai_model_name', value: 'gpt-3.5-turbo', description: 'AI模型名称' },
        { key: 'ai_max_tokens', value: '2000', description: '最大生成令牌数' },
        { key: 'ai_temperature', value: '0.7', description: '生成温度参数' },
        { key: 'app_theme', value: 'light', description: '应用主题' },
        { key: 'app_language', value: 'zh-CN', description: '应用语言' },
        { key: 'app_auto_save', value: 'true', description: '自动保存' },
      ];

      await this.updateSettings(defaultSettings);
    } catch (error) {
      console.error('重置设置失败:', error);
      throw new Error('重置设置失败');
    }
  }
}