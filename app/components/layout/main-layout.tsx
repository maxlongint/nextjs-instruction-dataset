'use client';

import { ReactNode } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import DataInitializer, { DataStatusIndicator } from '../data-initializer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <DataInitializer>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 顶部导航栏 */}
        <Header />
        
        {/* 主要内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧边栏 */}
          <Sidebar />
          
          {/* 右侧内容区域 */}
          <main className="flex-1 bg-white">
            <div className="h-full pl-6 pt-6 pb-6">
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
