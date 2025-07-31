import { Project, Dataset, Question, Answer, QuestionTemplate, PromptTemplate } from '../types';

// 项目服务
export const projectService = {
  getAll: (): Project[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.projects || [];
      }
    } catch (error) {
      console.error('获取项目数据失败:', error);
    }
    return [];
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
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        let datasets = data.state?.datasets || [];
        
        if (projectId) {
          datasets = datasets.filter((d: Dataset) => d.projectId === projectId);
        }
        
        return datasets;
      }
    } catch (error) {
      console.error('获取数据集数据失败:', error);
    }
    return [];
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
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        let questions = data.state?.questions || [];
        
        if (projectId) {
          questions = questions.filter((q: Question) => q.projectId === projectId);
        }
        
        return questions;
      }
    } catch (error) {
      console.error('获取问题数据失败:', error);
    }
    return [];
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
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('app-store');
      if (stored) {
        const data = JSON.parse(stored);
        return data.state?.answers || [];
      }
    } catch (error) {
      console.error('获取答案数据失败:', error);
    }
    return [];
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