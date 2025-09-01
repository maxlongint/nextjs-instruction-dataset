'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="max-w-2xl mx-auto mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center text-red-600">
                            <FiAlertTriangle className="mr-2 h-5 w-5" />
                            出现了一个错误
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-gray-700">
                            <p className="mb-2">很抱歉，应用遇到了一个意外错误。</p>
                            {this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm font-medium text-red-800 mb-1">错误信息:</p>
                                    <p className="text-sm text-red-700">{this.state.error.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <Button onClick={this.handleRetry} className="flex items-center">
                                <FiRefreshCw className="mr-2 h-4 w-4" />
                                重试
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => (window.location.href = '/')}
                                className="flex items-center"
                            >
                                <FiHome className="mr-2 h-4 w-4" />
                                返回首页
                            </Button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                                    查看详细错误信息 (开发模式)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                                    {this.state.error?.stack}
                                    {'\n\n'}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

// Hook版本的错误边界
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = () => setError(null);

    const handleError = React.useCallback((error: Error) => {
        console.error('Error caught by useErrorHandler:', error);
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { handleError, resetError };
}

// 通用错误处理函数
export const handleApiError = (error: unknown): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    const errorObj = error as Record<string, unknown>;
    const response = errorObj?.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;

    if (data?.error) {
        return String(data.error);
    }

    if (errorObj?.message) {
        return String(errorObj.message);
    }

    return '发生了未知错误，请稍后重试';
};

// 网络错误检测
export const isNetworkError = (error: unknown): boolean => {
    if (!navigator.onLine) {
        return true;
    }

    if (error instanceof Error) {
        return error.message.includes('fetch') || error.message.includes('network');
    }

    const errorObj = error as Record<string, unknown>;
    return (
        errorObj?.code === 'NETWORK_ERROR' ||
        (typeof errorObj?.message === 'string' &&
            (errorObj.message.includes('fetch') || errorObj.message.includes('network')))
    );
};

// API错误类型
export enum ApiErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    NOT_FOUND = 'not_found',
    SERVER = 'server',
    UNKNOWN = 'unknown',
}

// 错误分类函数
export const classifyError = (error: unknown): ApiErrorType => {
    if (isNetworkError(error)) {
        return ApiErrorType.NETWORK;
    }

    const errorObj = error as Record<string, unknown>;
    const response = errorObj?.response as Record<string, unknown> | undefined;
    const status = Number(response?.status || errorObj?.status || 0);

    switch (status) {
        case 400:
            return ApiErrorType.VALIDATION;
        case 401:
            return ApiErrorType.AUTHENTICATION;
        case 403:
            return ApiErrorType.AUTHORIZATION;
        case 404:
            return ApiErrorType.NOT_FOUND;
        case 500:
        case 502:
        case 503:
        case 504:
            return ApiErrorType.SERVER;
        default:
            return ApiErrorType.UNKNOWN;
    }
};

// 错误消息映射
export const getErrorMessage = (errorType: ApiErrorType, originalMessage?: string): string => {
    const messages = {
        [ApiErrorType.NETWORK]: '网络连接失败，请检查网络设置后重试',
        [ApiErrorType.VALIDATION]: '输入数据有误，请检查后重试',
        [ApiErrorType.AUTHENTICATION]: '身份验证失败，请重新登录',
        [ApiErrorType.AUTHORIZATION]: '权限不足，无法执行此操作',
        [ApiErrorType.NOT_FOUND]: '请求的资源不存在',
        [ApiErrorType.SERVER]: '服务器错误，请稍后重试',
        [ApiErrorType.UNKNOWN]: originalMessage || '发生了未知错误，请稍后重试',
    };

    return messages[errorType];
};
