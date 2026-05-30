# 知料数据修复包 2 — 演示高频场景法规/供应商补强

> 日期：2026-05-30
> 触发来源：数据与案例 agent 接续维护 20Q 数据资产
> 状态：已补结构化 seed JSON；仍为 `draft` / `needs_regulatory_review` 或 `needs_supplier_docs`，不代表已完成法规结论或真实供应商验证。
> 边界：本包只改 `docs/data/` 与 `src/data/formula_brief_seeds/*.json`，不改 `src/app/`、API route、prompt 或业务页面。

## 1. 本包目标

数据修复包 1 已把 20Q 中供应商闭环弱项和未收录原料转成 11 条 Ingredient Profile、10 条 Supplier Spec、10 条 Regulatory Rule。本包继续补 **演示高频但资料链仍偏薄** 的 4 个场景：

1. `GQ-001` 夜间场景软糖：GABA / 茶叶茶氨酸 / 低糖软糖；
2. `GQ-005` 女性胶原饮：胶原蛋白肽 / 透明质酸钠 / 维 C / 小红书和直播话术；
3. `GQ-011` 儿童 DHA 果味粉：DHA 藻油 / 包埋粉 / 儿童成长文案边界；
4. `GQ-012` 成人 Omega-3：鱼油 / 藻油 / 普通食品与保健食品路径分流。

本包优先解决三件事：

- 让验证器能识别更多常见原料别名，减少“未收录”误判；
- 固定供应商资料索取清单，避免把“待补供应商”误写成平台现货；
- 固定高风险表达边界，尤其是睡眠、美容、儿童成长、血脂/心血管方向。

## 2. 已新增结构化 seed

| 场景 | Ingredient Profile | Supplier Spec | Regulatory Rule | 覆盖 GQ |
|---|---|---|---|---|
| 夜间场景软糖 | `ING-SLEEP-GABA-THEANINE-001` | `SUP-SLEEP-GABA-THEANINE-SEED-001` | `REG-CLAIM-SLEEP-SCENE-001` | GQ-001 |
| 女性胶原饮 | `ING-COLLAGEN-HA-VC-001` | `SUP-HA-COLLAGEN-DRINK-SEED-001` | `REG-CLAIM-BEAUTY-COLLAGEN-001` | GQ-005 |
| 儿童 DHA 果味粉 | `ING-DHA-ALGAE-OIL-CHILD-001` | `SUP-DHA-ALGAE-OIL-SEED-001` | `REG-CLAIM-CHILD-DHA-001` | GQ-011 |
| 成人 Omega-3 路径分流 | `ING-OMEGA3-FISH-ALGAE-001` | `SUP-OMEGA3-FISH-ALGAE-SEED-001` | `REG-CLAIM-OMEGA3-PATH-SPLIT-001` | GQ-012 |

落地后当前结构化 seed 规模：

- Ingredient Profiles：15 条
- Supplier Specs：14 条
- Regulatory Rules：14 条

对应文件：

- `src/data/formula_brief_seeds/ingredient_profiles.seed.json`
- `src/data/formula_brief_seeds/supplier_specs.seed.json`
- `src/data/formula_brief_seeds/regulatory_rules.seed.json`

## 3. 官方来源索引（用于后续人工复核）

> 本包只把官方来源作为 seed 的 `source_refs` 和复核入口，不把其中任何条款自动等同为最终产品合规结论。具体食品类别、添加量、不适宜人群、标签提示仍需法规专家复核。

| 方向 | 复核入口 | 用途 |
|---|---|---|
| GABA / γ-氨基丁酸 | 国家卫健委政务服务平台：2009 年第 12 号相关公告页面 | 复核 GABA 作为新资源食品相关原料的公告来源、质量要求和使用边界 |
| 新食品原料目录 | 国家卫健委食品安全标准与监测评估司：新食品原料、添加剂新品种等公告目录 PDF | 作为 GABA、茶叶茶氨酸、透明质酸钠、DHA 藻油、鱼油及提取物、植物甾醇酯等方向的检索入口 |
| DHA 藻油 / 鱼油 / 植物甾醇酯 | 国家卫健委 2010 年第 3 号公告相关页面 | 复核 DHA 藻油、棉籽低聚糖等新资源食品公告入口，以及鱼油及提取物、植物甾醇酯等扩大使用范围入口 |
| 透明质酸钠 | 国家卫健委：关于蝉花子实体、透明质酸钠等“三新食品”公告解读 | 复核透明质酸钠食用范围、不适宜人群、推荐食用量和标签提示入口 |
| 营养强化剂 | GB 14880《食品安全国家标准 食品营养强化剂使用标准》PDF | 复核维 C、维 D、钙、锌等营养强化剂食品类别和使用量 |
| 营养标签 / 声称 | 国家卫健委：GB 28050-2025 问答 | 复核低糖、低钠、高蛋白等营养声称和标签表达条件 |

## 4. 新增记录的使用边界

### 4.1 夜间场景软糖

- 可用于提示：`夜间场景`、`低糖轻负担`、`添加 GABA / 茶叶茶氨酸`。
- 必须禁用或高风险复核：`助眠`、`改善睡眠`、`安神`、`缓解焦虑`、`治疗失眠`。
- 供应商索资重点：GABA / 茶叶茶氨酸规格书、COA、公告适配说明、推荐添加量、软糖热稳定和低糖胶体案例。

### 4.2 女性胶原饮

- 可用于提示：`添加胶原蛋白肽`、`清爽低糖`、`日常饮用`、`果味胶原饮`。
- 必须禁用或高风险复核：`美容养颜`、`改善皮肤`、`锁水`、`补水`、`抗氧化`、`抗衰`、`逆龄`、`水光肌`。
- 供应商索资重点：透明质酸钠公告适配、不适宜人群、推荐食用量、胶原肽来源/分子量/腥味遮蔽、维 C 使用路径。

### 4.3 儿童 DHA 果味粉

- 可用于提示：`添加 DHA 藻油`、`儿童日常营养粉`、`果味冲饮`。
- 必须禁用或高风险复核：`提高智力`、`改善视力`、`提高学习成绩`、`促进大脑发育`、`护眼`、`变聪明`。
- 供应商索资重点：DHA 含量、包埋率、氧化指标、包埋壁材、儿童适用年龄说明、腥味遮蔽和返味数据。

### 4.4 成人 Omega-3 路径分流

- 普通食品路径可用于提示：`日常脂质营养补充`、`添加鱼油或藻油来源 Omega-3`、`EPA/DHA 规格以供应商资料为准`。
- 普通食品路径不得表达：`辅助降血脂`、`降血脂`、`保护心血管`、`预防三高`、`预防心脑血管疾病`。
- 若要表达血脂/心血管方向，应单独评估保健食品注册/备案路径。
- 供应商索资重点：EPA/DHA 含量、食品级资质、氧化指标、污染物/重金属资料、普通食品与保健食品资料包差异。

## 5. 与运行逻辑的关系

- `src/lib/verify-output.ts` 会读取 `ingredient_profiles.seed.json`，因此本包新增的原料别名可帮助减少验证器“未收录”误判。
- 当前未修改 `src/lib/formula-brief-seeds.ts` 的 `SEED_SCENARIOS`，所以这 4 个新增场景暂不自动进入 prompt seed 场景注入。
- 后续如果产品 agent 要把这 4 个场景接入运行逻辑，应单独修改 `src/lib/formula-brief-seeds.ts`，并按既有流程先跑定向 GQ，再跑 20Q 全量回归。

## 6. 建议验证节奏

本包已完成 JSON 解析级验证。若后续要验证运行效果，建议顺序：

```bash
npx tsc --noEmit
GOLDEN_SET=all GOLDEN_IDS=GQ-001,GQ-005,GQ-011,GQ-012 GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all
GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all
```

验收标准：

- 4 个定向题技术通过；
- `jsonLeaks=0`；
- `riskyAllowedCount=0`；
- 不把 `待补充供应商` 写成 `platform_available=true`；
- 如使用 GABA、透明质酸钠、DHA、鱼油/藻油、维 C 等原料，必须明确“需按目标食品类别、添加量、标签和不适宜人群复核”。

## 7. 下一步

1. 若只做数据资产：继续补 `GQ-004` 银发骨骼乳制品的钙/维 D/乳矿物盐强化边界与索资模板。
2. 若要接入运行：把本包 4 个场景加入 `src/lib/formula-brief-seeds.ts`，再跑定向 4Q + 20Q。
3. 若要进入商业补库：优先找真实供应商资料，不要继续增加“待补充 A”式占位记录。

## 8. 2026-05-30 定向验证结果

> 命令：`GOLDEN_SET=all GOLDEN_IDS=GQ-001,GQ-005,GQ-011,GQ-012 GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all`
> 原始日志：`docs/tasks/regression-runs/golden-targeted-data-repair-2-4q-20260530-094120.log`

| ID | 结果 | Routes | Checks | Supplier Matches | 可用供应商 | Trust | unknown | JSON 可见 | 高风险可用表达 | Attempts |
|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|
| GQ-001 | PASS | 3 | 3 | 2 | 2 | 94 | 0 | 否 | 0 | 1 |
| GQ-005 | PASS | 3 | 3 | 5 | 2 | 82 | 0 | 否 | 0 | 1 |
| GQ-011 | PASS | 3 | 2 | 3 | 2 | 83 | 0 | 否 | 0 | 1 |
| GQ-012 | PASS | 3 | 3 | 4 | 4 | 94 | 0 | 否 | 0 | 1 |

自动化结论：

- 4/4 定向题技术通过；
- 4/4 有结构化 brief、SSE `[DONE]` 和 verification；
- `unknown=0`，说明本包新增原料别名已能被验证器覆盖；
- `jsonLeaks=0`、`riskyAllowedCount=0`；
- 0/4 需要重试。

人工复核注意：

- 本表只证明自动化回归通过，不等同于法规专家审查通过。
- GQ-005 / GQ-011 仍出现 `hasUnavailablePlaceholder=true`，说明方案里仍含“待补/暂无匹配”类补库提示；这符合当前“先补 seed 与证据，不伪造真实供应商”的策略。
- 下一步不再新增“待补充 A”式 JSON 占位，应转向真实供应商资料索取与入库评估。
