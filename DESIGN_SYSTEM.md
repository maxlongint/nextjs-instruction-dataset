# 设计系统规范 - shadcn/ui 风格指南

本文档详细说明了项目中使用的设计系统规范，确保所有组件与 shadcn/ui 的设计语言保持一致。

## 色彩系统

### 主色调
- **Primary**: 蓝色系 (#3b82f6, #2563eb, #1d4ed8)
- **Secondary**: 灰色系 (#6b7280, #4b5563, #374151)
- **Success**: 绿色系 (#10b981, #059669, #047857)
- **Warning**: 黄色系 (#f59e0b, #d97706, #b45309)
- **Danger**: 红色系 (#ef4444, #dc2626, #b91c1c)

### 中性色
- **Background**: #ffffff (白色背景)
- **Card**: #ffffff (卡片背景)
- **Border**: #e5e7eb (边框颜色)
- **Muted**: #f9fafb (静音背景)
- **Foreground**: #111827 (主要文字)
- **Muted-foreground**: #6b7280 (次要文字)

## 间距规则

### 内边距 (Padding)
- **xs**: 0.5rem (8px)
- **sm**: 0.75rem (12px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

### 外边距 (Margin)
- 遵循与内边距相同的规则
- 组件间距通常使用 `space-y-4` (1rem) 或 `space-y-6` (1.5rem)

### 网格间距
- **gap-2**: 0.5rem
- **gap-4**: 1rem
- **gap-6**: 1.5rem

## 圆角大小

### 标准圆角
- **rounded-sm**: 0.125rem (2px)
- **rounded**: 0.25rem (4px) - 默认
- **rounded-md**: 0.375rem (6px)
- **rounded-lg**: 0.5rem (8px) - 卡片和按钮
- **rounded-xl**: 0.75rem (12px) - 大型容器

### 特殊圆角
- **rounded-full**: 完全圆形 - 用于头像、状态指示器
- **rounded-none**: 无圆角 - 特殊情况

## 阴影系统

### 阴影层级
- **shadow-xs**: 轻微阴影，用于输入框
- **shadow-sm**: 小阴影，用于卡片悬停
- **shadow**: 标准阴影，用于弹出层
- **shadow-md**: 中等阴影，用于模态框
- **shadow-lg**: 大阴影，用于重要弹出层

## 字体规范

### 字体大小
- **text-xs**: 0.75rem (12px) - 辅助信息
- **text-sm**: 0.875rem (14px) - 次要文本
- **text-base**: 1rem (16px) - 正文
- **text-lg**: 1.125rem (18px) - 小标题
- **text-xl**: 1.25rem (20px) - 标题
- **text-2xl**: 1.5rem (24px) - 大标题

### 字体粗细
- **font-normal**: 400 - 正文
- **font-medium**: 500 - 强调文本
- **font-semibold**: 600 - 小标题
- **font-bold**: 700 - 主标题

## 交互动效

### 过渡动画
- **transition-colors**: 颜色过渡 (150ms)
- **transition-all**: 全属性过渡 (150ms)
- **duration-200**: 200ms - 快速交互
- **duration-300**: 300ms - 标准交互

### 悬停效果
- 按钮: `hover:bg-primary/90`
- 卡片: `hover:shadow-md`
- 链接: `hover:text-primary`

### 焦点状态
- 输入框: `focus-visible:ring-2 focus-visible:ring-primary`
- 按钮: `focus-visible:ring-2 focus-visible:ring-offset-2`

## 组件规范

### 按钮 (Button)
```tsx
// 主要按钮
<Button variant="default" size="md">
  主要操作
</Button>

// 次要按钮
<Button variant="outline" size="md">
  次要操作
</Button>

// 危险按钮
<Button variant="destructive" size="md">
  删除操作
</Button>
```

### 卡片 (Card)
```tsx
<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
    <CardDescription>描述文本</CardDescription>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
</Card>
```

### 表单元素
```tsx
// 输入框
<div className="space-y-2">
  <Label htmlFor="input">标签</Label>
  <Input id="input" placeholder="请输入..." />
</div>

// 文本域
<div className="space-y-2">
  <Label htmlFor="textarea">标签</Label>
  <Textarea id="textarea" placeholder="请输入..." />
</div>
```

### 徽章 (Badge)
```tsx
// 默认徽章
<Badge variant="default">默认</Badge>

// 次要徽章
<Badge variant="secondary">次要</Badge>

// 轮廓徽章
<Badge variant="outline">轮廓</Badge>
```

## 布局规范

### 容器
- 页面容器: `className="h-full p-6 overflow-hidden overflow-y-auto"`
- 内容区域: `className="space-y-6"`
- 网格布局: `className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"`

### 响应式设计
- 移动端优先: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- 断点使用: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

## 状态指示

### 加载状态
```tsx
<Loading size="md" text="加载中..." />
```

### 空状态
```tsx
<Card>
  <CardContent className="text-center py-12">
    <Icon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
    <CardTitle className="text-sm">暂无数据</CardTitle>
    <CardDescription>描述信息</CardDescription>
  </CardContent>
</Card>
```

### 错误状态
```tsx
<Badge variant="destructive">
  <AlertTriangle className="mr-1 h-3 w-3" />
  错误信息
</Badge>
```

## 自定义组件指南

当需要创建无法直接使用 shadcn/ui 替换的自定义组件时，请遵循以下原则：

1. **使用相同的设计令牌**: 颜色、间距、圆角等必须与 shadcn/ui 保持一致
2. **保持一致的交互模式**: 悬停、焦点、激活状态的视觉反馈
3. **遵循可访问性标准**: 适当的对比度、键盘导航支持
4. **使用 Tailwind CSS 类**: 避免自定义 CSS，优先使用 Tailwind 类名
5. **保持组件的组合性**: 支持 `className` 属性覆盖，使用 `cn()` 工具函数

## 示例：自定义状态卡片

```tsx
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatusCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  variant?: "default" | "success" | "warning" | "danger"
  className?: string
}

export function StatusCard({ 
  title, 
  value, 
  icon, 
  variant = "default",
  className 
}: StatusCardProps) {
  const variantStyles = {
    default: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600", 
    warning: "bg-yellow-100 text-yellow-600",
    danger: "bg-red-100 text-red-600"
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            variantStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

这个设计系统确保了整个应用程序的视觉一致性，同时保持了 shadcn/ui 的设计原则和最佳实践。