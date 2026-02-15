'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTemplateList, PaperTemplate, getRecommendedTemplate } from '@/lib/paper-templates';

interface TemplateSelectorProps {
  currentFormat?: 'MCM' | 'ICM' | 'CUMCM' | 'CUSTOM';
  onTemplateSelect: (template: PaperTemplate) => void;
  selectedTemplateId?: string;
}

/**
 * 论文模板选择器
 * 允许用户选择不同的论文模板
 */
export function TemplateSelector({
  currentFormat = 'CUSTOM',
  onTemplateSelect,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const templates = getTemplateList();
  const recommendedTemplate = getRecommendedTemplate(currentFormat);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">选择论文模板</h3>
        <Badge variant="outline">
          推荐: {recommendedTemplate.name}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isRecommended = template.id === recommendedTemplate.id;
          const isSelected = template.id === selectedTemplateId;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isRecommended ? 'border-primary' : ''}`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {isRecommended && (
                    <Badge variant="default" className="ml-2">
                      推荐
                    </Badge>
                  )}
                  {isSelected && (
                    <Badge variant="secondary" className="ml-2">
                      已选择
                    </Badge>
                  )}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{template.format}</Badge>
                    <Badge variant="outline">{template.language === 'CHINESE' ? '中文' : 'English'}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">章节结构：</p>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.map((section) => (
                        <Badge
                          key={section.id}
                          variant={section.required ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {section.title}
                          {section.required && '*'}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant={isSelected ? 'secondary' : 'default'}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateSelect(template);
                    }}
                  >
                    {isSelected ? '已选择' : '选择此模板'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>* 标记的章节为必填项</p>
      </div>
    </div>
  );
}

/**
 * 模板详情预览
 */
export function TemplatePreview({ template }: { template: PaperTemplate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">格式</h4>
          <div className="flex gap-2">
            <Badge>{template.format}</Badge>
            <Badge variant="outline">{template.language === 'CHINESE' ? '中文' : 'English'}</Badge>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">章节结构</h4>
          <div className="space-y-2">
            {template.sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between text-sm">
                <span>
                  {section.order}. {section.title}
                </span>
                <Badge variant={section.required ? 'default' : 'secondary'} className="text-xs">
                  {section.required ? '必填' : '可选'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">样式设置</h4>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>字体: {template.styling.fontFamily}</p>
            <p>字号: {template.styling.fontSize}pt</p>
            <p>行距: {template.styling.lineHeight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
