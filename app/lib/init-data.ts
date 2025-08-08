import { 
  mockProjects,
  mockDatasets,
  mockQuestions,
  mockAnswers,
  mockUsers,
  mockSettings,
  mockQuestionGenerationTasks
} from './mock-data';

// 强制初始化数据到 localStorage
export function forceInitializeData() {
  if (typeof window === 'undefined') return;
  
  try {
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
    console.log('强制初始化数据完成，问题数量:', mockQuestions.length);
    
    // 触发页面刷新
    window.dispatchEvent(new Event('storage'));
    
    return true;
  } catch (error) {
    console.error('强制初始化数据失败:', error);
    return false;
  }
}

// 检查数据状态
export function checkDataStatus() {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('app-store');
    if (!stored) {
      console.log('localStorage 中没有数据');
      return null;
    }
    
    const data = JSON.parse(stored);
    const status = {
      projects: data.state?.projects?.length || 0,
      datasets: data.state?.datasets?.length || 0,
      questions: data.state?.questions?.length || 0,
      answers: data.state?.answers?.length || 0,
      users: data.state?.users?.length || 0
    };
    
    console.log('当前数据状态:', status);
    return status;
  } catch (error) {
    console.error('检查数据状态失败:', error);
    return null;
  }
}

// 清空并重新初始化数据
export function resetAndInitializeData() {
  if (typeof window === 'undefined') return false;
  
  try {
    // 清空现有数据
    localStorage.removeItem('app-store');
    console.log('已清空现有数据');
    
    // 重新初始化
    return forceInitializeData();
  } catch (error) {
    console.error('重置数据失败:', error);
    return false;
  }
}