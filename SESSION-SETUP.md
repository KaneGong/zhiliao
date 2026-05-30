# 知料 ZhiLiao — 会话分工与启动指南

最后更新：2026-05-30

---

## 一句话定位

**知料 = 食品研发 AI 工作台。** 核心产品是 Formula Brief v1：用户提一个产品想法，平台输出结构化配方方案包（配方路线 + 合规检查 + 供应商匹配 + Trust Score）。

---

## 会话架构

整个知料项目在 Codex 中按 4 个会话分工：

| 会话 | 职责 | 不做什么 |
|------|------|----------|
| **00-主控** | 方向决策、任务拆分、验收、记忆 | 不写大量代码 |
| **01-Formula Brief** | 核心产品代码实现（API / Prompt / 前端 / 数据） | 不碰法规/供应商页面 |
| **02-数据与案例** | 测试问题、配方案例、原料/法规种子数据 | 不改核心业务代码 |
| **03-商业验证** | 访谈模板、合作伙伴材料、外部沟通 | 当前暂缓；不改网站代码 |

---

## 00-主控会话 - 启动提示

新开 00-主控会话后，直接粘贴以下内容：

```
你是知料项目的技术合伙人 / 主控 agent。项目路径：
/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/

先读取 AGENTS.md 和 SESSION-SETUP.md 了解项目全貌。
然后检查 git 状态、最近提交、当前分支，告诉我：
1. 当前项目状态（干净/有未提交改动）
2. 上一次做到哪了
3. 按照 90 天计划，接下来该做什么
```

---

## 01-Formula Brief 会话 - 启动提示

新开 01 会话后，粘贴：

```
你是知料项目的 Formula Brief 开发 agent。项目路径：
/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/

先读取：AGENTS.md、docs/tasks/week-01.md
核心代码位置：
- API: src/app/api/ai-recommend/route.ts
- Prompt: src/app/api/ai-recommend/prompt.ts
- 类型: src/lib/formula-brief.ts
- 种子数据: src/lib/formula-brief-seeds.ts
- 前端: src/app/recommend/page.tsx
- 配方库: src/app/recipes/page.tsx

当前阶段目标：把 /recommend 跑稳，供应商/合规状态诚实，不编造数据。
规则：
- 不碰 UI 主题/配色
- 不改法规页面、供应商后台
- 不做 PDF/Word 导出
- 改动后跑 npx tsc --noEmit 和 npm run build
```

---

## 02-数据与案例 会话 - 启动提示

新开 02 会话后，粘贴：

```
你是知料项目的数据与案例 agent。项目路径：
/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/

先读取：docs/tasks/golden-questions.md、docs/data/
核心数据资产：
- 题库: docs/tasks/golden-questions.md
- 回归脚本: scripts/run-golden-questions.mjs
- 种子数据: src/data/formula_brief_seeds/*.json
- 案例库: docs/data/recipe-case-library-v1.md

当前阶段目标：维护题库、准备案例、补充原料/法规/供应商种子数据。
规则：
- 不直接改 src/app/ 下的业务代码
- 不碰 API route 和 prompt
- 产出主要是 docs/data/ 下的文档和 src/data/ 下的 JSON
```

---

## 03-商业验证 会话 - 启动提示

新开 03 会话后，粘贴：

```
你是知料项目的商业验证 agent。项目路径：
/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/

先读取：docs/tasks/validation-interviews.md
相关材料：
- Partner Brief: ppt/zhiliao-partner-2026-05-29/

当前阶段目标：准备用户访谈、供应商联系、合作伙伴材料。
规则：
- 不改网站代码
- 产出放在 docs/ 下
```

---

## 当前阶段（90 天计划 Phase 1：验证产品内核）

### 已完成的

- [x] 全站 UI/UX（Warm Lab 风格）
- [x] Formula Brief v1 核心 API + 前端卡片
- [x] Golden Questions 回归系统（5 P0 + 20 全量）
- [x] 种子数据集成（原料/供应商/法规 seed JSON 注入 prompt）
- [x] 数据入口 Schema（原料/供应商/法规三类）
- [x] P0 回归：5/5 通过、JSON 泄露 0、高风险声称 0
- [x] 全量 20Q 回归：20/20 技术通过

### 当前主线（先做可展示网站）

- [x] **代码集成优化**：供应商/合规状态已在 post-processing 层做诚实标准化
- [x] **低分题目修复验证**：P0 与 20Q 回归已通过，低闭环题不再伪造可用供应商
- [x] **Demo-ready 运行配置**：固定本地启动、smoke、check、verify 命令
- [x] **展示体验巡检**：本地跑通 `/`、`/recommend`、`/search`、`/recipes`、`/regulations`，并完成 Demo E2E 验收
- [ ] **案例库扩展**：从 20 条草稿扩展到 50+ 条结构化案例
- [ ] **供应商数据补充**：只补真实供应商资料；商业联系人筛选暂缓
- [ ] **商业验证**：暂缓到网站进入稳定展示阶段后再启动

### 2026-05-30 Demo E2E 结论

- 本地 `dev:demo` + `smoke:local` 通过。
- AI 推荐与法规查询 SSE 均能返回流式内容。
- 注册/登录、保存配方、读取配方、管理后台鉴权通过。
- 显性入口已补齐：AI 配方、法规证据、我的配方、供应商入口、管理后台。
- 法规自然语言原料抽取已补：`DHA 能不能用于普通食品？` 可命中 `DHA（二十二碳六烯酸）`，并避免 `乳铁蛋白` 误带出单字 `铁`。
- 当前对话型页面只有 `/recommend` 和 `/regulations`；全站 AI 助手作为后续产品决策。
- 验收文档：`docs/tasks/demo-e2e-acceptance-2026-05-30.md`。

### 不做的事（当前阶段）

- PDF/Word/PPT 导出
- 供应商后台系统
- 数据库迁移（继续用 JSON 文件）
- 移动端 App

---

## 关键规则（所有会话通用）

1. **项目路径固定**：`/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/`，不反复问
2. **执行优先**：直接做最佳方案，少讨论选项
3. **改动后验证**：`npx tsc --noEmit` + `npm run build`
4. **Git 谨慎**：有很多历史 dirty files，只 stage 自己改的文件
5. **不编造数据**：供应商无匹配时说「暂无平台匹配」，不伪造
6. **敏感信息不入库**：API Key、密码、token 不在文档和提交里出现
7. **记忆更新**：重大变更后写入 `~/.codex/memories/extensions/ad_hoc/notes/`

---

## 测试回归命令

```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao"

# 启动开发服务器（⚠️ 需要 TTY 会话保持，否则会挂）
PORT=3010 npm run dev

# 展示用固定端口启动
npm run dev:demo

# 本地页面/API smoke（需先启动 dev:demo）
npm run smoke:local

# P0 5 题快速回归
npm run test:golden

# 全量 20 题回归
npm run test:golden:all

# TypeScript 检查
npm run check

# 构建验证
npm run build

# 展示前完整本地验证
npm run verify
```

---

## 关键文件索引

| 类别 | 文件 |
|------|------|
| 项目总览 | `AGENTS.md` |
| 本文件 | `SESSION-SETUP.md` |
| 部署指南 | `docs/deploy.md` |
| 90 天计划 | `docs/tasks/90-day-backlog.md` |
| Week 1 任务 | `docs/tasks/week-01.md` |
| Golden Questions 题库 | `docs/tasks/golden-questions.md` |
| 20Q 结果 | `docs/tasks/golden-question-results-2026-05-30-20q.md` |
| 数据 Schema | `docs/data/data-intake-schemas-v1.md` |
| 案例库 | `docs/data/recipe-case-library-v1.md` |
| 供应商缺口 | `docs/data/supplier-gap-shortlist-v1.md` |
| 低分修复矩阵 | `docs/data/low-score-repair-matrix-v1.md` |
| 商业验证 | `docs/tasks/validation-interviews.md` |
| 回归脚本 | `scripts/run-golden-questions.mjs` |
| 种子数据 | `src/data/formula_brief_seeds/*.json` |
| AI 推荐 API | `src/app/api/ai-recommend/route.ts` |
| AI Prompt | `src/app/api/ai-recommend/prompt.ts` |
| Formula Brief 类型 | `src/lib/formula-brief.ts` |
| 种子加载器 | `src/lib/formula-brief-seeds.ts` |
