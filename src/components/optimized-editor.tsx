'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface VirtualizedEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
  lineNumbers?: boolean;
  lineHeight?: number;
  rows?: number;
}

/**
 * 虚拟化编辑器
 * 只渲染可见区域的内容，提高大型文档的渲染性能
 */
export function VirtualizedEditor({
  content,
  onChange,
  className = '',
  lineNumbers = true,
  lineHeight = 20,
  rows = 30,
}: VirtualizedEditorProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(rows * lineHeight);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = content.split('\n');
  const totalHeight = lines.length * lineHeight;

  // 计算可见范围
  const visibleStart = Math.floor(scrollTop / lineHeight);
  const visibleEnd = Math.min(
    Math.ceil((scrollTop + viewportHeight) / lineHeight),
    lines.length
  );

  // 缓冲区大小（上下各渲染额外几行）
  const buffer = 5;
  const renderStart = Math.max(0, visibleStart - buffer);
  const renderEnd = Math.min(lines.length, visibleEnd + buffer);

  // 可见行
  const visibleLines = lines.slice(renderStart, renderEnd);

  // 顶部填充高度
  const paddingTop = renderStart * lineHeight;
  // 底部填充高度
  const paddingBottom = (lines.length - renderEnd) * lineHeight;

  // 处理滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 更新内容
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  // 同步滚动位置
  useEffect(() => {
    if (containerRef.current && textareaRef.current) {
      textareaRef.current.scrollTop = containerRef.current.scrollTop;
    }
  }, [scrollTop]);

  return (
    <div className={`relative ${className}`}>
      {/* 行号 */}
      {lineNumbers && (
        <div
          className="absolute left-0 top-0 bottom-0 w-12 bg-muted border-r overflow-hidden"
          style={{ height: totalHeight }}
        >
          <div
            style={{
              transform: `translateY(${paddingTop}px)`,
            }}
          >
            {visibleLines.map((_, i) => (
              <div
                key={renderStart + i}
                className="text-right pr-2 text-xs text-muted-foreground select-none"
                style={{ height: lineHeight, lineHeight: `${lineHeight}px` }}
              >
                {renderStart + i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 编辑器容器 */}
      <div
        ref={containerRef}
        className="relative overflow-auto pl-12"
        style={{ height: `${viewportHeight}px` }}
        onScroll={handleScroll}
      >
        {/* 顶部填充 */}
        <div style={{ height: paddingTop }} />

        {/* 可见内容 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
          style={{
            height: `${visibleLines.length * lineHeight}px`,
            lineHeight: `${lineHeight}px`,
            paddingTop: `${paddingTop}px`,
            minHeight: `${visibleLines.length * lineHeight}px`,
          }}
          spellCheck={false}
        />

        {/* 底部填充 */}
        <div style={{ height: paddingBottom }} />
      </div>
    </div>
  );
}

/**
 * 分段渲染的 LaTeX 渲染器
 * 将大型文档分段渲染，避免一次性渲染过多内容
 */
export function ChunkedLatexRenderer({
  content,
  chunkSize = 500,
}: {
  content: string;
  chunkSize?: number;
}) {
  const [chunks, setChunks] = useState<string[]>([]);
  const [renderedChunks, setRenderedChunks] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    // 将内容分块
    const lines = content.split('\n');
    const newChunks: string[] = [];
    for (let i = 0; i < lines.length; i += chunkSize) {
      newChunks.push(lines.slice(i, i + chunkSize).join('\n'));
    }
    setChunks(newChunks);
    setRenderedChunks(new Map());
  }, [content, chunkSize]);

  const handleChunkIntersect = (index: number) => {
    setRenderedChunks(prev => new Map(prev.set(index, true)));
  };

  return (
    <div className="space-y-4">
      {chunks.map((chunk, index) => (
        <LazyChunk
          key={index}
          index={index}
          chunk={chunk}
          onIntersect={() => handleChunkIntersect(index)}
        />
      ))}
    </div>
  );
}

/**
 * 懒加载的文本块
 */
function LazyChunk({
  index,
  chunk,
  onIntersect,
}: {
  index: number;
  chunk: string;
  onIntersect: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            onIntersect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [onIntersect]);

  return (
    <div ref={elementRef} className="min-h-[100px]">
      {isVisible ? (
        <pre className="whitespace-pre-wrap">{chunk}</pre>
      ) : (
        <div className="text-muted-foreground animate-pulse">
          加载中...
        </div>
      )}
    </div>
  );
}

/**
 * 防抖优化的内容编辑器
 */
export function DebouncedEditor({
  value,
  onChange,
  delay = 300,
}: {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
}) {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  }, [delay, onChange]);

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      className="w-full min-h-[500px] p-4 border rounded-md font-mono text-sm"
      placeholder="开始输入..."
    />
  );
}

/**
 * 带性能监控的编辑器
 */
export function MonitoredEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [updateTime, setUpdateTime] = useState<number>(0);

  const startTime = React.useRef<number>(0);

  const handleRender = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const handleRenderComplete = useCallback(() => {
    const endTime = performance.now();
    setRenderTime(endTime - startTime.current);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updateStart = performance.now();
    onChange(e.target.value);
    const updateEnd = performance.now();
    setUpdateTime(updateEnd - updateStart);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>渲染时间: {renderTime.toFixed(2)}ms</span>
        <span>更新时间: {updateTime.toFixed(2)}ms</span>
      </div>
      <textarea
        value={value}
        onChange={handleChange}
        className="w-full min-h-[500px] p-4 border rounded-md font-mono text-sm"
        onFocus={handleRender}
        onBlur={handleRenderComplete}
      />
    </div>
  );
}
