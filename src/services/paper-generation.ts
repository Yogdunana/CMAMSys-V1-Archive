/**
 * 论文生成服务
 * 基于讨论结果、代码和可视化生成符合竞赛格式的完整论文
 */

import { PaperFormat, PaperLanguage, PaperStatus } from '@prisma/client';
import prisma from '@/lib/prisma';

/**
 * 生成论文
 */
export async function generatePaper(
  autoTaskId: string,
  discussionId: string,
  discussionSummary: any,
  codeExecutionResult: any,
  format: PaperFormat = PaperFormat.MCM,
  language: PaperLanguage = PaperLanguage.ENGLISH
) {
  try {
    // 构建论文生成 Prompt
    const prompt = buildPaperPrompt(
      discussionSummary,
      codeExecutionResult,
      format,
      language
    );

    // 调用 AI 生成论文
    // TODO: 实现实际的 AI API 调用
    const paperContent = await generatePaperContentWithAI(prompt, format, language);

    // 创建论文记录
    const paper = await prisma.generatedPaper.create({
      data: {
        autoTaskId,
        discussionId,
        title: getPaperTitle(discussionSummary, format, language),
        content: paperContent.content,
        format,
        language,
        sections: paperContent.sections,
        wordCount: paperContent.wordCount,
        status: PaperStatus.DRAFT,
      },
    });

    return paper;
  } catch (error) {
    console.error('Error generating paper:', error);
    throw error;
  }
}

/**
 * 构建论文生成 Prompt
 */
function buildPaperPrompt(
  discussionSummary: any,
  codeExecutionResult: any,
  format: PaperFormat,
  language: PaperLanguage
) {
  const formatName = format === PaperFormat.MCM ? '美赛（MCM）' : '国赛（CUMCM）';
  const languageName = language === PaperLanguage.ENGLISH ? '英文' : '中文';

  return `
你是数学建模竞赛论文写作专家。请基于以下信息，生成符合 ${formatName} 格式的 ${languageName} 完整论文。

解题思路总结：
========================
核心算法：${discussionSummary.consensus?.mainAlgorithm || ''}
创新点：${discussionSummary.consensus?.keyInnovations || ''}
其他算法：${discussionSummary.coreAlgorithms?.map((a: any) => a.content).join('\n') || ''}
分歧点：${discussionSummary.disagreements?.map((d: any) => d.content).join('\n') || ''}
========================

代码执行结果：
========================
${codeExecutionResult.output || '执行成功'}
========================

论文格式要求：
========================
1. 竞赛格式：${formatName}
2. 语言：${languageName}
3. 页面设置：
   - 美赛：单栏、1.5倍行距、Times New Roman 12号字体
   - 国赛：双栏、单倍行距、宋体小四号字体

4. 论文结构（必须包含以下部分）：
   - 摘要（Abstract）
   - 问题重述（Problem Restatement）
   - 问题分析（Problem Analysis）
   - 模型假设（Model Assumptions）
   - 符号说明（Notation）
   - 模型建立（Model Establishment）
   - 模型求解（Model Solution）
   - 结果分析（Result Analysis）
   - 灵敏度分析（Sensitivity Analysis）
   - 模型评价（Model Evaluation）
   - 参考文献（References）
   - 附录（Appendix）

5. 写作要求：
   - 使用专业的数学建模术语
   - 公式使用 LaTeX 格式
   - 图表编号规范（图1、表1）
   - 逻辑清晰，层次分明
   - 语言简练，避免冗长

6. 特殊要求：
   - 摘要长度：200-300词（英文）/ 300-400字（中文）
   - 正文总字数：8000-12000词（英文）/ 12000-18000字（中文）
   - 参考文献格式：APA 格式

请生成完整的论文，确保格式规范、内容完整、逻辑清晰。
`;
}

/**
 * 调用 AI 生成论文内容
 */
async function generatePaperContentWithAI(
  prompt: string,
  format: PaperFormat,
  language: PaperLanguage
) {
  // TODO: 实现实际的 AI API 调用
  // 这里需要调用写作能力强的 AI Provider

  const title = getPaperTitle(null, format, language);

  return {
    content: `
${language === PaperLanguage.ENGLISH ? 'Abstract' : '摘要'}
========================
${language === PaperLanguage.ENGLISH
  ? 'This paper presents a comprehensive solution to the mathematical modeling problem using [Core Algorithm]. We propose [Innovations] and demonstrate their effectiveness through extensive numerical experiments. The model achieves [Key Results] and shows superior performance compared to traditional methods.'
  : '本文针对数学建模问题，提出了基于[核心算法]的综合解决方案。我们提出了[创新点]，并通过大量数值实验验证了其有效性。该模型实现了[关键结果]，与传统方法相比表现出优越的性能。'}

Keywords: Mathematical Modeling, ${format === PaperFormat.MCM ? 'MCM' : 'CUMCM'}, [Core Algorithm], [Innovation 1], [Innovation 2]

${language === PaperLanguage.ENGLISH ? '1. Problem Restatement' : '1. 问题重述'}
========================
${language === PaperLanguage.ENGLISH
  ? 'In this paper, we address the mathematical modeling problem described in the competition. The problem requires us to...'
  : '本文主要解决竞赛中描述的数学建模问题。该问题要求我们...'}

${language === PaperLanguage.ENGLISH ? '2. Problem Analysis' : '2. 问题分析'}
========================
${language === PaperLanguage.ENGLISH
  ? 'After carefully analyzing the problem, we identify the key challenges as follows...'
  : '经过仔细分析问题，我们确定的关键挑战如下...'}

${language === PaperLanguage.ENGLISH ? '3. Model Assumptions' : '3. 模型假设'}
========================
1. ${language === PaperLanguage.ENGLISH ? 'Assumption 1' : '假设1'}
2. ${language === PaperLanguage.ENGLISH ? 'Assumption 2' : '假设2'}
3. ${language === PaperLanguage.ENGLISH ? 'Assumption 3' : '假设3'}

${language === PaperLanguage.ENGLISH ? '4. Notation' : '4. 符号说明'}
========================
$x$: ${language === PaperLanguage.ENGLISH ? 'Variable description' : '变量描述'}
$y$: ${language === PaperLanguage.ENGLISH ? 'Variable description' : '变量描述'}
$\\alpha$: ${language === PaperLanguage.ENGLISH ? 'Parameter description' : '参数描述'}

${language === PaperLanguage.ENGLISH ? '5. Model Establishment' : '5. 模型建立'}
========================
${language === PaperLanguage.ENGLISH
  ? 'Based on the problem analysis, we establish the following mathematical model...'
  : '基于问题分析，我们建立如下数学模型...'}

Equation 1: $f(x) = \\alpha x^2 + \\beta x + \\gamma$

${language === PaperLanguage.ENGLISH ? '6. Model Solution' : '6. 模型求解'}
========================
${language === PaperLanguage.ENGLISH
  ? 'We solve the model using [Core Algorithm]...'
  : '我们使用[核心算法]求解模型...'}

${language === PaperLanguage.ENGLISH ? '7. Result Analysis' : '7. 结果分析'}
========================
${language === PaperLanguage.ENGLISH
  ? 'The experimental results show that...'
  : '实验结果表明...'}

${language === PaperLanguage.ENGLISH ? '8. Sensitivity Analysis' : '8. 灵敏度分析'}
========================
${language === PaperLanguage.ENGLISH
  ? 'We perform sensitivity analysis on key parameters...'
  : '我们对关键参数进行灵敏度分析...'}

${language === PaperLanguage.ENGLISH ? '9. Model Evaluation' : '9. 模型评价'}
========================
${language === PaperLanguage.ENGLISH
  ? 'The proposed model has the following advantages...'
  : '所提出的模型具有以下优势...'}

${language === PaperLanguage.ENGLISH ? 'References' : '参考文献'}
========================
[1] ${language === PaperLanguage.ENGLISH ? 'Author, A. A., & Author, B. B. (2023). Title of article. Journal Name, 1(1), 1-10.' : '作者, A. A., & 作者, B. B. (2023). 文章标题. 期刊名称, 1(1), 1-10.'}
[2] ${language === PaperLanguage.ENGLISH ? 'Author, C. C. (2022). Book Title. Publisher.' : '作者, C. C. (2022). 书名. 出版社.'}

${language === PaperLanguage.ENGLISH ? 'Appendix' : '附录'}
========================
Appendix A: ${language === PaperLanguage.ENGLISH ? 'Complete Code' : '完整代码'}
Appendix B: ${language === PaperLanguage.ENGLISH ? 'Additional Results' : '额外结果'}
`.trim(),
    sections: [
      'Abstract',
      'Problem Restatement',
      'Problem Analysis',
      'Model Assumptions',
      'Notation',
      'Model Establishment',
      'Model Solution',
      'Result Analysis',
      'Sensitivity Analysis',
      'Model Evaluation',
      'References',
      'Appendix',
    ],
    wordCount: 1000,
  };
}

/**
 * 获取论文标题
 */
function getPaperTitle(
  discussionSummary: any,
  format: PaperFormat,
  language: PaperLanguage
) {
  if (language === PaperLanguage.ENGLISH) {
    return format === PaperFormat.MCM
      ? 'Mathematical Modeling Competition Paper'
      : 'China Undergraduate Mathematical Contest in Modeling Paper';
  } else {
    return format === PaperFormat.MCM
      ? '美国大学生数学建模竞赛论文'
      : '全国大学生数学建模竞赛论文';
  }
}
