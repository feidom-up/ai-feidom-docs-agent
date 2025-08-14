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
   - **入口文件**: `.mastra/output/index.mjs`

3. **设置环境变量**
   - `OPENAI_API_KEY`: OpenAI API 密钥
   - `NODE_ENV`: `production`

4. **自动部署**
   - 推送到 GitHub 主分支自动触发部署

## 📁 项目结构

```
ai-feidom-docs-agent/
├── src/
│   └── mastra/
│       ├── agents/         # AI 代理 (docsAgent, weatherAgent)
│       ├── tools/          # 工具
│       ├── workflows/      # 工作流 (docsWorkflow, weatherWorkflow)
│       └── index.ts        # Mastra 配置
├── .mastra/output/        # 构建输出目录
└── package.json           # 项目依赖
```

## 🌐 访问服务

部署成功后，你的服务将在以下地址可用：
- `https://wf-bond.us`

## 📝 使用说明

### API 路径概览

#### 基础 API
- `GET /api` - API 状态检查

#### 代理 API
- `GET /api/agents` - 获取所有代理
- `GET /api/agents/{agentId}` - 获取特定代理
- `POST /api/agents/{agentId}/generate` - 执行代理
- `POST /api/agents/{agentId}/stream` - 流式执行代理

#### 工作流 API
- `GET /api/workflows` - 获取所有工作流
- `GET /api/workflows/{workflowId}` - 获取特定工作流
- `POST /api/workflows/{workflowId}/start` - 启动工作流
- `POST /api/workflows/{workflowId}/stream` - 流式执行工作流

#### 工具 API
- `GET /api/tools` - 获取所有工具
- `GET /api/tools/{toolId}` - 获取特定工具
- `POST /api/tools/{toolId}/execute` - 执行工具

### 使用示例

#### API 状态检查
```bash
curl https://wf-bond.us/api
```

#### 运行工作流
```bash
# 启动文档工作流
curl -X POST https://wf-bond.us/api/workflows/docsWorkflow/start \
  -H "Content-Type: application/json" \
  -d '{"input": {"url": "https://example.com"}}'

# 启动天气工作流
curl -X POST https://wf-bond.us/api/workflows/weatherWorkflow/start \
  -H "Content-Type: application/json" \
  -d '{"input": {"location": "Beijing"}}'
```

#### 运行代理
```bash
# 执行文档代理
curl -X POST https://wf-bond.us/api/agents/docsAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "Hello"}}'

# 执行天气代理
curl -X POST https://wf-bond.us/api/agents/weatherAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "What is the weather?"}}'
```

## 🔍 故障排除

如果遇到问题，请查看：
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署说明
2. Cloudflare Workers 控制台日志

## 📚 更多信息

- [Mastra 文档](https://mastra.ai/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/) 