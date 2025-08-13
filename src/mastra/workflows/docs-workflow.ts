import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const documentAnalysisSchema = z.object({
  url: z.string(),
  title: z.string(),
  content: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  metadata: z.object({
    url: z.string(),
    wordCount: z.number(),
    lastModified: z.string().optional(),
  }),
});

const solutionSchema = z.object({
  analysis: z.string(),
  recommendations: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

const analyzeDocument = createStep({
  id: 'analyze-document',
  description: 'Analyzes document content from a URL',
  inputSchema: z.object({
    url: z.string().describe('The document URL to analyze'),
  }),
  outputSchema: documentAnalysisSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    // 直接调用文档分析函数
    const documentData = await getDocumentData(inputData.url);

    return {
      url: inputData.url,
      title: documentData.title,
      content: documentData.content,
      summary: documentData.summary,
      keyPoints: documentData.keyPoints,
      metadata: documentData.metadata,
    };
  },
});

// 文档分析函数
const getDocumentData = async (url: string) => {
  try {
    // 获取文档内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // 简单的HTML解析，提取文本内容
    const textContent = extractTextFromHTML(html);
    const title = extractTitleFromHTML(html) || 'Untitled Document';
    
    // 计算字数
    const wordCount = textContent.split(/\s+/).length;
    
    // 生成摘要和关键点
    const summary = generateSummary(textContent);
    const keyPoints = extractKeyPoints(textContent);
    
    return {
      title,
      content: textContent,
      summary,
      keyPoints,
      metadata: {
        url,
        wordCount,
        lastModified: response.headers.get('last-modified') || undefined,
      },
    };
  } catch (error) {
    throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const extractTextFromHTML = (html: string): string => {
  // 移除HTML标签，保留文本内容
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 移除script标签
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 移除style标签
    .replace(/<[^>]+>/g, ' ') // 移除其他HTML标签
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim();
  
  return text;
};

const extractTitleFromHTML = (html: string): string | null => {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : null;
};

const generateSummary = (text: string): string => {
  // 简单的摘要生成：取前200个字符
  const maxLength = 200;
  if (text.length <= maxLength) {
    return text;
  }
  
  const summary = text.substring(0, maxLength);
  const lastSpace = summary.lastIndexOf(' ');
  return summary.substring(0, lastSpace) + '...';
};

const extractKeyPoints = (text: string): string[] => {
  // 简单的关键点提取：基于句子长度和关键词
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  const keyPoints: string[] = [];
  
  // 选择较长的句子作为关键点
  const sortedSentences = sentences
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);
  
  for (const sentence of sortedSentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20) {
      keyPoints.push(trimmed);
    }
  }
  
  return keyPoints;
};

const generateSolution = createStep({
  id: 'generate-solution',
  description: 'Generates solutions and recommendations based on document analysis',
  inputSchema: documentAnalysisSchema,
  outputSchema: solutionSchema,
  execute: async ({ inputData, mastra }) => {
    const documentData = inputData;

    if (!documentData) {
      throw new Error('Document data not found');
    }

    const agent = mastra?.getAgent('docsAgent');
    if (!agent) {
      throw new Error('Document agent not found');
    }

    const prompt = `Based on the following document analysis, please provide a comprehensive solution and recommendations:

📄 DOCUMENT ANALYSIS
Title: ${documentData.title}
URL: ${documentData.metadata.url}
Word Count: ${documentData.metadata.wordCount}
${documentData.metadata.lastModified ? `Last Modified: ${documentData.metadata.lastModified}` : ''}

📋 SUMMARY
${documentData.summary}

🔑 KEY POINTS
${documentData.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

📝 CONTENT PREVIEW
${documentData.content.substring(0, 500)}${documentData.content.length > 500 ? '...' : ''}

Please provide your analysis in the following format:

## 📊 DOCUMENT ANALYSIS
[Provide a comprehensive analysis of the document content, highlighting main themes, important information, and any notable insights]

## 💡 KEY INSIGHTS
[Extract and explain the most important insights from the document]

## 🎯 RECOMMENDATIONS
[Provide 3-5 actionable recommendations based on the document content]

## 🚀 NEXT STEPS
[Suggest 2-3 specific next steps or actions the user should consider]

## ⚠️ CONSIDERATIONS
[Note any important considerations, limitations, or caveats about the document or your analysis]

Guidelines:
- Be specific and actionable in your recommendations
- Consider the document's context and purpose
- If the document is technical, explain concepts clearly
- Provide practical, implementable suggestions
- Highlight any potential challenges or opportunities
- Keep the analysis balanced and objective`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let solutionText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      solutionText += chunk;
    }

    // 解析响应以提取结构化的建议和下一步
    const recommendations = extractRecommendations(solutionText);
    const nextSteps = extractNextSteps(solutionText);

    return {
      analysis: solutionText,
      recommendations,
      nextSteps,
    };
  },
});

const extractRecommendations = (text: string): string[] => {
  const recommendations: string[] = [];
  const lines = text.split('\n');
  let inRecommendations = false;

  for (const line of lines) {
    if (line.includes('RECOMMENDATIONS') || line.includes('💡')) {
      inRecommendations = true;
      continue;
    }
    if (inRecommendations && (line.includes('NEXT STEPS') || line.includes('🚀'))) {
      break;
    }
    if (inRecommendations && line.trim().match(/^\d+\./)) {
      recommendations.push(line.trim());
    }
  }

  return recommendations.length > 0 ? recommendations : ['Review the document thoroughly', 'Consider the key insights provided', 'Implement relevant recommendations'];
};

const extractNextSteps = (text: string): string[] => {
  const nextSteps: string[] = [];
  const lines = text.split('\n');
  let inNextSteps = false;

  for (const line of lines) {
    if (line.includes('NEXT STEPS') || line.includes('🚀')) {
      inNextSteps = true;
      continue;
    }
    if (inNextSteps && (line.includes('CONSIDERATIONS') || line.includes('⚠️'))) {
      break;
    }
    if (inNextSteps && line.trim().match(/^\d+\./)) {
      nextSteps.push(line.trim());
    }
  }

  return nextSteps.length > 0 ? nextSteps : ['Review the analysis provided', 'Consider implementing the recommendations', 'Follow up on any questions or concerns'];
};

const docsWorkflow = createWorkflow({
  id: 'docs-workflow',
  inputSchema: z.object({
    url: z.string().describe('The document URL to analyze'),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    recommendations: z.array(z.string()),
    nextSteps: z.array(z.string()),
  }),
})
  .then(analyzeDocument)
  .then(generateSolution);

docsWorkflow.commit();

export { docsWorkflow }; 