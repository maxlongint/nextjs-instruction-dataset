import { FiInbox, FiPlus } from 'react-icons/fi';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        {icon || <FiInbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          {action.label}
        </button>
      )}
    </div>
  );
}

// 预定义的空状态组件
export function EmptyProjects({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      title="还没有项目"
      description="创建您的第一个项目来开始管理数据集和生成训练数据"
      action={{
        label: '创建项目',
        onClick: onCreateProject,
      }}
    />
  );
}

export function EmptyDatasets({ onUploadDataset }: { onUploadDataset: () => void }) {
  return (
    <EmptyState
      title="还没有数据集"
      description="上传文本文件来创建数据集，用于生成问题和答案"
      action={{
        label: '上传数据集',
        onClick: onUploadDataset,
      }}
    />
  );
}

export function EmptyQuestions({ onGenerateQuestions }: { onGenerateQuestions: () => void }) {
  return (
    <EmptyState
      title="还没有生成问题"
      description="基于数据集内容生成相关问题，用于训练数据准备"
      action={{
        label: '生成问题',
        onClick: onGenerateQuestions,
      }}
    />
  );
}

export function EmptyAnswers({ onGenerateAnswers }: { onGenerateAnswers: () => void }) {
  return (
    <EmptyState
      title="还没有生成答案"
      description="为已生成的问题创建对应的答案，完成训练数据集"
      action={{
        label: '生成答案',
        onClick: onGenerateAnswers,
      }}
    />
  );
}