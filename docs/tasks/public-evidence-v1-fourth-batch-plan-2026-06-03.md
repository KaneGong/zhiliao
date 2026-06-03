# Public Evidence v1 — 第四批原料卡任务包

> 日期：2026-06-03
> 状态：ready for 02-data session
> 目标：在 45 张卡基础上，继续扩展 15 张高频/高风险原料证据卡，优先覆盖睡眠、体重管理、甜味剂、抗氧化、功能油脂/藻类和敏感免疫表达边界。
> 边界：只做公开法规/公开证据卡，不做 Supplier Verified；不改 `src/app`、API、prompt。

## 1. 当前基线

截至 2026-06-03，Public Evidence v1 已完成：

- 45 ingredient cards；
- 8 regulatory paths；
- 32 sources；
- 已接入 `/recommend` 和 `/regulations` 的最小 prompt 注入；
- 未收录原料走“未收录 / 待复核”路径；
- Public Evidence 与 Supplier Verified 已在 UI 中显性分层。

第四批目标不是无限扩表，而是补 Demo v2 和下一阶段最容易被用户问到、也最容易出错的敏感原料边界。

## 2. 第四批建议新增 15 张卡

| # | 原料 / 方向 | 主要风险 | 建议法规路径 | 处理优先级 |
|---:|---|---|---|---|
| 1 | 褪黑素 | 普通食品路径高度敏感，睡眠声称和保健食品边界 | health_food / ordinary_food_caution | P0 |
| 2 | 酪蛋白水解肽 / Lactium | 改善睡眠、缓解压力表达高风险；具体原料身份需复核 | ordinary_food_caution / novel_food_review | P0 |
| 3 | GABA 衍生/复配边界 | 已有 GABA 卡，但复配“助眠/抗焦虑”易过界 | ordinary_food_caution | P0 |
| 4 | 白芸豆提取物 | 阻断淀粉、减肥、控糖表达高风险 | ordinary_food_caution / health_food | P0 |
| 5 | 绿茶提取物 / EGCG | 减脂、抗氧化、咖啡因、肝损伤争议；限量需复核 | ordinary_food_caution | P0 |
| 6 | 雨生红球藻 / 虾青素 | 新食品原料/公告边界、抗氧化和护眼表达 | novel_food / ordinary_food_caution | P0 |
| 7 | 辅酶 Q10 | 保健食品常见，普通食品路径和声称边界敏感 | health_food / ordinary_food_caution | P0 |
| 8 | 磷脂酰丝氨酸 PS | 新食品原料公告、儿童/脑力/记忆声称高风险 | novel_food / ordinary_food_caution | P0 |
| 9 | 低聚异麦芽糖 IMO | 膳食纤维、益生元表达边界；糖/能量标识 | ordinary_food / nutrition_label | P1 |
| 10 | 阿洛酮糖 | 新型甜味/糖替代，国内法规状态需谨慎 | novel_food_review / additive_review | P1 |
| 11 | 甜菊糖苷 | 食品添加剂路径，使用范围和限量依 GB 2760 | food_additive | P1 |
| 12 | 罗汉果甜苷 | 食品添加剂/甜味剂路径，使用范围和限量需复核 | food_additive | P1 |
| 13 | 藻蓝蛋白 / 螺旋藻 | 色素/普通食品/新资源边界、儿童和免疫表达 | ordinary_food_caution / additive_review | P1 |
| 14 | 姜黄 / 姜黄素 | 色素、植物提取物、抗炎/护肝表达高风险 | food_additive / ordinary_food_caution | P1 |
| 15 | 牛初乳 / 免疫球蛋白方向 | 婴幼儿、免疫、乳源过敏和食品属性敏感 | special_population / ordinary_food_caution | P1 |

## 3. 每张卡必须包含字段

文档版和 JSON 版需同步。字段沿用 v1：

- `id`
- `name`
- `aliases`
- `regulatory_identity`
- `applicable_paths`
- `allowed_discussion_scenarios`
- `prohibited_or_high_risk_claims`
- `unsuitable_population_or_label_notes`
- `manual_review_points`
- `official_sources`
- `confidence`
- `last_checked_at`
- `manual_review_required`

建议新增可选字段：

- `evidence_summary_short`：运行时 prompt 可注入的短摘要；
- `full_review_notes`：文档中保留完整审阅细节；
- `source_quality`：`official_regulation` / `national_standard` / `official_supplier_public` / `reference_only`。

## 4. 质量原则

1. **官方优先**：官方法规、国家标准、国家卫健委/市场监管总局公告、GB 标准、供应商官网公开资料优先。
2. **不能用论文直接下法规结论**：论文只能说明研究背景，不得作为“可用于某食品类别”的依据。
3. **不确定就写待复核**：没有明确法规依据时，卡片必须写 `manual_review_required: true`。
4. **高风险表达必须显性列出**：睡眠、减肥、抗焦虑、抗疲劳、抗衰、护肝、免疫、护眼、控糖、改善记忆等必须进入风险表达。
5. **供应商资料不等于法规允许**：供应商官网只证明产品存在或应用方向，不能替代中国法规判断。
6. **儿童 / 婴幼儿 / 特膳单独 gate**：任何涉及儿童、孕妇、婴幼儿、老年疾病人群的用语都要单列复核。

## 5. 高敏原料处理说明

### 5.1 褪黑素

- 预期结论应保守：普通食品中不可直接按助眠卖点推荐，优先提示保健食品或其他监管路径复核。
- 禁用表达：改善睡眠、治疗失眠、调节褪黑素分泌、无依赖助眠。
- 需核查：保健食品原料目录/功能目录、普通食品适用性、跨境或海外法规不得直接套用中国市场。

### 5.2 Lactium / 酪蛋白水解肽

- 关键不是“供应商有产品”，而是中国普通食品适用路径和声称边界。
- 禁用表达：缓解焦虑、降低压力、改善睡眠障碍、镇静。
- 需核查：具体原料身份、生产工艺、食品级资质、目标食品类别、乳源过敏提示。

### 5.3 白芸豆 / 绿茶提取物 / EGCG

- 体重管理和控糖表达必须高敏。
- 禁用表达：阻断碳水吸收、减肥、燃脂、降糖、降脂。
- 需核查：食品属性、提取物规格、咖啡因或 EGCG 含量、安全摄入提示。

### 5.4 虾青素 / PS / CoQ10

- 多数用户会按“护眼、脑力、抗疲劳、心血管”来问，必须提示路径区分。
- 需把新食品原料公告、保健食品路径、普通食品声称分开。
- 不得把“可作为原料”扩展为“可宣称功效”。

### 5.5 阿洛酮糖 / 甜菊糖苷 / 罗汉果甜苷

- 必须区分食品添加剂、甜味剂、普通食品原料、新食品原料等路径。
- 重点核查 GB 2760 使用范围、限量、食品类别。
- AI 输出中要避免“天然甜味剂所以随便添加”的表述。

### 5.6 牛初乳 / 免疫球蛋白

- 婴幼儿、儿童、免疫力表达高风险。
- 必须单列乳源过敏、不适宜人群和目标食品类别。
- 不能把“免疫球蛋白含量”包装为增强免疫力的普通食品声称。

## 6. 02 会话执行提示词

可直接复制给 02：

```text
你是知料 02-数据与案例会话。请在项目路径 /Users/kgong/Work/AI Work/AI Projects/知料/zhiliao 工作。

任务：执行 Public Evidence v1 第四批扩展，不改 src/app、API、prompt。

请读取：
1. AGENTS.md
2. docs/tasks/public-evidence-v1-fourth-batch-plan-2026-06-03.md
3. docs/data/public-evidence-ingredient-cards-v1.md
4. docs/data/public-evidence-regulatory-map-v1.md
5. docs/data/public-evidence-source-register-v1.md
6. src/data/public_evidence/ingredient_cards.v1.json
7. src/data/public_evidence/regulatory_map.v1.json
8. src/data/public_evidence/sources.v1.json

目标：新增第四批 15 张原料证据卡，并同步文档版和 JSON 版。不要新增供应商运行数据。不要把公开资料标为 Supplier Verified。

15 张卡：褪黑素、酪蛋白水解肽/Lactium、GABA 衍生/复配边界、白芸豆提取物、绿茶提取物/EGCG、雨生红球藻/虾青素、辅酶 Q10、磷脂酰丝氨酸 PS、低聚异麦芽糖 IMO、阿洛酮糖、甜菊糖苷、罗汉果甜苷、藻蓝蛋白/螺旋藻、姜黄/姜黄素、牛初乳/免疫球蛋白方向。

验收：
- JSON 可解析；
- 总卡数从 45 增至 60；
- 每张新增卡至少 1 个官方/国家标准/官方公告/官方供应商公开来源；
- 高风险原料必须 manual_review_required=true；
- 不出现平台已索资/已验证供应商表述；
- 更新 source register；
- 新增一份验收记录到 docs/tasks/。
```

## 7. 主控验收清单

第四批完成后，主控验收：

```bash
node -e "const cards=require('./src/data/public_evidence/ingredient_cards.v1.json'); console.log(cards.length)"
node -e "const s=require('./src/data/public_evidence/sources.v1.json'); console.log(s.length)"
npm run verify
npm run smoke:local
```

专项 API 建议：

1. “褪黑素能不能做普通食品助眠软糖？”
2. “白芸豆提取物可以做减肥代餐吗？”
3. “阿洛酮糖能不能作为零糖饮料甜味剂？”
4. “虾青素和叶黄素做儿童护眼软糖怎么处理？”
5. “牛初乳能不能宣称增强免疫力？”

验收重点：

- 能给研发方向，但法规/用量/声称/供应商必须待复核；
- 不输出普通食品高风险功效承诺；
- 不把供应商公开资料当平台已核验供应商；
- 不卡死，不输出过长证据卡。
