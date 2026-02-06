/**
 * Solution Dialog Component
 * 用于添加/编辑解法的对话框
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  problemId: string;
  solution?: any;
  onSuccess: () => void;
}

export function SolutionDialog({
  open,
  onOpenChange,
  problemId,
  solution,
  onSuccess,
}: SolutionDialogProps) {
  const [formData, setFormData] = useState({
    type: solution?.type || 'SYSTEM',
    title: solution?.title || '',
    description: solution?.description || '',
    content: solution?.content || '',
    author: solution?.author || '',
    awardLevel: solution?.awardLevel || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');
      const url = solution ? `/api/solutions/${solution.id}` : '/api/solutions';
      const method = solution ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          problemId,
          ...formData,
          ...(formData.type === 'SYSTEM' && !formData.author && { author: 'CMAMSys' }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onOpenChange(false);
        // 重置表单
        if (!solution) {
          setFormData({
            type: 'SYSTEM',
            title: '',
            description: '',
            content: '',
            author: '',
            awardLevel: '',
          });
        }
      } else {
        console.error('Failed to save solution:', data.error);
      }
    } catch (error) {
      console.error('Failed to save solution:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {solution ? '编辑解法' : '添加解法'}
          </DialogTitle>
          <DialogDescription>
            {solution
              ? '修改解法信息和内容'
              : '为该题目添加新的解法'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="content">解法内容</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">解法类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SYSTEM">系统解法</SelectItem>
                    <SelectItem value="AWARD">获奖解法</SelectItem>
                    <SelectItem value="AI">AI 解法</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">作者/团队</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder="作者或团队名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">解法标题 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="输入解法标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">简短描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="简要描述解法的主要思路和方法"
                rows={3}
              />
            </div>

            {formData.type === 'AWARD' && (
              <div className="space-y-2">
                <Label htmlFor="awardLevel">获奖等级</Label>
                <Select
                  value={formData.awardLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, awardLevel: value })
                  }
                >
                  <SelectTrigger id="awardLevel">
                    <SelectValue placeholder="选择获奖等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Outstanding Winner">特等奖</SelectItem>
                    <SelectItem value="Finalist">一等奖</SelectItem>
                    <SelectItem value="Meritorious Winner">二等奖</SelectItem>
                    <SelectItem value="Honorable Mention">三等奖</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="content">解法详情</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="输入解法的详细内容，支持 Markdown 格式..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                支持 Markdown 格式，可以使用 # ## ### 标题、- 列表、**加粗**
                等语法
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim()}
          >
            {isSubmitting ? '保存中...' : solution ? '更新' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
