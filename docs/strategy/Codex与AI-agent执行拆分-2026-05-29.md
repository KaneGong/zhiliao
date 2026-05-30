# Codex 与 AI-agent 执行拆分

> 目标：把知料从单人项目变成“创始人 + AI-agent 工厂”的执行系统。

## 1. 工作原则

1. 所有大方向先写成 docs，再拆 PRD，再拆 backlog，再写代码。
2. 每个功能必须服务 90 天主线：方案包、案例库、可信层、供应商线索、导出。
3. Codex 不只写代码，也负责研究、文档、数据清洗、测试、部署、演示材料。
4. 人类创始人做判断、外部访谈、行业关系、最终审稿。

## 2. Codex 当前可承担的工作

### 产品与战略
- 竞品研究与市场分析
- PRD 编写
- 用户访谈提纲
- 商业化方案
- 投资人 deck 初稿
- 供应商招商话术

### 工程实现
- Next.js / React / Tailwind 页面开发
- API Route 开发
- 数据 schema 设计
- JSON → PostgreSQL 迁移方案
- AI prompt 与结构化输出
- Trust Layer / 校验规则
- 导出 PDF / Word / PPT / Excel
- 本地测试、构建、部署文档

### 数据建设
- 原料数据字段清洗
- 法规结构化
- 配方案例库生成与人工审核流程
- 竞品产品信息整理
- 供应商资料清洗
- 关键词、功能标签、宣称词库维护

### 质量验证
- TypeScript 检查
- build 验证
- 浏览器测试
- 输出样例回归测试
- 法规/原料引用检查
- 方案质量评分样例集

### 运营与融资材料
- 行业文章
- 用户 onboarding 文案
- 供应商邮件/微信话术
- 月报模板
- 投资人 one-pager
- 路演 PPT

## 3. AI-agent 角色分工

| Agent 角色 | 主要任务 | 产出 |
|---|---|---|
| 产品策略 Agent | 梳理定位、路线图、PRD | docs/strategy, docs/prd |
| 市场研究 Agent | 竞品、市场规模、商业模式 | market-research.md |
| 法规研究 Agent | 法规结构化、风险词、标准更新 | regulations schema/data |
| 食品研发 Agent | 配方案例、原料协同、剂型建议 | recipe cases |
| 数据工程 Agent | 数据清洗、导入脚本、校验脚本 | scripts + data |
| 前端工程 Agent | 工作台、卡片、导出界面 | src/app |
| 后端工程 Agent | API、保存、线索、日志 | src/app/api, src/lib |
| QA Agent | 测试、构建、验收清单 | docs/tasks, test logs |
| 增长 Agent | 访谈脚本、供应商话术、内容 | docs/growth |
| 融资 Agent | one-pager、deck、财务假设 | docs/fundraising |

## 4. 推荐目录结构

```text
docs/
├── strategy/
│   ├── 知料90天作战计划-2026-05-29.md
│   ├── Codex与AI-agent执行拆分-2026-05-29.md
│   ├── market-research.md
│   ├── business-model.md
│   └── fundraising-thesis.md
├── prd/
│   ├── PRD-Formula-Brief-v1.md
│   ├── PRD-Trust-Score-v1.md
│   ├── PRD-Recipe-Case-Library-v1.md
│   ├── PRD-Supplier-Leads-v1.md
│   └── PRD-Export-Reports-v1.md
├── tasks/
│   ├── 90-day-backlog.md
│   ├── week-01.md
│   └── validation-interviews.md
└── data/
    ├── recipe-case-schema.md
    ├── regulation-schema-v2.md
    └── supplier-lead-schema.md
```

## 5. 第一批要拆的 PRD

### PRD 1：Formula Brief v1
目标：把 AI 推荐从聊天答案升级为结构化方案包。

### PRD 2：Trust Score v1
目标：为每份方案生成可信评分，展示法规引用、原料覆盖、未收录项、风险提醒。

### PRD 3：Recipe Case Library v1
目标：建立 100 条配方案例，支持 AI 参考和前端展示。

### PRD 4：Supplier Leads v1
目标：记录供应商曝光、产品点击、样品/询价线索。

### PRD 5：Export Reports v1
目标：把方案导出为 PDF / Word / PPT / Excel BOM。

## 6. 每周节奏

### 周一
- 确定本周唯一主目标
- Codex 拆任务与验收标准

### 周二-周四
- Codex 开发 / 数据建设 / 文档产出
- Kane 做行业访谈和输出审核

### 周五
- 本地验证 + 线上部署
- 复盘用户反馈
- 写周报和下周计划

### 周末
- 深度研究、竞品观察、内容沉淀

## 7. 什么时候需要真人专家

AI 可以加速，但不能替代以下判断：

1. 法规专家：判断高风险边界、审查关键规则
2. 食品研发专家：判断配方是否真的可打样
3. 供应商 BD：验证供应商付费和线索需求
4. 企业客户顾问：帮助设计企业版工作流

前期不建议全职招聘。建议用兼职顾问 / 按次咨询 / 小额顾问费。

## 8. 投资节奏建议

当前不急着正式融资。先拿证据。

融资前最低证据：
- 30 个深访
- 100 个注册用户
- 20 个活跃研发用户
- 10 个保存方案
- 5 家供应商愿意维护资料
- 3 个愿意付费或签意向
- 1 个企业试点

达到这些后，再准备 angel / 产业投资人。

## 9. 立即下一步

1. 写 `PRD-Formula-Brief-v1.md`
2. 写 `docs/tasks/90-day-backlog.md`
3. 实现结构化方案包 schema
4. 生成 10 个黄金测试问题
5. 用现有 AI 推荐跑样例，评估质量
