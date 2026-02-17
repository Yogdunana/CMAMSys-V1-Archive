/**
 * 文档导出工具
 * 支持导出为 Word (.docx) 和 PDF 格式
 */

/**
 * 将论文内容导出为 Word 文档
 * 使用 html-docx-js 将 HTML 转换为 Word
 */
export async function exportToWord(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}) {
  const html2docx = await import('html-docx-js-typescript');
  const { saveAs } = await import('file-saver');

  // 将 Markdown 内容转换为 HTML
  const htmlContent = markdownToHtml(paper);

  // 创建 Word 文档 Blob
  const result = await html2docx.asBlob(htmlContent);
  
  // 确保转换为 Blob（如果是 Buffer）
  const blob = result instanceof Buffer 
    ? new Blob([result as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }) as Blob
    : result as Blob;

  // 下载
  saveAs(blob, `${paper.title}.docx`);
}

/**
 * 将 Markdown 内容转换为 HTML
 */
function markdownToHtml(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}): string {
  const lines = paper.content.split('\n');
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'SimSun', '宋体', serif; font-size: 12pt; line-height: 1.6; }
        h1 { font-size: 18pt; font-weight: bold; margin: 20px 0 10px 0; }
        h2 { font-size: 16pt; font-weight: bold; margin: 18px 0 8px 0; }
        h3 { font-size: 14pt; font-weight: bold; margin: 16px 0 6px 0; }
        h4 { font-size: 13pt; font-weight: bold; margin: 14px 0 6px 0; }
        p { margin: 10px 0; text-align: justify; }
        table { border-collapse: collapse; margin: 10px 0; width: 100%; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        blockquote { border-left: 3px solid #ccc; margin: 10px 0; padding-left: 10px; color: #666; }
        code { font-family: 'Courier New', monospace; background-color: #f0f0f0; padding: 2px 4px; }
        pre { background-color: #f0f0f0; padding: 10px; overflow-x: auto; }
        pre code { background-color: transparent; padding: 0; }
        .metadata { text-align: center; margin: 20px 0; color: #666; }
      </style>
    </head>
    <body>
      <h1 style="text-align: center;">${paper.title}</h1>
      <div class="metadata">
        格式: ${paper.format || 'MCM'}  |  语言: ${paper.language === 'CHINESE' ? '中文' : 'English'}  |  字数: ${paper.wordCount || 0}
      </div>
  `;

  let currentSection = '';
  let currentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测标题 (#, ##, ###, ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

    if (headingMatch) {
      // 保存上一个段落
      if (currentSection.trim()) {
        html += `<p>${escapeHtml(currentSection)}</p>`;
      }
      currentSection = '';

      // 添加标题
      const level = headingMatch[1].length;
      const title = escapeHtml(headingMatch[2]);
      html += `<h${level}>${title}</h${level}>`;
    } else if (line.trim() === '========================') {
      // 分隔符，保存段落
      if (currentSection.trim()) {
        html += `<p>${escapeHtml(currentSection)}</p>`;
      }
      currentSection = '';
    } else {
      // 添加内容
      if (line.trim()) {
        if (currentSection) {
          currentSection += '\n' + line;
        } else {
          currentSection = line;
        }
      }
    }
  }

  // 保存最后一个段落
  if (currentSection.trim()) {
    html += `<p>${escapeHtml(currentSection)}</p>`;
  }

  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 将论文内容导出为 PDF 文档
 * 改进中文字体支持
 */
export function exportToPDF(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}) {
  // 导入 jsPDF 库（需要在客户端使用）
  import('jspdf').then(({ jsPDF }) => {
    createPDF(paper, jsPDF);
  }).catch((error) => {
    console.error('Failed to load jsPDF:', error);
    // 降级方案：使用纯文本导出
    exportAsTextFile(paper);
  });
}

/**
 * 导出为纯文本文件（降级方案）
 */
function exportAsTextFile(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}) {
  const text = `
${paper.title}
${'='.repeat(paper.title.length)}

格式: ${paper.format || 'MCM'}  |  语言: ${paper.language === 'CHINESE' ? '中文' : 'English'}  |  字数: ${paper.wordCount || 0}

${paper.content}
  `.trim();

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${paper.title}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

import { loadChineseFont, getFontConfig, splitTextForPDF, isChineseFontSupported as checkChineseFontSupported } from './pdf-font-loader';

/**
 * 创建 PDF 文档
 */
async function createPDF(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}, jsPDF: any) {
  // 创建 PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // 检查是否为中文
  const isChinese = paper.language === 'CHINESE';

  // 如果是中文，尝试加载中文字体
  if (isChinese) {
    try {
      await loadChineseFont(doc);
    } catch (error) {
      console.warn('Failed to load Chinese font, falling back to standard font:', error);
    }
  }

  // 获取字体配置
  const titleFont = getFontConfig(paper.language as 'CHINESE' | 'ENGLISH', 'bold');
  const normalFont = getFontConfig(paper.language as 'CHINESE' | 'ENGLISH', 'normal');
  const italicFont = getFontConfig(paper.language as 'CHINESE' | 'ENGLISH', 'italic');

  // 添加标题
  doc.setFontSize(18);
  if (titleFont.isCustomFont) {
    doc.setFont(titleFont.fontName, 'bold');
  } else {
    doc.setFont('helvetica', 'bold');
  }
  const titleLines = splitTextForPDF(paper.title, doc, maxWidth);
  doc.text(titleLines, margin, 20);

  // 添加元数据
  doc.setFontSize(10);
  if (normalFont.isCustomFont) {
    doc.setFont(normalFont.fontName, 'normal');
  } else {
    doc.setFont('helvetica', 'normal');
  }

  const metadata = isChinese
    ? `格式: ${paper.format || 'MCM'}  |  语言: 中文  |  字数: ${paper.wordCount || 0}`
    : `Format: ${paper.format || 'MCM'}  |  Language: English  |  Word Count: ${paper.wordCount || 0}`;

  doc.text(metadata, margin, 20 + (titleLines.length * 10) + 10);

  // 添加提示信息（仅当无法加载中文字体时）
  if (isChinese && !checkChineseFontSupported()) {
    doc.setFontSize(10);
    if (italicFont.isCustomFont) {
      doc.setFont(italicFont.fontName, 'italic');
    } else {
      doc.setFont('helvetica', 'italic');
    }
    doc.text('注意：此 PDF 使用简化字体，中文可能显示不完整。建议使用 Word 格式。', margin, 20 + (titleLines.length * 10) + 20);
  }

  // 解析内容
  const sections = parseMarkdown(paper.content);

  let yPosition = 20 + (titleLines.length * 10) + 20;

  if (isChinese && !checkChineseFontSupported()) {
    yPosition += 10; // 为提示信息留出空间
  }

  sections.forEach(section => {
    // 检查是否需要新页面
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // 添加标题
    const level = section.level;
    doc.setFontSize(16 - (level - 1) * 2);
    if (titleFont.isCustomFont) {
      doc.setFont(titleFont.fontName, 'bold');
    } else {
      doc.setFont('helvetica', 'bold');
    }
    const sectionTitleLines = splitTextForPDF(section.title, doc, maxWidth);
    doc.text(sectionTitleLines, margin, yPosition);
    yPosition += sectionTitleLines.length * 10 + 2;

    // 添加内容
    doc.setFontSize(10);
    if (normalFont.isCustomFont) {
      doc.setFont(normalFont.fontName, 'normal');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const contentLines = splitTextForPDF(section.content, doc, maxWidth);
    doc.text(contentLines, margin, yPosition);
    yPosition += contentLines.length * 5 + 10;
  });

  // 下载
  doc.save(`${paper.title}.pdf`);
}

/**
 * 检查是否支持中文字体
 */
function isChineseFontSupported(): boolean {
  // 检查是否已加载中文字体
  return false; // 简化版本，实际应用中应该检查字体加载状态
}

/**
 * 解析 Markdown 格式的内容
 */
function parseMarkdown(content: string) {
  const sections: Array<{ level: number; title: string; content: string }> = [];
  const lines = content.split('\n');

  let currentSection: { level: number; title: string; content: string } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 检测标题 (#, ##, ###, ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);

    if (headingMatch) {
      // 保存上一个节
      if (currentSection) {
        sections.push(currentSection);
      }

      // 开始新节
      const level = headingMatch[1].length;
      currentSection = {
        level,
        title: headingMatch[2],
        content: '',
      };
    } else if (currentSection) {
      // 添加内容
      if (currentSection.content) {
        currentSection.content += '\n' + line;
      } else {
        currentSection.content = line;
      }
    }
  }

  // 保存最后一个节
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * 解析节并生成 Word 段落
 * 注释：此函数需要 docx 库支持，暂时禁用
 */
// function parseSection(section: { level: number; title: string; content: string }): Paragraph[] {
//   const paragraphs: Paragraph[] = [];
//
//   // 标题
//   const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
//                       section.level === 2 ? HeadingLevel.HEADING_2 :
//                       section.level === 3 ? HeadingLevel.HEADING_3 :
//                       HeadingLevel.HEADING_4;
//
//   paragraphs.push(
//     new Paragraph({
//       text: section.title,
//       heading: headingLevel,
//       spacing: {
//         before: 200,
//         after: 100,
//       },
//     })
//   );
//
//   // 内容（按段落分割）
//   const contentParagraphs = section.content.split('\n\n');
//
//   contentParagraphs.forEach(paragraphText => {
//     if (paragraphText.trim()) {
//       paragraphs.push(
//         new Paragraph({
//           children: [new TextRun({
//             text: paragraphText,
//             size: 24,
//           })],
//           spacing: {
//             after: 120,
//           },
//         })
//       );
//     }
//   });
//
//   return paragraphs;
// }

/**
 * 导出为支持中文的 PDF（服务器端生成）
 * 使用 Puppeteer 渲染，完全支持中文字体
 */
export async function exportToPDFChinese(paperId: string, paperTitle: string) {
  try {
    // 调用服务器端 API
    const response = await fetch(`/api/papers/${paperId}/pdf-chinese`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paperId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    // 获取 PDF Blob
    const blob = await response.blob();

    // 下载
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperTitle}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting to PDF (Chinese):', error);
    throw error;
  }
}
