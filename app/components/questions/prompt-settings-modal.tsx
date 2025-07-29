'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { FiSettings } from 'react-icons/fi';

interface PromptSettingsModalProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

export default function PromptSettingsModal({ 
  prompt, 
  onPromptChange
}: PromptSettingsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(prompt);

  useEffect(() => {
    setTempPrompt(prompt);
  }, [prompt]);

  const handleSave = () => {
    onPromptChange(tempPrompt);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempPrompt(prompt);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FiSettings className="mr-2 h-4 w-4" />
          提示词设置
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>提示词设置</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 min-h-0">
          {/* 提示词输入区域 */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              自定义提示词
            </label>
            <textarea
              value={tempPrompt}
              onChange={(e) => setTempPrompt(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
              placeholder="请输入您的自定义提示词..."
            />
            <div className="text-xs text-gray-500">
              字符数: {tempPrompt.length}
            </div>
          </div>

          {/* 说明区域 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>使用说明：</strong>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• 使用 <code className="bg-blue-100 px-1 rounded">{'{content}'}</code> 作为内容占位符，系统会自动替换为实际内容</li>
                <li>• 提示词将用于指导AI生成相关问题</li>
                <li>• 建议包含问题的类型、难度、格式等要求</li>
                <li>• 留空将使用系统默认提示词</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            保存设置
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}