'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSave, FiRefreshCw, FiDatabase, FiSettings, FiGlobe, FiCheck } from 'react-icons/fi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

interface AIConfig {
  platform: string;
  apiUrl: string;
  apiKey: string;
  maxTokens: number;
  temperature: number;
  concurrency: number;
}

interface PlatformConfig {
  name: string;
  label: string;
  defaultUrl: string;
  placeholder: string;
  requiresKey: boolean;
  models: string[];
}

interface AppConfig {
  theme: string;
  language: string;
  autoSave: boolean;
}

export default function SettingsPage() {
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    platform: '',
    apiUrl: '',
    apiKey: '',
    maxTokens: 2000,
    temperature: 0.7,
    concurrency: 3,
  });

  // 平台配置
  const platformConfigs: Record<string, PlatformConfig> = {
    openai: {
      name: 'openai',
      label: 'OpenAI',
      defaultUrl: 'https://api.openai.com/v1',
      placeholder: 'https://api.openai.com/v1',
      requiresKey: true,
      models: []
    },
    anthropic: {
      name: 'anthropic',
      label: 'Anthropic (Claude)',
      defaultUrl: 'https://api.anthropic.com',
      placeholder: 'https://api.anthropic.com',
      requiresKey: true,
      models: []
    },
    deepseek: {
      name: 'deepseek',
      label: 'DeepSeek',
      defaultUrl: 'https://api.deepseek.com/v1',
      placeholder: 'https://api.deepseek.com/v1',
      requiresKey: true,
      models: []
    },
    moonshot: {
      name: 'moonshot',
      label: 'Moonshot (Kimi)',
      defaultUrl: 'https://api.moonshot.cn/v1',
      placeholder: 'https://api.moonshot.cn/v1',
      requiresKey: true,
      models: []
    },
    ollama: {
      name: 'ollama',
      label: 'Ollama (本地)',
      defaultUrl: 'http://localhost:11434',
      placeholder: 'http://localhost:11434',
      requiresKey: false,
      models: []
    },
    custom: {
      name: 'custom',
      label: '自定义',
      defaultUrl: '',
      placeholder: '请输入自定义API地址',
      requiresKey: true,
      models: []
    }
  };

  const [appConfig, setAppConfig] = useState<AppConfig>({
    theme: 'light',
    language: 'zh-CN',
    autoSave: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // 获取AI配置
  const fetchAIConfig = async () => {
    try {
      const response = await fetch('/api/settings?type=ai');
      const result = await response.json();
      if (result.success) {
        setAiConfig(result.data);
      }
    } catch (error) {
      console.error('获取AI配置失败:', error);
    }
  };

  // 获取应用配置
  const fetchAppConfig = async () => {
    try {
      const response = await fetch('/api/settings?type=app');
      const result = await response.json();
      if (result.success) {
        setAppConfig(result.data);
      }
    } catch (error) {
      console.error('获取应用配置失败:', error);
    }
  };

  // 处理平台选择变化
  const handlePlatformChange = (platform: string) => {
    const config = platformConfigs[platform];
    if (config) {
      setAiConfig(prev => ({
        ...prev,
        platform,
        apiUrl: config.defaultUrl,
        apiKey: ''
      }));
    } else {
      // 如果没有选择平台，清空相关字段
      setAiConfig(prev => ({
        ...prev,
        platform: '',
        apiUrl: '',
        apiKey: ''
      }));
    }
  };

  // 处理API地址变化
  const handleApiUrlChange = (newUrl: string) => {
    setAiConfig(prev => ({ 
      ...prev, 
      apiUrl: newUrl
    }));
  };


  useEffect(() => {
    setMounted(true);
    const loadConfigs = async () => {
      setLoading(true);
      await Promise.all([fetchAIConfig(), fetchAppConfig()]);
      setLoading(false);
    };

    loadConfigs();
  }, []);


  // 保存AI配置
  const handleSaveAIConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ai',
          config: aiConfig,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('AI配置保存成功！');
        setShowSuccessDialog(true);
      } else {
        setErrorMessage('保存失败: ' + result.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('保存AI配置失败:', error);
      setErrorMessage('保存AI配置失败');
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  // 保存应用配置
  const handleSaveAppConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'app',
          config: appConfig,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('应用配置保存成功！');
        setShowSuccessDialog(true);
      } else {
        setErrorMessage('保存失败: ' + result.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('保存应用配置失败:', error);
      setErrorMessage('保存应用配置失败');
      setShowErrorDialog(true);
    } finally {
      setSaving(false);
    }
  };

  // 重置所有设置
  const handleResetSettings = () => {
    setConfirmMessage('确定要重置所有设置吗？此操作将恢复默认配置，无法撤销。');
    setConfirmAction(() => async () => {
      try {
        setResetting(true);
        const response = await fetch('/api/settings?action=reset', {
          method: 'DELETE',
        });

        const result = await response.json();
        
        if (result.success) {
          setSuccessMessage('设置重置成功！');
          setShowSuccessDialog(true);
          // 重新加载配置
          await Promise.all([fetchAIConfig(), fetchAppConfig()]);
        } else {
          setErrorMessage('重置失败: ' + result.error);
          setShowErrorDialog(true);
        }
      } catch (error) {
        console.error('重置设置失败:', error);
        setErrorMessage('重置设置失败');
        setShowErrorDialog(true);
      } finally {
        setResetting(false);
      }
    });
    setShowConfirmDialog(true);
  };

  // 测试AI连接
  const handleTestAIConnection = async () => {
    if (!aiConfig.apiUrl || (!aiConfig.apiKey && platformConfigs[aiConfig.platform]?.requiresKey)) {
      setErrorMessage('请先配置API地址和密钥');
      setShowErrorDialog(true);
      return;
    }

    try {
      // 先保存当前配置
      await handleSaveAIConfig();
      
      // 调用测试API
      const response = await fetch('/api/ai/test', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(`✅ ${result.message}`);
        setShowSuccessDialog(true);
      } else {
        setErrorMessage(`❌ ${result.message}`);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('测试AI连接失败:', error);
      setErrorMessage('❌ 测试AI连接失败: ' + (error instanceof Error ? error.message : '未知错误'));
      setShowErrorDialog(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6" suppressHydrationWarning>
        {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">配置AI模型、数据库连接和应用参数</p>
        </div>
        <button 
          onClick={handleResetSettings}
          disabled={resetting}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {resetting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              重置中...
            </>
          ) : (
            <>
              <FiRefreshCw className="mr-2 h-4 w-4" />
              重置设置
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI模型配置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">AI模型配置</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI平台 <span className="text-red-500">*</span>
              </label>
              <Select 
                value={aiConfig.platform || ""} 
                onValueChange={handlePlatformChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择AI平台" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(platformConfigs).map((config) => (
                    <SelectItem key={config.name} value={config.name}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!aiConfig.platform && (
                <p className="text-xs text-red-500 mt-1">请选择AI平台</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !aiConfig.apiUrl.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={aiConfig.platform && platformConfigs[aiConfig.platform] 
                  ? platformConfigs[aiConfig.platform].placeholder 
                  : "请先选择AI平台"}
                value={aiConfig.apiUrl}
                onChange={(e) => handleApiUrlChange(e.target.value)}
                disabled={!aiConfig.platform}
              />
              {!aiConfig.apiUrl.trim() && aiConfig.platform && (
                <p className="text-xs text-red-500 mt-1">请填写API地址</p>
              )}
              {!aiConfig.platform && (
                <p className="text-xs text-gray-500 mt-1">选择平台后将自动填入默认地址</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥 {aiConfig.platform && platformConfigs[aiConfig.platform]?.requiresKey && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={aiConfig.platform === 'ollama' ? '本地部署无需密钥' : 'sk-...'}
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                disabled={aiConfig.platform === 'ollama'}
              />
              {aiConfig.platform === 'ollama' && (
                <p className="text-xs text-gray-500 mt-1">Ollama本地部署无需API密钥</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大令牌数
                </label>
                <input
                  type="number"
                  min="100"
                  max="8000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={aiConfig.maxTokens}
                  onChange={(e) => setAiConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  温度参数
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={aiConfig.temperature}
                  onChange={(e) => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                并发数
                <span className="text-xs text-gray-500 ml-1">(同时处理的请求数量)</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={aiConfig.concurrency}
                onChange={(e) => setAiConfig({ ...aiConfig, concurrency: parseInt(e.target.value) || 1 })}
                placeholder="建议设置为1-5"
              />
              <p className="text-xs text-gray-500 mt-1">
                设置过高可能导致API限流，建议根据API提供商的限制进行调整
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button 
                onClick={handleSaveAIConfig}
                disabled={saving || !aiConfig.platform || !aiConfig.apiUrl.trim()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    保存配置
                  </>
                )}
              </button>
              
              <button 
                onClick={handleTestAIConnection}
                disabled={!aiConfig.platform || !aiConfig.apiUrl.trim() || (platformConfigs[aiConfig.platform]?.requiresKey && !aiConfig.apiKey.trim())}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <FiGlobe className="mr-2 h-4 w-4" />
                测试连接
              </button>
            </div>
          </div>
        </div>

        {/* 应用设置 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FiSettings className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">应用设置</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                界面主题
              </label>
              <Select value={appConfig.theme || "light"} onValueChange={(value: string) => setAppConfig({ ...appConfig, theme: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择主题" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色主题</SelectItem>
                  <SelectItem value="dark">深色主题</SelectItem>
                  <SelectItem value="auto">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                界面语言
              </label>
              <Select value={appConfig.language || "zh-CN"} onValueChange={(value: string) => setAppConfig({ ...appConfig, language: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="zh-TW">繁体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="autoSave"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={appConfig.autoSave}
                onChange={(e) => setAppConfig({ ...appConfig, autoSave: e.target.checked })}
              />
              <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700">
                启用自动保存
              </label>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleSaveAppConfig}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2 h-4 w-4" />
                    保存设置
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 数据库状态 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FiDatabase className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">数据库状态</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">数据库类型</span>
              <span className="text-sm font-medium text-gray-900">SQLite</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">连接状态</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已连接
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">数据库文件</span>
              <span className="text-sm font-medium text-gray-900">data/database.sqlite</span>
            </div>

            <div className="pt-4 space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                备份数据库
              </button>
              <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                恢复数据库
              </button>
            </div>
          </div>
        </div>

        {/* 系统信息 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <FiGlobe className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">系统信息</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">应用版本</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Node.js版本</span>
              <span className="text-sm font-medium text-gray-900">N/A</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">运行环境</span>
              <span className="text-sm font-medium text-gray-900">开发模式</span>
            </div>

            <div className="pt-4">
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                检查更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* 成功提示 Alert Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <FiCheck className="h-5 w-5 text-green-600 mr-2" />
              操作成功
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 错误提示 Alert Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <div className="h-5 w-5 text-red-600 mr-2">❌</div>
              操作失败
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 警告提示 Alert Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <div className="h-5 w-5 text-orange-600 mr-2">⚠️</div>
              警告
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {warningMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 确认操作 Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <div className="h-5 w-5 text-blue-600 mr-2">❓</div>
              确认操作
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {confirmMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setShowConfirmDialog(false);
              }}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              取消
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                setShowConfirmDialog(false);
                if (confirmAction) {
                  confirmAction();
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
