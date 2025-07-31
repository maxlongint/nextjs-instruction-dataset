'use client';

import { useEffect, useState } from 'react';
import { dataInitService } from '../lib/data-service';
import { DataValidator } from '../lib/data-validator';
import { ScenarioManager } from '../lib/data-scenarios';

interface DataInitializerProps {
  children: React.ReactNode;
}

export default function DataInitializer({ children }: DataInitializerProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 检查是否已有数据
        const stored = localStorage.getItem('app-store');
        
        if (!stored) {
          console.log('首次启动，初始化模拟数据...');
          dataInitService.initializeMockData();
        } else {
          console.log('检测到现有数据，验证数据完整性...');
          
          // 验证现有数据
          const data = JSON.parse(stored);
          if (data.state) {
            const validator = new DataValidator({
              projects: data.state.projects || [],
              datasets: data.state.datasets || [],
              questions: data.state.questions || [],
              answers: data.state.answers || [],
              users: data.state.users || [],
              tasks: data.state.tasks || []
            });

            const validation = validator.validateAll();
            
            if (!validation.isValid) {
              console.warn('数据验证失败，重新初始化数据:', validation.errors);
              dataInitService.resetAllData();
            } else {
              console.log('数据验证通过');
            }
          } else {
            console.log('数据格式异常，重新初始化...');
            dataInitService.initializeMockData();
          }
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('数据初始化失败:', error);
        setInitError('数据初始化失败，请刷新页面重试');
      }
    };

    initializeData();
  }, []);

  // 开发环境下提供数据管理工具
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isInitialized) {
      // 在控制台提供数据管理工具
      (window as any).dataTools = {
        // 切换数据场景
        setScenario: (scenarioName: string, options?: { itemCount?: number }) => {
          ScenarioManager.setScenario(scenarioName, options);
          console.log(`已切换到场景: ${scenarioName}`);
        },
        
        // 获取当前场景
        getCurrentScenario: () => {
          return ScenarioManager.getCurrentScenario();
        },
        
        // 获取可用场景
        getScenarios: () => {
          return ScenarioManager.getAvailableScenarios();
        },
        
        // 重置数据
        resetData: () => {
          dataInitService.resetAllData();
          console.log('数据已重置');
          window.location.reload();
        },
        
        // 导出数据
        exportData: () => {
          const data = dataInitService.exportData();
          console.log('导出的数据:', data);
          return data;
        },
        
        // 验证数据
        validateData: () => {
          const stored = localStorage.getItem('app-store');
          if (stored) {
            const data = JSON.parse(stored);
            const validator = new DataValidator({
              projects: data.state.projects || [],
              datasets: data.state.datasets || [],
              questions: data.state.questions || [],
              answers: data.state.answers || [],
              users: data.state.users || [],
              tasks: data.state.tasks || []
            });
            
            const validation = validator.validateAll();
            console.log('数据验证结果:', validation);
            console.log(validator.generateReport());
            return validation;
          }
        }
      };

      console.log('🔧 开发工具已加载！使用 window.dataTools 访问数据管理功能');
      console.log('可用命令:');
      console.log('- dataTools.setScenario("empty") - 切换到空数据场景');
      console.log('- dataTools.setScenario("single") - 切换到单条数据场景');
      console.log('- dataTools.setScenario("large", {itemCount: 100}) - 切换到大量数据场景');
      console.log('- dataTools.getCurrentScenario() - 获取当前场景');
      console.log('- dataTools.getScenarios() - 获取所有可用场景');
      console.log('- dataTools.resetData() - 重置所有数据');
      console.log('- dataTools.validateData() - 验证数据完整性');
    }
  }, [isInitialized]);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            初始化失败
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4">
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            正在初始化数据...
          </h3>
          <p className="text-sm text-gray-600">
            首次启动需要加载模拟数据，请稍候
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 数据状态指示器组件（开发环境使用）
export function DataStatusIndicator() {
  const [currentScenario, setCurrentScenario] = useState<string>('');
  const [dataStats, setDataStats] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const updateStatus = () => {
        const scenario = ScenarioManager.getCurrentScenario();
        setCurrentScenario(scenario);

        // 获取数据统计
        const stored = localStorage.getItem('app-store');
        if (stored) {
          const data = JSON.parse(stored);
          setDataStats({
            projects: data.state?.projects?.length || 0,
            datasets: data.state?.datasets?.length || 0,
            questions: data.state?.questions?.length || 0,
            answers: data.state?.answers?.length || 0,
            users: data.state?.users?.length || 0,
            tasks: data.state?.tasks?.length || 0
          });
        }
      };

      updateStatus();
      
      // 监听存储变化
      const handleStorageChange = () => updateStatus();
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs rounded-lg p-3 z-50">
      <div className="font-semibold mb-1">数据状态 ({currentScenario})</div>
      {dataStats && (
        <div className="space-y-1">
          <div>项目: {dataStats.projects}</div>
          <div>数据集: {dataStats.datasets}</div>
          <div>问题: {dataStats.questions}</div>
          <div>答案: {dataStats.answers}</div>
          <div>用户: {dataStats.users}</div>
          <div>任务: {dataStats.tasks}</div>
        </div>
      )}
    </div>
  );
}