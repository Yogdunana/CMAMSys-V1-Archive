'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { LatexStyleConfig, getLatexStyle, mergeLatexStyles, defaultLatexStyle } from '@/lib/latex-styles';

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  style?: LatexStyleConfig;
  stylePreset?: keyof typeof import('@/lib/latex-styles').latexStylePresets;
}

/**
 * LaTeX 公式渲染器
 * 使用 KaTeX 渲染数学公式
 */
export default function LatexRenderer({
  latex,
  displayMode = false,
  className = '',
  style: customStyle,
  stylePreset,
}: LatexRendererProps) {
  const [html, setHtml] = React.useState('');
  const [error, setError] = React.useState(false);

  // 获取样式配置
  const styleConfig = React.useMemo(() => {
    let config = defaultLatexStyle;

    if (stylePreset) {
      config = getLatexStyle(stylePreset);
    }

    if (customStyle) {
      config = mergeLatexStyles(config, customStyle);
    }

    return config;
  }, [stylePreset, customStyle]);

  // 应用样式
  const appliedStyle = displayMode ? styleConfig.blockStyle : styleConfig.inlineStyle;
  const inlineStyle = styleConfig.inlineStyle;
  const blockStyle = styleConfig.blockStyle;

  React.useEffect(() => {
    if (!latex) {
      setHtml('');
      return;
    }

    try {
      const rendered = katex.renderToString(latex, {
        displayMode,
        throwOnError: styleConfig.katexConfig?.throwOnError ?? false,
        trust: true,
        strict: false,
        errorColor: styleConfig.katexConfig?.errorColor ?? '#cc0000',
        macros: styleConfig.katexConfig?.macros,
      });
      setHtml(rendered);
      setError(false);
    } catch (err) {
      console.error('LaTeX render error:', err);
      setError(true);
      setHtml(latex); // Fallback to plain text
    }
  }, [latex, displayMode, styleConfig]);

  const computedClassName = displayMode
    ? 'block text-center my-4'
    : 'inline-block mx-1';

  if (error) {
    return (
      <span
        className={`text-red-500 bg-red-50 px-1 rounded ${computedClassName} ${className}`}
        style={{
          fontSize: appliedStyle?.fontSize,
          color: appliedStyle?.color,
        }}
      >
        {latex}
      </span>
    );
  }

  return (
    <span
      className={`${computedClassName} ${className}`}
      style={{
        fontSize: appliedStyle?.fontSize,
        color: appliedStyle?.color,
        fontFamily: styleConfig.fontFamily,
        padding: !displayMode ? (inlineStyle as any)?.padding : undefined,
        textAlign: displayMode ? (blockStyle as any)?.textAlign : undefined,
        margin: displayMode ? (blockStyle as any)?.margin : undefined,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * 渲染包含 LaTeX 公式的文本
 * 自动识别并渲染 $...$ 和 $$...$$ 格式的公式
 */
export function renderLatexText(
  text: string,
  style?: LatexStyleConfig,
  stylePreset?: keyof typeof import('@/lib/latex-styles').latexStylePresets,
): React.ReactNode {
  if (!text) return text;

  // 替换行内公式 $...$ 为 KaTeX 渲染
  // 替换块级公式 $$...$$ 为 KaTeX 渲染
  const parts: string[] = [];
  let currentPos = 0;
  let match: RegExpExecArray | null;

  // 匹配 $$...$$ (块级公式)
  const blockLatexRegex = /\$\$([^$]+)\$\$/g;

  // 先处理块级公式
  while ((match = blockLatexRegex.exec(text)) !== null) {
    // 添加公式前的文本
    if (match.index > currentPos) {
      parts.push(text.slice(currentPos, match.index));
    }

    // 添加块级公式
    parts.push(`__BLOCK_LATEX__${match[1]}__`);

    currentPos = match.index + match[0].length;
  }

  // 添加剩余文本
  if (currentPos < text.length) {
    parts.push(text.slice(currentPos));
  }

  // 处理每个部分
  const result = parts.map((part, index) => {
    if (part.startsWith('__BLOCK_LATEX__') && part.endsWith('__')) {
      const latex = part.slice(13, -2); // 移除标记
      return (
        <div key={index} className="flex justify-center my-4">
          <LatexRenderer
            latex={latex}
            displayMode={true}
            style={style}
            stylePreset={stylePreset}
          />
        </div>
      );
    }

    // 处理行内公式 $...$
    const inlineParts: string[] = [];
    let inlineCurrentPos = 0;
    let inlineMatch: RegExpExecArray | null;

    const inlineLatexRegex = /\$([^$]+)\$/g;

    while ((inlineMatch = inlineLatexRegex.exec(part)) !== null) {
      if (inlineMatch.index > inlineCurrentPos) {
        inlineParts.push(part.slice(inlineCurrentPos, inlineMatch.index));
      }

      inlineParts.push(`__INLINE_LATEX__${inlineMatch[1]}__`);

      inlineCurrentPos = inlineMatch.index + inlineMatch[0].length;
    }

    if (inlineCurrentPos < part.length) {
      inlineParts.push(part.slice(inlineCurrentPos));
    }

    return (
      <span key={index}>
        {inlineParts.map((inlinePart, inlineIndex) => {
          if (inlinePart.startsWith('__INLINE_LATEX__') && inlinePart.endsWith('__')) {
            const latex = inlinePart.slice(15, -2);
            return (
              <LatexRenderer
                key={inlineIndex}
                latex={latex}
                displayMode={false}
                className="mx-1"
                style={style}
                stylePreset={stylePreset}
              />
            );
          }
          return <span key={inlineIndex}>{inlinePart}</span>;
        })}
      </span>
    );
  });

  return <>{result}</>;
}
