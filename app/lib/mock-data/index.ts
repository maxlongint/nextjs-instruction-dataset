import { 
  Project, 
  Dataset, 
  Question, 
  Answer, 
  QuestionTemplate, 
  PromptTemplate, 
  Setting,
  QuestionGenerationTask,
  User,
  ProjectStats,
  ActivityItem
} from '../../types';

// 模拟用户数据
export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    fullName: "系统管理员",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    role: "admin",
    status: "active",
    department: "技术部",
    position: "系统管理员",
    phone: "13800138001",
    bio: "负责系统整体管理和维护工作",
    skills: ["系统管理", "数据库", "服务器运维", "安全管理"],
    preferences: {
      theme: "light",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      notifications: {
        email: true,
        push: true,
        projectUpdates: true,
        questionGenerated: true,
        answerReviewed: true,
        systemMaintenance: true
      },
      dashboard: {
        defaultView: "grid",
        itemsPerPage: 20,
        showCompletedTasks: true,
        autoRefresh: true,
        refreshInterval: 30
      }
    },
    lastLoginAt: "2024-01-28T09:15:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-28T09:15:00Z"
  },
  {
    id: 2,
    username: "project_manager",
    email: "pm@example.com",
    fullName: "张项目",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    role: "manager",
    status: "active",
    department: "产品部",
    position: "项目经理",
    phone: "13800138002",
    bio: "专注于AI项目管理和产品规划",
    skills: ["项目管理", "产品规划", "团队协作", "需求分析"],
    preferences: {
      theme: "dark",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      notifications: {
        email: true,
        push: true,
        projectUpdates: true,
        questionGenerated: false,
        answerReviewed: true,
        systemMaintenance: false
      },
      dashboard: {
        defaultView: "kanban",
        itemsPerPage: 15,
        showCompletedTasks: false,
        autoRefresh: true,
        refreshInterval: 60
      }
    },
    lastLoginAt: "2024-01-27T16:30:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-27T16:30:00Z"
  },
  {
    id: 3,
    username: "data_analyst",
    email: "analyst@example.com",
    fullName: "李数据",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    role: "member",
    status: "active",
    department: "数据部",
    position: "数据分析师",
    phone: "13800138003",
    bio: "专业的数据分析和机器学习工程师",
    skills: ["数据分析", "机器学习", "Python", "SQL", "统计学"],
    preferences: {
      theme: "system",
      language: "zh-CN",
      timezone: "Asia/Shanghai",
      notifications: {
        email: true,
        push: false,
        projectUpdates: true,
        questionGenerated: true,
        answerReviewed: false,
        systemMaintenance: true
      },
      dashboard: {
        defaultView: "list",
        itemsPerPage: 25,
        showCompletedTasks: true,
        autoRefresh: false,
        refreshInterval: 120
      }
    },
    lastLoginAt: "2024-01-28T08:45:00Z",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-28T08:45:00Z"
  }
];

// 模拟项目数据
export const mockProjects: Project[] = [
  {
    id: 1,
    name: "AI对话数据集",
    description: "用于训练智能客服机器人的对话数据集，包含常见问答场景",
    status: "active",
    priority: "high",
    category: "AI训练",
    tags: ["AI", "对话", "客服", "训练数据"],
    ownerId: 1,
    memberIds: [1, 2, 3],
    progress: 75,
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-03-15T00:00:00Z",
    estimatedHours: 120,
    actualHours: 90,
    budget: 50000,
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z"
  },
  {
    id: 2,
    name: "技术文档问答",
    description: "基于技术文档生成的问答对，涵盖编程、架构设计等技术领域",
    status: "active",
    priority: "medium",
    category: "技术文档",
    tags: ["技术", "文档", "编程", "架构"],
    ownerId: 2,
    memberIds: [2, 4, 5],
    progress: 60,
    startDate: "2024-01-18T00:00:00Z",
    endDate: "2024-04-18T00:00:00Z",
    estimatedHours: 80,
    actualHours: 48,
    budget: 30000,
    createdAt: "2024-01-18T10:15:00Z",
    updatedAt: "2024-01-25T16:45:00Z"
  },
  {
    id: 3,
    name: "教育培训材料",
    description: "教育培训相关的问答数据，适用于在线学习平台",
    status: "completed",
    priority: "low",
    category: "教育培训",
    tags: ["教育", "培训", "在线学习"],
    ownerId: 3,
    memberIds: [3, 6],
    progress: 100,
    startDate: "2024-01-22T00:00:00Z",
    endDate: "2024-02-22T00:00:00Z",
    estimatedHours: 60,
    actualHours: 55,
    budget: 20000,
    createdAt: "2024-01-22T09:20:00Z",
    updatedAt: "2024-01-28T11:30:00Z"
  },
  {
    id: 4,
    name: "金融问答数据集",
    description: "金融领域专业问答数据，涵盖投资、理财、保险等多个方面",
    status: "active",
    priority: "urgent",
    category: "金融服务",
    tags: ["金融", "投资", "理财", "保险"],
    ownerId: 2,
    memberIds: [2, 3, 4],
    progress: 25,
    startDate: "2024-01-26T00:00:00Z",
    endDate: "2024-05-26T00:00:00Z",
    estimatedHours: 200,
    actualHours: 50,
    budget: 80000,
    createdAt: "2024-01-26T11:45:00Z",
    updatedAt: "2024-01-28T10:30:00Z"
  },
  {
    id: 5,
    name: "医疗咨询数据集",
    description: "医疗健康咨询相关的问答数据集",
    status: "inactive",
    priority: "low",
    category: "医疗健康",
    tags: ["医疗", "健康", "咨询"],
    ownerId: 1,
    memberIds: [1],
    progress: 0,
    startDate: "2024-02-01T00:00:00Z",
    endDate: "2024-06-01T00:00:00Z",
    estimatedHours: 150,
    actualHours: 0,
    budget: 60000,
    createdAt: "2024-01-28T14:00:00Z",
    updatedAt: "2024-01-28T14:00:00Z"
  }
];

// 模拟数据集数据
export const mockDatasets: Dataset[] = [
  {
    id: 1,
    projectId: 1,
    name: '客服对话数据集',
    description: '包含常见客服问答的数据集',
    fileName: 'customer-service.txt',
    filePath: '/uploads/customer-service.txt',
    fileSize: 1024,
    type: 'text',
    size: 1024,
    content: '用户：你好，我想咨询一下产品信息。\n客服：您好！很高兴为您服务，请问您想了解哪款产品呢？\n\n用户：我想了解你们的会员服务。\n客服：我们提供多种会员服务，包括基础会员、高级会员和VIP会员。\n\n用户：VIP会员有什么特权？\n客服：VIP会员享有专属客服、优先处理、专属折扣等特权。',
    segmentDelimiter: '\n\n',
    segmentCount: 3,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    metadata: {
      dialogueCount: 3,
      averageLength: 45,
      topics: ['产品咨询', '会员服务', 'VIP特权']
    },
    tags: ['客服', '对话', '问答', '中文'],
    isPublic: false,
    downloadCount: 15,
    lastAccessedAt: '2024-01-20T09:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    projectId: 1,
    name: "产品说明数据集",
    description: "产品功能和特性的详细说明文档",
    fileName: "product-docs.txt",
    filePath: "/uploads/product-docs.txt",
    fileSize: 8960,
    type: 'text',
    size: 8960,
    content: "我们的产品是一款基于人工智能的智能助手，能够帮助用户完成各种任务。\n\n产品特点包括：自然语言处理、机器学习算法、云端部署等。\n\n使用场景：客户服务、内容创作、数据分析等领域。",
    segmentDelimiter: "\n\n",
    segmentCount: 3,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    metadata: {
      sectionCount: 3,
      keywordDensity: 0.15,
      readabilityScore: 85
    },
    tags: ['产品', '说明', 'AI', '功能'],
    isPublic: true,
    downloadCount: 32,
    lastAccessedAt: '2024-01-25T14:15:00Z',
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    projectId: 2,
    name: "教育内容数据集",
    description: "教育培训相关的理论和实践内容",
    fileName: "education-content.txt",
    filePath: "/uploads/education-content.txt",
    fileSize: 12340,
    type: 'text',
    size: 12340,
    content: "教育是培养人的社会活动。教育的根本目的是促进人的全面发展。\n\n现代教育注重培养学生的创新能力和实践能力。\n\n在线教育是利用互联网技术进行教学的新模式，具有灵活性和便利性的特点。",
    segmentDelimiter: "\n\n",
    segmentCount: 3,
    status: 'ready',
    uploadProgress: 100,
    encoding: 'UTF-8',
    language: 'zh-CN',
    metadata: {
      conceptCount: 5,
      educationLevel: 'general',
      subjectArea: 'education_theory'
    },
    tags: ['教育', '培训', '理论', '在线学习'],
    isPublic: true,
    downloadCount: 28,
    lastAccessedAt: '2024-01-28T16:45:00Z',
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z"
  },
  {
    id: 4,
    projectId: 4,
    name: "投资理财问答",
    description: "投资理财相关的专业问答数据",
    fileName: "investment-qa.json",
    filePath: "/uploads/investment-qa.json",
    fileSize: 25600,
    type: 'json',
    size: 25600,
    content: '{"questions": [{"q": "什么是基金定投？", "a": "基金定投是定期定额投资基金的简称..."}]}',
    segmentDelimiter: "\n",
    segmentCount: 50,
    status: 'processing',
    uploadProgress: 75,
    encoding: 'UTF-8',
    language: 'zh-CN',
    metadata: {
      questionCount: 50,
      categories: ['投资', '理财', '基金', '股票'],
      difficulty: 'intermediate'
    },
    tags: ['金融', '投资', '理财', '基金'],
    isPublic: false,
    downloadCount: 0,
    createdAt: "2024-01-26T12:00:00Z",
    updatedAt: "2024-01-28T10:30:00Z"
  }
];

// 模拟问题数据
export const mockQuestions: Question[] = [
  {
    id: 1,
    uid: "q_001",
    projectId: 1,
    datasetId: 1,
    segmentId: "seg_001",
    prompt: "基于以下客服对话内容，生成一个相关的问题：",
    content: "用户：你好，我想咨询一下产品价格\n客服：您好！很高兴为您服务，请问您想了解哪款产品的价格呢？",
    generatedQuestion: "如何咨询产品价格信息？",
    wordCount: 45,
    status: "generated",
    type: "short_answer",
    difficulty: "easy",
    category: "客服咨询",
    tags: ["价格", "咨询", "客服"],
    points: 10,
    timeLimit: 300,
    hints: ["可以通过多种渠道咨询", "客服会提供详细信息"],
    explanation: "这是一个关于产品价格咨询流程的基础问题",
    references: ["客服手册第3章"],
    isPublic: true,
    usageCount: 25,
    rating: 4.2,
    ratingCount: 8,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    uid: "q_002",
    projectId: 1,
    datasetId: 1,
    segmentId: "seg_002",
    prompt: "基于以下客服对话内容，生成一个相关的问题：",
    content: "用户：我想了解你们的云服务器套餐\n客服：我们有多种云服务器套餐，包括基础版、标准版和企业版",
    generatedQuestion: "云服务器有哪些套餐类型？",
    wordCount: 38,
    status: "answered",
    type: "multiple_choice",
    difficulty: "medium",
    category: "产品介绍",
    tags: ["云服务器", "套餐", "产品"],
    points: 15,
    timeLimit: 180,
    hints: ["有三种主要套餐类型", "每种套餐适合不同用户群体"],
    explanation: "云服务器套餐分为基础版、标准版和企业版，分别适合不同规模的用户需求",
    references: ["产品手册第2章", "价格表"],
    reviewerId: 2,
    reviewedAt: "2024-01-15T12:00:00Z",
    reviewComments: "问题清晰，答案准确",
    isPublic: true,
    usageCount: 42,
    rating: 4.5,
    ratingCount: 12,
    createdAt: "2024-01-15T11:15:00Z",
    updatedAt: "2024-01-15T12:00:00Z"
  },
  {
    id: 3,
    uid: "q_003",
    projectId: 2,
    datasetId: 3,
    segmentId: "seg_003",
    prompt: "根据React开发文档内容，提出一个技术问题：",
    content: "在现代React开发中，推荐使用函数组件配合Hooks来构建应用",
    generatedQuestion: "为什么推荐使用函数组件而不是类组件？",
    wordCount: 32,
    status: "generated",
    type: "essay",
    difficulty: "hard",
    category: "前端开发",
    tags: ["React", "函数组件", "Hooks", "前端"],
    points: 25,
    timeLimit: 600,
    hints: ["考虑性能优化", "代码简洁性", "Hooks的优势"],
    explanation: "函数组件配合Hooks提供了更简洁的代码结构和更好的性能优化机制",
    references: ["React官方文档", "Hooks指南"],
    isPublic: false,
    usageCount: 18,
    rating: 4.8,
    ratingCount: 5,
    createdAt: "2024-01-18T12:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z"
  }
];

// 模拟答案数据
export const mockAnswers: Answer[] = [
  {
    id: 1,
    questionId: 2,
    prompt: "请为以下问题提供详细的答案：",
    generatedAnswer: "我们提供三种云服务器套餐：\n1. 基础版：适合个人开发者和小型项目，提供1核2G配置\n2. 标准版：适合中小企业，提供2核4G配置，包含负载均衡\n3. 企业版：适合大型企业，提供4核8G及以上配置，包含高可用架构",
    content: "云服务器套餐详细说明和配置对比",
    type: "generated",
    status: "approved",
    isCorrect: true,
    confidence: 0.95,
    wordCount: 78,
    language: "zh-CN",
    sources: ["产品手册", "技术规格文档"],
    reviewerId: 2,
    reviewedAt: "2024-01-15T16:00:00Z",
    reviewComments: "答案准确完整，涵盖了所有套餐类型",
    rating: 4.6,
    ratingCount: 15,
    usageCount: 32,
    lastUsedAt: "2024-01-25T10:30:00Z",
    createdAt: "2024-01-15T15:30:00Z",
    updatedAt: "2024-01-15T16:00:00Z"
  },
  {
    id: 2,
    questionId: 1,
    prompt: "请为以下问题提供详细的答案：",
    generatedAnswer: "您可以通过以下方式咨询产品价格：\n1. 访问官网产品页面查看标准价格\n2. 联系在线客服获取详细报价\n3. 拨打客服热线400-xxx-xxxx\n4. 提交询价表单，我们会在24小时内回复",
    content: "产品价格咨询的多种渠道和方式",
    type: "generated",
    status: "approved",
    isCorrect: true,
    confidence: 0.92,
    wordCount: 65,
    language: "zh-CN",
    sources: ["客服手册", "价格政策文档"],
    reviewerId: 1,
    reviewedAt: "2024-01-15T17:00:00Z",
    reviewComments: "提供了全面的咨询渠道信息",
    rating: 4.3,
    ratingCount: 12,
    usageCount: 28,
    lastUsedAt: "2024-01-24T14:20:00Z",
    createdAt: "2024-01-15T16:45:00Z",
    updatedAt: "2024-01-15T17:00:00Z"
  }
];

// 模拟问题模板数据
export const mockQuestionTemplates: QuestionTemplate[] = [
  {
    id: 1,
    name: "基础问答模板",
    description: "适用于一般性问答场景的模板",
    template: "基于以下内容，生成一个相关的问题：\n\n{content}\n\n请确保问题简洁明了，易于理解。",
    isDefault: true,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 2,
    name: "技术文档模板",
    description: "专门用于技术文档的问题生成模板",
    template: "根据以下技术文档内容，提出一个深入的技术问题：\n\n{content}\n\n问题应该能够测试对该技术概念的理解程度。",
    isDefault: false,
    createdAt: "2024-01-12T10:30:00Z",
    updatedAt: "2024-01-12T10:30:00Z"
  }
];

// 模拟提示词模板数据
export const mockPromptTemplates: PromptTemplate[] = [
  {
    id: 1,
    name: "问题生成提示词",
    description: "用于生成问题的标准提示词模板",
    template: "你是一个专业的问题生成助手。请基于给定的内容生成一个相关且有价值的问题。\n\n内容：{content}\n\n要求：\n1. 问题应该简洁明了\n2. 问题应该能够引发思考\n3. 问题应该与内容高度相关\n\n请生成问题：",
    category: "question",
    isDefault: true,
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-10T09:00:00Z"
  },
  {
    id: 2,
    name: "答案生成提示词",
    description: "用于生成答案的标准提示词模板",
    template: "你是一个知识渊博的助手。请为以下问题提供准确、详细的答案。\n\n问题：{question}\n\n相关内容：{content}\n\n要求：\n1. 答案应该准确可靠\n2. 答案应该结构清晰\n3. 答案应该易于理解\n\n请提供答案：",
    category: "answer",
    isDefault: true,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-10T09:15:00Z"
  }
];

// 模拟系统设置数据
export const mockSettings: Setting[] = [
  {
    id: 1,
    key: "ai_model",
    value: "gpt-3.5-turbo",
    description: "默认使用的AI模型",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 2,
    key: "max_tokens",
    value: "2000",
    description: "AI生成内容的最大token数量",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 3,
    key: "temperature",
    value: "0.7",
    description: "AI生成内容的创造性程度",
    updatedAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 4,
    key: "default_language",
    value: "zh-CN",
    description: "系统默认语言设置",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 5,
    key: "max_file_size",
    value: "10485760",
    description: "文件上传最大大小限制（字节）",
    updatedAt: "2024-01-15T10:00:00Z"
  }
];

// 模拟问题生成任务数据
export const mockQuestionGenerationTasks: QuestionGenerationTask[] = [
  {
    id: 1,
    projectId: 1,
    datasetId: 1,
    status: "completed",
    totalQuestions: 50,
    completedQuestions: 50,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T12:30:00Z"
  },
  {
    id: 2,
    projectId: 1,
    datasetId: 2,
    status: "running",
    totalQuestions: 30,
    completedQuestions: 18,
    createdAt: "2024-01-16T14:00:00Z",
    updatedAt: "2024-01-16T15:45:00Z"
  },
  {
    id: 3,
    projectId: 2,
    datasetId: 3,
    status: "pending",
    totalQuestions: 25,
    completedQuestions: 0,
    createdAt: "2024-01-18T11:30:00Z",
    updatedAt: "2024-01-18T11:30:00Z"
  }
];

// 模拟统计数据
export const mockProjectStats: ProjectStats = {
  totalProjects: 15,
  activeProjects: 8,
  completedProjects: 5,
  totalQuestions: 342,
  answeredQuestions: 256,
  totalDatasets: 28,
  totalUsers: 12,
  recentActivity: [
    {
      id: 1,
      type: "question_generated",
      title: "生成新问题",
      description: "在AI对话数据集项目中生成了15个新问题",
      userId: 2,
      userName: "张项目",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      entityId: 1,
      entityType: "project",
      createdAt: "2024-01-28T10:30:00Z"
    },
    {
      id: 2,
      type: "answer_created",
      title: "创建答案",
      description: "为问题创建了详细答案",
      userId: 3,
      userName: "李数据",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      entityId: 2,
      entityType: "question",
      createdAt: "2024-01-28T09:15:00Z"
    },
    {
      id: 3,
      type: "dataset_uploaded",
      title: "上传数据集",
      description: "上传了新的教育培训数据集",
      userId: 1,
      userName: "系统管理员",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      entityId: 3,
      entityType: "dataset",
      createdAt: "2024-01-27T14:20:00Z"
    },
    {
      id: 4,
      type: "project_created",
      title: "创建项目",
      description: "创建了新项目'金融问答数据集'",
      userId: 2,
      userName: "张项目",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      entityId: 4,
      entityType: "project",
      createdAt: "2024-01-26T11:45:00Z"
    },
    {
      id: 5,
      type: "user_joined",
      title: "新用户加入",
      description: "新成员王开发加入了团队",
      userId: 4,
      userName: "王开发",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      createdAt: "2024-01-25T16:30:00Z"
    }
  ]
};

// 扩展的模拟数据（包含更多状态场景）
export const mockExtendedProjects: Project[] = [
  ...mockProjects,
  {
    id: 6,
    name: "法律咨询问答",
    description: "法律咨询领域的专业问答数据集",
    status: "archived",
    priority: "medium",
    category: "法律服务",
    tags: ["法律", "咨询", "合同", "纠纷"],
    ownerId: 3,
    memberIds: [3, 5],
    progress: 100,
    startDate: "2023-10-01T00:00:00Z",
    endDate: "2023-12-31T00:00:00Z",
    estimatedHours: 100,
    actualHours: 95,
    budget: 40000,
    createdAt: "2023-10-01T09:00:00Z",
    updatedAt: "2023-12-31T17:00:00Z"
  }
];

// 扩展的数据集数据（包含不同状态）
export const mockExtendedDatasets: Dataset[] = [
  ...mockDatasets,
  {
    id: 5,
    projectId: 5,
    name: "空数据集示例",
    description: "用于测试空状态的数据集",
    fileName: "empty-dataset.txt",
    filePath: "/uploads/empty-dataset.txt",
    fileSize: 0,
    type: 'text',
    size: 0,
    content: '',
    segmentDelimiter: "\n\n",
    segmentCount: 0,
    status: 'error',
    uploadProgress: 0,
    encoding: 'UTF-8',
    language: 'zh-CN',
    metadata: {},
    tags: [],
    isPublic: false,
    downloadCount: 0,
    createdAt: "2024-01-28T15:00:00Z",
    updatedAt: "2024-01-28T15:00:00Z"
  }
];

// 扩展的问题数据（包含更多类型和状态）
export const mockExtendedQuestions: Question[] = [
  ...mockQuestions,
  {
    id: 4,
    uid: "q_004",
    projectId: 4,
    datasetId: 4,
    segmentId: "seg_004",
    prompt: "基于金融投资内容，生成一个选择题：",
    content: "基金定投是一种长期投资策略，通过定期定额投资来分散风险",
    generatedQuestion: "基金定投的主要优势是什么？",
    wordCount: 28,
    status: "draft",
    type: "multiple_choice",
    difficulty: "medium",
    category: "金融投资",
    tags: ["基金", "定投", "投资策略"],
    points: 20,
    timeLimit: 240,
    hints: ["考虑风险分散", "长期投资的好处"],
    explanation: "基金定投通过定期投资可以有效分散市场波动风险",
    references: ["投资理财指南"],
    isPublic: false,
    usageCount: 0,
    createdAt: "2024-01-28T11:00:00Z",
    updatedAt: "2024-01-28T11:00:00Z"
  }
];

// 扩展的答案数据（包含更多状态）
export const mockExtendedAnswers: Answer[] = [
  ...mockAnswers,
  {
    id: 3,
    questionId: 4,
    prompt: "请为基金定投问题提供详细答案：",
    generatedAnswer: "基金定投的主要优势包括：\n1. 风险分散：通过定期投资分散市场波动风险\n2. 强制储蓄：培养良好的投资习惯\n3. 复利效应：长期投资获得复利收益\n4. 降低择时难度：无需判断市场时机",
    content: "基金定投优势的全面分析",
    type: "generated",
    status: "draft",
    isCorrect: true,
    confidence: 0.88,
    wordCount: 68,
    language: "zh-CN",
    sources: ["投资理财教程", "基金投资指南"],
    usageCount: 0,
    createdAt: "2024-01-28T11:15:00Z",
    updatedAt: "2024-01-28T11:15:00Z"
  }
];

// 空数据状态示例
export const emptyProjects: Project[] = [];
export const emptyDatasets: Dataset[] = [];
export const emptyQuestions: Question[] = [];
export const emptyAnswers: Answer[] = [];
export const emptyUsers: User[] = [];

// 单条数据示例
export const singleProject: Project[] = [mockProjects[0]];
export const singleDataset: Dataset[] = [mockDatasets[0]];
export const singleQuestion: Question[] = [mockQuestions[0]];
export const singleAnswer: Answer[] = [mockAnswers[0]];
export const singleUser: User[] = [mockUsers[0]];

// 分页数据示例函数
export const getPaginatedData = <T>(data: T[], page: number = 1, pageSize: number = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
    hasNext: endIndex < data.length,
    hasPrev: page > 1
  };
};

// 数据生成工具函数
export const generateMockData = {
  // 生成随机项目数据
  project: (count: number = 1): Project[] => {
    const categories = ["AI训练", "技术文档", "教育培训", "金融服务", "医疗健康", "法律服务"];
    const statuses: Project['status'][] = ["active", "inactive", "completed", "archived"];
    const priorities: Project['priority'][] = ["low", "medium", "high", "urgent"];
    
    return Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      name: `项目${index + 1}`,
      description: `这是第${index + 1}个测试项目的描述`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: [`标签${index + 1}`, `测试`],
      ownerId: Math.floor(Math.random() * 3) + 1,
      memberIds: [1, 2, 3].slice(0, Math.floor(Math.random() * 3) + 1),
      progress: Math.floor(Math.random() * 101),
      startDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: Math.floor(Math.random() * 200) + 50,
      actualHours: Math.floor(Math.random() * 150),
      budget: Math.floor(Math.random() * 100000) + 10000,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  },

  // 生成随机问题数据
  question: (count: number = 1, projectId: number = 1, datasetId: number = 1): Question[] => {
    const types: Question['type'][] = ["single_choice", "multiple_choice", "true_false", "short_answer", "essay", "fill_blank"];
    const difficulties: Question['difficulty'][] = ["easy", "medium", "hard", "expert"];
    const statuses: Question['status'][] = ["draft", "generated", "reviewed", "answered", "exported", "archived"];
    const categories = ["基础知识", "专业技能", "实践应用", "理论分析"];
    
    return Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      uid: `q_${Date.now()}_${index}`,
      projectId,
      datasetId,
      segmentId: `seg_${Date.now()}_${index}`,
      prompt: `这是第${index + 1}个问题的提示词`,
      content: `这是第${index + 1}个问题的内容描述`,
      generatedQuestion: `这是第${index + 1}个生成的问题？`,
      wordCount: Math.floor(Math.random() * 100) + 20,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      type: types[Math.floor(Math.random() * types.length)],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: [`标签${index + 1}`, `测试`],
      points: Math.floor(Math.random() * 30) + 5,
      timeLimit: Math.floor(Math.random() * 600) + 60,
      hints: [`提示${index + 1}`],
      explanation: `这是第${index + 1}个问题的解释`,
      references: [`参考资料${index + 1}`],
      isPublic: Math.random() > 0.5,
      usageCount: Math.floor(Math.random() * 50),
      rating: Math.random() * 2 + 3,
      ratingCount: Math.floor(Math.random() * 20),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }
};
