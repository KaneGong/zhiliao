# 2026-05-21 知料 Bug 修复：Markdown 表格 + 流式滚动跳闪

## 环境
- 平台：Codex Desktop（非 Claude Code CLI）
- 模型：GPT-5.5，reasoning effort xhigh
- 项目路径：/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/
- 部署：rsync → root@8.153.99.9:/opt/zhiliao → npm install → npm build → pm2 restart zhiliao
- SSH 限制：sandbox 封死 port 22，自动化不可行，需用户在终端手动跑

## 改动文件
- `src/app/recommend/page.tsx` — AI 配方顾问对话页面
- `package.json` / `package-lock.json` — 新增依赖

## Bug 1: Markdown 表格渲染不正确
**根因**：`react-markdown` v10 默认不包含 GFM（GitHub Flavored Markdown）支持，表格的 `|` 分隔符被当作纯文本输出。

**修复**：
1. 安装 `remark-gfm`：`npm install remark-gfm`
2. 在 `page.tsx` 第 8 行添加：`import remarkGfm from "remark-gfm";`
3. 在 `<Markdown>` 组件添加：`remarkPlugins={[remarkGfm]}`

## Bug 2: 流式输出时页面跳动
**根因**：`useEffect` 监听 `messages` 变化，每次 token 到达都调用 `scrollIntoView({ behavior: "smooth" })`。smooth 动画需要时间，但流式输出 token 间隔极短（几十毫秒），前一个动画未结束下一个就触发，多个 smooth 动画重叠产生视觉跳闪。

**修复**：
1. 自动滚动（useEffect 中）：改为 `chatRef.current.scrollTop = chatRef.current.scrollHeight`（即时定位，无动画）
2. 用户点击「↓ 回到底部」：同样改为即时 scrollTop，不需要 smooth
3. TypeScript 类型修复：scrollToBottom 函数加 `if (chatRef.current)` null guard

## 部署状态
- 本地 `npm run build` 通过（TypeScript + Turbopack 编译成功）
- 待部署到服务器：用户在终端执行 `cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao" && bash deploy.sh`

## 用户反馈
- 改动后基本可以，但交互界面还不够完美
- 明天（5/22）继续优化 UI 交互

## 当前项目认知
- 知料是食品行业 AI 方案顾问平台
- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- 数据层：本地 JSON 文件（src/data/），构建时嵌入
- AI 后端：DeepSeek API（deepseek-chat），流式 SSE 响应
- 核心页面：首页（page.tsx）、AI 推荐（recommend/page.tsx）、搜索、法规、供应商门户等
- 最新 commit：a724c8e "fix: admin auth check properly validates cookie"
