# 知料本地启动与恢复指南

最后更新：2026-05-28

## 1. 环境要求
- Node.js 20+
- npm 10+
- Git

## 2. 获取代码
```bash
git clone <repo-url> zhiliao
cd zhiliao
```

本机常用路径：
```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao"
```

## 3. 环境变量
创建 `.env.local`，按实际安全凭据填写。不要把真实值写入文档或提交 Git。

常见变量：
```bash
DEEPSEEK_API_KEY=...
BAIDU_QIANFAN_API_KEY=...
TAVILY_API_KEY=...
JWT secret：按需配置，使用安全随机值。
```

以当前代码实际读取的变量名为准；缺失时先查看 `src/app/api/*` 与 `src/lib/*`。

## 4. 安装与运行
```bash
npm install
npm run dev
```

访问：<http://localhost:3000>

## 5. 本地验证
```bash
npx tsc --noEmit
npm run build
```

## 6. Agent 开工顺序
1. 先读项目根的 `AGENTS.md`。
2. 部署相关读 `docs/deploy.md`。
3. 服务器配置读 `docs/server-config.md`。
4. 历史细节优先查 Codex Memory：`~/.codex/memories/`；项目内 `docs/memory/README.md` 只保留说明。

## 7. 关键页面
- `/` 首页
- `/recommend` AI 推荐
- `/search` 原料库
- `/regulations` 法规查询
- `/recipes` 配方库
- `/login`、`/register`、`/settings`
- `/supplier/register`、`/supplier/dashboard`
- `/admin`

## 8. 部署
当前部署方式见 `docs/deploy.md`。不要再默认使用旧的 9000 webhook；除非已先验证 webhook 正常。

## 9. 常见问题
### `DEEPSEEK_API_KEY not found`
检查 `.env.local` 是否存在，变量名是否与代码一致。不要在聊天或文档里展示真实 key。

### Markdown 表格不渲染
确认 `remark-gfm` 存在并被 `ReactMarkdown` 引入。

### 线上 502 或 PM2 反复重启
确认 PM2 入口是：
```bash
/opt/zhiliao/.next/standalone/server.js
```
standalone 模式不要用 `next start`。

### 浏览器无法打开线上站点，但服务器 curl 正常
检查本机 VPN/代理 DNS fake-ip：
```bash
dig +short zhiliao-ai.cn
```
正确解析应为 `8.153.99.9`，不是 `198.18.x.x`。
