import { Project, Dataset, Question, Answer, User, QuestionGenerationTask } from '../types';

// 数据一致性验证器
export class DataValidator {
  private projects: Project[] = [];
  private datasets: Dataset[] = [];
  private questions: Question[] = [];
  private answers: Answer[] = [];
  private users: User[] = [];
  private tasks: QuestionGenerationTask[] = [];

  constructor(data: {
    projects: Project[];
    datasets: Dataset[];
    questions: Question[];
    answers: Answer[];
    users: User[];
    tasks: QuestionGenerationTask[];
  }) {
    this.projects = data.projects;
    this.datasets = data.datasets;
    this.questions = data.questions;
    this.answers = data.answers;
    this.users = data.users;
    this.tasks = data.tasks;
  }

  // 验证所有数据的一致性
  validateAll(): ValidationResult {
    const results: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: {
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        warningChecks: 0
      }
    };

    // 执行各种验证
    const validations = [
      this.validateProjectReferences(),
      this.validateDatasetReferences(),
      this.validateQuestionReferences(),
      this.validateAnswerReferences(),
      this.validateUserReferences(),
      this.validateTaskReferences(),
      this.validateDataIntegrity(),
      this.validateBusinessRules()
    ];

    // 合并验证结果
    validations.forEach(validation => {
      results.errors.push(...validation.errors);
      results.warnings.push(...validation.warnings);
      results.summary.totalChecks += validation.summary.totalChecks;
      results.summary.passedChecks += validation.summary.passedChecks;
      results.summary.failedChecks += validation.summary.failedChecks;
      results.summary.warningChecks += validation.summary.warningChecks;
    });

    results.isValid = results.errors.length === 0;

    return results;
  }

  // 验证项目引用
  private validateProjectReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    // 检查项目所有者是否存在
    this.projects.forEach(project => {
      result.summary.totalChecks++;
      const owner = this.users.find(u => u.id === project.ownerId);
      if (!owner) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'Project',
          entityId: project.id,
          field: 'ownerId',
          message: `项目 "${project.name}" 的所有者 ID ${project.ownerId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    // 检查项目成员是否存在
    this.projects.forEach(project => {
      project.memberIds.forEach(memberId => {
        result.summary.totalChecks++;
        const member = this.users.find(u => u.id === memberId);
        if (!member) {
          result.errors.push({
            type: 'REFERENCE_ERROR',
            entity: 'Project',
            entityId: project.id,
            field: 'memberIds',
            message: `项目 "${project.name}" 的成员 ID ${memberId} 不存在`
          });
          result.summary.failedChecks++;
        } else {
          result.summary.passedChecks++;
        }
      });
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证数据集引用
  private validateDatasetReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    // 检查数据集所属项目是否存在
    this.datasets.forEach(dataset => {
      result.summary.totalChecks++;
      const project = this.projects.find(p => p.id === dataset.projectId);
      if (!project) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'Dataset',
          entityId: dataset.id,
          field: 'projectId',
          message: `数据集 "${dataset.name}" 所属项目 ID ${dataset.projectId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证问题引用
  private validateQuestionReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    this.questions.forEach(question => {
      // 检查问题所属项目是否存在
      result.summary.totalChecks++;
      const project = this.projects.find(p => p.id === question.projectId);
      if (!project) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'Question',
          entityId: question.id,
          field: 'projectId',
          message: `问题 "${question.generatedQuestion}" 所属项目 ID ${question.projectId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      // 检查问题所属数据集是否存在
      result.summary.totalChecks++;
      const dataset = this.datasets.find(d => d.id === question.datasetId);
      if (!dataset) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'Question',
          entityId: question.id,
          field: 'datasetId',
          message: `问题 "${question.generatedQuestion}" 所属数据集 ID ${question.datasetId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      // 检查审核者是否存在（如果有）
      if (question.reviewerId) {
        result.summary.totalChecks++;
        const reviewer = this.users.find(u => u.id === question.reviewerId);
        if (!reviewer) {
          result.errors.push({
            type: 'REFERENCE_ERROR',
            entity: 'Question',
            entityId: question.id,
            field: 'reviewerId',
            message: `问题 "${question.generatedQuestion}" 的审核者 ID ${question.reviewerId} 不存在`
          });
          result.summary.failedChecks++;
        } else {
          result.summary.passedChecks++;
        }
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证答案引用
  private validateAnswerReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    this.answers.forEach(answer => {
      // 检查答案对应的问题是否存在
      result.summary.totalChecks++;
      const question = this.questions.find(q => q.id === answer.questionId);
      if (!question) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'Answer',
          entityId: answer.id,
          field: 'questionId',
          message: `答案 ID ${answer.id} 对应的问题 ID ${answer.questionId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      // 检查审核者是否存在（如果有）
      if (answer.reviewerId) {
        result.summary.totalChecks++;
        const reviewer = this.users.find(u => u.id === answer.reviewerId);
        if (!reviewer) {
          result.errors.push({
            type: 'REFERENCE_ERROR',
            entity: 'Answer',
            entityId: answer.id,
            field: 'reviewerId',
            message: `答案 ID ${answer.id} 的审核者 ID ${answer.reviewerId} 不存在`
          });
          result.summary.failedChecks++;
        } else {
          result.summary.passedChecks++;
        }
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证用户引用
  private validateUserReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    // 检查用户名唯一性
    const usernames = new Set<string>();
    this.users.forEach(user => {
      result.summary.totalChecks++;
      if (usernames.has(user.username)) {
        result.errors.push({
          type: 'UNIQUENESS_ERROR',
          entity: 'User',
          entityId: user.id,
          field: 'username',
          message: `用户名 "${user.username}" 重复`
        });
        result.summary.failedChecks++;
      } else {
        usernames.add(user.username);
        result.summary.passedChecks++;
      }
    });

    // 检查邮箱唯一性
    const emails = new Set<string>();
    this.users.forEach(user => {
      result.summary.totalChecks++;
      if (emails.has(user.email)) {
        result.errors.push({
          type: 'UNIQUENESS_ERROR',
          entity: 'User',
          entityId: user.id,
          field: 'email',
          message: `邮箱 "${user.email}" 重复`
        });
        result.summary.failedChecks++;
      } else {
        emails.add(user.email);
        result.summary.passedChecks++;
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证任务引用
  private validateTaskReferences(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    this.tasks.forEach(task => {
      // 检查任务所属项目是否存在
      result.summary.totalChecks++;
      const project = this.projects.find(p => p.id === task.projectId);
      if (!project) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'QuestionGenerationTask',
          entityId: task.id,
          field: 'projectId',
          message: `任务 ID ${task.id} 所属项目 ID ${task.projectId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      // 检查任务所属数据集是否存在
      result.summary.totalChecks++;
      const dataset = this.datasets.find(d => d.id === task.datasetId);
      if (!dataset) {
        result.errors.push({
          type: 'REFERENCE_ERROR',
          entity: 'QuestionGenerationTask',
          entityId: task.id,
          field: 'datasetId',
          message: `任务 ID ${task.id} 所属数据集 ID ${task.datasetId} 不存在`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证数据完整性
  private validateDataIntegrity(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    // 检查必填字段
    this.projects.forEach(project => {
      const requiredFields = ['name', 'description', 'status', 'priority', 'category'];
      requiredFields.forEach(field => {
        result.summary.totalChecks++;
        if (!project[field as keyof Project] || project[field as keyof Project] === '') {
          result.errors.push({
            type: 'REQUIRED_FIELD_ERROR',
            entity: 'Project',
            entityId: project.id,
            field,
            message: `项目 ID ${project.id} 缺少必填字段: ${field}`
          });
          result.summary.failedChecks++;
        } else {
          result.summary.passedChecks++;
        }
      });
    });

    // 检查数据格式
    this.questions.forEach(question => {
      result.summary.totalChecks++;
      if (question.wordCount < 0) {
        result.errors.push({
          type: 'DATA_FORMAT_ERROR',
          entity: 'Question',
          entityId: question.id,
          field: 'wordCount',
          message: `问题 ID ${question.id} 的字数不能为负数`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      result.summary.totalChecks++;
      if (question.rating && (question.rating < 0 || question.rating > 5)) {
        result.errors.push({
          type: 'DATA_FORMAT_ERROR',
          entity: 'Question',
          entityId: question.id,
          field: 'rating',
          message: `问题 ID ${question.id} 的评分必须在0-5之间`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 验证业务规则
  private validateBusinessRules(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalChecks: 0, passedChecks: 0, failedChecks: 0, warningChecks: 0 }
    };

    // 检查项目进度是否合理
    this.projects.forEach(project => {
      result.summary.totalChecks++;
      if (project.progress < 0 || project.progress > 100) {
        result.errors.push({
          type: 'BUSINESS_RULE_ERROR',
          entity: 'Project',
          entityId: project.id,
          field: 'progress',
          message: `项目 "${project.name}" 的进度必须在0-100之间`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }

      // 检查已完成项目的进度是否为100%
      result.summary.totalChecks++;
      if (project.status === 'completed' && project.progress !== 100) {
        result.warnings.push({
          type: 'BUSINESS_RULE_WARNING',
          entity: 'Project',
          entityId: project.id,
          field: 'progress',
          message: `已完成项目 "${project.name}" 的进度应该为100%`
        });
        result.summary.warningChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    // 检查任务完成数量是否超过总数
    this.tasks.forEach(task => {
      result.summary.totalChecks++;
      if (task.completedQuestions > task.totalQuestions) {
        result.errors.push({
          type: 'BUSINESS_RULE_ERROR',
          entity: 'QuestionGenerationTask',
          entityId: task.id,
          field: 'completedQuestions',
          message: `任务 ID ${task.id} 的完成数量不能超过总数量`
        });
        result.summary.failedChecks++;
      } else {
        result.summary.passedChecks++;
      }
    });

    result.isValid = result.errors.length === 0;
    return result;
  }

  // 生成验证报告
  generateReport(): string {
    const validation = this.validateAll();
    
    let report = '# 数据一致性验证报告\n\n';
    report += `## 验证概要\n`;
    report += `- 总检查项: ${validation.summary.totalChecks}\n`;
    report += `- 通过检查: ${validation.summary.passedChecks}\n`;
    report += `- 失败检查: ${validation.summary.failedChecks}\n`;
    report += `- 警告检查: ${validation.summary.warningChecks}\n`;
    report += `- 整体状态: ${validation.isValid ? '✅ 通过' : '❌ 失败'}\n\n`;

    if (validation.errors.length > 0) {
      report += `## 错误详情 (${validation.errors.length})\n\n`;
      validation.errors.forEach((error, index) => {
        report += `### ${index + 1}. ${error.type}\n`;
        report += `- **实体**: ${error.entity} (ID: ${error.entityId})\n`;
        report += `- **字段**: ${error.field}\n`;
        report += `- **消息**: ${error.message}\n\n`;
      });
    }

    if (validation.warnings.length > 0) {
      report += `## 警告详情 (${validation.warnings.length})\n\n`;
      validation.warnings.forEach((warning, index) => {
        report += `### ${index + 1}. ${warning.type}\n`;
        report += `- **实体**: ${warning.entity} (ID: ${warning.entityId})\n`;
        report += `- **字段**: ${warning.field}\n`;
        report += `- **消息**: ${warning.message}\n\n`;
      });
    }

    if (validation.isValid && validation.warnings.length === 0) {
      report += `## 🎉 恭喜！\n\n所有数据验证都已通过，数据关联关系完整且一致。\n`;
    }

    return report;
  }
}

// 验证结果接口
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: number;
    warningChecks: number;
  };
}

// 验证错误接口
export interface ValidationError {
  type: string;
  entity: string;
  entityId: number;
  field: string;
  message: string;
}

// 数据关联关系工具
export class DataRelationshipManager {
  // 获取项目的所有相关数据
  static getProjectRelatedData(projectId: number, allData: {
    projects: Project[];
    datasets: Dataset[];
    questions: Question[];
    answers: Answer[];
    users: User[];
    tasks: QuestionGenerationTask[];
  }) {
    const project = allData.projects.find(p => p.id === projectId);
    if (!project) return null;

    const datasets = allData.datasets.filter(d => d.projectId === projectId);
    const questions = allData.questions.filter(q => q.projectId === projectId);
    const questionIds = questions.map(q => q.id);
    const answers = allData.answers.filter(a => questionIds.includes(a.questionId));
    const tasks = allData.tasks.filter(t => t.projectId === projectId);
    
    const memberIds = [project.ownerId, ...project.memberIds];
    const members = allData.users.filter(u => memberIds.includes(u.id));

    return {
      project,
      datasets,
      questions,
      answers,
      tasks,
      members,
      statistics: {
        datasetCount: datasets.length,
        questionCount: questions.length,
        answerCount: answers.length,
        taskCount: tasks.length,
        memberCount: members.length,
        completionRate: questions.length > 0 ? Math.round((answers.length / questions.length) * 100) : 0
      }
    };
  }

  // 获取用户的所有相关数据
  static getUserRelatedData(userId: number, allData: {
    projects: Project[];
    datasets: Dataset[];
    questions: Question[];
    answers: Answer[];
    users: User[];
    tasks: QuestionGenerationTask[];
  }) {
    const user = allData.users.find(u => u.id === userId);
    if (!user) return null;

    const ownedProjects = allData.projects.filter(p => p.ownerId === userId);
    const memberProjects = allData.projects.filter(p => p.memberIds.includes(userId));
    const allProjects = [...ownedProjects, ...memberProjects];
    
    const reviewedQuestions = allData.questions.filter(q => q.reviewerId === userId);
    const reviewedAnswers = allData.answers.filter(a => a.reviewerId === userId);

    return {
      user,
      ownedProjects,
      memberProjects,
      allProjects,
      reviewedQuestions,
      reviewedAnswers,
      statistics: {
        ownedProjectCount: ownedProjects.length,
        memberProjectCount: memberProjects.length,
        totalProjectCount: allProjects.length,
        reviewedQuestionCount: reviewedQuestions.length,
        reviewedAnswerCount: reviewedAnswers.length
      }
    };
  }

  // 检查数据删除的影响
  static checkDeletionImpact(entityType: string, entityId: number, allData: {
    projects: Project[];
    datasets: Dataset[];
    questions: Question[];
    answers: Answer[];
    users: User[];
    tasks: QuestionGenerationTask[];
  }) {
    const impact = {
      canDelete: true,
      affectedEntities: [] as string[],
      warnings: [] as string[]
    };

    switch (entityType) {
      case 'Project':
        const relatedDatasets = allData.datasets.filter(d => d.projectId === entityId);
        const relatedQuestions = allData.questions.filter(q => q.projectId === entityId);
        const relatedTasks = allData.tasks.filter(t => t.projectId === entityId);
        
        if (relatedDatasets.length > 0) {
          impact.affectedEntities.push(`${relatedDatasets.length} 个数据集`);
        }
        if (relatedQuestions.length > 0) {
          impact.affectedEntities.push(`${relatedQuestions.length} 个问题`);
        }
        if (relatedTasks.length > 0) {
          impact.affectedEntities.push(`${relatedTasks.length} 个任务`);
        }
        break;

      case 'Dataset':
        const datasetQuestions = allData.questions.filter(q => q.datasetId === entityId);
        const datasetTasks = allData.tasks.filter(t => t.datasetId === entityId);
        
        if (datasetQuestions.length > 0) {
          impact.affectedEntities.push(`${datasetQuestions.length} 个问题`);
        }
        if (datasetTasks.length > 0) {
          impact.affectedEntities.push(`${datasetTasks.length} 个任务`);
        }
        break;

      case 'Question':
        const questionAnswers = allData.answers.filter(a => a.questionId === entityId);
        if (questionAnswers.length > 0) {
          impact.affectedEntities.push(`${questionAnswers.length} 个答案`);
        }
        break;

      case 'User':
        const userProjects = allData.projects.filter(p => p.ownerId === entityId || p.memberIds.includes(entityId));
        if (userProjects.length > 0) {
          impact.canDelete = false;
          impact.warnings.push(`用户是 ${userProjects.length} 个项目的所有者或成员，无法删除`);
        }
        break;
    }

    return impact;
  }
}