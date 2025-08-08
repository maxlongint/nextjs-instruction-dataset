import { Project, Dataset, Question, Answer, User, Setting, QuestionGenerationTask, ProjectStats, ActivityItem } from '../types';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    fullName: '系统管理员',
    avatar: '/avatars/admin.jpg',
    role: 'admin',
    status: 'active',
    department: '技术部',
    position: '系统管理员',
    phone: '13800138000',
    bio: '负责系统维护和用户管理',
    skills: ['系统管理', '数据库管理', '网络安全'],
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notifications: {
        email: true,
        push: true,
        projectUpdates: true,
        questionGenerated: true,
        answerReviewed: true,
        systemMaintenance: true
      },
      dashboard: {
        defaultView: 'grid',
        itemsPerPage: 20,
        showCompletedTasks: true,
        autoRefresh: true,
        refreshInterval: 30
      }
    },
    lastLoginAt: new Date().toISOString(),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@example.com',
    fullName: '项目经理',
    avatar: '/avatars/manager.jpg',
    role: 'manager',
    status: 'active',
    department: '产品部',
    position: '项目经理',
    phone: '13800138001',
    bio: '负责项目管理和团队协调',
    skills: ['项目管理', '团队协作', '需求分析'],
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      notifications: {
        email: true,
        push: false,
        projectUpdates: true,
        questionGenerated: false,
        answerReviewed: true,
        systemMaintenance: false
      },
      dashboard: {
        defaultView: 'list',
        itemsPerPage: 15,
        showCompletedTasks: false,
        autoRefresh: false,
        refreshInterval: 60
      }
    },
    lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

// 模拟项目数据
export const mockProjects: Project[] = [
  {
    id: 1,
    name: '智能客服问答系统',
    description: '构建一个基于AI的智能客服问答系统，提供7x24小时的客户服务支持',
    status: 'active',
    priority: 'high',
    category: 'AI应用',
    tags: ['AI', '客服', '自然语言处理'],
    ownerId: 1,
    memberIds: [1, 2],
    progress: 65,
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-04-15T00:00:00.000Z',
    estimatedHours: 200,
    actualHours: 130,
    budget: 50000,
    createdAt: '2024-01-15T08:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '教育培训问答库',
    description: '为在线教育平台构建专业的问答知识库，涵盖多个学科领域',
    status: 'active',
    priority: 'medium',
    category: '教育',
    tags: ['教育', '知识库', '在线学习'],
    ownerId: 2,
    memberIds: [1, 2],
    progress: 40,
    startDate: '2024-02-01T00:00:00.000Z',
    endDate: '2024-06-01T00:00:00.000Z',
    estimatedHours: 150,
    actualHours: 60,
    budget: 30000,
    createdAt: '2024-02-01T09:15:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: '技术文档问答助手',
    description: '基于技术文档构建智能问答助手，帮助开发者快速找到解决方案',
    status: 'completed',
    priority: 'medium',
    category: '技术',
    tags: ['技术文档', '开发者工具', 'API'],
    ownerId: 1,
    memberIds: [1],
    progress: 100,
    startDate: '2023-11-01T00:00:00.000Z',
    endDate: '2024-01-31T00:00:00.000Z',
    estimatedHours: 120,
    actualHours: 115,
    budget: 25000,
    createdAt: '2023-11-01T10:00:00.000Z',
    updatedAt: '2024-01-31T18:00:00.000Z'
  }
];

// 模拟数据集数据
export const mockDatasets: Dataset[] = [
  {
    id: 1,
    projectId: 1,
    name: '客服对话记录',
    description: '包含过去一年的客服对话记录，用于训练智能客服模型',
    fileName: 'customer_service_logs.txt',
    filePath: '/uploads/customer_service_logs.txt',
    fileSize: 2048576,
    type: 'text',
    size: 2048576,
    content: `客户：你好，我想咨询一下你们的产品价格。
客服：您好！很高兴为您服务。请问您想了解哪款产品的价格呢？

客户：我想了解基础版和专业版的区别。
客服：好的，我来为您详细介绍一下：

基础版功能：
- 基本的数据分析功能
- 支持最多100个用户
- 标准技术支持
- 价格：999元/月

专业版功能：
- 高级数据分析和可视化
- 支持最多1000个用户
- 优先技术支持
- 自定义报表功能
- 价格：2999元/月

客户：专业版有试用期吗？
客服：是的，专业版提供15天免费试用期，您可以在试用期内体验所有功能。

客户：那我先试用一下专业版吧。
客服：好的，我来为您开通试用账户。请提供您的邮箱地址。

客户：我的邮箱是test@example.com
客服：收到，我已经为您开通了专业版试用账户，登录信息已发送到您的邮箱。

客户：谢谢！
客服：不客气，如果在使用过程中有任何问题，随时联系我们。祝您使用愉快！`,
    segmentDelimiter: '\n\n',
    segmentCount: 8,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    tags: ['客服', '对话记录'],
    isPublic: false,
    downloadCount: 5,
    lastAccessedAt: new Date().toISOString(),
    createdAt: '2024-01-20T10:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    projectId: 1,
    name: '产品FAQ文档',
    description: '产品常见问题解答文档',
    fileName: 'product_faq.txt',
    filePath: '/uploads/product_faq.txt',
    fileSize: 1024000,
    type: 'text',
    size: 1024000,
    content: `Q: 如何注册账户？
A: 您可以通过官网首页的"注册"按钮进行账户注册，需要提供邮箱和手机号码。

Q: 忘记密码怎么办？
A: 在登录页面点击"忘记密码"，输入注册邮箱，系统会发送重置密码的链接到您的邮箱。

Q: 如何升级账户？
A: 登录后在"账户设置"页面可以选择升级套餐，支持在线支付。

Q: 数据安全如何保障？
A: 我们采用银行级别的加密技术，所有数据都经过加密存储，并定期备份。

Q: 支持哪些支付方式？
A: 支持支付宝、微信支付、银行卡支付等多种支付方式。`,
    segmentDelimiter: '\n\n',
    segmentCount: 5,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    tags: ['FAQ', '产品文档'],
    isPublic: false,
    downloadCount: 3,
    lastAccessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-22T14:15:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    projectId: 2,
    name: '数学基础知识',
    description: '中学数学基础知识点整理',
    fileName: 'math_basics.txt',
    filePath: '/uploads/math_basics.txt',
    fileSize: 1536000,
    type: 'text',
    size: 1536000,
    content: `一元二次方程的解法

一元二次方程的一般形式为：ax² + bx + c = 0 (a ≠ 0)

求解方法：
1. 因式分解法
2. 配方法
3. 求根公式法

求根公式：x = (-b ± √(b² - 4ac)) / 2a

判别式：Δ = b² - 4ac
- 当Δ > 0时，方程有两个不相等的实根
- 当Δ = 0时，方程有两个相等的实根
- 当Δ < 0时，方程无实根

例题：解方程 x² - 5x + 6 = 0
解：这里 a = 1, b = -5, c = 6
使用因式分解法：x² - 5x + 6 = (x - 2)(x - 3) = 0
所以 x = 2 或 x = 3`,
    segmentDelimiter: '\n\n',
    segmentCount: 6,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    tags: ['数学', '教育', '基础知识'],
    isPublic: true,
    downloadCount: 12,
    lastAccessedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-02-05T11:20:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

// 模拟问题数据
export const mockQuestions: Question[] = [
  {
    id: 1,
    uid: 'q_1',
    projectId: 1,
    datasetId: 1,
    segmentId: 'segment-1',
    prompt: '基于以下客服对话内容，生成一个相关的问题：',
    content: '客户：你好，我想咨询一下你们的产品价格。\n客服：您好！很高兴为您服务。请问您想了解哪款产品的价格呢？',
    generatedQuestion: '客户在咨询产品价格时，客服应该如何回应？',
    wordCount: 45,
    status: 'generated',
    type: 'short_answer',
    difficulty: 'easy',
    category: '客服技巧',
    tags: ['客服', '价格咨询', '沟通技巧'],
    points: 10,
    timeLimit: 300,
    isPublic: false,
    usageCount: 3,
    rating: 4.5,
    ratingCount: 2,
    createdAt: '2024-01-25T09:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    uid: 'q_2',
    projectId: 1,
    datasetId: 1,
    segmentId: 'segment-2',
    prompt: '基于以下客服对话内容，生成一个相关的问题：',
    content: '客户：我想了解基础版和专业版的区别。\n客服：好的，我来为您详细介绍一下：\n\n基础版功能：\n- 基本的数据分析功能\n- 支持最多100个用户\n- 标准技术支持\n- 价格：999元/月',
    generatedQuestion: '基础版产品包含哪些主要功能和服务？',
    wordCount: 78,
    status: 'reviewed',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '产品知识',
    tags: ['产品功能', '版本对比', '价格'],
    points: 15,
    timeLimit: 600,
    isPublic: false,
    usageCount: 5,
    rating: 4.8,
    ratingCount: 4,
    createdAt: '2024-01-25T10:15:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    uid: 'q_3',
    projectId: 2,
    datasetId: 3,
    segmentId: 'segment-1',
    prompt: '基于以下数学知识内容，生成一个相关的问题：',
    content: '一元二次方程的一般形式为：ax² + bx + c = 0 (a ≠ 0)\n\n求解方法：\n1. 因式分解法\n2. 配方法\n3. 求根公式法',
    generatedQuestion: '一元二次方程有哪几种主要的求解方法？',
    wordCount: 52,
    status: 'generated',
    type: 'multiple_choice',
    difficulty: 'medium',
    category: '数学基础',
    tags: ['一元二次方程', '解法', '数学'],
    points: 20,
    timeLimit: 480,
    isPublic: true,
    usageCount: 8,
    rating: 4.2,
    ratingCount: 6,
    createdAt: '2024-02-08T14:20:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    uid: 'q_4',
    projectId: 1,
    datasetId: 2,
    segmentId: 'segment-1',
    prompt: '基于以下FAQ内容，生成一个相关的问题：',
    content: 'Q: 如何注册账户？\nA: 您可以通过官网首页的"注册"按钮进行账户注册，需要提供邮箱和手机号码。',
    generatedQuestion: '用户注册账户时需要提供哪些信息？',
    wordCount: 38,
    status: 'answered',
    type: 'short_answer',
    difficulty: 'easy',
    category: '账户管理',
    tags: ['注册', '账户', 'FAQ'],
    points: 10,
    timeLimit: 240,
    isPublic: false,
    usageCount: 2,
    rating: 4.0,
    ratingCount: 1,
    createdAt: '2024-01-28T16:45:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

// 模拟答案数据
export const mockAnswers: Answer[] = [
  {
    id: 1,
    questionId: 1,
    segmentId: 'segment-1',
    prompt: '请为以下问题提供详细的答案：',
    generatedAnswer: '当客户咨询产品价格时，客服应该：\n1. 热情地问候客户\n2. 询问客户具体想了解哪款产品\n3. 根据客户需求提供相应的产品信息\n4. 保持专业和耐心的服务态度',
    content: '当客户咨询产品价格时，客服应该：\n1. 热情地问候客户\n2. 询问客户具体想了解哪款产品\n3. 根据客户需求提供相应的产品信息\n4. 保持专业和耐心的服务态度',
    type: 'generated',
    status: 'approved',
    isCorrect: true,
    confidence: 0.92,
    wordCount: 58,
    language: 'zh-CN',
    sources: ['客服培训手册', '服务标准'],
    reviewerId: 1,
    reviewedAt: '2024-01-26T10:30:00.000Z',
    reviewComments: '答案准确，符合客服服务标准',
    rating: 4.5,
    ratingCount: 2,
    usageCount: 3,
    lastUsedAt: new Date().toISOString(),
    createdAt: '2024-01-25T11:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    questionId: 2,
    segmentId: 'segment-2',
    prompt: '请为以下问题提供详细的答案：',
    generatedAnswer: '基础版产品包含以下主要功能和服务：\n\n功能特性：\n- 基本的数据分析功能\n- 支持最多100个用户同时使用\n\n服务支持：\n- 标准技术支持服务\n- 工作日响应客户问题\n\n价格：\n- 月费：999元/月\n- 适合中小型企业使用',
    content: '基础版产品包含以下主要功能和服务：\n\n功能特性：\n- 基本的数据分析功能\n- 支持最多100个用户同时使用\n\n服务支持：\n- 标准技术支持服务\n- 工作日响应客户问题\n\n价格：\n- 月费：999元/月\n- 适合中小型企业使用',
    type: 'generated',
    status: 'approved',
    isCorrect: true,
    confidence: 0.95,
    wordCount: 89,
    language: 'zh-CN',
    sources: ['产品说明书', '价格表'],
    reviewerId: 2,
    reviewedAt: '2024-01-26T14:20:00.000Z',
    reviewComments: '答案详细准确，信息完整',
    rating: 4.8,
    ratingCount: 4,
    usageCount: 5,
    lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-25T12:30:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    questionId: 3,
    segmentId: 'segment-1',
    prompt: '请为以下问题提供详细的答案：',
    generatedAnswer: '一元二次方程有三种主要的求解方法：\n\n1. 因式分解法\n   - 将方程左边分解为两个一次因式的乘积\n   - 适用于能够直接分解的方程\n\n2. 配方法\n   - 通过配成完全平方式来求解\n   - 适用于所有一元二次方程\n\n3. 求根公式法\n   - 使用求根公式 x = (-b ± √(b² - 4ac)) / 2a\n   - 是最通用的方法，适用于所有情况',
    content: '一元二次方程有三种主要的求解方法：\n\n1. 因式分解法\n   - 将方程左边分解为两个一次因式的乘积\n   - 适用于能够直接分解的方程\n\n2. 配方法\n   - 通过配成完全平方式来求解\n   - 适用于所有一元二次方程\n\n3. 求根公式法\n   - 使用求根公式 x = (-b ± √(b² - 4ac)) / 2a\n   - 是最通用的方法，适用于所有情况',
    type: 'generated',
    status: 'generated',
    isCorrect: true,
    confidence: 0.98,
    wordCount: 142,
    language: 'zh-CN',
    sources: ['数学教材', '教学大纲'],
    rating: 4.2,
    ratingCount: 6,
    usageCount: 8,
    lastUsedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-02-08T15:45:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    questionId: 4,
    segmentId: 'segment-1',
    prompt: '请为以下问题提供详细的答案：',
    generatedAnswer: '用户注册账户时需要提供以下信息：\n\n必填信息：\n- 邮箱地址：用于账户验证和找回密码\n- 手机号码：用于安全验证和重要通知\n\n注册流程：\n1. 访问官网首页\n2. 点击"注册"按钮\n3. 填写邮箱和手机号\n4. 设置密码\n5. 完成邮箱验证\n6. 注册成功',
    content: '用户注册账户时需要提供以下信息：\n\n必填信息：\n- 邮箱地址：用于账户验证和找回密码\n- 手机号码：用于安全验证和重要通知\n\n注册流程：\n1. 访问官网首页\n2. 点击"注册"按钮\n3. 填写邮箱和手机号\n4. 设置密码\n5. 完成邮箱验证\n6. 注册成功',
    type: 'generated',
    status: 'approved',
    isCorrect: true,
    confidence: 0.90,
    wordCount: 98,
    language: 'zh-CN',
    sources: ['用户手册', '注册流程'],
    reviewerId: 1,
    reviewedAt: '2024-01-29T09:15:00.000Z',
    reviewComments: '答案清晰，流程描述准确',
    rating: 4.0,
    ratingCount: 1,
    usageCount: 2,
    lastUsedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-28T17:30:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

// 模拟系统设置
export const mockSettings: Setting[] = [
  {
    id: 1,
    key: 'openai_api_key',
    value: '',
    description: 'OpenAI API密钥，用于调用GPT模型生成问题和答案',
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    key: 'openai_model',
    value: 'gpt-3.5-turbo',
    description: '使用的OpenAI模型版本',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    key: 'max_tokens',
    value: '2000',
    description: '生成内容的最大token数量',
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    key: 'temperature',
    value: '0.7',
    description: '生成内容的创造性程度（0-1）',
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    key: 'questions_per_segment',
    value: '3',
    description: '每个文本段落生成的问题数量',
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    key: 'auto_generate_answers',
    value: 'true',
    description: '是否自动为生成的问题创建答案',
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    key: 'default_language',
    value: 'zh-CN',
    description: '默认语言设置',
    updatedAt: new Date().toISOString()
  },
  {
    id: 8,
    key: 'export_format',
    value: 'json',
    description: '默认导出格式（json/csv/xlsx）',
    updatedAt: new Date().toISOString()
  }
];

// 模拟问题生成任务
export const mockQuestionGenerationTasks: QuestionGenerationTask[] = [
  {
    id: 1,
    projectId: 1,
    datasetId: 1,
    status: 'completed',
    totalQuestions: 10,
    completedQuestions: 10,
    createdAt: '2024-01-25T09:00:00.000Z',
    updatedAt: '2024-01-25T09:30:00.000Z'
  },
  {
    id: 2,
    projectId: 1,
    datasetId: 2,
    status: 'running',
    totalQuestions: 8,
    completedQuestions: 5,
    createdAt: '2024-01-28T14:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    projectId: 2,
    datasetId: 3,
    status: 'completed',
    totalQuestions: 12,
    completedQuestions: 12,
    createdAt: '2024-02-08T10:00:00.000Z',
    updatedAt: '2024-02-08T11:30:00.000Z'
  }
];

// 模拟活动记录
const mockActivities: ActivityItem[] = [
  {
    id: 1,
    type: 'project_created',
    title: '创建了新项目',
    description: '智能客服问答系统',
    userId: 1,
    userName: '系统管理员',
    userAvatar: '/avatars/admin.jpg',
    entityId: 1,
    entityType: 'project',
    createdAt: '2024-01-15T08:30:00.000Z'
  },
  {
    id: 2,
    type: 'dataset_uploaded',
    title: '上传了数据集',
    description: '客服对话记录',
    userId: 1,
    userName: '系统管理员',
    userAvatar: '/avatars/admin.jpg',
    entityId: 1,
    entityType: 'dataset',
    createdAt: '2024-01-20T10:30:00.000Z'
  },
  {
    id: 3,
    type: 'question_generated',
    title: '生成了问题',
    description: '客户在咨询产品价格时，客服应该如何回应？',
    userId: 1,
    userName: '系统管理员',
    userAvatar: '/avatars/admin.jpg',
    entityId: 1,
    entityType: 'question',
    createdAt: '2024-01-25T09:30:00.000Z'
  },
  {
    id: 4,
    type: 'answer_created',
    title: '创建了答案',
    description: '为问题提供了详细的回答',
    userId: 2,
    userName: '项目经理',
    userAvatar: '/avatars/manager.jpg',
    entityId: 1,
    entityType: 'answer',
    createdAt: '2024-01-25T11:00:00.000Z'
  }
];

// 模拟项目统计数据
export const mockProjectStats: ProjectStats = {
  totalProjects: 3,
  activeProjects: 2,
  completedProjects: 1,
  totalQuestions: 4,
  answeredQuestions: 4,
  totalDatasets: 3,
  totalUsers: 2,
  recentActivity: mockActivities
};

// 分页工具函数
export function getPaginatedData<T>(data: T[], page: number = 1, pageSize: number = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
}

// 生成模拟数据的工具函数
export function generateMockData(type: 'projects' | 'datasets' | 'questions' | 'answers', count: number = 10) {
  const data = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const id = Date.now() + i;
    
    switch (type) {
      case 'projects':
        data.push({
          id,
          name: `项目 ${i + 1}`,
          description: `这是第 ${i + 1} 个模拟项目的描述`,
          status: ['active', 'inactive', 'completed'][i % 3],
          priority: ['low', 'medium', 'high'][i % 3],
          category: '默认分类',
          tags: [`标签${i + 1}`],
          ownerId: 1,
          memberIds: [1],
          progress: Math.floor(Math.random() * 100),
          createdAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;
        
      case 'datasets':
        data.push({
          id,
          projectId: 1,
          name: `数据集 ${i + 1}`,
          description: `这是第 ${i + 1} 个模拟数据集`,
          fileName: `dataset_${i + 1}.txt`,
          filePath: `/uploads/dataset_${i + 1}.txt`,
          fileSize: Math.floor(Math.random() * 1000000) + 100000,
          type: 'text',
          content: `这是数据集 ${i + 1} 的内容...`,
          segmentDelimiter: '\n\n',
          segmentCount: Math.floor(Math.random() * 20) + 5,
          status: 'ready',
          tags: [`数据${i + 1}`],
          isPublic: false,
          downloadCount: Math.floor(Math.random() * 10),
          createdAt: new Date(now.getTime() - i * 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;
        
      case 'questions':
        data.push({
          id,
          uid: `q_${id}`,
          projectId: 1,
          datasetId: 1,
          prompt: '基于以下内容生成问题：',
          content: `这是问题 ${i + 1} 的内容...`,
          generatedQuestion: `这是生成的问题 ${i + 1}？`,
          status: 'generated',
          type: 'short_answer',
          difficulty: ['easy', 'medium', 'hard'][i % 3],
          category: '默认分类',
          tags: [`问题${i + 1}`],
          isPublic: false,
          usageCount: Math.floor(Math.random() * 5),
          createdAt: new Date(now.getTime() - i * 6 * 60 * 60 * 1000).toISOString()
        });
        break;
        
      case 'answers':
        data.push({
          id,
          questionId: i + 1,
          prompt: '请为以下问题提供答案：',
          generatedAnswer: `这是问题 ${i + 1} 的答案...`,
          content: `这是问题 ${i + 1} 的答案...`,
          type: 'generated',
          status: 'generated',
          usageCount: Math.floor(Math.random() * 3),
          createdAt: new Date(now.getTime() - i * 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;
    }
  }
  
  return data;
}
