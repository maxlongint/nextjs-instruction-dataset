'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { FiSettings, FiSave, FiLoader, FiCheckCircle } from 'react-icons/fi';

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
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    setTempPrompt(prompt);
  }, [prompt]);

  // 加载当前保存的提示词设置
  const loadCurrentSettings = async () => {
    try {
      setLoadingCurrent(true);
      const response = await fetch('/api/prompt-templates?type=current&category=question');
      const result = await response.json();
      
      if (result.success && result.data.template) {
        setTempPrompt(result.data.template);
      }
    } catch (error) {
      console.error('加载提示词设置失败:', error);
    } finally {
      setLoadingCurrent(false);
    }
  };

  // 保存提示词设置
  const handleSave = async () => {
    if (!tempPrompt.trim()) {
      alert('提示词不能为空');
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/prompt-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: tempPrompt,
          category: 'question',
          saveAsTemplate,
          templateName: saveAsTemplate ? templateName : undefined,
          templateDescription: saveAsTemplate ? templateDescription : undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // 更新父组件的prompt状态
        onPromptChange(tempPrompt);
        
        // 重置模板保存相关状态
        setSaveAsTemplate(false);
        setTemplateName('');
        setTemplateDescription('');
        
        setIsOpen(false);
        setShowSuccessDialog(true);
      } else {
        alert('保存失败: ' + result.error);
      }
    } catch (error) {
      console.error('保存提示词设置失败:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempPrompt(prompt);
    setSaveAsTemplate(false);
    setTemplateName('');
    setTemplateDescription('');
    setIsOpen(false);
  };

  // 打开弹窗时加载当前设置
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadCurrentSettings();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FiSettings className="mr-2 h-4 w-4" />
            提示词设置
          </button>
        </DialogTrigger>
        <DialogContent
          className="max-h-[85vh] overflow-hidden flex flex-col"
          style={{ width: '45vw', maxWidth: 'none' }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FiSettings className="mr-2 h-5 w-5" />
              提示词设置
              {loadingCurrent && (
                <FiLoader className="ml-2 h-4 w-4 animate-spin text-blue-500" />
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 flex-1 min-h-0">
            {/* 提示词输入区域 */}
            <div className="flex flex-col space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                自定义提示词
              </Label>
              <textarea
                value={tempPrompt}
                onChange={(e) => setTempPrompt(e.target.value)}
                disabled={loadingCurrent}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="请输入您的自定义提示词..."
              />
              <div className="text-xs text-gray-500">
                字符数: {tempPrompt.length}
              </div>
            </div>

            {/* 保存为模板选项 */}
            <div className="space-y-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveAsTemplate"
                  checked={saveAsTemplate}
                  onCheckedChange={(checked) => setSaveAsTemplate(Boolean(checked))}
                />
                <Label htmlFor="saveAsTemplate" className="text-sm font-medium">
                  保存为模板（可复用）
                </Label>
              </div>
              
              {saveAsTemplate && (
                <div className="space-y-3 ml-6">
                  <div>
                    <Label className="text-sm text-gray-600">模板名称</Label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="请输入模板名称"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">模板描述（可选）</Label>
                    <input
                      type="text"
                      value={templateDescription}
                      onChange={(e) => setTemplateDescription(e.target.value)}
                      placeholder="请输入模板描述"
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 说明区域 */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>使用说明：</strong>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• 使用 <code className="bg-blue-100 px-1 rounded">{'{content}'}</code> 作为内容占位符，系统会自动替换为实际内容</li>
                  <li>• 提示词将用于指导AI生成相关问题</li>
                  <li>• 建议包含问题的类型、难度、格式等要求</li>
                  <li>• 设置会自动保存到数据库，下次打开时会加载上次的设置</li>
                  <li>• 勾选"保存为模板"可以创建可复用的提示词模板</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !tempPrompt.trim() || (saveAsTemplate && !templateName.trim())}
              className="min-w-[100px]"
            >
              {saving ? (
                <>
                  <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <FiSave className="mr-2 h-4 w-4" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* 成功提示对话框 */}
    <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <FiCheckCircle className="mr-2 h-5 w-5 text-green-600" />
              保存成功
            </AlertDialogTitle>
            <AlertDialogDescription>
              提示词设置已成功保存到数据库，下次打开时会自动加载您的设置。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}