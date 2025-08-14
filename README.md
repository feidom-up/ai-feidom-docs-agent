# AI Feidom Docs Agent

一个基于 Mastra 框架的 AI 文档分析代理，可以部署到 Cloudflare Worker。

## 🚀 快速部署到 Cloudflare Worker

### 方法一：使用部署脚本（推荐）

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

### 方法二：手动部署

1. **安装 Wrangler CLI**
```bash
npm install -g wrangler
```

2. **登录 Cloudflare**
```bash
wrangler login
```

3. **安装依赖**
```bash
npm install
```

4. **构建项目**
```bash
npm run build
```

5. **部署到 Cloudflare Worker**
```bash
wrangler deploy
```

## 📁 项目结构

```
ai-feidom-docs-agent/
├── src/
│   └── mastra/
│       ├── agents/          # AI 代理
│       ├── tools/           # 工具
│       ├── workflows/       # 工作流
│       └── index.ts         # Mastra 配置
├── wrangler.toml           # Cloudflare Worker 配置
├── package.json            # 项目依赖
├── deploy.sh              # 部署脚本
└── DEPLOYMENT.md          # 详细部署说明
```

## 🔧 配置

### 环境变量

如果需要设置环境变量（如 OpenAI API Key），可以使用：

```bash
wrangler secret put OPENAI_API_KEY
```

或在 `wrangler.toml` 中配置：

```toml
[vars]
OPENAI_API_KEY = "your-api-key"
```

## 🌐 访问服务

部署成功后，你的服务将在以下地址可用：
- `https://ai-feidom-docs-agent.your-subdomain.workers.dev`

## 📝 使用说明

### 健康检查
```bash
curl https://your-worker.your-subdomain.workers.dev/health
```

### 运行工作流
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/workflow \
  -H "Content-Type: application/json" \
  -d '{"workflowName": "docs-workflow", "input": {"url": "https://example.com"}}'
```

### 运行代理
```bash
curl -X POST https://your-worker.your-subdomain.workers.dev/api/agent \
  -H "Content-Type: application/json" \
  -d '{"agentName": "docsAgent", "input": {"message": "Hello"}}'
```

## 🔍 故障排除

如果遇到问题，请查看：
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署说明
2. Cloudflare Worker 控制台日志
3. 使用 `wrangler tail` 查看实时日志

## 📚 更多信息

- [Mastra 文档](https://mastra.ai/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/) 