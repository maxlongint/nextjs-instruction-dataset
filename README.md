# 指令监督微调生成器

一个基于 Next.js + TypeScript + SQLite 的单机版桌面应用，用于管理机器学习项目的数据集处理和指令微调数据生成。

## 功能特性

### 🗂️ 项目管理
- 创建和管理多个机器学习项目
- 项目详情页面支持数据集文件上传
- 支持 .txt、.md、.json 等文本格式文件
- 项目信息编辑和删除功能

### 📝 问题生成
- 从项目数据集中选择文本片段
- 配置自定义提示词模板
- 调用AI模型生成相关问题
- 支持批量生成和结果管理

### 💬 答案生成
- 基于已生成的问题创建对应答案
- 自定义答案生成提示词
- AI模型自动生成高质量答案
- 问题-答案对的统一管理

### ⚙️ 系统设置
- AI模型API配置（支持OpenAI、Claude等）
- 模型参数调整（温度、最大令牌数等）
- 应用主题和语言设置
- 数据库备份和恢复功能

## 技术架构

### 前端技术栈
- **Next.js 14** - React全栈框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 原子化CSS框架
- **Shadcn/ui** - 现代化UI组件库
- **React Icons** - 图标库
- **React Hook Form** - 表单处理

### 后端技术栈
- **Next.js API Routes** - 服务端API
- **SQLite** - 轻量级数据库
- **Drizzle ORM** - 类型安全的ORM
- **Node.js fs** - 文件系统操作

### 设计风格
- 扁平化设计风格
- 传统上下左右布局
- 左侧菜单导航，右侧内容区域
- 卡片式和表格式数据展示
- 响应式设计，支持不同屏幕尺寸

## 快速开始

### 环境要求
- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd nextjs-instruction-dataset
```

2. **安装依赖**
```bash
npm install
```

3. **初始化数据库**
```bash
npm run db:generate
npm run db:push
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:3000`

### 生产构建

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 使用指南

### 1. 配置AI模型
1. 进入"系统设置"页面
2. 配置AI模型API地址和密钥
3. 选择合适的模型和参数
4. 点击"测试连接"验证配置

### 2. 创建项目
1. 在"项目管理"页面点击"新建项目"
2. 填写项目名称和描述
3. 保存项目信息

### 3. 上传数据集
1. 进入项目详情页面
2. 拖拽或选择文本文件上传
3. 系统自动解析文件内容

### 4. 生成问题
1. 在"问题生成"页面选择项目和数据集
2. 配置问题生成的提示词模板
3. 设置生成参数并开始生成
4. 查看和管理生成的问题

### 5. 生成答案
1. 在"答案生成"页面选择已生成的问题
2. 配置答案生成的提示词模板
3. 批量生成对应答案
4. 导出问题-答案对数据

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── projects/          # 项目管理页面
│   ├── questions/         # 问题生成页面
│   ├── answers/           # 答案生成页面
│   └── settings/          # 系统设置页面
├── src/
│   ├── components/        # React组件
│   │   ├── layout/       # 布局组件
│   │   ├── projects/     # 项目相关组件
│   │   └── common/       # 通用组件
│   └── lib/
│       ├── db/           # 数据库配置和模式
│       └── services/     # 业务逻辑服务
├── data/                  # 数据库文件目录
└── uploads/              # 文件上传目录
```

## 数据库模式

### 项目表 (projects)
- id: 主键
- name: 项目名称
- description: 项目描述
- created_at: 创建时间
- updated_at: 更新时间

### 数据集表 (datasets)
- id: 主键
- project_id: 项目ID（外键）
- name: 数据集名称
- file_name: 文件名
- file_path: 文件路径
- file_size: 文件大小
- content: 文件内容
- created_at: 创建时间

### 问题表 (questions)
- id: 主键
- dataset_id: 数据集ID（外键）
- content: 问题内容
- prompt: 生成提示词
- created_at: 创建时间

### 答案表 (answers)
- id: 主键
- question_id: 问题ID（外键）
- content: 答案内容
- prompt: 生成提示词
- created_at: 创建时间

### 设置表 (settings)
- id: 主键
- key: 设置键
- value: 设置值
- type: 设置类型
- created_at: 创建时间
- updated_at: 更新时间

## API接口

### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建新项目
- `GET /api/projects/[id]` - 获取项目详情
- `PUT /api/projects/[id]` - 更新项目信息
- `DELETE /api/projects/[id]` - 删除项目

### 数据集管理
- `GET /api/datasets` - 获取数据集列表
- `POST /api/datasets` - 上传数据集
- `GET /api/datasets/[id]` - 获取数据集详情
- `DELETE /api/datasets/[id]` - 删除数据集
- `GET /api/datasets/[id]/segments` - 获取数据集片段

### 问题生成
- `GET /api/questions` - 获取问题列表
- `POST /api/questions/generate` - 生成问题
- `GET /api/questions/[id]` - 获取问题详情
- `DELETE /api/questions/[id]` - 删除问题

### 答案生成
- `GET /api/answers` - 获取答案列表
- `POST /api/answers/generate` - 生成答案
- `GET /api/answers/[id]` - 获取答案详情
- `DELETE /api/answers/[id]` - 删除答案

### 系统设置
- `GET /api/settings` - 获取设置
- `POST /api/settings` - 保存设置
- `DELETE /api/settings` - 重置设置
- `POST /api/ai/test` - 测试AI连接

## 开发指南

### 添加新功能
1. 在 `src/lib/db/schema.ts` 中定义数据模式
2. 在 `src/lib/services/` 中创建业务逻辑服务
3. 在 `app/api/` 中创建API路由
4. 在 `app/` 中创建页面组件
5. 在 `src/components/` 中创建UI组件

### 数据库迁移
```bash
# 生成迁移文件
npm run db:generate

# 应用迁移
npm run db:push

# 查看数据库
npm run db:studio
```

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 格式化代码
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

## 常见问题

### Q: 如何配置不同的AI模型？
A: 在系统设置页面中，可以配置不同的API地址和模型名称。支持OpenAI、Claude、本地模型等。

### Q: 数据库文件在哪里？
A: 数据库文件位于项目根目录的 `data/database.sqlite`。

### Q: 如何备份数据？
A: 可以直接复制 `data` 目录和 `uploads` 目录来备份所有数据。

### Q: 支持哪些文件格式？
A: 目前支持 .txt、.md、.json 等文本格式文件。

### Q: 如何自定义提示词？
A: 在问题生成和答案生成页面中，可以使用Markdown编辑器自定义提示词模板。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 实现项目管理功能
- 实现问题生成功能
- 实现答案生成功能
- 实现系统设置功能
- 集成AI模型API调用
- 完善用户界面和交互体验