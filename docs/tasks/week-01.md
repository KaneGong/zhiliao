# Week 01 执行计划 — Formula Brief v1

> 日期：2026-05-29  
> 周目标：把 `/recommend` 的 AI 输出从 Markdown 聊天答案升级为结构化新品配方方案包。  
> 原则：第一周不追求完美，不做大重构；先让“方案包”跑通，并用黄金测试问题验证。

## 1. 本周唯一主目标

用户输入一个新品想法后，知料输出一份结构化方案包，包含：

- Product Brief
- Formula Routes
- Compliance Checks
- Supplier Matches
- Claim Suggestions
- Trust Score
- Next Steps
- Markdown Summary fallback

## 2. Day-by-day

### Day 1：Schema + Prompt

- [ ] 创建 `src/lib/formula-brief.ts`
- [ ] 定义 `FormulaBrief`、`FormulaRoute`、`ComplianceCheck`、`SupplierMatch`、`TrustScore` 类型
- [ ] 在 `src/app/api/ai-recommend/prompt.ts` 增加结构化输出要求
- [ ] 明确 JSON 输出格式和 fallback 规则
- [ ] 建立 5 个黄金测试问题文件 `docs/tasks/golden-questions.md`

验收：
- TypeScript 类型无错误
- Prompt 中有清晰的结构化输出约束

### Day 2：API 解析

- [ ] 修改 `/api/ai-recommend/route.ts`
- [ ] 从模型输出中提取 JSON block
- [ ] JSON 解析失败时保留 Markdown 输出
- [ ] 调用 `verifyAIOutput` 生成验证结果
- [ ] 生成 Trust Score v1
- [ ] SSE 末尾发送 `formula_brief` 事件

验收：
- 同一个接口仍能流式输出 Markdown
- 结束时能返回结构化 brief 或明确 fallback

### Day 3：前端卡片组件

- [ ] 新增 `FormulaBriefView` 组件
- [ ] 渲染 Product Brief
- [ ] 渲染 2-3 条 Formula Route
- [ ] 渲染 Compliance Checks
- [ ] 渲染 Supplier Matches
- [ ] 渲染 Trust Score
- [ ] 移动端可读

验收：
- `/recommend` 不再只是大段 Markdown
- 结构化 brief 存在时优先展示卡片
- fallback Markdown 仍可用

### Day 4：保存与配方库兼容

- [ ] 修改 recipe 保存结构
- [ ] 兼容旧 `query + recommendation`
- [ ] 新增 `formula_brief` 字段
- [ ] 配方库详情页展示结构化方案摘要
- [ ] 保存后可重新打开

验收：
- 新方案保存成功
- 旧方案不崩溃
- 配方库能区分结构化方案和旧 Markdown 方案

### Day 5：回归测试 + 调整

- [ ] 跑 5 个黄金问题
- [ ] 记录每个方案的结构完整性
- [ ] 检查高风险表达
- [ ] 检查未收录原料是否标注
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] 本地浏览器验证

验收：
- 5 个黄金问题至少 4 个能生成可用方案包
- 构建通过
- 没有破坏现有聊天体验

## 3. Codex 执行方式

### 开始指令

用户明天可以直接说：

> 按 week-01 开始实现 Formula Brief v1。

Codex 应执行：

1. 读 `AGENTS.md`
2. 读 `docs/prd/PRD-Formula-Brief-v1.md`
3. 读本文件
4. 新建实现分支或直接在当前工作树实施
5. 每完成一个 Day 级任务运行局部验证
6. Day 5 运行完整验证

## 4. 黄金测试问题

详见：`docs/tasks/golden-questions.md`。

如果该文件尚未创建，先用 PRD 中的 5 个问题。

## 5. 不做事项

第一周不要做：

- PDF/Word/PPT 导出
- 供应商线索后台
- 数据库迁移
- 复杂 RAG
- 多人协作
- 投资人材料

## 6. 风险处理

### JSON 不稳定

处理：
- 允许模型先输出 Markdown
- 末尾输出 JSON fence
- 解析失败时 fallback Markdown
- 后续再考虑二次模型抽取

### 方案太长

处理：
- 前端卡片折叠
- 默认显示摘要
- 详细内容放展开区

### 法规错误

处理：
- Trust Layer 标注未收录/需确认
- 不把 AI 输出作为最终法律建议
- 高风险内容进入人工复核点

## 7. 本周完成定义

本周完成不等于最终产品完成。

完成定义：

- `/recommend` 能生成结构化方案包
- 方案可保存
- 方案可重新查看
- 5 个黄金问题跑通
- TypeScript 与 build 通过
- 用户可以看出这是“工作台方案包”，而不是普通聊天回答
