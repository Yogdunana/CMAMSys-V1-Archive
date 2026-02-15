/**
 * 文档导出工具
 * 支持导出为 Word (.docx) 和 PDF 格式
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * 将论文内容导出为 Word 文档
 */
export async function exportToWord(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}) {
  // 解析内容
  const sections = parseMarkdown(paper.content);

  // 创建文档
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 标题
        new Paragraph({
          text: paper.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),

        // 元数据
        new Paragraph({
          children: [
            new TextRun({
              text: `格式: ${paper.format || 'MCM'}  |  `,
              bold: false,
              size: 20,
            }),
            new TextRun({
              text: `语言: ${paper.language === 'CHINESE' ? '中文' : 'English'}  |  `,
              bold: false,
              size: 20,
            }),
            new TextRun({
              text: `字数: ${paper.wordCount || 0}`,
              bold: false,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),
      ],
      // 内容
      ...sections.flatMap(section => parseSection(section)),
    }],
  });

  // 生成 Blob
  const blob = await Packer.toBlob(doc);

  // 下载
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${paper.title}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 将论文内容导出为 PDF 文档
 */
export function exportToPDF(paper: {
  title: string;
  content: string;
  format?: string;
  language?: string;
  wordCount?: number;
}) {
  // 创建 PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // 设置字体（支持中文）
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
