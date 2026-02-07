'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
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
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  RefreshCw,
  Settings,
  Zap,
  Globe,
  Shield,
  Trash2,
  Edit,
  Star,
  StarOff,
  TrendingUp,
  Activity,
  Clock,
} from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  type: 'DEEPSEEK' | 'VOLCENGINE' | 'ALIYUN' | 'OPENAI' | 'ANTHROPIC' | 'ZHIPU' | 'BAIDU' | 'TENCENT' | 'HUNGYUAN' | 'MINIMAX' | 'GOOGLE_GEMINI' | 'AZURE_OPENAI' | 'ALIYUN_QWEN' | 'BAIDU_WENXIN' | 'CUSTOM';
  apiKey: string;
  endpoint?: string;
  status: 'ACTIVE' | 'INACTIVE';
  priority: number;
  isDefault: boolean;
  capabilities: string[];
  supportedModels: string[];
  totalRequests: number;
  totalTokensUsed: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Usage statistics
  usage?: {
    totalRequests: number;
    totalTokens: number;
    successRate: number;
    avgLatency: number;
    requestsLast7Days: number;
    requestsLast30Days: number;
  };
}

const PROVIDER_TYPES: Record<string, { name: string; icon: any; color: string; models: string[]; capabilities: string[] }> = {
  ALIYUN: {
    name: '阿里云百炼',
    icon: Zap,
    color: 'bg-orange-500',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  ALIYUN_QWEN: {
    name: '阿里云千问',
    icon: Zap,
    color: 'bg-orange-500',
    models: ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen-long'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  VOLCENGINE: {
    name: '火山引擎（豆包）',
    icon: Globe,
    color: 'bg-blue-500',
    models: ['doubao-pro-256k', 'doubao-pro-32k', 'doubao-pro-4k', 'doubao-lite-32k'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
  },
  DEEPSEEK: {
    name: 'DeepSeek',
    icon: Shield,
    color: 'bg-purple-500',
    models: ['deepseek-chat', 'deepseek-coder', 'deepseek-v3'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'math'],
  },
  OPENAI: {
    name: 'OpenAI',
    icon: Settings,
    color: 'bg-green-500',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
  },
  ANTHROPIC: {
    name: 'Anthropic Claude',
    icon: Settings,
    color: 'bg-yellow-500',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'analysis'],
  },
  ZHIPU: {
    name: '智谱 AI',
    icon: Shield,
    color: 'bg-pink-500',
    models: ['glm-4', 'glm-3-turbo'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  BAIDU: {
    name: '百度文心',
    icon: Settings,
    color: 'bg-red-500',
    models: ['ernie-bot-4', 'ernie-bot-turbo'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  BAIDU_WENXIN: {
    name: '百度文心一言',
    icon: Settings,
    color: 'bg-red-500',
    models: ['ernie-bot-4', 'ernie-bot-turbo'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  TENCENT: {
    name: '腾讯混元',
    icon: Globe,
    color: 'bg-cyan-500',
    models: ['hunyuan-lite'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  HUNGYUAN: {
    name: '混元',
    icon: Globe,
    color: 'bg-cyan-500',
    models: ['hunyuan-lite'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  MINIMAX: {
    name: 'MiniMax',
    icon: Settings,
    color: 'bg-indigo-500',
    models: ['abab5.5-chat', 'abab5-chat'],
    capabilities: ['text-generation', 'code-generation', 'reasoning'],
  },
  GOOGLE_GEMINI: {
    name: 'Google Gemini',
    icon: Shield,
    color: 'bg-emerald-500',
    models: ['gemini-pro', 'gemini-ultra'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'multimodal'],
  },
  AZURE_OPENAI: {
    name: 'Azure OpenAI',
    icon: Settings,
    color: 'bg-sky-500',
    models: ['gpt-4', 'gpt-35-turbo'],
    capabilities: ['text-generation', 'code-generation', 'reasoning', 'function-calling'],
  },
  CUSTOM: {
    name: '自定义 Provider',
    icon: Settings,
    color: 'bg-gray-500',
    models: [],
    capabilities: [],
  },
};

export default function AIProvidersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [manualSelectEnabled, setManualSelectEnabled] = useState(() => {
    // 从 localStorage 读取设置
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiProviderManualSelect') === 'true';
    }
    return false;
  });
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

  // 获取 token
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  };

  // 保存手动选择设置到 localStorage
  useEffect(() => {
    localStorage.setItem('aiProviderManualSelect', String(manualSelectEnabled));
  }, [manualSelectEnabled]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('/api/ai-providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProviders(data.data || []);
          // Fetch usage for each provider
          for (const provider of data.data || []) {
            fetchProviderUsage(provider.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProviderUsage = async (providerId: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/ai-providers/${providerId}/usage`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProviders(prev =>
          prev.map(p => p.id === providerId ? { ...p, usage: data } : p)
        );
      }
    } catch (error) {
      console.error('Failed to fetch provider usage:', error);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [user]);

  const handleTypeChange = (type: AIProvider['type']) => {
    const config = PROVIDER_TYPES[type];
    setFormData({
      ...formData,
      type,
      capabilities: config?.capabilities || [],
      supportedModels: config?.models || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      const url = editingProvider
        ? `/api/ai-providers/${editingProvider.id}`
        : '/api/ai-providers';
      const method = editingProvider ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
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
          toast({
            title: '操作成功',
            description: editingProvider ? 'Provider 已更新' : 'Provider 已添加',
          });
        }
      } else {
        const data = await response.json();
        throw new Error(data.error?.message || '操作失败');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '操作失败',
        description: error instanceof Error ? error.message : '未知错误',
      });
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
      const token = getToken();
      const response = await fetch(`/api/ai-providers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchProviders();
        toast({
          title: '删除成功',
          description: 'Provider 已删除',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = getToken();
      const response = await fetch(`/api/ai-providers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isDefault: true,
        }),
      });

      if (response.ok) {
        await fetchProviders();
        toast({
          title: '设置成功',
          description: '已设为首选 Provider',
        });
      } else {
        const data = await response.json();
        throw new Error(data.error?.message || '设置失败');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '设置失败',
        description: error instanceof Error ? error.message : '未知错误',
      });
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
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto py-8">
          <div className="max-w-7xl mx-auto">
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
                          placeholder="例如：火山引擎豆包主账号"
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
                                  {config.icon && <config.icon className="h-4 w-4" />}
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

                      <div className="space-y-2">
                        <Label htmlFor="endpoint">Endpoint（可选）</Label>
                        <Input
                          id="endpoint"
                          value={formData.endpoint}
                          onChange={(e) =>
                            setFormData({ ...formData, endpoint: e.target.value })
                          }
                          placeholder="自定义 API 端点"
                        />
                      </div>

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

            {/* 手动选择开关 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">AI 模型选择模式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manual-select"
                    checked={manualSelectEnabled}
                    onCheckedChange={setManualSelectEnabled}
                  />
                  <Label htmlFor="manual-select" className="cursor-pointer">
                    手动选择开启
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {manualSelectEnabled
                    ? '开启手动选择后，系统将使用您选为"首选"的 Provider'
                    : '关闭手动选择后，系统将根据优先级自动选择最佳 Provider'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>已配置的 Providers</CardTitle>
                <CardDescription>
                  {manualSelectEnabled
                    ? '系统将使用"首选" Provider'
                    : '系统会根据优先级自动选择最合适的 Provider'}
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
                          <TableHead>首选</TableHead>
                          <TableHead>使用情况</TableHead>
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {providers.map((provider) => {
                          const config = PROVIDER_TYPES[provider.type];
                          const Icon = config?.icon;
                          return (
                            <TableRow key={provider.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {Icon && <Icon className="h-4 w-4" />}
                                  {provider.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge>{config?.name || provider.type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {provider.supportedModels && provider.supportedModels.length > 0 ? (
                                    <>
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
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
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
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSetDefault(provider.id)}
                                  disabled={provider.isDefault}
                                  title={provider.isDefault ? '已是首选' : '设为首选'}
                                >
                                  {provider.isDefault ? (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <StarOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  {provider.usage ? (
                                    <>
                                      <div className="flex items-center gap-1 text-xs">
                                        <Activity className="h-3 w-3" />
                                        <span>{provider.usage.totalRequests} 次请求</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>{provider.usage.totalTokens.toLocaleString()} tokens</span>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span>{provider.usage.successRate}% 成功率</span>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">无数据</span>
                                  )}
                                </div>
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
        </main>
      </div>
    </ProtectedRoute>
  );
}
