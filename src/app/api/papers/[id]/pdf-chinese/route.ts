import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * API 路由：生成支持中文的 PDF
 * 使用服务器端渲染，支持中文字体
 */
export async function POST(request: NextRequest) {
  try {
    const { paperId } = await request.json();

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID is required' },
        { status: 400 }
      );
    }

    // 获取论文数据
    const paper = await prisma.generatedPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      );
    }

    // 使用 Puppeteer 生成 PDF
    const { chromium } = require('playwright');

    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    // 创建 HTML 内容
    const htmlContent = generateHTML(paper);

    // 设置内容并生成 PDF
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '20mm',
        right: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    // 返回 PDF 文件
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${paper.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

/**
 * 生成 HTML 内容
 */
function generateHTML(paper: any): string {
  return `
<!DOCTYPE html>
<html lang="${paper.language === 'CHINESE' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(paper.title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${paper.language === 'CHINESE'
        ? '"Microsoft YaHei", "微软雅黑", "SimSun", "宋体", sans-serif'
        : '"Times New Roman", serif'
      };
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }

    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }

    h1 {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20pt;
      page-break-after: avoid;
    }

    h2 {
      font-size: 16pt;
      font-weight: bold;
      margin-top: 20pt;
      margin-bottom: 10pt;
      page-break-after: avoid;
    }

    h3 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 15pt;
      margin-bottom: 8pt;
      page-break-after: avoid;
    }

    h4 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 12pt;
      text-align: justify;
    }

    .metadata {
      font-size: 10pt;
      text-align: center;
      margin-bottom: 20pt;
      color: #666;
    }

    .section {
      margin-bottom: 15pt;
      page-break-inside: avoid;
    }

    pre, code {
      font-family: 'Courier New', monospace;
      background: #f5f5f5;
      padding: 2px 4px;
      border-radius: 3px;
    }

    pre {
      padding: 10pt;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15pt 0;
      page-break-inside: avoid;
    }

    table th,
    table td {
      border: 1px solid #ddd;
      padding: 8pt;
      text-align: left;
    }

    table th {
      background: #f5f5f5;
      font-weight: bold;
    }

    .katex {
      font-size: 1em;
    }

    .katex-display {
      margin: 1em 0;
      overflow-x: auto;
      overflow-y: hidden;
    }

    @page {
      size: A4;
      margin: 20mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(paper.title)}</h1>

    <div class="metadata">
      ${paper.language === 'CHINESE'
        ? `格式: ${paper.format || 'MCM'}  |  语言: 中文  |  字数: ${paper.wordCount || 0}`
        : `Format: ${paper.format || 'MCM'}  |  Language: English  |  Word Count: ${paper.wordCount || 0}`
      }
    </div>

    <div class="content">
      ${renderMarkdown(paper.content, paper.language)}
    </div>
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: "$$", right: "$$", display: true},
          {left: "$", right: "$", display: false}
        ],
        throwOnError: false
      });
    });
  </script>
</body>
</html>
  `.trim();
}

/**
 * 渲染 Markdown 为 HTML
 */
function renderMarkdown(content: string, language: string): string {
  // 简单的 Markdown 解析
  const lines = content.split('\n');
  let html = '';
  let inList = false;
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 代码块
    if (line.startsWith('```')) {
      inCode = !inCode;
      if (inCode) {
        html += '<pre><code>';
      } else {
        html += '</code></pre>';
      }
      continue;
    }

    if (inCode) {
      html += escapeHtml(line) + '\n';
      continue;
    }

    // 标题
    if (line.startsWith('# ')) {
      html += `<h1>${escapeHtml(line.slice(2))}</h1>\n`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${escapeHtml(line.slice(3))}</h2>\n`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${escapeHtml(line.slice(4))}</h3>\n`;
    } else if (line.startsWith('#### ')) {
      html += `<h4>${escapeHtml(line.slice(5))}</h4>\n`;
    }
    // 列表
    else if (line.startsWith('- ') || line.match(/^\d+\.\s/)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      html += `<li>${escapeHtml(line.replace(/^[-\d.]\s+/, ''))}</li>\n`;
    }
    // 空行
    else if (line.trim() === '') {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += '<br>\n';
    }
    // 普通段落
    else if (line.trim()) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<p>${escapeHtml(line)}</p>\n`;
    }
  }

  if (inList) {
    html += '</ul>\n';
  }

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
