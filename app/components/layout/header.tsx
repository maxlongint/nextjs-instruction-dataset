'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTitleClick = () => {
    router.push('/');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      {/* 左侧品牌区域 */}
      <div className="flex items-center">
        {/* 移动端菜单按钮 */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden mr-2"
          aria-label="打开菜单"
        >
          <FiMenu className="h-6 w-6" />
        </button>
        
        <h1 
          className="text-lg md:text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleTitleClick}
          title="返回首页"
        >
          <span className="hidden sm:inline">指令监督微调生成器</span>
          <span className="sm:hidden">指令生成器</span>
        </h1>
      </div>
      
      {/* 右侧状态信息区域 */}
      <div className="flex items-center gap-4">
        {/* 当前时间显示 */}
        <div className="text-sm text-gray-500">
          {mounted ? currentTime : '--:--:--'}
        </div>
        {/* 系统状态指示器 */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">系统正常</span>
        </div>
      </div>
    </header>
  );
}