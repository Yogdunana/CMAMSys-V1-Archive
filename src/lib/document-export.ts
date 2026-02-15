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

  // 创建 Word 文档
  const doc = html2docx.default(htmlContent);

  // 生成 Blob
  const blob = new Blob([doc], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

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

/**
 * 创建 PDF 文档
 */
function createPDF(paper: {
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

  // 设置字体
  // 注意：jsPDF 默认不支持中文字符
  // 对于中文内容，建议使用第三方服务或自定义字体
  const isChinese = paper.language === 'CHINESE';

  if (isChinese) {
    // 中文内容：使用特殊处理
    // 将中文字符转换为 Unicode 转义序列
    const escapeChinese = (text: string) => {
      return text.replace(/[\u4e00-\u9fa5]/g, (char) => {
        return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      });
    };

    // 添加标题
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const title = escapeChinese(paper.title);
    doc.text(title, margin, 20);

    // 添加元数据
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const metadata = escapeChinese(`格式: ${paper.format || 'MCM'}  |  语言: 中文  |  字数: ${paper.wordCount || 0}`);
    doc.text(metadata, margin, 30);

    // 添加提示信息
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('注意：此 PDF 使用简化字体，中文可能显示不完整。建议使用 Word 格式。', margin, 40);
  } else {
    // 英文内容：正常处理
    doc.setFont('helvetica');
    const fontSize = 12;
    doc.setFontSize(fontSize);

    // 添加标题
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(paper.title, maxWidth);
    doc.text(titleLines, margin, 20);

    // 添加元数据
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Format: ${paper.format || 'MCM'}  |  Language: English  |  Word Count: ${paper.wordCount || 0}`, margin, 20 + (titleLines.length * 10) + 10);

    // 解析内容
    const sections = parseMarkdown(paper.content);

    let yPosition = 20 + (titleLines.length * 10) + 20;

    sections.forEach(section => {
      // 检查是否需要新页面
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // 添加标题
      const level = section.level;
      doc.setFontSize(16 - (level - 1) * 2);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin, yPosition);
      yPosition += 12;

      // 添加内容
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const contentLines = doc.splitTextToSize(section.content, maxWidth);
      doc.text(contentLines, margin, yPosition);
      yPosition += contentLines.length * 5 + 10;
    });
  }

  // 添加元数据
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`格式: ${paper.format || 'MCM'}  |  语言: ${paper.language === 'CHINESE' ? '中文' : 'English'}  |  字数: ${paper.wordCount || 0}`, margin, 20 + (titleLines.length * 10) + 10);

  // 解析内容
  const sections = parseMarkdown(paper.content);

  let yPosition = 20 + (titleLines.length * 10) + 20;

  sections.forEach(section => {
    // 检查是否需要新页面
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // 添加标题
    const level = section.level;
    doc.setFontSize(16 - (level - 1) * 2);
    doc.setFont('helvetica', 'bold');
    doc.text(section.title, margin, yPosition);
    yPosition += 12;

    // 添加内容
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contentLines = doc.splitTextToSize(section.content, maxWidth);
    doc.text(contentLines, margin, yPosition);
    yPosition += contentLines.length * 5 + 10;
  });

  // 下载
  doc.save(`${paper.title}.pdf`);
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
 */
function parseSection(section: { level: number; title: string; content: string }): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // 标题
  const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
                      section.level === 2 ? HeadingLevel.HEADING_2 :
                      section.level === 3 ? HeadingLevel.HEADING_3 :
                      HeadingLevel.HEADING_4;

  paragraphs.push(
    new Paragraph({
      text: section.title,
      heading: headingLevel,
      spacing: {
        before: 200,
        after: 100,
      },
    })
  );

  // 内容（按段落分割）
  const contentParagraphs = section.content.split('\n\n');

  contentParagraphs.forEach(paragraphText => {
    if (paragraphText.trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({
            text: paragraphText,
            size: 24,
          })],
          spacing: {
            after: 120,
          },
        })
      );
    }
  });

  return paragraphs;
}
