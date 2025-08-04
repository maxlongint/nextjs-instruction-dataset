'use client';

import { ReactNode, useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import DataInitializer, { DataStatusIndicator } from '../data-initializer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DataInitializer>
      {/* 应用主布局容器 */}
      <div className="flex flex-col h-screen">
        {/* 顶部导航栏区域 */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* 主要内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧导航边栏 - 响应式设计 */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:static lg:inset-0
          `}>
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          
          {/* 移动端遮罩层 */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* 右侧主内容区域 */}
          <main className="flex-1 bg-white overflow-hidden">
            <div className="h-full p-4 md:p-6 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
        
        {/* 开发环境数据状态指示器 */}
        <DataStatusIndicator />
      </div>
    </DataInitializer>
  );
}
