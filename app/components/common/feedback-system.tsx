'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// 反馈类型定义
export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

// 反馈上下文
interface FeedbackContextType {
  messages: FeedbackMessage[];
  showFeedback: (message: Omit<FeedbackMessage, 'id'>) => void;
  hideFeedback: (id: string) => void;
  clearAll: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

// 反馈提供者组件
export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = useCallback((message: Omit<FeedbackMessage, 'id'>) => {
    const id = Date.now().toString();
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? 5000,
    };

    setMessages(prev => [...prev, newMessage]);

    // 自动隐藏非持久化消息
    if (!message.persistent && newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        hideFeedback(id);
      }, newMessage.duration);
    }
  }, []);

  const hideFeedback = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <FeedbackContext.Provider value={{ messages, showFeedback, hideFeedback, clearAll }}>
      {children}
      <FeedbackContainer />
    </FeedbackContext.Provider>
  );
};

// 反馈容器组件
const FeedbackContainer: React.FC = () => {
  const context = useContext(FeedbackContext);
  if (!context) return null;

  const { messages, hideFeedback } = context;

  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {messages.map((message) => (
        <FeedbackItem
          key={message.id}
          message={message}
          onClose={() => hideFeedback(message.id)}
        />
      ))}
    </div>
  );
};

// 反馈项组件
const FeedbackItem: React.FC<{
  message: FeedbackMessage;
  onClose: () => void;
}> = ({ message, onClose }) => {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${getBackgroundColor()} animate-in slide-in-from-right`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">{message.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{message.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// 使用反馈的Hook
export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

// 错误处理Hook
export const useErrorHandler = () => {
  const { showFeedback } = useFeedback();

  const handleError = useCallback((error: Error | string, title?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    showFeedback({
      type: 'error',
      title: title || '操作失败',
      message: errorMessage,
      duration: 8000,
    });
  }, [showFeedback]);

  return { handleError };
};

// 异步操作Hook
export const useAsyncOperation = <T,>(
  operation: () => Promise<T>,
  options: {
    loadingTitle?: string;
    loadingMessage?: string;
    successTitle?: string;
    successMessage?: string;
    errorTitle?: string;
    showProgress?: boolean;
  } = {}
) => {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      // 显示加载消息
      if (options.loadingTitle || options.loadingMessage) {
        showFeedback({
          type: 'info',
          title: options.loadingTitle || '处理中',
          message: options.loadingMessage || '请稍候...',
          persistent: true,
        });
      }

      const result = await operation();

      // 显示成功消息
      if (options.successTitle || options.successMessage) {
        showFeedback({
          type: 'success',
          title: options.successTitle || '操作成功',
          message: options.successMessage || '操作已完成',
        });
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);

      // 显示错误消息
      showFeedback({
        type: 'error',
        title: options.errorTitle || '操作失败',
        message: error.message,
        duration: 8000,
      });

      return null;
    } finally {
      setLoading(false);
    }
  }, [operation, options, showFeedback]);

  return {
    execute,
    loading,
    error,
  };
};

// 错误边界组件
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-xl font-semibold text-gray-900">出现错误</h1>
            </div>
            <p className="text-gray-600 mb-4">
              应用程序遇到了一个错误。请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}