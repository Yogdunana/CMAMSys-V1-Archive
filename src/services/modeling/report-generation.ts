/**
 * Report Generation Module
 * Generates comprehensive mathematical modeling competition reports with LaTeX, Markdown, and PDF support
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('REPORT_GENERATION');

export interface ReportConfig {
  reportType: 'full' | 'summary' | 'technical' | 'presentation';
  format: 'markdown' | 'latex' | 'pdf' | 'html';
  includeCharts: boolean;
  includeCode: boolean;
  includeAppendices: boolean;
  language: 'en' | 'zh';
  template?: string;
  customSections?: ReportSection[];
}

export interface ReportSection {
  title: string;
  content: string;
  order: number;
  type: 'text' | 'table' | 'chart' | 'code' | 'equation' | 'image';
  metadata?: Record<string, any>;
}

export interface ModelingContext {
  projectName: string;
  problemDescription: string;
  dataDescription: string;
  methodology: string;
  assumptions: string[];
  preprocessingSteps: string[];
  modelSelection: string;
  trainingResults: any;
  evaluationResults: any;
  conclusions: string;
  references: string[];
  appendices: string[];
}

export interface GeneratedReport {
  reportId: string;
  format: string;
  content: string;
  filePath?: string;
  generatedAt: Date;
  pageCount?: number;
  wordCount?: number;
}

/**
 * Generate modeling report
 */
export async function generateReport(
  context: ModelingContext,
  config: Partial<ReportConfig> = {}
): Promise<GeneratedReport> {
  const fullConfig: ReportConfig = {
    reportType: config.reportType || 'full',
    format: config.format || 'markdown',
    includeCharts: config.includeCharts || false,
    includeCode: config.includeCode || false,
    includeAppendices: config.includeAppendices || true,
    language: config.language || 'en',
    template: config.template,
    customSections: config.customSections,
  };

  logger.info('Generating modeling report', {
    projectName: context.projectName,
    reportType: fullConfig.reportType,
    format: fullConfig.format,
  });

  try {
    let content = '';
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Generate content based on format
    switch (fullConfig.format) {
      case 'markdown':
        content = generateMarkdownReport(context, fullConfig);
        break;
      case 'latex':
        content = generateLaTeXReport(context, fullConfig);
        break;
      case 'html':
        content = generateHTMLReport(context, fullConfig);
        break;
      default:
        content = generateMarkdownReport(context, fullConfig);
    }

    // Calculate statistics
    const wordCount = content.split(/\s+/).length;
    const pageCount = Math.ceil(wordCount / 500);

    logger.info('Report generated successfully', {
      reportId,
      wordCount,
      pageCount,
    });

    return {
      reportId,
      format: fullConfig.format,
      content,
      generatedAt: new Date(),
      pageCount,
      wordCount,
    };
  } catch (error) {
    logger.error('Report generation failed', error);
    throw new Error(`Report generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(context: ModelingContext, config: ReportConfig): string {
  let md = '';

  // Title
  md += `# ${context.projectName}\n\n`;
  md += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
  md += `---\n\n`;

  // Abstract
  md += `## Abstract\n\n`;
  md += `${context.conclusions}\n\n`;
  md += `---\n\n`;

  // Problem Description
  md += `## 1. Problem Description\n\n`;
  md += `${context.problemDescription}\n\n`;

  // Data Description
  md += `## 2. Data Description\n\n`;
  md += `${context.dataDescription}\n\n`;

  // Methodology
  md += `## 3. Methodology\n\n`;
  md += `${context.methodology}\n\n`;

  // Assumptions
  md += `### 3.1 Assumptions\n\n`;
  context.assumptions.forEach((assumption, index) => {
    md += `${index + 1}. ${assumption}\n`;
  });
  md += `\n`;

  // Preprocessing
  md += `### 3.2 Data Preprocessing\n\n`;
  context.preprocessingSteps.forEach((step, index) => {
    md += `${index + 1}. ${step}\n`;
  });
  md += `\n`;

  // Model Selection
  md += `## 4. Model Selection\n\n`;
  md += `${context.modelSelection}\n\n`;

  // Results
  md += `## 5. Results\n\n`;

  if (context.trainingResults) {
    md += `### 5.1 Training Results\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    Object.entries(context.trainingResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        md += `| ${key} | ${value.toFixed(4)} |\n`;
      } else {
        md += `| ${key} | ${JSON.stringify(value)} |\n`;
      }
    });
    md += `\n`;
  }

  if (context.evaluationResults) {
    md += `### 5.2 Evaluation Results\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    Object.entries(context.evaluationResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        md += `| ${key} | ${value.toFixed(4)} |\n`;
      } else if (typeof value === 'object') {
        md += `| ${key} | ${JSON.stringify(value)} |\n`;
      }
    });
    md += `\n`;
  }

  // Conclusions
  md += `## 6. Conclusions\n\n`;
  md += `${context.conclusions}\n\n`;

  // References
  if (context.references.length > 0) {
    md += `## 7. References\n\n`;
    context.references.forEach((ref, index) => {
      md += `${index + 1}. ${ref}\n`;
    });
    md += `\n`;
  }

  // Appendices
  if (config.includeAppendices && context.appendices.length > 0) {
    md += `## 8. Appendices\n\n`;
    context.appendices.forEach((appendix, index) => {
      md += `### Appendix ${String.fromCharCode(65 + index)}\n\n`;
      md += `${appendix}\n\n`;
    });
  }

  return md;
}

/**
 * Generate LaTeX report
 */
function generateLaTeXReport(context: ModelingContext, config: ReportConfig): string {
  let latex = '';

  latex += `\\documentclass[12pt,a4paper]{article}\n`;
  latex += `\\usepackage[utf8]{inputenc}\n`;
  latex += `\\usepackage{amsmath,amssymb,amsfonts}\n`;
  latex += `\\usepackage{graphicx}\n`;
  latex += `\\usepackage{booktabs}\n`;
  latex += `\\usepackage{hyperref}\n`;
  latex += `\\usepackage{geometry}\n`;
  latex += `\\geometry{a4paper,margin=1in}\n\n`;

  latex += `\\title{${context.projectName}}\n`;
  latex += `\\author{CMAMSys}\n`;
  latex += `\\date{\\today}\n\n`;

  latex += `\\begin{document}\n\n`;
  latex += `\\maketitle\n\n`;

  // Abstract
  latex += `\\begin{abstract}\n`;
  latex += `${context.conclusions}\n`;
  latex += `\\end{abstract}\n\n`;

  // Problem Description
  latex += `\\section{Problem Description}\n`;
  latex += `${context.problemDescription}\n\n`;

  // Data Description
  latex += `\\section{Data Description}\n`;
  latex += `${context.dataDescription}\n\n`;

  // Methodology
  latex += `\\section{Methodology}\n`;
  latex += `${context.methodology}\n\n`;

  latex += `\\subsection{Assumptions}\n`;
  latex += `\\begin{enumerate}\n`;
  context.assumptions.forEach((assumption) => {
    latex += `  \\item ${assumption}\n`;
  });
  latex += `\\end{enumerate}\n\n`;

  latex += `\\subsection{Data Preprocessing}\n`;
  latex += `\\begin{enumerate}\n`;
  context.preprocessingSteps.forEach((step) => {
    latex += `  \\item ${step}\n`;
  });
  latex += `\\end{enumerate}\n\n`;

  // Model Selection
  latex += `\\section{Model Selection}\n`;
  latex += `${context.modelSelection}\n\n`;

  // Results
  latex += `\\section{Results}\n\n`;

  if (context.trainingResults) {
    latex += `\\subsection{Training Results}\n`;
    latex += `\\begin{table}[h]\n`;
    latex += `\\centering\n`;
    latex += `\\begin{tabular}{ll}\n`;
    latex += `\\toprule\n`;
    latex += `Metric & Value \\\\\n`;
    latex += `\\midrule\n`;
    Object.entries(context.trainingResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        latex += `${key} & ${value.toFixed(4)} \\\\\n`;
      } else {
        latex += `${key} & ${JSON.stringify(value)} \\\\\n`;
      }
    });
    latex += `\\bottomrule\n`;
    latex += `\\end{tabular}\n`;
    latex += `\\caption{Training Results}\n`;
    latex += `\\end{table}\n\n`;
  }

  if (context.evaluationResults) {
    latex += `\\subsection{Evaluation Results}\n`;
    latex += `\\begin{table}[h]\n`;
    latex += `\\centering\n`;
    latex += `\\begin{tabular}{ll}\n`;
    latex += `\\toprule\n`;
    latex += `Metric & Value \\\\\n`;
    latex += `\\midrule\n`;
    Object.entries(context.evaluationResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        latex += `${key} & ${value.toFixed(4)} \\\\\n`;
      } else if (typeof value === 'object') {
        latex += `${key} & ${JSON.stringify(value)} \\\\\n`;
      }
    });
    latex += `\\bottomrule\n`;
    latex += `\\end{tabular}\n`;
    latex += `\\caption{Evaluation Results}\n`;
    latex += `\\end{table}\n\n`;
  }

  // Conclusions
  latex += `\\section{Conclusions}\n`;
  latex += `${context.conclusions}\n\n`;

  // References
  if (context.references.length > 0) {
    latex += `\\section{References}\n`;
    latex += `\\begin{thebibliography}{9}\n`;
    context.references.forEach((ref, index) => {
      latex += `\\bibitem{ref${index}} ${ref}\n`;
    });
    latex += `\\end{thebibliography}\n\n`;
  }

  // Appendices
  if (config.includeAppendices && context.appendices.length > 0) {
    latex += `\\section{Appendices}\n`;
    context.appendices.forEach((appendix, index) => {
      latex += `\\subsection{Appendix ${String.fromCharCode(65 + index)}}\n`;
      latex += `${appendix}\n\n`;
    });
  }

  latex += `\\end{document}\n`;

  return latex;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(context: ModelingContext, config: ReportConfig): string {
  let html = '';

  html += `<!DOCTYPE html>\n`;
  html += `<html lang="${config.language}">\n`;
  html += `<head>\n`;
  html += `  <meta charset="UTF-8">\n`;
  html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  html += `  <title>${context.projectName}</title>\n`;
  html += `  <style>\n`;
  html += `    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }\n`;
  html += `    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }\n`;
  html += `    h2 { color: #555; margin-top: 30px; }\n`;
  html += `    h3 { color: #666; margin-top: 20px; }\n`;
  html += `    table { border-collapse: collapse; width: 100%; margin: 20px 0; }\n`;
  html += `    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n`;
  html += `    th { background-color: #f5f5f5; }\n`;
  html += `    tr:nth-child(even) { background-color: #f9f9f9; }\n`;
  html += `    .abstract { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #333; margin: 20px 0; }\n`;
  html += `    .metric { display: inline-block; margin: 10px; padding: 10px; background-color: #e7f3ff; border-radius: 5px; }\n`;
  html += `    @media print { body { max-width: 100%; } }\n`;
  html += `  </style>\n`;
  html += `</head>\n`;
  html += `<body>\n`;

  // Title
  html += `<h1>${context.projectName}</h1>\n`;
  html += `<p><em>Generated on ${new Date().toLocaleDateString()}</em></p>\n`;
  html += `<hr>\n\n`;

  // Abstract
  html += `<div class="abstract">\n`;
  html += `<h2>Abstract</h2>\n`;
  html += `<p>${context.conclusions}</p>\n`;
  html += `</div>\n\n`;

  // Problem Description
  html += `<h2>1. Problem Description</h2>\n`;
  html += `<p>${context.problemDescription}</p>\n\n`;

  // Data Description
  html += `<h2>2. Data Description</h2>\n`;
  html += `<p>${context.dataDescription}</p>\n\n`;

  // Methodology
  html += `<h2>3. Methodology</h2>\n`;
  html += `<p>${context.methodology}</p>\n\n`;

  html += `<h3>3.1 Assumptions</h3>\n`;
  html += `<ol>\n`;
  context.assumptions.forEach((assumption) => {
    html += `  <li>${assumption}</li>\n`;
  });
  html += `</ol>\n\n`;

  html += `<h3>3.2 Data Preprocessing</h3>\n`;
  html += `<ol>\n`;
  context.preprocessingSteps.forEach((step) => {
    html += `  <li>${step}</li>\n`;
  });
  html += `</ol>\n\n`;

  // Model Selection
  html += `<h2>4. Model Selection</h2>\n`;
  html += `<p>${context.modelSelection}</p>\n\n`;

  // Results
  html += `<h2>5. Results</h2>\n\n`;

  if (context.trainingResults) {
    html += `<h3>5.1 Training Results</h3>\n`;
    html += `<table>\n`;
    html += `<thead><tr><th>Metric</th><th>Value</th></tr></thead>\n`;
    html += `<tbody>\n`;
    Object.entries(context.trainingResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        html += `  <tr><td>${key}</td><td>${value.toFixed(4)}</td></tr>\n`;
      } else {
        html += `  <tr><td>${key}</td><td>${JSON.stringify(value)}</td></tr>\n`;
      }
    });
    html += `</tbody></table>\n\n`;
  }

  if (context.evaluationResults) {
    html += `<h3>5.2 Evaluation Results</h3>\n`;
    html += `<table>\n`;
    html += `<thead><tr><th>Metric</th><th>Value</th></tr></thead>\n`;
    html += `<tbody>\n`;
    Object.entries(context.evaluationResults).forEach(([key, value]) => {
      if (typeof value === 'number') {
        html += `  <tr><td>${key}</td><td>${value.toFixed(4)}</td></tr>\n`;
      } else if (typeof value === 'object') {
        html += `  <tr><td>${key}</td><td>${JSON.stringify(value)}</td></tr>\n`;
      }
    });
    html += `</tbody></table>\n\n`;
  }

  // Conclusions
  html += `<h2>6. Conclusions</h2>\n`;
  html += `<p>${context.conclusions}</p>\n\n`;

  // References
  if (context.references.length > 0) {
    html += `<h2>7. References</h2>\n`;
    html += `<ol>\n`;
    context.references.forEach((ref) => {
      html += `  <li>${ref}</li>\n`;
    });
    html += `</ol>\n\n`;
  }

  // Appendices
  if (config.includeAppendices && context.appendices.length > 0) {
    html += `<h2>8. Appendices</h2>\n`;
    context.appendices.forEach((appendix, index) => {
      html += `<h3>Appendix ${String.fromCharCode(65 + index)}</h3>\n`;
      html += `<p>${appendix}</p>\n\n`;
    });
  }

  html += `</body>\n`;
  html += `</html>\n`;

  return html;
}

/**
 * Generate report templates
 */
export function getReportTemplates(): Record<string, string> {
  return {
    full: 'Comprehensive report with all sections including appendices',
    summary: 'Condensed report focusing on key findings and conclusions',
    technical: 'Technical report with detailed methodology and results',
    presentation: 'Report optimized for presentation slides',
  };
}

/**
 * Validate report content
 */
export function validateReportContent(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!content || content.trim().length === 0) {
    errors.push('Report content is empty');
  }

  if (content.length < 100) {
    errors.push('Report content is too short (minimum 100 characters)');
  }

  // Check for required sections
  const requiredSections = ['Problem Description', 'Methodology', 'Results', 'Conclusions'];
  requiredSections.forEach((section) => {
    if (!content.includes(section)) {
      errors.push(`Missing required section: ${section}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
