import { Project, Dataset, Question, Answer, User, QuestionGenerationTask } from '../types';

// 数据场景生成器
export class DataScenarioGenerator {
  // 生成空数据场景
  static generateEmptyScenario() {
    return {
      projects: [] as Project[],
      datasets: [] as Dataset[],
      questions: [] as Question[],
      answers: [] as Answer[],
      users: [] as User[],
      tasks: [] as QuestionGenerationTask[]
    };
  }

  // 生成单条数据场景
  static generateSingleItemScenario() {
    const user: User = {
      id: 1,
      username: "demo_user",
      email: "demo@example.com",
      fullName: "演示用户",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      role: "admin",
      status: "active",
      department: "演示部门",
      position: "演示职位",
      phone: "13800138000",
      bio: "这是一个演示用户账户",
      skills: ["演示技能"],
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
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const project: Project = {
      id: 1,
      name: "演示项目",
      description: "这是一个用于演示的项目",
      status: "active",
      priority: "medium",
      category: "演示分类",
      tags: ["演示", "测试"],
      ownerId: 1,
      memberIds: [1],
      progress: 50,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 40,
      actualHours: 20,
      budget: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const dataset: Dataset = {
      id: 1,
      projectId: 1,
      name: "演示数据集",
      description: "用于演示的数据集",
      fileName: "demo-data.txt",
      filePath: "/uploads/demo-data.txt",
      fileSize: 1024,
      type: 'text',
      size: 1024,
      content: "这是演示数据的内容。\n\n包含多个段落用于测试。",
      segmentDelimiter: "\n\n",
      segmentCount: 2,
      status: 'ready',
      uploadProgress: 100,
      encoding: 'UTF-8',
      language: 'zh-CN',
      metadata: {
        sampleCount: 2,
        averageLength: 20
      },
      tags: ['演示', '测试'],
      isPublic: false,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const question: Question = {
      id: 1,
      uid: "demo_q_001",
      projectId: 1,
      datasetId: 1,
      segmentId: "demo_seg_001",
      prompt: "基于以下内容生成问题：",
      content: "这是演示数据的内容。",
      generatedQuestion: "这是什么类型的数据？",
      wordCount: 12,
      status: "generated",
      type: "short_answer",
      difficulty: "easy",
      category: "演示分类",
      tags: ["演示", "测试"],
      points: 10,
      timeLimit: 300,
      hints: ["这是一个演示提示"],
      explanation: "这是演示问题的解释",
      references: ["演示参考资料"],
      isPublic: false,
      usageCount: 0,
      rating: 4.0,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const answer: Answer = {
      id: 1,
      questionId: 1,
      prompt: "请回答以下问题：",
      generatedAnswer: "这是演示数据，用于展示系统功能。",
      content: "详细的答案内容",
      type: "generated",
      status: "approved",
      isCorrect: true,
      confidence: 0.9,
      wordCount: 18,
      language: "zh-CN",
      sources: ["演示数据源"],
      rating: 4.5,
      ratingCount: 1,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const task: QuestionGenerationTask = {
      id: 1,
      projectId: 1,
      datasetId: 1,
      status: "completed",
      totalQuestions: 1,
      completedQuestions: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return {
      projects: [project],
      datasets: [dataset],
      questions: [question],
      answers: [answer],
      users: [user],
      tasks: [task]
    };
  }

  // 生成大量数据场景（用于测试分页）
  static generateLargeDataScenario(itemCount: number = 100) {
    const users: User[] = [];
    const projects: Project[] = [];
    const datasets: Dataset[] = [];
    const questions: Question[] = [];
    const answers: Answer[] = [];
    const tasks: QuestionGenerationTask[] = [];

    // 生成用户
    for (let i = 1; i <= Math.min(itemCount / 10, 20); i++) {
      users.push({
        id: i,
        username: `user_${i}`,
        email: `user${i}@example.com`,
        fullName: `用户 ${i}`,
        avatar: `https://images.unsplash.com/photo-${1472099645785 + i}?w=100&h=100&fit=crop&crop=face`,
        role: i === 1 ? "admin" : i <= 3 ? "manager" : "member",
        status: "active",
        department: `部门 ${Math.ceil(i / 5)}`,
        position: `职位 ${i}`,
        phone: `1380013800${i.toString().padStart(2, '0')}`,
        bio: `这是用户 ${i} 的简介`,
        skills: [`技能${i}A`, `技能${i}B`],
        preferences: {
          theme: i % 2 === 0 ? "light" : "dark",
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
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 生成项目
    for (let i = 1; i <= Math.min(itemCount / 5, 50); i++) {
      const ownerId = users[Math.floor(Math.random() * users.length)]?.id || 1;
      const memberCount = Math.floor(Math.random() * 5) + 1;
      const memberIds = Array.from(new Set([
        ownerId,
        ...Array.from({ length: memberCount }, () => 
          users[Math.floor(Math.random() * users.length)]?.id || 1
        )
      ]));

      projects.push({
        id: i,
        name: `项目 ${i}`,
        description: `这是项目 ${i} 的详细描述，包含了项目的目标、范围和预期成果。`,
        status: ["active", "completed", "inactive"][Math.floor(Math.random() * 3)] as any,
        priority: ["low", "medium", "high", "urgent"][Math.floor(Math.random() * 4)] as any,
        category: `分类 ${Math.ceil(i / 10)}`,
        tags: [`标签${i}A`, `标签${i}B`, "通用标签"],
        ownerId,
        memberIds,
        progress: Math.floor(Math.random() * 101),
        startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: Math.floor(Math.random() * 200) + 20,
        actualHours: Math.floor(Math.random() * 150) + 10,
        budget: Math.floor(Math.random() * 100000) + 10000,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 生成数据集
    for (let i = 1; i <= Math.min(itemCount / 3, 80); i++) {
      const projectId = projects[Math.floor(Math.random() * projects.length)]?.id || 1;
      
      datasets.push({
        id: i,
        projectId,
        name: `数据集 ${i}`,
        description: `数据集 ${i} 的详细描述`,
        fileName: `dataset_${i}.txt`,
        filePath: `/uploads/dataset_${i}.txt`,
        fileSize: Math.floor(Math.random() * 50000) + 1000,
        type: 'text',
        size: Math.floor(Math.random() * 50000) + 1000,
        content: `这是数据集 ${i} 的内容示例。\n\n包含多个段落和示例数据。\n\n用于生成问题和答案。`,
        segmentDelimiter: "\n\n",
        segmentCount: Math.floor(Math.random() * 20) + 3,
        status: ['ready', 'processing', 'error'][Math.floor(Math.random() * 3)] as any,
        uploadProgress: Math.floor(Math.random() * 101),
        encoding: 'UTF-8',
        language: 'zh-CN',
        metadata: {
          sampleCount: Math.floor(Math.random() * 100) + 10,
          averageLength: Math.floor(Math.random() * 100) + 20
        },
        tags: [`数据集${i}`, '自动生成'],
        isPublic: Math.random() > 0.5,
        downloadCount: Math.floor(Math.random() * 50),
        lastAccessedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 生成问题
    for (let i = 1; i <= itemCount; i++) {
      const dataset = datasets[Math.floor(Math.random() * datasets.length)];
      if (!dataset) continue;

      const projectId = dataset.projectId;
      const reviewerId = Math.random() > 0.7 ? users[Math.floor(Math.random() * users.length)]?.id : undefined;

      questions.push({
        id: i,
        uid: `auto_q_${i.toString().padStart(6, '0')}`,
        projectId,
        datasetId: dataset.id,
        segmentId: `seg_${i}`,
        prompt: `基于以下内容生成问题 ${i}：`,
        content: `这是问题 ${i} 的源内容，包含了相关的背景信息和上下文。`,
        generatedQuestion: `这是自动生成的问题 ${i}，用于测试系统功能？`,
        wordCount: Math.floor(Math.random() * 100) + 10,
        status: ["generated", "answered", "reviewed"][Math.floor(Math.random() * 3)] as any,
        type: ["short_answer", "multiple_choice", "essay"][Math.floor(Math.random() * 3)] as any,
        difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as any,
        category: `分类 ${Math.ceil(i / 20)}`,
        tags: [`问题${i}`, "自动生成", `难度${Math.ceil(i / 30)}`],
        points: Math.floor(Math.random() * 50) + 5,
        timeLimit: Math.floor(Math.random() * 600) + 60,
        hints: [`提示 ${i}A`, `提示 ${i}B`],
        explanation: `这是问题 ${i} 的详细解释和说明。`,
        references: [`参考资料 ${i}`],
        reviewerId,
        reviewedAt: reviewerId ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        reviewComments: reviewerId ? `问题 ${i} 的审核意见` : undefined,
        isPublic: Math.random() > 0.3,
        usageCount: Math.floor(Math.random() * 20),
        rating: Math.random() * 2 + 3, // 3-5分
        ratingCount: Math.floor(Math.random() * 10) + 1,
        createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // 生成答案（约70%的问题有答案）
    const questionsWithAnswers = questions.slice(0, Math.floor(questions.length * 0.7));
    questionsWithAnswers.forEach((question, index) => {
      const reviewerId = Math.random() > 0.6 ? users[Math.floor(Math.random() * users.length)]?.id : undefined;
      
      answers.push({
        id: index + 1,
        questionId: question.id,
        prompt: `请为问题 ${question.id} 提供答案：`,
        generatedAnswer: `这是问题 ${question.id} 的自动生成答案，包含了详细的解释和说明。答案内容丰富，涵盖了问题的各个方面。`,
        content: `问题 ${question.id} 的扩展答案内容`,
        type: ["generated", "manual", "imported"][Math.floor(Math.random() * 3)] as any,
        status: ["draft", "generated", "reviewed", "approved", "rejected"][Math.floor(Math.random() * 5)] as any,
        isCorrect: Math.random() > 0.2,
        confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
        wordCount: Math.floor(Math.random() * 200) + 50,
        language: "zh-CN",
        sources: [`来源 ${index + 1}A`, `来源 ${index + 1}B`],
        reviewerId,
        reviewedAt: reviewerId ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        reviewComments: reviewerId ? `答案 ${index + 1} 的审核意见` : undefined,
        rating: Math.random() * 1.5 + 3.5, // 3.5-5分
        ratingCount: Math.floor(Math.random() * 15) + 1,
        usageCount: Math.floor(Math.random() * 30),
        lastUsedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // 生成任务
    datasets.forEach((dataset, index) => {
      const questionCount = questions.filter(q => q.datasetId === dataset.id).length;
      if (questionCount === 0) return;

      tasks.push({
        id: index + 1,
        projectId: dataset.projectId,
        datasetId: dataset.id,
        status: ["pending", "running", "completed", "failed"][Math.floor(Math.random() * 4)] as any,
        totalQuestions: questionCount,
        completedQuestions: Math.floor(Math.random() * questionCount),
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    return {
      projects,
      datasets,
      questions,
      answers,
      users,
      tasks
    };
  }

  // 生成错误状态场景
  static generateErrorScenario() {
    return {
      projects: [{
        id: 1,
        name: "错误项目",
        description: "这个项目包含一些错误状态",
        status: "active" as const,
        priority: "high" as const,
        category: "错误测试",
        tags: ["错误", "测试"],
        ownerId: 999, // 不存在的用户ID
        memberIds: [999, 1000], // 不存在的用户ID
        progress: 150, // 超出范围的进度
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 结束日期早于开始日期
        estimatedHours: -10, // 负数小时
        actualHours: 200, // 超出预估小时
        budget: -5000, // 负预算
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      datasets: [{
        id: 1,
        projectId: 999, // 不存在的项目ID
        name: "错误数据集",
        description: "包含错误的数据集",
        fileName: "error-data.txt",
        filePath: "/uploads/error-data.txt",
        fileSize: -1024, // 负文件大小
        type: 'text' as const,
        size: -1024,
        content: "",
        segmentDelimiter: "\n\n",
        segmentCount: -5, // 负段落数
        status: 'error' as const,
        uploadProgress: 150, // 超出100%的进度
        encoding: 'UTF-8',
        language: 'zh-CN',
        metadata: {},
        tags: ['错误'],
        isPublic: false,
        downloadCount: -10, // 负下载次数
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      questions: [{
        id: 1,
        uid: "error_q_001",
        projectId: 999, // 不存在的项目ID
        datasetId: 999, // 不存在的数据集ID
        segmentId: "error_seg",
        prompt: "错误问题提示",
        content: "错误问题内容",
        generatedQuestion: "这是一个错误的问题？",
        wordCount: -10, // 负字数
        status: "generated" as const,
        type: "short_answer" as const,
        difficulty: "easy" as const,
        category: "错误分类",
        tags: ["错误"],
        points: -5, // 负分数
        timeLimit: -60, // 负时间限制
        hints: [],
        explanation: "",
        references: [],
        reviewerId: 999, // 不存在的审核者ID
        isPublic: false,
        usageCount: -1, // 负使用次数
        rating: 6, // 超出5分的评分
        ratingCount: -1, // 负评分次数
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      answers: [{
        id: 1,
        questionId: 999, // 不存在的问题ID
        prompt: "错误答案提示",
        generatedAnswer: "这是一个错误的答案",
        type: "generated" as const,
        status: "approved" as const,
        wordCount: -20, // 负字数
        language: "zh-CN",
        usageCount: -5, // 负使用次数
        rating: -1, // 负评分
        ratingCount: -2, // 负评分次数
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      users: [{
        id: 1,
        username: "", // 空用户名
        email: "invalid-email", // 无效邮箱格式
        fullName: "",
        avatar: "",
        role: "admin" as const,
        status: "active" as const,
        department: "",
        position: "",
        phone: "invalid-phone", // 无效手机号
        bio: "",
        skills: [],
        preferences: {
          theme: "light" as const,
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
            defaultView: "grid" as const,
            itemsPerPage: 20,
            showCompletedTasks: true,
            autoRefresh: true,
            refreshInterval: 30
          }
        },
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      tasks: [{
        id: 1,
        projectId: 999, // 不存在的项目ID
        datasetId: 999, // 不存在的数据集ID
        status: "completed" as const,
        totalQuestions: -10, // 负总数
        completedQuestions: 20, // 完成数大于总数
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    };
  }

  // 生成加载状态场景
  static generateLoadingScenario() {
    return {
      projects: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: "加载中...",
        description: "数据加载中，请稍候...",
        status: "active" as const,
        priority: "medium" as const,
        category: "加载中",
        tags: ["加载中"],
        ownerId: 1,
        memberIds: [1],
        progress: 0,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        estimatedHours: 0,
        actualHours: 0,
        budget: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      datasets: [],
      questions: [],
      answers: [],
      users: [],
      tasks: []
    };
  }

  // 根据场景名称获取对应数据
  static getScenarioData(scenarioName: string, options?: { itemCount?: number }) {
    switch (scenarioName) {
      case 'empty':
        return this.generateEmptyScenario();
      case 'single':
        return this.generateSingleItemScenario();
      case 'large':
        return this.generateLargeDataScenario(options?.itemCount);
      case 'error':
        return this.generateErrorScenario();
      case 'loading':
        return this.generateLoadingScenario();
      default:
        return this.generateSingleItemScenario();
    }
  }
}

// 场景管理器
export class ScenarioManager {
  private static currentScenario: string = 'default';

  // 设置当前场景
  static setScenario(scenarioName: string, options?: { itemCount?: number }) {
    if (typeof window === 'undefined') return;

    try {
      const scenarioData = DataScenarioGenerator.getScenarioData(scenarioName, options);
      
      const storeData = {
        state: {
          projects: scenarioData.projects,
          datasets: scenarioData.datasets,
          questions: scenarioData.questions,
          answers: scenarioData.answers,
          users: scenarioData.users,
          tasks: scenarioData.tasks,
          currentScenario: scenarioName
        }
      };

      localStorage.setItem('app-store', JSON.stringify(storeData));
      this.currentScenario = scenarioName;
      
      console.log(`已切换到场景: ${scenarioName}`);
      
      // 触发页面刷新以显示新数据
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('切换场景失败:', error);
    }
  }

  // 获取当前场景
  static getCurrentScenario(): string {
    if (typeof window === 'undefined') return 'default';

    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.currentScenario || 'default';
      }
    } catch (error) {
      console.error('获取当前场景失败:', error);
    }

    return this.currentScenario;
  }

  // 获取所有可用场景
  static getAvailableScenarios() {
    return [
      { name: 'empty', label: '空数据场景', description: '没有任何数据，用于测试空状态' },
      { name: 'single', label: '单条数据场景', description: '每个类型只有一条数据，用于基础功能测试' },
      { name: 'large', label: '大量数据场景', description: '包含大量数据，用于测试分页和性能' },
      { name: 'error', label: '错误数据场景', description: '包含错误和异常数据，用于测试错误处理' },
      { name: 'loading', label: '加载状态场景', description: '模拟数据加载状态' }
    ];
  }

  // 重置到默认场景
  static resetToDefault() {
    this.setScenario('single');
  }
}