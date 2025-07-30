'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle, 
  FiInfo,
  FiX,
  FiLoader
} from 'react-icons/fi';

// 消息类型
export enum MessageType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

// 消息接口
export interface FeedbackMessage {
  id: string;
  type: MessageType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
}

// 进度消息接口
export interface ProgressMessage extends FeedbackMessage {
  progress?: number;
  current?: string;
  total?: number;
  completed?: number;
}

// 反馈系统上下文
interface FeedbackContextType {
  messages: FeedbackMessage[];
  showMessage: (message: Omit<FeedbackMessage, 'id'>) => string;
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, persistent?: boolean) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
  showProgress: (message: ProgressMessage) => string;
  updateProgress: (id: string, progress: number, current?: string) => void;
  removeMessage: (id: string) => void;
  clearAll: () => void;
}

// 创建上下文
import { createContext, useContext } from 'react';

const FeedbackContext = createContext<FeedbackContextType | null>(null);

// 反馈系统提供者
export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  // 生成唯一ID
  const generateId = () => `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 显示消息
  const showMessage = (message: Omit<FeedbackMessage, 'id'>): string => {
    const id = generateId();
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? (message.type === MessageType.ERROR ? 0 : 5000)
    };

    setMessages(prev => [...prev, newMessage]);

    // 自动移除非持久化消息
    if (newMessage.duration && newMessage.duration > 0 && !newMessage.persistent) {
      setTimeout(() => {
        removeMessage(id);
      }, newMessage.duration);
    }

    return id;
  };

  // 快捷方法
  const showSuccess = (title: string, message: string, duration = 5000) =>
    showMessage({ type: MessageType.SUCCESS, title, message, duration });

  const showError = (title: string, message: string, persistent = false) =>
    showMessage({ type: MessageType.ERROR, title, message, persistent, duration: persistent ? 0 : 8000 });

  const showWarning = (title: string, message: string, duration = 6000) =>
    showMessage({ type: MessageType.WARNING, title, message, duration });

  const showInfo = (title: string, message: string, duration = 4000) =>
    showMessage({ type: MessageType.INFO, title, message, duration });

  const showProgress = (message: ProgressMessage) =>
    showMessage({ ...message, type: MessageType.LOADING, persistent: true });

  // 更新进度
  const updateProgress = (id: string, progress: number, current?: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { 
            ...msg, 
            message: current || msg.message,
            ...(msg as ProgressMessage).progress !== undefined && { progress }
          }
        : msg
    ));
  };

  // 移除消息
  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  // 清空所有消息
  const clearAll = () => {
    setMessages([]);
  };

  const contextValue: FeedbackContextType = {
    messages,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showProgress,
    updateProgress,
    removeMessage,
    clearAll
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
}

// 反馈容器组件
function FeedbackContainer() {
  const context = useContext(FeedbackContext);
  if (!context) return null;

  const { messages, removeMessage } = context;

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {messages.map(message => (
        <FeedbackMessage
          key={message.id}
          message={message}
          onClose={() => removeMessage(message.id)}
        />
      ))}
    </div>
  );
}

// 单个反馈消息组件
function FeedbackMessage({ 
  message, 
  onClose 
}: { 
  message: FeedbackMessage; 
  onClose: () => void;
}) {
  const getIcon = () => {
    switch (message.type) {
      case MessageType.SUCCESS:
        return <FiCheckCircle className="h-5 w-5 text-green-600" />;
      case MessageType.ERROR:
        return <FiXCircle className="h-5 w-5 text-red-600" />;
      case MessageType.WARNING:
        return <FiAlertTriangle className="h-5 w-5 text-yellow-600" />;
      case MessageType.INFO:
        return <FiInfo className="h-5 w-5 text-blue-600" />;
      case MessageType.LOADING:
        return <FiLoader className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (message.type) {
      case MessageType.SUCCESS:
        return 'border-green-200 bg-green-50';
      case MessageType.ERROR:
        return 'border-red-200 bg-red-50';
      case MessageType.WARNING:
        return 'border-yellow-200 bg-yellow-50';
      case MessageType.INFO:
        return 'border-blue-200 bg-blue-50';
      case MessageType.LOADING:
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const progressMessage = message as ProgressMessage;

  return (
    <Card className={`${getBorderColor()} border shadow-lg animate-in slide-in-from-right-full duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {message.title}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                {message.message}
              </p>
              
              {/* 进度条 */}
              {message.type === MessageType.LOADING && progressMessage.progress !== undefined && (
                <div className="space-y-2">
                  <Progress value={progressMessage.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{progressMessage.current || '处理中...'}</span>
                    {progressMessage.total && progressMessage.completed !== undefined && (
                      <span>{progressMessage.completed}/{progressMessage.total}</span>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex space-x-2 mt-3">
                  {message.actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || 'outline'}
                      size="sm"
                      onClick={action.action}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 使用反馈系统的Hook
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
}

// 错误处理Hook
export function useErrorHandler() {
  const feedback = useFeedback();

  const handleError = (error: any, title = '操作失败') => {
    let message = '发生了未知错误，请稍后重试';
    
    if (error?.response?.data?.error) {
      message = error.response.data.error;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    return feedback.showError(title, message, true);
  };

  const handleSuccess = (title: string, message: string) => {
    return feedback.showSuccess(title, message);
  };

  const handleWarning = (title: string, message: string) => {
    return feedback.showWarning(title, message);
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    showInfo: feedback.showInfo,
    showProgress: feedback.showProgress,
    updateProgress: feedback.updateProgress,
    removeMessage: feedback.removeMessage
  };
}

// 异步操作包装器
export function useAsyncOperation() {
  const { handleError, handleSuccess, showProgress, updateProgress, removeMessage } = useErrorHandler();

  const executeWithFeedback = async <T>(
    operation: () => Promise<T>,
    options: {
      loadingTitle?: string;
      loadingMessage?: string;
      successTitle?: string;
      successMessage?: string;
      errorTitle?: string;
      showProgress?: boolean;
      onProgress?: (progress: number, current?: string) => void;
    } = {}
  ): Promise<T | null> => {
    const {
      loadingTitle = '处理中',
      loadingMessage = '请稍候...',
      successTitle = '操作成功',
      successMessage = '操作已完成',
      errorTitle = '操作失败',
      showProgress: enableProgress = false
    } = options;

    let progressId: string | null = null;

    try {
      // 显示加载状态
      if (enableProgress) {
        progressId = showProgress({
          id: '',
          type: MessageType.LOADING,
          title: loadingTitle,
          message: loadingMessage,
          progress: 0,
          persistent: true
        });
      }

      // 设置进度更新回调
      if (options.onProgress && progressId) {
        options.onProgress = (progress: number, current?: string) => {
          updateProgress(progressId!, progress, current);
        };
      }

      // 执行操作
      const result = await operation();

      // 移除加载状态
      if (progressId) {
        removeMessage(progressId);
      }

      // 显示成功消息
      handleSuccess(successTitle, successMessage);

      return result;
    } catch (error) {
      // 移除加载状态
      if (progressId) {
        removeMessage(progressId);
      }

      // 显示错误消息
      handleError(error, errorTitle);
      return null;
    }
  };

  return { executeWithFeedback };
}