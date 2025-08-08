import { 
  Project, 
  Dataset, 
  Question, 
  Answer, 
  QuestionTemplate, 
  PromptTemplate, 
  User, 
  Setting, 
  QuestionGenerationTask, 
  ProjectStats 
} from '../types';
import { 
  mockUsers, 
  mockSettings, 
  mockQuestionGenerationTasks, 
  mockProjectStats,
  mockProjects,
  mockDatasets,
  mockQuestions,
  mockAnswers,
  getPaginatedData,
  generateMockData
} from './mock-data';

// 项目服务
export const projectService = {
  getAll: (): Project[] => {
    if (typeof window === 'undefined') return mockProjects;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.projects || mockProjects;
      }
    } catch (error) {
      console.error('获取项目数据失败:', error);
    }
    return mockProjects;
  },

  getById: (id: number): Project | null => {
    const projects = projectService.getAll();
    return projects.find(p => p.id === id) || null;
  },

  create: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: { projects: [], datasets: [], questions: [], answers: [] } };
        
        if (!data.state.projects) data.state.projects = [];
        data.state.projects.push(newProject);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存项目数据失败:', error);
      }
    }

    return newProject;
  },

  update: (id: number, updates: Partial<Project>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.projects) return false;
      
      const index = data.state.projects.findIndex((p: Project) => p.id === id);
      if (index === -1) return false;
      
      data.state.projects[index] = {
        ...data.state.projects[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新项目数据失败:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state) return false;
      
      // 删除项目及相关数据
      if (data.state.projects) {
        data.state.projects = data.state.projects.filter((p: Project) => p.id !== id);
      }
      if (data.state.datasets) {
        data.state.datasets = data.state.datasets.filter((d: Dataset) => d.projectId !== id);
      }
      if (data.state.questions) {
        data.state.questions = data.state.questions.filter((q: Question) => q.projectId !== id);
      }
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('删除项目数据失败:', error);
      return false;
    }
  }
};

// 数据集服务
export const datasetService = {
  getAll: (projectId?: number): Dataset[] => {
    if (typeof window === 'undefined') return mockDatasets;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        let datasets = data.state?.datasets || mockDatasets;
        
        if (projectId) {
          datasets = datasets.filter((d: Dataset) => d.projectId === projectId);
        }
        
        return datasets;
      }
    } catch (error) {
      console.error('获取数据集数据失败:', error);
    }
    return mockDatasets;
  },

  getById: (id: number): Dataset | null => {
    const datasets = datasetService.getAll();
    return datasets.find(d => d.id === id) || null;
  },

  create: (datasetData: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>): Dataset => {
    const newDataset: Dataset = {
      ...datasetData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: { projects: [], datasets: [], questions: [], answers: [] } };
        
        if (!data.state.datasets) data.state.datasets = [];
        data.state.datasets.push(newDataset);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存数据集数据失败:', error);
      }
    }

    return newDataset;
  },

  update: (id: number, updates: Partial<Dataset>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.datasets) return false;
      
      const index = data.state.datasets.findIndex((d: Dataset) => d.id === id);
      if (index === -1) return false;
      
      data.state.datasets[index] = {
        ...data.state.datasets[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新数据集数据失败:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state) return false;
      
      // 删除数据集及相关问题
      if (data.state.datasets) {
        data.state.datasets = data.state.datasets.filter((d: Dataset) => d.id !== id);
      }
      if (data.state.questions) {
        data.state.questions = data.state.questions.filter((q: Question) => q.datasetId !== id);
      }
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('删除数据集数据失败:', error);
      return false;
    }
  }
};

// 问题服务
export const questionService = {
  getAll: (projectId?: number): Question[] => {
    if (typeof window === 'undefined') return mockQuestions;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        let questions = data.state?.questions || mockQuestions;
        
        if (projectId) {
          questions = questions.filter((q: Question) => q.projectId === projectId);
        }
        
        return questions;
      }
    } catch (error) {
      console.error('获取问题数据失败:', error);
    }
    return mockQuestions;
  },

  getById: (id: number): Question | null => {
    const questions = questionService.getAll();
    return questions.find(q => q.id === id) || null;
  },

  create: (questionData: Omit<Question, 'id' | 'createdAt'>): Question => {
    const newQuestion: Question = {
      ...questionData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: { projects: [], datasets: [], questions: [], answers: [] } };
        
        if (!data.state.questions) data.state.questions = [];
        data.state.questions.push(newQuestion);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存问题数据失败:', error);
      }
    }

    return newQuestion;
  },

  update: (id: number, updates: Partial<Question>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.questions) return false;
      
      const index = data.state.questions.findIndex((q: Question) => q.id === id);
      if (index === -1) return false;
      
      data.state.questions[index] = {
        ...data.state.questions[index],
        ...updates
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新问题数据失败:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state) return false;
      
      // 删除问题及相关答案
      if (data.state.questions) {
        data.state.questions = data.state.questions.filter((q: Question) => q.id !== id);
      }
      if (data.state.answers) {
        data.state.answers = data.state.answers.filter((a: Answer) => a.questionId !== id);
      }
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('删除问题数据失败:', error);
      return false;
    }
  }
};

// 答案服务
export const answerService = {
  getAll: (): Answer[] => {
    if (typeof window === 'undefined') return mockAnswers;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.answers || mockAnswers;
      }
    } catch (error) {
      console.error('获取答案数据失败:', error);
    }
    return mockAnswers;
  },

  getById: (id: number): Answer | null => {
    const answers = answerService.getAll();
    return answers.find(a => a.id === id) || null;
  },

  getByQuestionId: (questionId: number): Answer | null => {
    const answers = answerService.getAll();
    return answers.find(a => a.questionId === questionId) || null;
  },

  create: (answerData: Omit<Answer, 'id' | 'createdAt'>): Answer => {
    const newAnswer: Answer = {
      ...answerData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: { projects: [], datasets: [], questions: [], answers: [] } };
        
        if (!data.state.answers) data.state.answers = [];
        data.state.answers.push(newAnswer);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存答案数据失败:', error);
      }
    }

    return newAnswer;
  },

  update: (id: number, updates: Partial<Answer>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.answers) return false;
      
      const index = data.state.answers.findIndex((a: Answer) => a.id === id);
      if (index === -1) return false;
      
      data.state.answers[index] = {
        ...data.state.answers[index],
        ...updates
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新答案数据失败:', error);
      return false;
    }
  },

  delete: (id: number): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.answers) return false;
      
      data.state.answers = data.state.answers.filter((a: Answer) => a.id !== id);
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('删除答案数据失败:', error);
      return false;
    }
  }
};

// 模板服务
export const templateService = {
  getQuestionTemplates: (category?: string): QuestionTemplate[] => {
    const templates: QuestionTemplate[] = [
      {
        id: 1,
        name: '基础问题模板',
        template: '基于以下内容，请生成一个相关的问题：\n\n{content}',
        category: 'basic',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '深度分析模板',
        template: '请根据以下内容生成一个需要深度思考的问题：\n\n{content}\n\n要求问题能够引导深入分析和讨论。',
        category: 'analysis',
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return category ? templates.filter(t => t.category === category) : templates;
  },

  getPromptTemplates: (category?: string): PromptTemplate[] => {
    const templates: PromptTemplate[] = [
      {
        id: 1,
        name: '基础答案模板',
        template: '请基于以下问题提供详细的答案：\n\n{question}',
        category: 'basic',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '专业解答模板',
        template: '作为专业人士，请对以下问题提供权威、详细的解答：\n\n{question}\n\n请确保答案准确、全面且易于理解。',
        category: 'professional',
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return category ? templates.filter(t => t.category === category) : templates;
  }
};

// 用户服务
export const userService = {
  getAll: (): User[] => {
    if (typeof window === 'undefined') return mockUsers;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.users || mockUsers;
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
    return mockUsers;
  },

  getById: (id: number): User | null => {
    const users = userService.getAll();
    return users.find(u => u.id === id) || null;
  },

  getCurrentUser: (): User | null => {
    // 模拟当前登录用户，实际应用中应该从认证系统获取
    return mockUsers[0] || null;
  },

  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const newUser: User = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: {} };
        
        if (!data.state.users) data.state.users = [...mockUsers];
        data.state.users.push(newUser);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存用户数据失败:', error);
      }
    }

    return newUser;
  },

  update: (id: number, updates: Partial<User>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.users) data.state.users = [...mockUsers];
      
      const index = data.state.users.findIndex((u: User) => u.id === id);
      if (index === -1) return false;
      
      data.state.users[index] = {
        ...data.state.users[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新用户数据失败:', error);
      return false;
    }
  }
};

// 设置服务
export const settingService = {
  getAll: (): Setting[] => {
    if (typeof window === 'undefined') return mockSettings;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.settings || mockSettings;
      }
    } catch (error) {
      console.error('获取设置数据失败:', error);
    }
    return mockSettings;
  },

  getByKey: (key: string): Setting | null => {
    const settings = settingService.getAll();
    return settings.find(s => s.key === key) || null;
  },

  getValue: (key: string, defaultValue?: string): string => {
    const setting = settingService.getByKey(key);
    return setting?.value || defaultValue || '';
  },

  update: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      const data = stored ? JSON.parse(stored) : { state: {} };
      
      if (!data.state.settings) data.state.settings = [...mockSettings];
      
      const index = data.state.settings.findIndex((s: Setting) => s.key === key);
      if (index !== -1) {
        data.state.settings[index] = {
          ...data.state.settings[index],
          value,
          updatedAt: new Date().toISOString()
        };
      } else {
        // 创建新设置
        data.state.settings.push({
          id: Date.now(),
          key,
          value,
          description: `用户自定义设置: ${key}`,
          updatedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新设置数据失败:', error);
      return false;
    }
  }
};

// 问题生成任务服务
export const taskService = {
  getAll: (projectId?: number): QuestionGenerationTask[] => {
    if (typeof window === 'undefined') return mockQuestionGenerationTasks;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        let tasks = data.state?.tasks || mockQuestionGenerationTasks;
        
        if (projectId) {
          tasks = tasks.filter((t: QuestionGenerationTask) => t.projectId === projectId);
        }
        
        return tasks;
      }
    } catch (error) {
      console.error('获取任务数据失败:', error);
    }
    return mockQuestionGenerationTasks;
  },

  getById: (id: number): QuestionGenerationTask | null => {
    const tasks = taskService.getAll();
    return tasks.find(t => t.id === id) || null;
  },

  create: (taskData: Omit<QuestionGenerationTask, 'id' | 'createdAt' | 'updatedAt'>): QuestionGenerationTask => {
    const newTask: QuestionGenerationTask = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('app-store');
        const data = stored ? JSON.parse(stored) : { state: {} };
        
        if (!data.state.tasks) data.state.tasks = [...mockQuestionGenerationTasks];
        data.state.tasks.push(newTask);
        
        localStorage.setItem('app-store', JSON.stringify(data));
      } catch (error) {
        console.error('保存任务数据失败:', error);
      }
    }

    return newTask;
  },

  update: (id: number, updates: Partial<QuestionGenerationTask>): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) return false;
      
      const data = JSON.parse(stored);
      if (!data.state?.tasks) data.state.tasks = [...mockQuestionGenerationTasks];
      
      const index = data.state.tasks.findIndex((t: QuestionGenerationTask) => t.id === id);
      if (index === -1) return false;
      
      data.state.tasks[index] = {
        ...data.state.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem('app-store', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('更新任务数据失败:', error);
      return false;
    }
  }
};

// 统计服务
export const statsService = {
  getProjectStats: (): ProjectStats => {
    if (typeof window === 'undefined') return mockProjectStats;
    
    try {
      const projects = projectService.getAll();
      const datasets = datasetService.getAll();
      const questions = questionService.getAll();
      const answers = answerService.getAll();
      const users = userService.getAll();

      // 计算实时统计数据
      const stats: ProjectStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalQuestions: questions.length,
        answeredQuestions: answers.length,
        totalDatasets: datasets.length,
        totalUsers: users.length,
        recentActivity: mockProjectStats.recentActivity // 使用模拟的活动数据
      };

      return stats;
    } catch (error) {
      console.error('获取统计数据失败:', error);
      return mockProjectStats;
    }
  },

  getProjectProgress: (projectId: number): { completed: number; total: number; percentage: number } => {
    try {
      const questions = questionService.getAll(projectId);
      const answers = answerService.getAll();
      
      const projectAnswers = answers.filter(a => 
        questions.some(q => q.id === a.questionId)
      );

      const total = questions.length;
      const completed = projectAnswers.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { completed, total, percentage };
    } catch (error) {
      console.error('获取项目进度失败:', error);
      return { completed: 0, total: 0, percentage: 0 };
    }
  }
};

// 数据初始化服务
export const dataInitService = {
  // 初始化模拟数据到本地存储
  initializeMockData: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('app-store');
      if (!stored) {
        const initialData = {
          state: {
            projects: mockProjects,
            datasets: mockDatasets,
            questions: mockQuestions,
            answers: mockAnswers,
            users: mockUsers,
            settings: mockSettings,
            tasks: mockQuestionGenerationTasks
          }
        };
        
        localStorage.setItem('app-store', JSON.stringify(initialData));
        console.log('模拟数据初始化完成');
      }
    } catch (error) {
      console.error('初始化模拟数据失败:', error);
    }
  },

  // 重置所有数据
  resetAllData: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('app-store');
      dataInitService.initializeMockData();
      console.log('数据重置完成');
    } catch (error) {
      console.error('重置数据失败:', error);
    }
  },

  // 导出数据
  exportData: (): string => {
    if (typeof window === 'undefined') return '{}';
    
    try {
      const stored = localStorage.getItem('app-store');
      return stored || '{}';
    } catch (error) {
      console.error('导出数据失败:', error);
      return '{}';
    }
  },

  // 导入数据
  importData: (jsonData: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const data = JSON.parse(jsonData);
      localStorage.setItem('app-store', JSON.stringify(data));
      console.log('数据导入完成');
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
};

// 分页和搜索工具
export const dataUtils = {
  // 分页数据
  paginate: <T>(data: T[], page: number = 1, pageSize: number = 10) => {
    return getPaginatedData(data, page, pageSize);
  },

  // 搜索过滤
  search: <T extends Record<string, unknown>>(
    data: T[], 
    searchTerm: string, 
    searchFields: (keyof T)[]
  ): T[] => {
    if (!searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => 
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term);
        }
        if (Array.isArray(value)) {
          return value.some(v => 
            typeof v === 'string' && v.toLowerCase().includes(term)
          );
        }
        return false;
      })
    );
  },

  // 排序
  sort: <T extends Record<string, unknown>>(
    data: T[], 
    sortField: keyof T, 
    sortOrder: 'asc' | 'desc' = 'asc'
  ): T[] => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });
  },

  // 生成模拟数据
  generateData: generateMockData
};
