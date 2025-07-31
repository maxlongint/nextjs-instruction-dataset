import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Dataset, Question, Answer } from '../types';
import { mockProjects, mockDatasets, mockQuestions, mockAnswers } from './mock-data';

// 项目状态管理
interface ProjectStore {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: number, updates: Partial<Project>) => boolean;
  deleteProject: (id: number) => boolean;
  getProject: (id: number) => Project | undefined;
}

export const useProjects = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: mockProjects,
      
      addProject: (data) => {
        const newProject: Project = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          projects: [...state.projects, newProject]
        }));
        
        return newProject;
      },
      
      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          )
        }));
        return true;
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter(project => project.id !== id)
        }));
        return true;
      },
      
      getProject: (id) => {
        return get().projects.find(project => project.id === id);
      }
    }),
    {
      name: 'projects-storage'
    }
  )
);

// 数据集状态管理
interface DatasetStore {
  datasets: Dataset[];
  addDataset: (dataset: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>) => Dataset;
  updateDataset: (id: number, updates: Partial<Dataset>) => boolean;
  deleteDataset: (id: number) => boolean;
  getDataset: (id: number) => Dataset | undefined;
  getDatasetsByProject: (projectId: number) => Dataset[];
}

export const useDatasets = create<DatasetStore>()(
  persist(
    (set, get) => ({
      datasets: mockDatasets,
      
      addDataset: (data) => {
        const newDataset: Dataset = {
          id: Date.now(),
          projectId: data.projectId,
          name: data.name,
          fileName: data.fileName,
          filePath: data.filePath,
          fileSize: data.fileSize,
          description: data.description || '',
          type: data.type || 'text',
          size: data.size || 0,
          segmentCount: data.segmentCount || 0,
          content: data.content || '',
          segmentDelimiter: data.segmentDelimiter || '\n\n',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          datasets: [...state.datasets, newDataset]
        }));
        
        return newDataset;
      },
      
      updateDataset: (id, updates) => {
        set((state) => ({
          datasets: state.datasets.map(dataset =>
            dataset.id === id
              ? { ...dataset, ...updates, updatedAt: new Date().toISOString() }
              : dataset
          )
        }));
        return true;
      },
      
      deleteDataset: (id) => {
        set((state) => ({
          datasets: state.datasets.filter(dataset => dataset.id !== id)
        }));
        return true;
      },
      
      getDataset: (id) => {
        return get().datasets.find(dataset => dataset.id === id);
      },
      
      getDatasetsByProject: (projectId) => {
        return get().datasets.filter(dataset => dataset.projectId === projectId);
      }
    }),
    {
      name: 'datasets-storage'
    }
  )
);

// 问题状态管理
interface QuestionStore {
  questions: Question[];
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Question;
  updateQuestion: (id: number, updates: Partial<Question>) => boolean;
  deleteQuestion: (id: number) => boolean;
  getQuestion: (id: number) => Question | undefined;
  getQuestionsByProject: (projectId: number) => Question[];
  getQuestionsByDataset: (datasetId: number) => Question[];
}

export const useQuestions = create<QuestionStore>()(
  persist(
    (set, get) => ({
      questions: mockQuestions,
      
      addQuestion: (data) => {
        const newQuestion: Question = {
          id: Date.now(),
          projectId: data.projectId,
          datasetId: data.datasetId,
          segmentId: data.segmentId,
          content: data.content,
          type: data.type || 'generated',
          difficulty: data.difficulty || 'medium',
          category: data.category || 'general',
          tags: data.tags || [],
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          questions: [...state.questions, newQuestion]
        }));
        
        return newQuestion;
      },
      
      updateQuestion: (id, updates) => {
        set((state) => ({
          questions: state.questions.map(question =>
            question.id === id ? { ...question, ...updates } : question
          )
        }));
        return true;
      },
      
      deleteQuestion: (id) => {
        set((state) => ({
          questions: state.questions.filter(question => question.id !== id)
        }));
        return true;
      },
      
      getQuestion: (id) => {
        return get().questions.find(question => question.id === id);
      },
      
      getQuestionsByProject: (projectId) => {
        return get().questions.filter(question => question.projectId === projectId);
      },
      
      getQuestionsByDataset: (datasetId) => {
        return get().questions.filter(question => question.datasetId === datasetId);
      }
    }),
    {
      name: 'questions-storage'
    }
  )
);

// 答案状态管理
interface AnswerStore {
  answers: Answer[];
  addAnswer: (answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt'>) => Answer;
  updateAnswer: (id: number, updates: Partial<Answer>) => boolean;
  deleteAnswer: (id: number) => boolean;
  getAnswer: (id: number) => Answer | undefined;
  getAnswersByQuestion: (questionId: number) => Answer[];
}

export const useAnswers = create<AnswerStore>()(
  persist(
    (set, get) => ({
      answers: mockAnswers,
      
      addAnswer: (data) => {
        const newAnswer: Answer = {
          id: Date.now(),
          questionId: data.questionId,
          segmentId: data.segmentId,
          content: data.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          answers: [...state.answers, newAnswer]
        }));
        
        return newAnswer;
      },
      
      updateAnswer: (id, updates) => {
        set((state) => ({
          answers: state.answers.map(answer =>
            answer.id === id
              ? { ...answer, ...updates, updatedAt: new Date().toISOString() }
              : answer
          )
        }));
        return true;
      },
      
      deleteAnswer: (id) => {
        set((state) => ({
          answers: state.answers.filter(answer => answer.id !== id)
        }));
        return true;
      },
      
      getAnswer: (id) => {
        return get().answers.find(answer => answer.id === id);
      },
      
      getAnswersByQuestion: (questionId) => {
        return get().answers.filter(answer => answer.questionId === questionId);
      }
    }),
    {
      name: 'answers-storage'
    }
  )
);