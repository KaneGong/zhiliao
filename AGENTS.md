# 知料 ZhiLiao — AI Agent 协作指南

## 项目概要
知料是一个面向 B 端食品行业的 AI 配方研发平台。
- **域名**：zhiliao-ai.cn
- **服务器**：8.153.99.9 (阿里云 Ubuntu 22.04)
- **部署**：PM2 standalone，webhook 端口 9000

## 技术栈
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 (Warm Lab v4 暖色主题)
- DeepSeek API (deepseek-chat, SSE 流式)
- 数据存储：`src/data/*.json`（内嵌 JSON 文件）

## 目录结构
```
zhiliao/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页
│   │   ├── recommend/          # AI 推荐页
│   │   ├── regulations/        # 法规查询页
│   │   ├── search/             # 原料搜索页
│   │   ├── product/[id]/       # 产品详情
│   │   ├── recipes/            # 配方页
│   │   ├── login/register/     # 用户认证
│   │   ├── settings/           # 用户设置
│   │   ├── supplier/           # 供应商门户
│   │   ├── admin/              # 平台管理员后台
│   │   ├── api/                # API 路由
│   │   │   ├── ai-recommend/   # AI 推荐 API（主）
│   │   │   ├── recommend/      # 推荐 API
│   │   │   ├── regulations/    # 法规 API
│   │   │   ├── ingredients/    # 原料 CRUD
│   │   │   ├── products/       # 产品 CRUD
│   │   │   ├── suppliers/      # 供应商 CRUD
│   │   │   ├── auth/           # 用户认证
│   │   │   └── admin/auth/     # 管理员认证
│   │   ├── components/         # 页面级组件
│   │   └── globals.css         # 全局样式 (Warm Lab v4)
│   ├── components/Navbar.tsx   # 全局导航栏
│   ├── lib/                    # 工具库
│   │   ├── auth.ts             # JWT 认证
│   │   ├── data.ts             # JSON 数据读写
│   │   ├── filestore.ts        # 文件存储抽象
│   │   ├── logger.ts           # 服务端日志
│   │   └── users.ts            # 用户管理
│   ├── data/                   # JSON 数据文件（构建时嵌入）
│   │   ├── ingredients.json    # 原料库
│   │   ├── products.json       # 产品库
│   │   ├── recipes.json        # 配方库
│   │   ├── regulations.json    # 法规库
│   │   ├── suppliers.json      # 供应商库
│   │   ├── tags.json           # 标签
│   │   ├── users.json          # 用户
│   │   └── pricing.json        # 定价
│   └── types/index.ts          # TypeScript 类型
├── docs/                       # 项目文档（★ SETUP.md 是搭建入口）
│   ├── SETUP.md               # ★ 完整搭建指南（新机必读）
│   ├── DEPLOY-v2.md            # 旧版部署指南
│   ├── deploy.md               # 当前部署指南
│   ├── server-config.md        # 服务器配置清单
│   ├── README.md               # 项目说明
│   └── archive/                # 历史分析报告
├── scripts/                    # 工具脚本
│   └── gen_products.py         # 产品数据生成
├── public/                     # 静态资源
├── next.config.ts              # Next.js 配置 (standalone 输出)
├── package.json
└── AGENTS.md                   # 本文件
```

## 关键约定
- **AI 后端**：使用 DeepSeek API，非 OpenAI。流式 SSE。
- **部署**：PM2 + standalone 模式。`pm2 delete` 再 `pm2 start`（restart 会保留旧命令）。
- **配色**：Warm Lab v4 — 底色 #0f1318，强调色 #f0a550（琥珀金），暖色调暗色系。
- **B2B 定位**：用户是食品公司研发和产品经理。AI 可信度优先，每个推理步骤可溯源。
- **数据真实性**：原料数据以供应商手册和国标为准，不编造。不确定的信息明确标注。

## 用户偏好
- 喜欢暖色 Warm Lab 主题（非冷色）
- 追求高级感、平衡感、协调性（Apple 风格）
- 倾向于让 Agent 主动执行而非讨论方案
- 项目路径默认 `/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/`
- 部署：tar → curl POST 到 8.153.99.9:9000 即可

## 管理员
- 路径：`/admin`
- 密码：`zhiliao2026`（硬编码在 `src/app/api/admin/auth/route.ts`）

## 当前状态（2026-05-25）
- ✅ 首页视觉节奏优化完成（3 场景循环动图）
- ✅ 法规页改造为对话式 AI 界面
- ✅ 域名备案完成（zhiliao-ai.cn）
- ✅ HTTPS 证书配置完成
- 🔜 AI 推荐内容深化
- 🔜 法规功能完善

## 记忆备份
所有 Codex 记忆系统文件已备份到 `docs/memory/`：
- `docs/memory/RESTORE.md` — **恢复指南**（Codex 重装/崩溃后如何恢复上下文）
- `docs/memory/MEMORY.md` — Codex MEMORY.md 完整副本
- `docs/memory/2026-*.md` — 各轮 rollout 摘要

恢复时只需告诉 Agent：**读 AGENTS.md + docs/memory/ 下所有文件**。

## 用户偏好（补充）
- 提供阶段性进度更新，避免长时间沉默
- 优先执行方案而非反复讨论选项
- 每次对话结束后记录记忆
- 首页内容尽量利用首屏空间，避免动图被截断
- SSE 流式滚动平滑性至关重要，一次修彻底
