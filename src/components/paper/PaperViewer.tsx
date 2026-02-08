'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Download,
  Save,
  Edit3,
  Eye,
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface PaperSection {
  id: string;
  title: string;
  content: string;
  level: number; // 1 = 标题, 2 = 副标题, 3 = 三级标题
  subsections?: PaperSection[];
}

interface PaperViewerProps {
  paperId: string;
  initialContent?: string;
  onSave?: (content: string) => Promise<void>;
}

export function PaperViewer({ paperId, initialContent, onSave }: PaperViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('preview');
  const [content, setContent] = useState(initialContent || '');
  const [sections, setSections] = useState<PaperSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 解析 Markdown 内容为章节结构
  useEffect(() => {
    const parsedSections = parseMarkdownToSections(content || '');
    setSections(parsedSections);

    // 默认展开所有章节
    const allSectionIds = new Set<string>();
    const collectIds = (secs: PaperSection[]) => {
      secs.forEach(section => {
        allSectionIds.add(section.id);
        if (section.subsections) {
          collectIds(section.subsections);
        }
      });
    };
    collectIds(parsedSections);
    setExpandedSections(allSectionIds);
  }, [content]);

  const parseMarkdownToSections = (markdown: string): PaperSection[] => {
    const lines = markdown.split('\n');
    const rootSections: PaperSection[] = [];
    const stack: { sections: PaperSection[]; level: number }[] = [
      { sections: rootSections, level: 0 },
    ];

    let currentId = 0;

    lines.forEach(line => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2].trim();
        const id = `section-${currentId++}`;

        const newSection: PaperSection = {
          id,
          title,
          content: '',
          level,
          subsections: [],
        };

        // 找到合适的父章节
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        const parent = stack[stack.length - 1];
        if (level === 1) {
          parent.sections.push(newSection);
        } else {
          // 找到最近的一个章节作为父级
          const lastSection = parent.sections[parent.sections.length - 1];
          if (lastSection) {
            let targetSection = lastSection;
            // 根据 level 找到正确的嵌套位置
            let targetStack = stack.slice(1);
            while (targetStack.length > 0 && targetStack[targetStack.length - 1].level >= level) {
              targetStack.pop();
            }
            if (targetStack.length > 0) {
              targetSection = targetStack[targetStack.length - 1].sections[targetStack[targetStack.length - 1].sections.length - 1];
            }
            if (targetSection) {
              if (!targetSection.subsections) {
                targetSection.subsections = [];
              }
              targetSection.subsections.push(newSection);
            }
          }
        }

        stack.push({ sections: [newSection], level });
      } else if (line.trim()) {
        // 添加到当前章节内容
        if (stack.length > 1) {
          const parent = stack[stack.length - 1];
          if (parent.sections.length > 0) {
            const currentSection = parent.sections[parent.sections.length - 1];
            currentSection.content += line + '\n';
          }
        }
      }
    });

    return rootSections;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(content);
      setHasUnsavedChanges(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paper-${paperId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditing = (sectionId: string, sectionContent: string) => {
    setEditingSection(sectionId);
    setEditedContent(sectionContent);
  };

  const saveSectionEdit = () => {
    if (editingSection) {
      // 更新内容
      const updateContent = (secs: PaperSection[]): boolean => {
        for (const section of secs) {
          if (section.id === editingSection) {
            section.content = editedContent;
            return true;
          }
          if (section.subsections && updateContent(section.subsections)) {
            return true;
          }
        }
        return false;
      };

      const newSections = [...sections];
      updateContent(newSections);

      // 重新生成 Markdown
      const newContent = generateMarkdownFromSections(newSections);
      setContent(newContent);
      setHasUnsavedChanges(true);
      setEditingSection(null);
      setEditedContent('');
    }
  };

  const generateMarkdownFromSections = (secs: PaperSection[]): string => {
    let markdown = '';
    secs.forEach(section => {
      markdown += '#'.repeat(section.level) + ' ' + section.title + '\n\n';
      if (section.content) {
        markdown += section.content + '\n\n';
      }
      if (section.subsections && section.subsections.length > 0) {
        markdown += generateMarkdownFromSections(section.subsections);
      }
    });
    return markdown;
  };

  const renderSection = (section: PaperSection, depth = 0): React.ReactNode => {
    const isExpanded = expandedSections.has(section.id);
    const isEditing = editingSection === section.id;

    return (
      <div key={section.id} className={depth > 0 ? 'ml-4' : ''}>
        <div
          className={`flex items-start gap-2 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer group ${
            isEditing ? 'bg-muted' : ''
          }`}
          onClick={() => !isEditing && toggleSection(section.id)}
        >
          {section.subsections && section.subsections.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mt-1 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 mt-1 text-muted-foreground" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}

          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium ${
                section.level === 1
                  ? 'text-lg'
                  : section.level === 2
                  ? 'text-base'
                  : 'text-sm'
              }`}
              style={{
                marginLeft: `${(section.level - 1) * 12}px`,
              }}
            >
              {section.title}
            </h3>

            {isExpanded && !isEditing && (
              <div
                className={`mt-2 text-muted-foreground whitespace-pre-wrap ${
                  section.level === 1 ? 'text-sm' : 'text-xs'
                }`}
                style={{
                  marginLeft: `${(section.level - 1) * 12}px`,
                }}
              >
                {section.content.slice(0, 200)}
                {section.content.length > 200 && '...'}
              </div>
            )}

            {isEditing && (
              <Textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="mt-2 min-h-[200px]"
                style={{
                  marginLeft: `${(section.level - 1) * 12}px`,
                }}
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>

          {isEditing && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={e => {
                  e.stopPropagation();
                  saveSectionEdit();
                }}
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  setEditingSection(null);
                }}
              >
                取消
              </Button>
            </div>
          )}

          {!isEditing && isExpanded && (
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100"
              onClick={e => {
                e.stopPropagation();
                startEditing(section.id, section.content);
              }}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isExpanded && section.subsections && (
          <div className="mt-1 space-y-1">
            {section.subsections.map(subsection => renderSection(subsection, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                论文预览与编辑
              </CardTitle>
              <CardDescription>支持 Markdown 格式</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {viewMode === 'edit' && hasUnsavedChanges && (
                <Button onClick={handleSave} variant="default" className="gap-2">
                  <Save className="w-4 h-4" />
                  保存更改
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                下载
              </Button>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  预览
                </Button>
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setViewMode('edit')}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  编辑
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索论文内容..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* 内容区域 */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'preview' ? (
            <ScrollArea className="h-[600px] p-6">
              <div className="max-w-4xl mx-auto space-y-2">
                {sections.length > 0 ? (
                  sections.map(section => renderSection(section))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    论文内容为空
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            <ScrollArea className="h-[600px] p-6">
              <Textarea
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="min-h-[500px] font-mono text-sm"
                placeholder="在此编辑论文内容..."
              />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* 未保存更改提示 */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 shadow-lg">
          <div className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span className="font-medium">有未保存的更改</span>
          </div>
        </div>
      )}
    </div>
  );
}
