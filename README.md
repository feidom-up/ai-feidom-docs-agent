# AI Feidom Docs Agent

一个基于 Mastra 框架的 AI 文档分析代理，部署到 Cloudflare Workers。

## 🚀 部署

本项目通过 Cloudflare Workers admin portal 进行 GitHub 自动化 CI/CD 部署。

### 部署步骤

1. **连接 GitHub 仓库**
   - 在 [Cloudflare Workers 控制台](https://dash.cloudflare.com/) 创建新项目
   - 连接你的 GitHub 仓库

2. **配置构建设置**
   - **构建命令**: `npm run build`
   - **输出目录**: `.mastra/output`
   - **入口文件**: `src/worker.js`

3. **设置环境变量**
   - `OPENAI_API_KEY`: OpenAI API 密钥
   - `NODE_ENV`: `production`

4. **自动部署**
   - 推送到 GitHub 主分支自动触发部署

## 📁 项目结构

```
ai-feidom-docs-agent/
├── src/
│   ├── worker.js           # Cloudflare Workers 入口文件
│   └── mastra/
│       ├── agents/         # AI 代理
│       ├── tools/          # 工具
│       ├── workflows/      # 工作流
│       └── index.ts        # Mastra 配置
├── wrangler.toml          # Cloudflare Workers 配置
└── package.json           # 项目依赖
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
2. Cloudflare Workers 控制台日志

## 📚 更多信息

- [Mastra 文档](https://mastra.ai/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/) 