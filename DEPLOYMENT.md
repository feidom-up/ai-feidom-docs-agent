# Cloudflare Workers GitHub CI/CD 部署指南

## 概述

本项目配置为通过 Cloudflare Workers admin portal 进行 GitHub 自动化 CI/CD 部署。

## 项目结构

```
ai-feidom-docs-agent/
├── src/
│   ├── worker.js          # Cloudflare Workers 入口文件
│   └── mastra/            # Mastra 应用代码
├── .mastra/output/        # Mastra 构建输出（自动生成）
├── wrangler.toml          # Cloudflare Workers 配置
└── package.json           # 项目配置
```

## 部署流程

### 1. Cloudflare Workers 控制台配置

1. 登录 [Cloudflare Workers 控制台](https://dash.cloudflare.com/)
2. 创建新的 Worker 项目
3. 连接 GitHub 仓库
4. 配置构建设置：
   - **构建命令**: `npm run build`
   - **输出目录**: `.mastra/output`
   - **入口文件**: `src/worker.js`

### 2. 环境变量配置

在 Cloudflare Workers 控制台中设置必要的环境变量：

- `OPENAI_API_KEY`: OpenAI API 密钥
- `NODE_ENV`: `production`

### 3. 自动部署

配置完成后，每次推送到 GitHub 主分支都会自动触发部署。

## API 端点

部署后，你的 API 将在以下端点可用：

- **健康检查**: `https://your-worker.your-subdomain.workers.dev/health`
- **API 端点**: `https://your-worker.your-subdomain.workers.dev/api/*`

## 本地开发

### 启动本地开发服务器

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

## 注意事项

### 1. 存储限制

Cloudflare Workers 不支持文件系统，因此：
- 使用内存存储 (`:memory:`) 替代文件存储
- 数据在请求之间不会持久化
- 如果需要持久化存储，考虑使用 Cloudflare KV 或 D1 数据库

### 2. 运行时限制

- 单个请求执行时间限制为 30 秒
- 内存使用限制为 128MB
- 不支持某些 Node.js API

### 3. 构建要求

- Node.js 版本 >= 20.9.0
- 确保所有依赖正确安装

## 故障排除

### 1. 构建失败

检查：
- Node.js 版本是否符合要求
- 所有依赖是否正确安装
- Mastra 配置是否正确

### 2. 运行时错误

检查：
- 环境变量是否正确设置
- API 密钥是否有效
- 网络连接是否正常

### 3. 部署失败

检查：
- GitHub 仓库连接是否正常
- 构建命令是否正确
- 权限设置是否正确

## 监控和日志

部署后，你可以在 Cloudflare Workers 控制台中查看：
- 请求日志
- 错误日志
- 性能指标
- 资源使用情况 