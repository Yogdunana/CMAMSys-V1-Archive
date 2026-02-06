'use client';

import React, { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';
import {
  Plus,
  RefreshCw,
  Settings,
  Zap,
  Globe,
  Shield,
  Trash2,
  Edit,
} from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  type: 'ALIYUN' | 'VOLCENGINE' | 'DEEPSEEK';
  apiKey: string;
  endpoint?: string;
  status: 'ACTIVE' | 'INACTIVE';
  priority: number;
  capabilities: string[];
  supportedModels: string[];
  createdAt: string;
  updatedAt: string;
}

const PROVIDER_TYPES = {
  ALIYUN: {
    name: '阿里云百炼',
    icon: <Zap className="h-4 w-4" />,
    color: 'bg-orange-500',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  VOLCENGINE: {
    name: '火山引擎（豆包）',
    icon: <Globe className="h-4 w-4" />,
    color: 'bg-blue-500',
    models: ['doubao-pro-256k', 'doubao-pro-32k', 'doubao-pro-4k', 'doubao-lite-32k'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
  },
  DEEPSEEK: {
    name: 'DeepSeek',
    icon: <Shield className="h-4 w-4" />,
    color: 'bg-purple-500',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-v3'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'math'],
  },
};

export default function AIProvidersPage() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'VOLCENGINE' as AIProvider['type'],
    apiKey: '',
    endpoint: '',
    status: 'ACTIVE' as AIProvider['status'],
    priority: 10,
    capabilities: [] as string[],
    supportedModels: [] as string[],
  });

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleTypeChange = (type: AIProvider['type']) => {
    const config = PROVIDER_TYPES[type];
    setFormData({
      ...formData,
      type,
      capabilities: config.capabilities,
      supportedModels: config.models,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingProvider
        ? `/api/ai-providers/${editingProvider.id}`
        : '/api/ai-providers';
      const method = editingProvider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProviders();
        setDialogOpen(false);
        setEditingProvider(null);
        setFormData({
          name: '',
          type: 'VOLCENGINE',
          apiKey: '',
          endpoint: '',
          status: 'ACTIVE',
          priority: 10,
          capabilities: [],
          supportedModels: [],
        });
      }
    } catch (error) {
      console.error('Failed to save provider:', error);
    }
  };

  const handleEdit = (provider: AIProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      type: provider.type,
      apiKey: '',
      endpoint: provider.endpoint || '',
      status: provider.status,
      priority: provider.priority,
      capabilities: provider.capabilities,
      supportedModels: provider.supportedModels,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此 AI Provider 吗？')) return;

    try {
      const response = await fetch(`/api/ai-providers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProviders();
      }
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  const toggleCapability = (cap: string) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.includes(cap)
        ? formData.capabilities.filter((c) => c !== cap)
        : [...formData.capabilities, cap],
    });
  };

  const toggleModel = (model: string) => {
    setFormData({
      ...formData,
      supportedModels: formData.supportedModels.includes(model)
        ? formData.supportedModels.filter((m) => m !== model)
        : [...formData.supportedModels, model],
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Provider 管理</h1>
            <p className="text-muted-foreground mt-2">
              管理您的 AI 服务提供商，配置 API Key 和模型
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchProviders} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProvider(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加 Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProvider ? '编辑 Provider' : '添加 AI Provider'}
                  </DialogTitle>
                  <DialogDescription>
                    配置 AI 服务提供商的连接信息和能力
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">名称</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="例如：阿里云百炼主账号"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Provider 类型</Label>
                    <Select
                      value={formData.type}
                      onValueChange={handleTypeChange}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PROVIDER_TYPES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              {config.icon}
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                      placeholder="输入 API Key"
                      required={!editingProvider}
                    />
                    {editingProvider && (
                      <p className="text-xs text-muted-foreground">
                        留空则保持原 API Key 不变
                      </p>
                    )}
                  </div>

                  {formData.type === 'VOLCENGINE' && (
                    <div className="space-y-2">
                      <Label htmlFor="endpoint">推理接入点（可选）</Label>
                      <Input
                        id="endpoint"
                        value={formData.endpoint}
                        onChange={(e) =>
                          setFormData({ ...formData, endpoint: e.target.value })
                        }
                        placeholder="例如：ep-20250101000000-xxx"
                      />
                      <p className="text-xs text-muted-foreground">
                        火山引擎专属，可用于将通用模型映射到特定的推理接入点
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">优先级</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        数字越大优先级越高
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">状态</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            status: value as AIProvider['status'],
                          })
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">启用</SelectItem>
                          <SelectItem value="INACTIVE">禁用</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.type && PROVIDER_TYPES[formData.type] && (
                    <>
                      <div className="space-y-2">
                        <Label>能力</Label>
                        <div className="flex flex-wrap gap-2">
                          {PROVIDER_TYPES[formData.type].capabilities.map((cap) => (
                            <Badge
                              key={cap}
                              variant={
                                formData.capabilities.includes(cap)
                                  ? 'default'
                                  : 'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => toggleCapability(cap)}
                            >
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>支持的模型</Label>
                        <div className="flex flex-wrap gap-2">
                          {PROVIDER_TYPES[formData.type].models.map((model) => (
                            <Badge
                              key={model}
                              variant={
                                formData.supportedModels.includes(model)
                                  ? 'default'
                                  : 'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => toggleModel(model)}
                            >
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      取消
                    </Button>
                    <Button type="submit">
                      {editingProvider ? '保存修改' : '添加'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>已配置的 Providers</CardTitle>
            <CardDescription>
              系统会根据优先级自动选择最合适的 Provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">尚未配置 AI Provider</p>
                <p className="text-sm mb-4">添加您的第一个 AI 服务提供商</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加 Provider
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>模型</TableHead>
                      <TableHead>优先级</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => {
                      const config = PROVIDER_TYPES[provider.type];
                      return (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {config?.icon}
                              {provider.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge>{config?.name || provider.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {provider.supportedModels.slice(0, 2).map((model) => (
                                <Badge key={model} variant="outline" className="text-xs">
                                  {model}
                                </Badge>
                              ))}
                              {provider.supportedModels.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{provider.supportedModels.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{provider.priority}</TableCell>
                          <TableCell>
                            <Badge
                              variant={provider.status === 'ACTIVE' ? 'default' : 'secondary'}
                            >
                              {provider.status === 'ACTIVE' ? '启用' : '禁用'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(provider)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(provider.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
