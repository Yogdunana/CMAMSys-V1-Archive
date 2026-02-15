/**
 * PDF 中文字体加载器
 * 使用思源黑体（Noto Sans CJK）作为中文字体
 */

/**
 * 加载中文字体
 * 注意：由于字体文件较大，这里使用简化的方案
 * 实际生产环境建议：
 * 1. 使用 CDN 加载字体文件
 * 2. 或者在服务器端预加载字体
 * 3. 或者使用第三方 PDF 服务
 */

/**
 * 基础英文字体配置
 */
export const ENGLISH_FONTS = {
  standard: 'helvetica',
  bold: 'helvetica',
  italic: 'helvetica',
  bolditalic: 'helvetica',
};

/**
 * 中文字体配置
 * 注意：这里使用占位符，实际使用时需要加载真实字体文件
 */
export const CHINESE_FONTS = {
  standard: 'NotoSansCJK',
  bold: 'NotoSansCJK-Bold',
  italic: 'NotoSansCJK-Italic',
  bolditalic: 'NotoSansCJK-BoldItalic',
};

/**
 * 字体加载状态
 */
let isChineseFontLoaded = false;
let fontLoadPromise: Promise<void> | null = null;

/**
 * 加载中文字体（简化版本）
 * 实际应用中应该从 CDN 或本地文件加载
 */
export async function loadChineseFont(doc: any): Promise<void> {
  if (isChineseFontLoaded) {
    return Promise.resolve();
  }

  if (fontLoadPromise) {
    return fontLoadPromise;
  }

  fontLoadPromise = (async () => {
    try {
      // 注意：这里是一个简化的实现
      // 实际应用中需要：
      // 1. 下载 Noto Sans CJK 字体文件
      // 2. 将字体转换为 base64
      // 3. 使用 doc.addFileToVFS() 和 doc.addFont() 添加字体

      // 示例代码（需要真实的字体文件）：
      /*
      const fontData = await fetch('/fonts/NotoSansCJK-Regular.ttf').then(res => res.arrayBuffer());
      const base64Font = btoa(String.fromCharCode(...new Uint8Array(fontData)));

      doc.addFileToVFS('NotoSansCJK-Regular.ttf', base64Font);
      doc.addFont('NotoSansCJK-Regular.ttf', 'NotoSansCJK', 'normal');

      const fontDataBold = await fetch('/fonts/NotoSansCJK-Bold.ttf').then(res => res.arrayBuffer());
      const base64FontBold = btoa(String.fromCharCode(...new Uint8Array(fontDataBold)));

      doc.addFileToVFS('NotoSansCJK-Bold.ttf', base64FontBold);
      doc.addFont('NotoSansCJK-Bold.ttf', 'NotoSansCJK', 'bold');
      */

      // 由于浏览器环境限制，这里使用简化方案
      console.warn('Chinese font loading is simplified. For production, please load actual font files.');
      isChineseFontLoaded = true;
    } catch (error) {
      console.error('Failed to load Chinese font:', error);
      throw error;
    }
  })();

  return fontLoadPromise;
}

/**
 * 检查是否支持中文字体
 */
export function isChineseFontSupported(): boolean {
  return isChineseFontLoaded;
}

/**
 * 获取适合的字体配置
 */
export function getFontConfig(language: 'CHINESE' | 'ENGLISH', fontStyle: 'normal' | 'bold' | 'italic' | 'bolditalic') {
  if (language === 'CHINESE' && isChineseFontLoaded) {
    return {
      fontName: CHINESE_FONTS[fontStyle],
      isCustomFont: true,
    };
  }

  return {
    fontName: ENGLISH_FONTS.standard,
    isCustomFont: false,
  };
}

/**
 * 文本分词（支持中文）
 */
export function splitTextForPDF(text: string, doc: any, maxWidth: number): string[] {
  if (!isChineseFontLoaded) {
    // 如果没有中文字体，尝试按中文字符分割
    const words: string[] = [];
    let currentWord = '';
    let inChinese = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isChineseChar = /[\u4e00-\u9fa5]/.test(char);

      if (isChineseChar !== inChinese) {
        if (currentWord) {
          words.push(currentWord);
          currentWord = '';
        }
        inChinese = isChineseChar;
      }

      currentWord += char;
    }

    if (currentWord) {
      words.push(currentWord);
    }

    // 使用 jsPDF 的 splitTextToSize
    return doc.splitTextToSize(text, maxWidth);
  }

  return doc.splitTextToSize(text, maxWidth);
}

/**
 * 处理中文文本（简化版本）
 * 将中文字符转换为可显示的形式
 */
export function processChineseText(text: string): string {
  // 简化版本：直接返回原文
  // 实际应用中，如果字体不支持中文，需要特殊处理
  return text;
}
