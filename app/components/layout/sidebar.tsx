'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiFolder, 
  FiHelpCircle, 
  FiMessageSquare, 
  FiSettings 
} from 'react-icons/fi';

const navigation = [
  { name: '项目管理', href: '/projects', icon: FiFolder },
  { name: '问题生成', href: '/questions', icon: FiHelpCircle },
  { name: '答案生成', href: '/answers', icon: FiMessageSquare },
  { name: '系统设置', href: '/settings', icon: FiSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 pt-8">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive 
                  ? 'bg-blue-100 text-blue-700 border-blue-300' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <IconComponent
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}