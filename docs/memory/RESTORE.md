# 知料项目记忆恢复指南

## 场景：Codex 重装 / 崩溃 / 换机器后恢复上下文

### 记忆文件备份位置
所有知料相关记忆已备份到：
```
zhiliao/docs/memory/
├── RESTORE.md                           # 本文件
├── MEMORY.md                            # Codex MEMORY.md 完整副本
├── 2026-05-19T09-49-50-8QRl-...md       # 5/19 项目初始化 + Hermes 测试
├── 2026-05-19T09-49-50-DYsD-...md       # 5/19 本地检查 + SSH 被封
├── 2026-05-20T02-59-03-bCvQ-...md       # 5/20 PM2 修复 + 项目初始化
├── 2026-05-20T18-32-48-hrBE-...md       # 5/20-21 Bug修复 + 首页优化 + AIDemo
├── 1779377148-zhiliao-regulations-...md  # 法规页改造为对话式
├── 2026-05-21-zhiliao-bugfix-...md       # 5/21 Bug修复笔记
└── 20260525-005602-zhiliao-project-...md # 5/25 项目目录整理
```

### 恢复方法 A：Codex 尚在工作（推荐）
在新对话中直接告诉 Agent：

> 请读取 /Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/AGENTS.md 和 docs/memory/ 下的所有记忆文件，恢复知料项目的完整上下文。

Agent 会自动：
1. 读取 AGENTS.md → 获得项目结构、技术栈、约定
2. 读取 docs/memory/MEMORY.md → 获得历史任务摘要
3. 读取 rollout_summaries → 获得详细 bug 修复记录和决策理由

### 恢复方法 B：Codex 完全重装（从零开始）

如果 Codex 记忆系统完全清空（`~/.codex/memories/` 消失），需要手动注入记忆：

**步骤 1**：确保项目文件完整
```bash
ls /Users/kgong/Work/AI\ Work/AI\ Projects/知料/zhiliao/
# 确认 src/, docs/, scripts/ 都在
```

**步骤 2**：在新对话中告诉 Agent
> 这是知料项目，路径是 /Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/。请先读取 AGENTS.md 了解项目全貌，然后读取 docs/memory/ 了解历史。

**步骤 3**：如需重建 Codex 记忆系统
```bash
# 将备份的 MEMORY.md 复制回 Codex 记忆目录
cp /Users/kgong/Work/AI\ Work/AI\ Projects/知料/zhiliao/docs/memory/MEMORY.md \
   /Users/kgong/.codex/memories/MEMORY.md

# 将 rollout summaries 复制回去
cp /Users/kgong/Work/AI\ Work/AI\ Projects/知料/zhiliao/docs/memory/2026-*.md \
   /Users/kgong/.codex/memories/rollout_summaries/
```

### 恢复方法 C：最简方式（一句话）

直接在新对话中粘贴下面这句话：

> 项目路径：/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/
> 先读 AGENTS.md，再读 docs/memory/ 下所有文件。
> 线上：https://zhiliao-ai.cn，服务器 root@8.153.99.9，部署用 tar+curl POST 9000 端口。

Agent 就有足够信息开工了。

### 记忆触发词速查表

以下关键词可直接唤醒 Agent 的知料上下文：

| 说这个 | Agent 会联想到 |
|--------|---------------|
| "知料" / "zhiliao" | 项目路径、技术栈、部署方式 |
| "Warm Lab" | 暖色主题 (#f0a550, #0f1318) |
| "PM2 crash" | standalone vs next start 修复 |
| "markdown 表格" | remark-gfm 插件 |
| "流式滚动" | scrollTop 替代 scrollIntoView |
| "首页动图" | AIDemo 3场景循环 |
| "法规页" | 对话式 AI 界面改造 |
| "管理员密码" | zhiliao2026 |
| "部署" | tar + curl POST 9000 |

---

> 💡 每次重要改动后，建议更新本文件和 AGENTS.md 的"当前状态"部分。
