import { FiLoader } from 'react-icons/fi';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ size = 'md', text, className = '' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      {text && (
        <span className={`ml-2 text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  );
}

export function LoadingPage({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingButton({ 
  loading, 
  children, 
  className = '',
  ...props 
}: { 
  loading: boolean; 
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={`flex items-center justify-center ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && <FiLoader className="animate-spin h-4 w-4 mr-2" />}
      {children}
    </button>
  );
}