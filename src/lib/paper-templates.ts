/**
 * 论文模板配置
 * 支持不同的论文格式和样式
 */

export interface PaperTemplate {
  id: string;
  name: string;
  description: string;
  format: 'MCM' | 'ICM' | 'CUMCM' | 'CUSTOM';
  language: 'CHINESE' | 'ENGLISH';
  sections: PaperSection[];
  styling: TemplateStyling;
}

export interface PaperSection {
  id: string;
  name: string;
  title: string;
  required: boolean;
  order: number;
  defaultContent?: string;
}

export interface TemplateStyling {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  headingStyles: {
    h1: { fontSize: number; bold: boolean };
    h2: { fontSize: number; bold: boolean };
    h3: { fontSize: number; bold: boolean };
    h4: { fontSize: number; bold: boolean };
  };
  spacing: {
    paragraph: number;
    section: number;
  };
}

/**
 * MCM/ICM 模板（英文）
 */
export const mcmTemplate: PaperTemplate = {
  id: 'mcm',
  name: 'MCM/ICM Template',
  description: 'Mathematical Contest in Modeling / Interdisciplinary Contest in Modeling standard template',
  format: 'MCM',
  language: 'ENGLISH',
  sections: [
    { id: 'summary', name: 'Summary', title: 'Summary', required: true, order: 1 },
    { id: 'keywords', name: 'Keywords', title: 'Keywords', required: true, order: 2 },
    { id: 'introduction', name: 'Introduction', title: 'Introduction', required: true, order: 3 },
    { id: 'problem-analysis', name: 'Problem Analysis', title: 'Problem Analysis', required: true, order: 4 },
    { id: 'assumptions', name: 'Assumptions', title: 'Assumptions', required: true, order: 5 },
    { id: 'model', name: 'Model', title: 'Model', required: true, order: 6 },
    { id: 'solution', name: 'Solution', title: 'Solution', required: true, order: 7 },
    { id: 'results', name: 'Results', title: 'Results', required: true, order: 8 },
    { id: 'sensitivity-analysis', name: 'Sensitivity Analysis', title: 'Sensitivity Analysis', required: false, order: 9 },
    { id: 'discussion', name: 'Discussion', title: 'Discussion', required: true, order: 10 },
    { id: 'conclusions', name: 'Conclusions', title: 'Conclusions', required: true, order: 11 },
    { id: 'references', name: 'References', title: 'References', required: true, order: 12 },
  ],
  styling: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Times New Roman',
    headingStyles: {
      h1: { fontSize: 16, bold: true },
      h2: { fontSize: 14, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 6,
      section: 12,
    },
  },
};

/**
 * CUMCM 模板（中文）
 */
export const cumcmTemplate: PaperTemplate = {
  id: 'cumcm',
  name: 'CUMCM Template',
  description: 'China Undergraduate Mathematical Contest in Modeling standard template',
  format: 'CUMCM',
  language: 'CHINESE',
  sections: [
    { id: 'summary', name: '摘要', title: '摘要', required: true, order: 1 },
    { id: 'keywords', name: '关键词', title: '关键词', required: true, order: 2 },
    { id: 'introduction', name: '问题重述与分析', title: '问题重述与分析', required: true, order: 3 },
    { id: 'assumptions', name: '模型假设', title: '模型假设', required: true, order: 4 },
    { id: 'symbols', name: '符号说明', title: '符号说明', required: true, order: 5 },
    { id: 'model', name: '模型建立', title: '模型建立', required: true, order: 6 },
    { id: 'solution', name: '模型求解', title: '模型求解', required: true, order: 7 },
    { id: 'results', name: '结果分析', title: '结果分析', required: true, order: 8 },
    { id: 'sensitivity-analysis', name: '灵敏度分析', title: '灵敏度分析', required: false, order: 9 },
    { id: 'discussion', name: '模型评价与推广', title: '模型评价与推广', required: true, order: 10 },
    { id: 'references', name: '参考文献', title: '参考文献', required: true, order: 11 },
    { id: 'appendix', name: '附录', title: '附录', required: false, order: 12 },
  ],
  styling: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: '宋体',
    headingStyles: {
      h1: { fontSize: 16, bold: true },
      h2: { fontSize: 14, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 6,
      section: 12,
    },
  },
};

/**
 * 自定义模板
 */
export const customTemplate: PaperTemplate = {
  id: 'custom',
  name: 'Custom Template',
  description: 'Custom template for specific needs',
  format: 'CUSTOM',
  language: 'ENGLISH',
  sections: [
    { id: 'title', name: 'Title', title: 'Title', required: true, order: 0 },
    { id: 'abstract', name: 'Abstract', title: 'Abstract', required: true, order: 1 },
    { id: 'introduction', name: 'Introduction', title: 'Introduction', required: true, order: 2 },
    { id: 'methodology', name: 'Methodology', title: 'Methodology', required: true, order: 3 },
    { id: 'results', name: 'Results', title: 'Results', required: true, order: 4 },
    { id: 'discussion', name: 'Discussion', title: 'Discussion', required: true, order: 5 },
    { id: 'conclusion', name: 'Conclusion', title: 'Conclusion', required: true, order: 6 },
    { id: 'references', name: 'References', title: 'References', required: true, order: 7 },
  ],
  styling: {
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: 'Arial',
    headingStyles: {
      h1: { fontSize: 18, bold: true },
      h2: { fontSize: 15, bold: true },
      h3: { fontSize: 13, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 5,
      section: 10,
    },
  },
};

/**
 * HiMCM 模板（美国高中数学建模竞赛）
 */
export const himcmTemplate: PaperTemplate = {
  id: 'himcm',
  name: 'HiMCM Template',
  description: 'High School Mathematical Contest in Modeling standard template',
  format: 'MCM',
  language: 'ENGLISH',
  sections: [
    { id: 'summary', name: 'Summary', title: 'Summary', required: true, order: 1 },
    { id: 'problem-analysis', name: 'Problem Analysis', title: 'Problem Analysis', required: true, order: 2 },
    { id: 'assumptions', name: 'Assumptions', title: 'Assumptions', required: true, order: 3 },
    { id: 'model', name: 'Model', title: 'Model', required: true, order: 4 },
    { id: 'solution', name: 'Solution', title: 'Solution', required: true, order: 5 },
    { id: 'results', name: 'Results', title: 'Results', required: true, order: 6 },
    { id: 'discussion', name: 'Discussion', title: 'Discussion', required: true, order: 7 },
    { id: 'conclusions', name: 'Conclusions', title: 'Conclusions', required: true, order: 8 },
    { id: 'references', name: 'References', title: 'References', required: true, order: 9 },
  ],
  styling: {
    fontSize: 11,
    lineHeight: 1.5,
    fontFamily: 'Times New Roman',
    headingStyles: {
      h1: { fontSize: 15, bold: true },
      h2: { fontSize: 13, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 5,
      section: 10,
    },
  },
};

/**
 * MathorCup 模板
 */
export const mathorCupTemplate: PaperTemplate = {
  id: 'mathorcup',
  name: 'MathorCup Template',
  description: 'MathorCup Global Mathematical Modeling Challenge standard template',
  format: 'CUSTOM',
  language: 'ENGLISH',
  sections: [
    { id: 'abstract', name: 'Abstract', title: 'Abstract', required: true, order: 1 },
    { id: 'keywords', name: 'Keywords', title: 'Keywords', required: true, order: 2 },
    { id: 'introduction', name: 'Introduction', title: 'Introduction', required: true, order: 3 },
    { id: 'background', name: 'Background', title: 'Background', required: true, order: 4 },
    { id: 'model', name: 'Model', title: 'Model', required: true, order: 5 },
    { id: 'analysis', name: 'Analysis', title: 'Analysis', required: true, order: 6 },
    { id: 'results', name: 'Results', title: 'Results', required: true, order: 7 },
    { id: 'evaluation', name: 'Evaluation', title: 'Evaluation', required: false, order: 8 },
    { id: 'conclusion', name: 'Conclusion', title: 'Conclusion', required: true, order: 9 },
    { id: 'references', name: 'References', title: 'References', required: true, order: 10 },
  ],
  styling: {
    fontSize: 12,
    lineHeight: 1.6,
    fontFamily: 'Times New Roman',
    headingStyles: {
      h1: { fontSize: 16, bold: true },
      h2: { fontSize: 14, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 6,
      section: 12,
    },
  },
};

/**
 * APMCM 模板（亚太杯）
 */
export const apmcmTemplate: PaperTemplate = {
  id: 'apmcm',
  name: 'APMCM Template',
  description: 'Asia-Pacific Mathematical Contest in Modeling standard template',
  format: 'CUSTOM',
  language: 'ENGLISH',
  sections: [
    { id: 'summary', name: 'Summary', title: 'Summary', required: true, order: 1 },
    { id: 'keywords', name: 'Keywords', title: 'Keywords', required: true, order: 2 },
    { id: 'introduction', name: 'Introduction', title: 'Introduction', required: true, order: 3 },
    { id: 'problem-analysis', name: 'Problem Analysis', title: 'Problem Analysis', required: true, order: 4 },
    { id: 'assumptions', name: 'Assumptions', title: 'Assumptions', required: true, order: 5 },
    { id: 'model', name: 'Model', title: 'Model', required: true, order: 6 },
    { id: 'solution', name: 'Solution', title: 'Solution', required: true, order: 7 },
    { id: 'results', name: 'Results', title: 'Results', required: true, order: 8 },
    { id: 'discussion', name: 'Discussion', title: 'Discussion', required: true, order: 9 },
    { id: 'conclusions', name: 'Conclusions', title: 'Conclusions', required: true, order: 10 },
    { id: 'references', name: 'References', title: 'References', required: true, order: 11 },
  ],
  styling: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Times New Roman',
    headingStyles: {
      h1: { fontSize: 16, bold: true },
      h2: { fontSize: 14, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 6,
      section: 12,
    },
  },
};

/**
 * 研究生数学建模竞赛模板
 */
export const gmmcmTemplate: PaperTemplate = {
  id: 'gmmcm',
  name: 'GMMCM Template',
  description: 'China Postgraduate Mathematical Contest in Modeling standard template',
  format: 'CUMCM',
  language: 'CHINESE',
  sections: [
    { id: 'summary', name: '摘要', title: '摘要', required: true, order: 1 },
    { id: 'keywords', name: '关键词', title: '关键词', required: true, order: 2 },
    { id: 'introduction', name: '问题背景与意义', title: '问题背景与意义', required: true, order: 3 },
    { id: 'problem-analysis', name: '问题分析', title: '问题分析', required: true, order: 4 },
    { id: 'assumptions', name: '模型假设', title: '模型假设', required: true, order: 5 },
    { id: 'symbols', name: '符号说明', title: '符号说明', required: true, order: 6 },
    { id: 'model', name: '模型建立', title: '模型建立', required: true, order: 7 },
    { id: 'solution', name: '模型求解', title: '模型求解', required: true, order: 8 },
    { id: 'results', name: '结果分析', title: '结果分析', required: true, order: 9 },
    { id: 'discussion', name: '模型评价与改进', title: '模型评价与改进', required: true, order: 10 },
    { id: 'references', name: '参考文献', title: '参考文献', required: true, order: 11 },
    { id: 'appendix', name: '附录', title: '附录', required: false, order: 12 },
  ],
  styling: {
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: '宋体',
    headingStyles: {
      h1: { fontSize: 16, bold: true },
      h2: { fontSize: 14, bold: true },
      h3: { fontSize: 12, bold: true },
      h4: { fontSize: 11, bold: true },
    },
    spacing: {
      paragraph: 6,
      section: 12,
    },
  },
};

/**
 * 模板预设
 */
export const paperTemplates = {
  mcm: mcmTemplate,
  cumcm: cumcmTemplate,
  custom: customTemplate,
  himcm: himcmTemplate,
  mathorcup: mathorCupTemplate,
  apmcm: apmcmTemplate,
  gmmcm: gmmcmTemplate,
};

/**
 * 获取模板
 */
export function getTemplate(templateId: string): PaperTemplate | undefined {
  return paperTemplates[templateId as keyof typeof paperTemplates];
}

/**
 * 获取所有模板列表
 */
export function getTemplateList(): PaperTemplate[] {
  return Object.values(paperTemplates);
}

/**
 * 根据格式获取推荐模板
 */
export function getRecommendedTemplate(format: 'MCM' | 'ICM' | 'CUMCM' | 'CUSTOM'): PaperTemplate {
  switch (format) {
    case 'MCM':
    case 'ICM':
      return mcmTemplate;
    case 'CUMCM':
      return cumcmTemplate;
    case 'CUSTOM':
    default:
      return customTemplate;
  }
}

/**
 * 根据模板生成论文大纲
 */
export function generatePaperOutline(template: PaperTemplate): string {
  let outline = `# ${template.name}\n\n`;
  outline += `${template.description}\n\n`;

  template.sections.forEach((section) => {
    const requiredMark = section.required ? '*' : '';
    outline += `${section.order}. ${section.title}${requiredMark}\n`;
  });

  return outline;
}

/**
 * 根据模板生成论文初始内容
 */
export function generatePaperInitialContent(template: PaperTemplate): string {
  let content = '';

  template.sections.forEach((section) => {
    const headingLevel = section.order === 1 ? '#' : '#'.repeat(Math.min(section.order, 4));
    content += `${headingLevel} ${section.title}\n\n`;

    if (section.defaultContent) {
      content += section.defaultContent + '\n\n';
    }
  });

  return content;
}

/**
 * 验证论文内容是否符合模板要求
 */
export function validatePaperAgainstTemplate(
  paperContent: string,
  template: PaperTemplate,
): { valid: boolean; missingSections: string[] } {
  const missingSections: string[] = [];

  template.sections.forEach((section) => {
    if (section.required) {
      // 简单检查：查找标题
      const regex = new RegExp(`^#{1,4}\\s*${section.title}`, 'm');
      if (!regex.test(paperContent)) {
        missingSections.push(section.title);
      }
    }
  });

  return {
    valid: missingSections.length === 0,
    missingSections,
  };
}

/**
 * 创建自定义模板
 */
export function createCustomTemplate(
  name: string,
  description: string,
  language: 'CHINESE' | 'ENGLISH',
  sections: Array<{ title: string; required: boolean; order: number }>,
): PaperTemplate {
  return {
    id: `custom_${Date.now()}`,
    name,
    description,
    format: 'CUSTOM',
    language,
    sections: sections.map((section, index) => ({
      id: `section_${index}`,
      name: section.title,
      title: section.title,
      required: section.required,
      order: section.order,
    })),
    styling: language === 'CHINESE'
      ? {
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: '宋体',
          headingStyles: {
            h1: { fontSize: 16, bold: true },
            h2: { fontSize: 14, bold: true },
            h3: { fontSize: 12, bold: true },
            h4: { fontSize: 11, bold: true },
          },
          spacing: {
            paragraph: 6,
            section: 12,
          },
        }
      : {
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: 'Times New Roman',
          headingStyles: {
            h1: { fontSize: 16, bold: true },
            h2: { fontSize: 14, bold: true },
            h3: { fontSize: 12, bold: true },
            h4: { fontSize: 11, bold: true },
          },
          spacing: {
            paragraph: 6,
            section: 12,
          },
        },
  };
}
