# 知料 90 天 Backlog

> 日期：2026-05-29
> 使用方式：每周只选 1 个主目标，避免散。P0 是必须做，P1 是能拉开差距，P2 是验证后再做。

## 2026-05-30 状态更新

- Formula Brief v1 已跑通，旧会话 P0 回归 5/5 通过。
- 本会话全量 20Q 复跑已完成：20/20 技术通过，0 次重试，原始日志见 `docs/tasks/regression-runs/golden-20q-20260530-065327.log`。
- 改进后复跑文档：`docs/tasks/golden-question-results-2026-05-30-20q-rerun.md`。
- Seed 数据链已建立并接入：`src/data/formula_brief_seeds/*.seed.json` + `src/lib/formula-brief-seeds.ts`。
- 数据修复包 1 已完成：11 条 ingredient profiles、10 条 supplier specs、10 条 regulatory rules、10 个 seed scenarios。
- 数据修复包 1 后全量 20Q 候选最终日志：`docs/tasks/regression-runs/golden-20q-final-clean-after-all-verifier-fixes-20260530-085625.log`，20/20 技术通过、0 次重试、`jsonLeaks=0`、`riskyAllowedCount=0`。
- 验证器 false positive 已定向修复：`GQ-004 / GQ-005 / GQ-006 / GQ-016` 单题复跑均通过且 unknown=0。
- 供应商真实性硬化后全量 20Q 复跑已通过：`docs/tasks/regression-runs/golden-20q-supplier-truthfulness-20260530-094102.summary.json`，20/20 技术通过、`jsonLeaks=0`、`riskyAllowedCount=0`。
- 商业验证暂缓到网站进入稳定展示阶段后再启动；当前节奏改为先把本地/线上运行配置、展示体验和核心功能闭环打磨好。
- 下一阶段节奏：先完成 Demo-ready 运行配置与展示体验巡检，再补真实供应商/法规资料，之后进入 Recipe Case Library 扩展。

## 2026-05-30 主控决策：先展示，后商业

- 商业联系人池、访谈和供应商外联不作为当前 sprint 的执行目标。
- 当前 sprint 目标改为：让网站能稳定启动、核心页面可展示、Formula Brief 输出可信、验证命令固定。
- 已配置展示运行命令：`npm run dev:demo`、`npm run smoke:local`、`npm run check`、`npm run verify`。
- 03-商业验证会话只保留材料，不继续扩写；需要 Kane 筛选真实联系人和时机后再重启。

## 2026-05-30 Demo E2E 验收更新

- 已补显性入口：导航和首页均可直接进入 AI 配方工作台、法规证据工作台、我的配方、供应商入口和管理后台。
- 已完成本地端到端演示验收：注册/登录、AI 推荐 SSE、法规 SSE、保存配方、读取配方、管理后台鉴权均通过。
- 验收记录：`docs/tasks/demo-e2e-acceptance-2026-05-30.md`。
- 当前产品边界确认：目前只有 `/recommend` 和 `/regulations` 是对话型页面；其他页面是工作台/管理页。全站 AI 助手属于后续产品决策。
- 下一步最优先修复：法规查询的自然语言原料抽取，例如先从“DHA 能不能用于普通食品？”中抽取 `DHA` 再匹配法规库。

## Week 1 — Formula Brief v1

### P0

- [ ] 定义 `FormulaBrief` TypeScript 类型
- [ ] 增加 `src/lib/formula-brief.ts`
- [ ] 优化 `ai-recommend/prompt.ts`：要求输出方案包结构
- [ ] `/api/ai-recommend` 解析结构化 JSON
- [ ] 保留 Markdown fallback
- [ ] 前端新增方案包卡片组件
- [ ] 保存方案时保存结构化 JSON
- [ ] 新旧配方库兼容
- [ ] 5 个黄金问题回归测试

### P1

- [ ] 可信评分 v1
- [ ] 方案顶部数据来源概览
- [ ] 合规风险词高亮
- [ ] 供应商匹配解释

### 验收

- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [x] `npm run verify`
- [x] `npm run dev:demo` + `npm run smoke:local`
- [ ] 本地浏览器测试 `/recommend`
- [ ] 保存并打开方案

## Week 2 — Trust Score + Golden Evaluation

### P0

- [ ] 扩展 Trust Score 数据结构
- [ ] 输出原料覆盖率、法规覆盖率、未收录原料数
- [ ] 建立 20 个黄金测试问题
- [ ] 建立 AI 输出评分表
- [ ] 增加服务端日志字段：query、brief_parse_success、trust_score、unknown_ingredients

### P1

- [ ] 方案质量人工评分面板草案
- [ ] 高风险表达词库 v1
- [ ] 可用表达模板 v1

## Week 3-4 — Recipe Case Library 100

### P0

- [ ] 定义配方案例 schema
- [ ] 创建 `docs/data/recipe-case-schema.md`
- [ ] 扩展 `src/data/recipes.json` 或新建 `recipe_cases.json`
- [ ] 生成 10 个品类 × 每类 10 个案例
- [ ] 为每个案例标注：目标人群、剂型、核心原料、辅助原料、合规路径、供应商匹配
- [ ] AI prompt 注入相似案例摘要

### P1

- [ ] 案例库浏览页
- [ ] 方案输出展示“参考案例”
- [ ] 案例人工审核状态：draft / reviewed / verified

## Week 5-6 — Supplier Leads v1

### P0

- [ ] 定义 supplier lead schema
- [ ] 产品详情页新增“申请样品 / 获取报价”
- [ ] AI 方案供应商匹配产生曝光日志
- [ ] 供应商后台显示曝光、点击、线索
- [ ] 管理员后台查看全部线索

### P1

- [ ] 供应商月报模板
- [ ] 供应商推荐权重规则草案
- [ ] 供应商资料完整度评分

## Week 7-8 — Export Reports v1

### P0

- [ ] PDF 导出
- [ ] Word 导出
- [ ] Excel BOM 导出
- [ ] 保存方案详情页优化

### P1

- [ ] PPT 摘要导出
- [ ] 企业内部评审模板
- [ ] 方案版本对比

## Week 9-10 — Commercial Validation

### P0

- [ ] 完成 30 个用户/供应商访谈
- [ ] 汇总需求频次
- [ ] 确认前三个付费点
- [ ] 供应商报价页/招商页草案
- [ ] 企业试点方案 one-pager

### P1

- [ ] 微信/朋友圈/行业群内测文案
- [ ] 演示视频脚本
- [ ] 供应商邮件模板

## Week 11-12 — Investor Readiness

### P0

- [ ] 汇总用户数据
- [ ] 汇总方案生成数据
- [ ] 汇总供应商线索数据
- [ ] 写投资人 one-pager
- [ ] 写 pitch deck v1

### P1

- [ ] 财务模型草案
- [ ] 竞品对比表
- [ ] 数据壁垒路线图

## 持续任务

### 数据

- [ ] 每周新增 50 个原料或补全字段
- [ ] 每周新增 20 条法规/规则/宣称样例
- [ ] 每周新增 20 个配方案例

### 质量

- [ ] 每周跑黄金测试问题
- [ ] 记录错误案例
- [ ] 更新 prompt 和校验规则

### 增长

- [ ] 每周 5 个研发用户访谈
- [ ] 每周 3 个供应商访谈
- [ ] 每周 1 篇行业内容草稿

## 当前最优先任务

1. 法规查询自然语言原料抽取
2. 线上部署前 checklist 与服务器 smoke
3. Formula Brief v1 演示路径视觉巡检
4. 真实供应商资料补库准备
5. 100 条配方案例库
