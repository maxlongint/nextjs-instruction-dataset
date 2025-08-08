'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome,
  FiFolder, 
  FiHelpCircle, 
  FiMessageSquare, 
  FiSettings 
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: '首页', href: '/', icon: FiHome },
  { name: '项目管理', href: '/projects', icon: FiFolder },
  { name: '问题生成', href: '/questions', icon: FiHelpCircle },
  { name: '答案生成', href: '/answers', icon: FiMessageSquare },
  { name: '系统设置', href: '/settings', icon: FiSettings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    // 左侧导航边栏
    <aside className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* 主导航菜单 */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            // 更精确的路径匹配逻辑
            let isActive = false;
            if (item.href === '/') {
              // 首页只有完全匹配才高亮
              isActive = pathname === '/';
            } else {
              // 其他页面支持子路径匹配
              isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            }
            const IconComponent = item.icon;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={`
                  w-full justify-start
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Link
                  href={item.href}
                  onClick={() => onClose?.()}
                >
                  <IconComponent
                    className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-500' : 'text-gray-400'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
