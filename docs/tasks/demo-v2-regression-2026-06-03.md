# Demo Question Set v2 回归记录

> 日期：2026-06-03  
> 范围：`docs/data/demo-question-set-v2.md` 中的 10 组演示问题；其中 DEMO2-Q-010 拆成透明质酸钠、乳铁蛋白、DHA/Omega-3 三个法规专项，实际 API 测试共 12 条。  
> 环境：本地 `npm run dev:demo`，base URL `http://127.0.0.1:3010`。  
> 原始结果：`docs/tasks/regression-runs/demo-v2-regression-20260602-171816.summary.json`。  
> 结论：本轮主控验收通过。发现并修复咖啡因能量饮高风险题偶发不输出结构化卡片的问题；复跑 GQ-014 与 DEMO2-Q-004 原题均通过。

## 1. 验证命令

```bash
npm run smoke:local
npm run check
GOLDEN_SET=all GOLDEN_IDS=GQ-014 GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=0 npm run test:golden:all
```

补充：使用临时脚本对 Demo v2 题单逐条调用 `/api/ai-recommend` 与 `/api/regulations`，结果写入：

```text
docs/tasks/regression-runs/demo-v2-regression-20260602-171816.summary.json
```

## 2. 环境与基础 smoke

| 项目 | 结果 | 备注 |
|---|---|---|
| 本地 demo 服务 | PASS | 旧 `next dev` 进程曾导致 smoke 卡住，重启后恢复 |
| `npm run smoke:local` | PASS | 首页、推荐、搜索、配方、法规、供应商页和核心 API 均通过 |
| `npm run check` | PASS | TypeScript noEmit 通过 |

## 3. Demo v2 API 回归结果

| ID | 页面 | 结果 | 结构化卡片 | 证据/原料命中 | 关键观察 |
|---|---|---|---|---|---|
| DEMO2-Q-001 | `/recommend` | PASS | 有 | 乳清蛋白 | 高蛋白正向样板稳定；有未收录/待复核提示 |
| DEMO2-Q-002 | `/recommend` | PASS | 有 | GABA、茶氨酸、酸枣仁 | 助眠需求可纠偏到夜间场景；无高风险 allowed 表达 |
| DEMO2-Q-003 | `/regulations` | PASS | 不适用 | GABA | 法规页能命中证据并提示不构成法律建议 |
| DEMO2-Q-004 | `/recommend` | 初跑 REVIEW，修复后 PASS | 修复后有 | 咖啡因、牛磺酸 | 初跑仅 Markdown；修复 prompt 后结构化卡片恢复 |
| DEMO2-Q-005 | `/recommend` | PASS | 有 | 葛根、枳椇子、维生素 C | 解酒/护肝红线被压住；保留聚会场景研发路线 |
| DEMO2-Q-006 | `/recommend` | PASS | 有 | 儿童益生菌 | 未把儿童菌株缺口包装成已验证供应商 |
| DEMO2-Q-007 | `/recommend` | PASS | 有 | 钾、镁、维生素 B6 | 运动补给场景未医疗化为治疗脱水/快速恢复 |
| DEMO2-Q-008 | `/recommend` | PASS | 有 | 钾、氯化钾、柠檬酸钾 | 低钠调味粉保留工艺方向，并提示标签/人群复核 |
| DEMO2-Q-009 | `/recommend` | PASS | 有 | 聚葡萄糖、抗性糊精、赤藓糖醇 | 低糖、高纤和肠道表达边界稳定 |
| DEMO2-Q-010A | `/regulations` | PASS | 不适用 | 透明质酸钠 | 法规专项查询稳定 |
| DEMO2-Q-010B | `/regulations` | PASS | 不适用 | 乳铁蛋白 | 婴幼儿/特膳敏感路径提示稳定 |
| DEMO2-Q-010C | `/regulations` | PASS | 不适用 | DHA、鱼油、Omega-3 | DHA/Omega-3 路径分流与人工复核提示稳定 |

## 4. 本轮发现的问题与修复

### 问题：咖啡因能量饮高风险题偶发只输出 Markdown

- **表现**：DEMO2-Q-004 初跑时内容方向正确，能说明普通食品边界，也没有把供应商误标为已验证，但未输出 `formula_brief_json`，前端会退回纯 Markdown。
- **判断**：这是 prompt 对“高风险功能词但仍需结构化输出”的约束不够硬。模型在合规风险高时容易选择只写法规解释，不继续生成 Formula Brief 卡片。
- **修复文件**：
  - `src/app/api/ai-recommend/prompt.ts`
  - `src/lib/formula-brief.ts`
- **修复内容**：
  - 明确新增咖啡因/能量饮表达边界：原料事实、低糖清爽、下午茶/加班场景可讨论；提神、专注、抗疲劳、增强精力、提升工作效率不得作为普通食品正向声称。
  - 明确要求：即使用户需求包含高风险功能词，也必须输出完整 `formula_brief_json`，不能只输出 Markdown。
  - 补充咖啡因/能量饮的安全表达与风险表达推断。

### 修复后复跑

| 命令/题目 | 结果 | 关键指标 |
|---|---|---|
| `GQ-014` | PASS | brief=Y，routes=3，checks=3，jsonFence=N，riskyAllowed=0 |
| DEMO2-Q-004 原题 | PASS | sawDone=Y，hasBrief=Y，routes=3，checks=3，riskyAllowed=0 |

## 5. 主控结论

Demo v2 可作为当前展示题单使用。建议演示时优先使用：

1. 高蛋白运动饮：展示完整 Formula Brief。
2. 助眠软糖 + GABA 法规查询：展示高风险纠偏和证据追溯。
3. 咖啡因能量饮：展示 Public Evidence 第二批能力和能量饮表达边界。
4. 饮酒场景软糖：展示解酒/护肝红线控制。
5. 膳食纤维气泡水或低钠调味粉：展示普通食品可落地的配方工程价值。

## 6. 后续建议

- 可以把 Demo v2 中 3-5 个最稳题做成演示截图或短视频脚本。
- 可以给 01 会话派发一个轻量 UI 任务：在 Formula Brief 卡片中更显性区分“公开证据 / 待复核 / 供应商索资”。
- 可以给 02 会话派发供应商候选公开资料任务，但仍不得标记 Supplier Verified。
