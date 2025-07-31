import { 
  Project, 
  Dataset, 
  Question, 
  Answer, 
  QuestionTemplate, 
  PromptTemplate, 
  Setting,
  QuestionGenerationTask 
} from '../../types';

// 模拟项目数据
export const mockProjects: Project[] = [
  {
    id: 1,
    name: "AI对话数据集",
    description: "用于训练智能客服机器人的对话数据集，包含常见问答场景",
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z"
  },
  {
    id: 2,
    name: "技术文档问答",
    description: "基于技术文档生成的问答对，涵盖编程、架构设计等技术领域",
    createdAt: "2024-01-18T10:15:00Z",
    updatedAt: "2024-01-25T16:45:00Z"
  },
  {
    id: 3,
    name: "教育培训材料",
    description: "教育培训相关的问答数据，适用于在线学习平台",
    createdAt: "2024-01-22T09:20:00Z",
    updatedAt: "2024-01-28T11:30:00Z"
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
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    projectId: 1,
    name: "产品说明数据集",
    fileName: "product-docs.txt",
    filePath: "/uploads/product-docs.txt",
    fileSize: 8960,
    content: "我们的产品是一款基于人工智能的智能助手，能够帮助用户完成各种任务。\n\n产品特点包括：自然语言处理、机器学习算法、云端部署等。\n\n使用场景：客户服务、内容创作、数据分析等领域。",
    segmentDelimiter: "\n\n",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z"
  },
  {
    id: 3,
    projectId: 2,
    name: "教育内容数据集",
    fileName: "education-content.txt",
    filePath: "/uploads/education-content.txt",
    fileSize: 12340,
    content: "教育是培养人的社会活动。教育的根本目的是促进人的全面发展。\n\n现代教育注重培养学生的创新能力和实践能力。\n\n在线教育是利用互联网技术进行教学的新模式，具有灵活性和便利性的特点。",
    segmentDelimiter: "\n\n",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z"
  }
];

// 模拟问题数据
export const mockQuestions: Question[] = [
  {
    id: 1,
    uid: "q_001",
    projectId: 1,
    datasetId: 1,
    prompt: "基于以下客服对话内容，生成一个相关的问题：",
    content: "用户：你好，我想咨询一下产品价格\n客服：您好！很高兴为您服务，请问您想了解哪款产品的价格呢？",
    generatedQuestion: "如何咨询产品价格信息？",
    wordCount: 45,
    status: "generated",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    uid: "q_002",
    projectId: 1,
    datasetId: 1,
    prompt: "基于以下客服对话内容，生成一个相关的问题：",
    content: "用户：我想了解你们的云服务器套餐\n客服：我们有多种云服务器套餐，包括基础版、标准版和企业版",
    generatedQuestion: "云服务器有哪些套餐类型？",
    wordCount: 38,
    status: "answered",
    createdAt: "2024-01-15T11:15:00Z"
  },
  {
    id: 3,
    uid: "q_003",
    projectId: 2,
    datasetId: 3,
    prompt: "根据React开发文档内容，提出一个技术问题：",
    content: "在现代React开发中，推荐使用函数组件配合Hooks来构建应用",
    generatedQuestion: "为什么推荐使用函数组件而不是类组件？",
    wordCount: 32,
    status: "generated",
    createdAt: "2024-01-18T12:00:00Z"
  }
];

// 模拟答案数据
export const mockAnswers: Answer[] = [
  {
    id: 1,
    questionId: 2,
    prompt: "请为以下问题提供详细的答案：",
    generatedAnswer: "我们提供三种云服务器套餐：\n1. 基础版：适合个人开发者和小型项目，提供1核2G配置\n2. 标准版：适合中小企业，提供2核4G配置，包含负载均衡\n3. 企业版：适合大型企业，提供4核8G及以上配置，包含高可用架构",
    createdAt: "2024-01-15T15:30:00Z"
  },
  {
    id: 2,
    questionId: 1,
    prompt: "请为以下问题提供详细的答案：",
    generatedAnswer: "您可以通过以下方式咨询产品价格：\n1. 访问官网产品页面查看标准价格\n2. 联系在线客服获取详细报价\n3. 拨打客服热线400-xxx-xxxx\n4. 提交询价表单，我们会在24小时内回复",
    createdAt: "2024-01-15T16:45:00Z"
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