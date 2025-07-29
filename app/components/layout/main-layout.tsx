'use client';

import { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <Header />
      
      {/* 主要内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar />
        
        {/* 右侧内容区域 */}
        {/* 右侧内容区域 */}
        {/* 右侧内容区域 */}
        <main className="flex-1 bg-white">
          <div className="h-full p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}