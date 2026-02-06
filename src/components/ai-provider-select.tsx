'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Globe, Shield, Loader2 } from 'lucide-react';

interface AIProvider {
  id: string;
  name: string;
  type: 'ALIYUN' | 'VOLCENGINE' | 'DEEPSEEK';
  status: 'ACTIVE' | 'INACTIVE';
  priority: number;
  supportedModels: string[];
  capabilities: string[];
}

interface AIModel {
  name: string;
  providerId: string;
  providerName: string;
  providerType: string;
}

const PROVIDER_TYPES = {
  ALIYUN: { name: '阿里云百炼', icon: Zap, color: 'bg-orange-500' },
  VOLCENGINE: { name: '火山引擎', icon: Globe, color: 'bg-blue-500' },
  DEEPSEEK: { name: 'DeepSeek', icon: Shield, color: 'bg-purple-500' },
};

interface AIProviderSelectProps {
  onProviderChange?: (providerId: string | null) => void;
  onModelChange?: (model: string | null) => void;
  defaultValue?: {
    providerId?: string;
    model?: string;
  };
  required?: boolean;
  disabled?: boolean;
}

export function AIProviderSelect({
  onProviderChange,
  onModelChange,
  defaultValue,
  required = false,
  disabled = false,
}: AIProviderSelectProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    defaultValue?.providerId || null
  );
  const [selectedModel, setSelectedModel] = useState<string | null>(defaultValue?.model || null);
  const [loading, setLoading] = useState(true);
  const [autoSelect, setAutoSelect] = useState(!defaultValue?.providerId);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-providers');
      if (response.ok) {
        const data = await response.json();
        const activeProviders = (data.providers || []).filter(
          (p: AIProvider) => p.status === 'ACTIVE'
        );
        setProviders(activeProviders.sort((a: AIProvider, b: AIProvider) => b.priority - a.priority));
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  useEffect(() => {
    if (autoSelect && providers.length > 0 && !selectedProviderId) {
      const bestProvider = providers[0];
      setSelectedProviderId(bestProvider.id);
      if (bestProvider.supportedModels.length > 0) {
        setSelectedModel(bestProvider.supportedModels[0]);
      }
    }
  }, [autoSelect, providers, selectedProviderId]);

  useEffect(() => {
    if (onProviderChange) {
      onProviderChange(autoSelect ? null : selectedProviderId);
    }
  }, [selectedProviderId, autoSelect, onProviderChange]);

  useEffect(() => {
    if (onModelChange) {
      onModelChange(selectedModel);
    }
  }, [selectedModel, onModelChange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">
          暂无可用的 AI Provider，请先在{' '}
          <a href="/dashboard/ai-providers" className="text-primary underline">
            设置页面
          </a>{' '}
          添加
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 自动/手动选择切换 */}
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-select"
          checked={autoSelect}
          onCheckedChange={setAutoSelect}
          disabled={disabled}
        />
        <Label htmlFor="auto-select" className="cursor-pointer">
          自动选择最佳 Provider
        </Label>
      </div>

      {!autoSelect && (
        <>
          {/* Provider 选择 */}
          <div className="space-y-2">
            <Label className={required ? 'required' : ''}>
              AI Provider {required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={selectedProviderId || ''}
              onValueChange={(value) => {
                setSelectedProviderId(value);
                setSelectedModel(null);
              }}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择 AI Provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => {
                  const config = PROVIDER_TYPES[provider.type];
                  const Icon = config?.icon;
                  return (
                    <SelectItem key={provider.id} value={provider.id}>
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span className="font-medium">{provider.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {config?.name}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 模型选择 */}
          {selectedProvider && (
            <div className="space-y-2">
              <Label className={required ? 'required' : ''}>
                模型 {required && <span className="text-destructive">*</span>}
              </Label>
              <Select
                value={selectedModel || ''}
                onValueChange={setSelectedModel}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.supportedModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      {/* 当前选择预览 */}
      {(autoSelect || selectedProviderId) && (
        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-sm font-medium mb-2">
            {autoSelect ? '将自动选择最佳 Provider' : '当前选择：'}
          </p>
          {!autoSelect && selectedProvider && selectedModel && (
            <div className="flex items-center gap-2">
              <Badge variant="default">{selectedProvider.name}</Badge>
              <span>→</span>
              <Badge variant="outline">{selectedModel}</Badge>
            </div>
          )}
          {autoSelect && providers.length > 0 && (
            <div className="text-sm text-muted-foreground">
              系统将根据优先级和任务类型自动选择：{providers[0].name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
