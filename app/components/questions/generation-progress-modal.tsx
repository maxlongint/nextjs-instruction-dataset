'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Progress } from '../ui/progress';

interface GenerationProgress {
  total: number;
  completed: number;
  failed: number;
  current: string;
  percentage: number;
}

interface GenerationProgressModalProps {
  isOpen: boolean;
  progress: GenerationProgress;
}

export default function GenerationProgressModal({
  isOpen,
  progress,
}: GenerationProgressModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>正在生成问题...</DialogTitle>
        </DialogHeader>
        <div>
          <Progress value={progress.percentage} />
          <div className="mt-2 text-sm text-gray-600">
            {progress.current}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            总数: {progress.total}, 已完成: {progress.completed}, 失败: {progress.failed}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}