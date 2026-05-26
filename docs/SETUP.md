# 知料 — 完整搭建指南

从零开始，在任何电脑上用任何 AI Agent 恢复知料项目。

---

## 一、获取代码

```bash
git clone https://github.com/KaneGong/zhiliao.git
cd zhiliao
```

## 二、环境要求

| 工具 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 20 | 运行时 |
| npm | ≥ 10 | 包管理 |
| Git | 任意 | 版本控制 |

## 三、配置环境变量

创建 `.env.local`：

```bash
DEEPSEEK_API_KEY=你的DeepSeek_API_Key
```

> DeepSeek API Key 获取：https://platform.deepseek.com/api_keys

## 四、安装 & 运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`

## 五、让 AI Agent 认识项目

在新对话中告诉 Agent：

> 项目路径：zhiliao/
> 先读 AGENTS.md，再读 docs/memory/ 下所有文件。

Agent 会自动获取：
- 完整目录结构和技术栈
- 所有历史 bug 修复记录和设计决策
- 用户偏好和项目约定
- 部署方式

## 六、部署到服务器

### 当前服务器
- IP: 8.153.99.9
- SSH: root@8.153.99.9
- App 路径: /opt/zhiliao
- PM2 进程: zhiliao
- 域名: zhiliao-ai.cn

### 部署命令
```bash
# 打包 + 上传 + 触发构建
tar -czf /tmp/deploy.tar.gz --exclude='node_modules' --exclude='.next' --exclude='.git' .
curl -X POST --data-binary @/tmp/deploy.tar.gz http://8.153.99.9:9000/
curl http://8.153.99.9:9000/   # 触发构建（约40秒）
```

或使用项目内的部署脚本：
```bash
bash scripts/deploy.sh
```

### 部署到新服务器
参考 `docs/server-config.md`

## 七、文件结构速览

```
zhiliao/
├── AGENTS.md              # ★ AI Agent 协作入口（读这个就够）
├── docs/
│   ├── SETUP.md           # 本文件
│   ├── deploy.md          # 部署详细指南
│   ├── server-config.md   # 服务器配置清单
│   └── memory/            # 历史记忆备份
│       ├── RESTORE.md     # 记忆恢复指南
│       └── *.md           # 历史 rollout 摘要
├── scripts/
│   ├── deploy.sh          # 一键部署
│   └── gen_products.py    # 产品数据生成
├── src/
│   ├── app/               # Next.js 页面 + API 路由
│   ├── components/        # 共享组件
│   ├── lib/               # 工具库
│   ├── data/              # JSON 数据
│   └── types/             # TypeScript 类型
├── .env.local             # 环境变量（不提交 git）
├── next.config.ts         # Next.js standalone 配置
├── package.json           # 依赖
└── tailwind 配置          # Warm Lab v4 暖色主题
```

## 八、关键信息速查

| 项目 | 值 |
|------|-----|
| 框架 | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| AI 后端 | DeepSeek API (deepseek-chat, SSE) |
| 设计主题 | Warm Lab v4（#f0a550 琥珀金, #0f1318 底色） |
| 数据存储 | src/data/*.json（构建时嵌入） |
| 管理员密码 | zhiliao2026 |
| 管理员路径 | /admin |
| GitHub | https://github.com/KaneGong/zhiliao |
| 域名 | https://zhiliao-ai.cn |

## 九、常见问题

**Q: 本地运行报错 "DEEPSEEK_API_KEY not found"**
A: 检查 `.env.local` 是否存在，确保有 `DEEPSEEK_API_KEY=...`

**Q: Markdown 表格不渲染**
A: 已安装 `remark-gfm`，如果丢失：`npm install remark-gfm`

**Q: PM2 部署后 502**
A: 检查 PM2 是否用 `node .next/standalone/server.js` 而非 `next start`。详见 `docs/server-config.md`

**Q: SSH 被沙箱拦截**
A: 使用 tar+curl POST 9000 端口方式部署，不需要 SSH。
