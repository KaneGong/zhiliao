# 2026-05-21 知料工作记录

## 法规页改造 — 对话式聊天界面

将法规速查页面从简单搜索+结果布局完全重写为对话式聊天界面，对齐 AI 推荐页的交互体验。

### 改动文件
- `src/app/regulations/page.tsx` — 完全重写（~215行 → ~310行）

### 新增功能
- 聊天气泡布局：用户消息右对齐琥珀渐变，AI 消息左对齐带 Shield 头像，DB 结果结构化卡片
- 流式 SSE + Markdown 渲染 + streaming-cursor 动画
- 复制按钮（hover 显示）、停止生成、自动滚动 + 回底按钮
- textarea 自动伸缩、Enter 发送
- 多轮对话历史（连续查询，历史保留）
- 空状态：热门查询词按钮 + 参考法规标准卡片
- Suspense 包裹（useSearchParams）

### 服务器配置
- nginx: 添加 `proxy_buffering off` + `proxy_cache off` 确保 SSE 流式不被缓冲
- 部署方式：tar.gz → curl POST to port 9000 webhook → 自动构建部署

### 管理员密码
- 管理后台 (`/admin`) 独立认证：密码硬编码在 `src/app/api/admin/auth/route.ts` → `zhiliao2026`
- 用户登录 (`/login`)：`kane@zhiliao-ai.cn` / `Kane975237`，存储在 `src/data/users.json`

### 项目状态
- 域名：zhiliao-ai.cn（已备案，HTTPS via Let's Encrypt）
- 服务器：8.153.99.9，PM2 standalone 模式
- 配色：Warm Lab v4 暗色主题（暖琥珀金 #f0a550，底色 #0f1318）
- 图标：Lucide SVG（非 emoji）
- 沙箱限制：SSH port 22 被封，port 9000 可通过
