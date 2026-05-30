# 知料数据修复包 1 — 20Q 商业闭环补强

> 日期：2026-05-30
> 触发来源：Formula Brief v1 20Q 改进后复跑
> 对应结果文档：`docs/tasks/golden-question-results-2026-05-30-20q-rerun.md`
> 状态：已转成结构化 seed 数据，仍为 `draft`，不代表已完成供应商或法规验证。

## 1. 本包目标

把 20Q 复跑中暴露的两类问题转成可持续修复的数据资产：

1. **供应商可用匹配为 0**：`GQ-003 / GQ-007 / GQ-010 / GQ-013 / GQ-015 / GQ-017 / GQ-019`
2. **未收录 / 误判原料**：`GQ-014 B族维生素`、`GQ-020 燕麦纤维`、`GQ-006 可溶性膳食纤维组合`、`GQ-004 / GQ-016 蛋白描述词`

本包不追求一次性补成 verified 数据，而是先让 Formula Brief 能稳定做到：

- 明确哪些场景只有补库线索，不是平台现货；
- 明确哪些表达不能作为普通食品可用声称；
- 明确下一步应该向供应商索取什么资料；
- 避免为了展示“匹配”而乱凑不相关供应商。

## 2. 已新增 / 扩展的结构化 seed

截至 2026-05-30 本包落地后：

- Ingredient Profiles：11 条
- Supplier Specs：10 条
- Regulatory Rules：10 条
- Formula Brief seed scenarios：10 个

| 场景 | Ingredient Profile | Supplier Spec | Regulatory Rule | 覆盖 GQ |
|---|---|---|---|---|
| 儿童益生菌 | `ING-PROBIOTIC-CHILD-001` | `SUP-PROBIOTIC-CHILD-SEED-001` | `REG-CLAIM-CHILD-PROBIOTIC-001` | GQ-003 |
| 植物基蛋白 | `ING-PLANT-PROTEIN-BLEND-001` | `SUP-PLANT-PROTEIN-SEED-001` | `REG-CLAIM-PLANT-PROTEIN-001` | GQ-007 |
| 免疫方向营养饮 | `ING-IMMUNE-NUTRITION-001` | `SUP-IMMUNE-NUTRITION-SEED-001` | `REG-CLAIM-IMMUNE-NUTRITION-001` | GQ-010 |
| 电解质果冻 | `ING-ELECTROLYTE-JELLY-001` | `SUP-ELECTROLYTE-JELLY-SEED-001` | `REG-CLAIM-ELECTROLYTE-JELLY-001` | GQ-013 |
| 饮酒场景软糖 | `ING-SOCIAL-GUMMY-HERBAL-001` | `SUP-SOCIAL-GUMMY-SEED-001` | `REG-CLAIM-SOCIAL-DRINKING-001` | GQ-015 |
| 低钠调味粉 | `ING-LOW-SODIUM-SEASONING-001` | `SUP-LOW-SODIUM-SEASONING-SEED-001` | `REG-CLAIM-LOW-SODIUM-001` | GQ-017 |
| 植物甾醇酸奶 | `ING-PLANT-STEROL-YOGURT-001` | `SUP-PLANT-STEROL-YOGURT-SEED-001` | `REG-CLAIM-PLANT-STEROL-001` | GQ-019 |
| 咖啡因/B族维生素能量饮 | `ING-CAFFEINE-BVITAMIN-001` | `SUP-CAFFEINE-BVITAMIN-SEED-001` | `REG-CLAIM-CAFFEINE-ENERGY-001` | GQ-014 |
| 燕麦纤维烘焙体系 | `ING-OAT-FIBER-BAKERY-001` | `SUP-OAT-FIBER-BAKERY-SEED-001` | `REG-CLAIM-OAT-FIBER-BAKERY-001` | GQ-020 |
| 可溶性膳食纤维轻负担体系 | `ING-SOLUBLE-FIBER-LIGHT-001` | `SUP-SOLUBLE-FIBER-LIGHT-SEED-001` | `REG-CLAIM-SOLUBLE-FIBER-LIGHT-001` | GQ-006 / GQ-018 |
| 烘焙适用乳清蛋白方向 | `ING-BAKERY-WHEY-PROTEIN-001` | 复用 `SUP-OAT-FIBER-BAKERY-SEED-001` | 复用 `REG-CLAIM-OAT-FIBER-BAKERY-001` | GQ-020 |

对应文件：

- `src/data/formula_brief_seeds/ingredient_profiles.seed.json`
- `src/data/formula_brief_seeds/supplier_specs.seed.json`
- `src/data/formula_brief_seeds/regulatory_rules.seed.json`
- `src/lib/formula-brief-seeds.ts`

## 3. 已接入的运行逻辑

- `src/lib/formula-brief-seeds.ts` 已扩展为 10 个场景配置。
- `src/app/api/ai-recommend/prompt.ts` 通过 `buildFormulaBriefSeedBlock()` 注入场景化 seed 提醒。
- `src/lib/formula-brief.ts` 在 normalize 阶段使用 seed 做三件事：
  1. 过滤明显错误的供应商匹配；
  2. 注入高风险表达和人工复核点；
  3. 把资料缺口写入 next steps。
- `scripts/run-golden-questions.mjs` 已支持 `GOLDEN_IDS`，可定向回归低分题。
- `src/lib/verify-output.ts` 已补强 seed 覆盖和误判过滤：
  - seed 原料命中后标为 `Seed待复核`，不再当作 `not_found`；
  - 支持 `小分子/浓缩/分离/速溶/热稳定` 等描述性前缀覆盖已知原料；
  - 支持 `菊粉或聚葡萄糖` 等组合原料拆分；
  - 过滤 `优质蛋白` 等概念词，避免误记为未收录原料。

## 4. 文档沉淀

- `docs/data/low-score-repair-matrix-v1.md` 已从 3 题扩展到 7 题商业闭环修复矩阵。
- `docs/data/recipe-cases-seed-2026-05-30.md` 已补齐 `RC-20260530-013` ~ `RC-20260530-020`，实现 20Q 全覆盖。
- 本文件作为数据修复包 1 的总索引。

## 5. 验证节奏

### 2026-05-30 数据修复包 1 验证结果

- 全量 20Q 候选最终日志：`docs/tasks/regression-runs/golden-20q-final-clean-after-all-verifier-fixes-20260530-085625.log`
  - 20/20 技术通过
  - 20/20 有结构化 brief
  - 20/20 有 SSE `[DONE]`
  - 20/20 有 verification
  - 0 次重试
  - `jsonLeaks=0`
  - `riskyAllowedCount=0`
  - Trust Score 平均值：75.75
  - 残留 false positive：`GQ-016` 的 `优质蛋白`
- 残留 false positive 定向修复日志：`docs/tasks/regression-runs/golden-targeted-gq016-after-concept-filter-20260530-090652.log`
  - GQ-016 1/1 通过
  - unknown=0
  - `jsonLeaks=0`
  - `riskyAllowedCount=0`
- 其他定向修复日志：
  - `docs/tasks/regression-runs/golden-targeted-gq004-after-whey-prefix-fix-20260530-085544.log`
  - `docs/tasks/regression-runs/golden-targeted-gq006-after-composite-ingredient-fix-20260530-084516.log`
  - `docs/tasks/regression-runs/golden-targeted-gq005-after-known-prefix-20260530-081716.log`

每次修改 seed、prompt 或 sanitizer 后按顺序执行：

```bash
npx tsc --noEmit
GOLDEN_SET=all GOLDEN_IDS=GQ-003,GQ-007,GQ-010,GQ-013,GQ-015,GQ-017,GQ-019 GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all
GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all
```

判断标准：

- 定向 7 题必须技术通过；
- 20Q 全量必须技术通过；
- `jsonLeaks=0`；
- `riskyAllowedCount=0`；
- 如果供应商仍为 0，必须在方案中明确“暂无平台匹配 / 需补资料”，不能乱匹配。

## 6. 后续真实数据补库顺序

1. 儿童益生菌菌株：先找 2-3 个可询样供应商。
2. 植物基蛋白：先找饮料级豌豆/大米/大豆蛋白资料。
3. 植物甾醇酯：先确认公告范围、限量和酸奶应用可能性。
4. 电解质果冻与低钠调味：补调味/胶体/矿物质供应链。
5. B 族维生素、燕麦纤维、可溶性膳食纤维、烘焙适用乳清蛋白：作为原料库完整性修补项。
