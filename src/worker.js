// Cloudflare Workers 入口文件
import { mastra } from '../.mastra/output/mastra.mjs';
import { tools } from '../.mastra/output/tools.mjs';

// 创建 Mastra 实例
const mastraInstance = mastra({
  workflows: { 
    weatherWorkflow: tools[1], 
    docsWorkflow: tools[0] 
  },
  agents: { 
    weatherAgent: tools[1], 
    docsAgent: tools[0] 
  },
  storage: {
    url: ":memory:",
  },
  logger: {
    level: 'info'
  }
});

// Cloudflare Workers 处理器
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // 健康检查
    if (path === '/health') {
      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // API 路由 - 转发给 Mastra
    if (path.startsWith('/api/')) {
      try {
        const response = await mastraInstance.handle(request);
        
        const headers = new Headers(response.headers);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });
      } catch (error) {
        console.error('Mastra error:', error);
        return new Response(JSON.stringify({ error: 'Processing error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    }

    // 默认响应
    return new Response('Not Found', {
      status: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
}; 