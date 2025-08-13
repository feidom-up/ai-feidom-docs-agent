import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

interface DocumentContent {
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  metadata: {
    url: string;
    wordCount: number;
    lastModified?: string;
  };
}

export const docsTool = createTool({
  id: 'analyze-document',
  description: 'Analyze and summarize document content from a URL',
  inputSchema: z.object({
    url: z.string().describe('Document URL to analyze'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    summary: z.string(),
    keyPoints: z.array(z.string()),
    metadata: z.object({
      url: z.string(),
      wordCount: z.number(),
      lastModified: z.string().optional(),
    }),
  }),
  execute: async ({ context }) => {
    return await analyzeDocument(context.url);
  },
});

const analyzeDocument = async (url: string): Promise<DocumentContent> => {
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