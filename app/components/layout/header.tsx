'use client';

import { useState, useEffect } from 'react';

export default function Header() {
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

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">
          指令监督微调生成器
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-500">
          {mounted ? currentTime : '--:--:--'}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">系统正常</span>
        </div>
      </div>
    </header>
  );
}