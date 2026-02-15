/**
 * LaTeX 公式样式配置
 * 使用 KaTeX 的自定义样式功能
 */

export interface LatexStyleConfig {
  // 字体大小
  fontSize?: string | number;

  // 颜色
  color?: string;

  // 字体
  fontFamily?: string;

  // 行内公式样式
  inlineStyle?: {
    fontSize?: string | number;
    color?: string;
    padding?: string;
  };

  // 块级公式样式
  blockStyle?: {
    fontSize?: string | number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    margin?: string;
  };

  // KaTeX 配置选项
  katexConfig?: {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
  };
}

/**
 * 默认 LaTeX 样式配置
 */
export const defaultLatexStyle: LatexStyleConfig = {
  fontSize: '1rem',
  color: '#000000',
  fontFamily: 'Times New Roman, serif',
  inlineStyle: {
    fontSize: '1rem',
    color: '#000000',
    padding: '0 2px',
  },
  blockStyle: {
    fontSize: '1.1rem',
    color: '#000000',
    textAlign: 'center',
    margin: '16px 0',
  },
  katexConfig: {
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    macros: {
      // 自定义宏
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
    },
  },
};

/**
 * 数学建模常用样式
 */
export const mathModelingStyle: LatexStyleConfig = {
  fontSize: '1rem',
  color: '#000000',
  fontFamily: 'Times New Roman, serif',
  inlineStyle: {
    fontSize: '1rem',
    color: '#000000',
    padding: '0 2px',
  },
  blockStyle: {
    fontSize: '1.15rem',
    color: '#000000',
    textAlign: 'center',
    margin: '20px 0',
  },
  katexConfig: {
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    macros: {
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
      // 数学建模常用宏
      '\\argmax': '\\operatorname{argmax}',
      '\\argmin': '\\operatorname{argmin}',
      '\\max': '\\operatorname{max}',
      '\\min': '\\operatorname{min}',
      '\\sup': '\\operatorname{sup}',
      '\\inf': '\\operatorname{inf}',
      '\\lim': '\\operatorname{lim}',
      '\\limsup': '\\operatorname{limsup}',
      '\\liminf': '\\operatorname{liminf}',
      '\\partial': '\\partial',
      '\\nabla': '\\nabla',
      '\\Delta': '\\Delta',
      '\\sum': '\\sum',
      '\\prod': '\\prod',
      '\\int': '\\int',
      '\\oint': '\\oint',
    },
  },
};

/**
 * 学术论文样式
 */
export const academicPaperStyle: LatexStyleConfig = {
  fontSize: '1.1rem',
  color: '#000000',
  fontFamily: 'Times New Roman, serif',
  inlineStyle: {
    fontSize: '1.1rem',
    color: '#000000',
    padding: '0 2px',
  },
  blockStyle: {
    fontSize: '1.2rem',
    color: '#000000',
    textAlign: 'center',
    margin: '24px 0',
  },
  katexConfig: {
    displayMode: false,
    throwOnError: false,
    errorColor: '#cc0000',
    macros: {
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
      '\\argmax': '\\operatorname{argmax}',
      '\\argmin': '\\operatorname{argmin}',
      '\\max': '\\operatorname{max}',
      '\\min': '\\operatorname{min}',
      '\\sup': '\\operatorname{sup}',
      '\\inf': '\\operatorname{inf}',
      '\\lim': '\\operatorname{lim}',
      '\\limsup': '\\operatorname{limsup}',
      '\\liminf': '\\operatorname{liminf}',
      '\\partial': '\\partial',
      '\\nabla': '\\nabla',
      '\\Delta': '\\Delta',
      '\\sum': '\\sum',
      '\\prod': '\\prod',
      '\\int': '\\int',
      '\\oint': '\\oint',
      '\\leq': '\\leq',
      '\\geq': '\\geq',
      '\\neq': '\\neq',
      '\\approx': '\\approx',
      '\\equiv': '\\equiv',
      '\\Rightarrow': '\\Rightarrow',
      '\\Leftrightarrow': '\\Leftrightarrow',
    },
  },
};

/**
 * 深色主题样式
 */
export const darkThemeStyle: LatexStyleConfig = {
  fontSize: '1rem',
  color: '#e0e0e0',
  fontFamily: 'Times New Roman, serif',
  inlineStyle: {
    fontSize: '1rem',
    color: '#e0e0e0',
    padding: '0 2px',
  },
  blockStyle: {
    fontSize: '1.1rem',
    color: '#e0e0e0',
    textAlign: 'center',
    margin: '16px 0',
  },
  katexConfig: {
    displayMode: false,
    throwOnError: false,
    errorColor: '#ff6b6b',
    macros: {
      '\\N': '\\mathbb{N}',
      '\\Z': '\\mathbb{Z}',
      '\\Q': '\\mathbb{Q}',
      '\\R': '\\mathbb{R}',
      '\\C': '\\mathbb{C}',
    },
  },
};

/**
 * 样式预设
 */
export const latexStylePresets = {
  default: defaultLatexStyle,
  mathModeling: mathModelingStyle,
  academicPaper: academicPaperStyle,
  darkTheme: darkThemeStyle,
};

/**
 * 获取 LaTeX 样式
 */
export function getLatexStyle(styleName: keyof typeof latexStylePresets | LatexStyleConfig): LatexStyleConfig {
  if (typeof styleName === 'string' && styleName in latexStylePresets) {
    return latexStylePresets[styleName];
  }
  return styleName as LatexStyleConfig;
}

/**
 * 合并样式配置
 */
export function mergeLatexStyles(base: LatexStyleConfig, override: Partial<LatexStyleConfig>): LatexStyleConfig {
  return {
    ...base,
    ...override,
    inlineStyle: { ...base.inlineStyle, ...override.inlineStyle },
    blockStyle: { ...base.blockStyle, ...override.blockStyle },
    katexConfig: { ...base.katexConfig, ...override.katexConfig },
  };
}
