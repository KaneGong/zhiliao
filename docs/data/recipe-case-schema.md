# 配方案例库 v1 Schema — Recipe Case Library

> 日期：2026-05-30
> 所属：Formula Brief v1 / `/recommend` 结构化方案包
> 状态：草案，用于 prompt few-shot、golden question 扩展、人工评审与评测集建设；不是最终法规结论。

## 1. 目标

配方案例库 v1 是 Formula Brief 的“参考案例层”，用于让 AI 从单次聊天回答升级为可评审、可保存、可复用的新品配方方案包。

它服务四件事：

1. **Prompt 示例**：给模型提供结构化输出范式，减少大段 Markdown 和遗漏模块。
2. **Evaluation 基准**：作为 golden questions 的预期答案框架，检查结构完整、合规边界、供应商价值和风险提示。
3. **Trust Layer 输入**：为 Trust Score 提供“案例质量、法规覆盖、原料库覆盖、供应商匹配”的解释依据。
4. **供应商沟通起点**：把研发想法转成询样/报价/资料索取清单，形成 B 端可落地工作流。

## 2. 设计原则

- **案例不是配方定案**：只给方向、原料角色和复核点，不直接给最终添加量、标签结论或法规保证。
- **普通食品与保健食品分开表达**：普通食品只给场景、营养、风味、轻负担等表达；保健功能声称必须进入“禁用/需保健食品路径”。
- **未收录必须显式标注**：平台原料库、法规库暂未覆盖的原料，不允许伪装成已验证。
- **供应商匹配可为空**：宁可写“暂无平台匹配，需外采/补库”，不要编造供应商。
- **剂型和工艺约束前置**：软糖、液体饮、固体饮、乳制品、棒类的稳定性、口感、加工温度、货架期差异必须进入风险点。
- **适合评审而非营销夸张**：每条案例都应能被研发、法规、采购、供应商应用工程师讨论。

## 3. Case Record 字段

| 字段 | 类型 | 必填 | 说明 | 用于 Formula Brief |
|---|---|---:|---|---|
| `case_id` | string | 是 | 稳定 ID，建议 `RC-YYYYMMDD-###` | 追踪评测样例与后续版本 |
| `case_name` | string | 是 | 案例名称，包含品类和方向 | Product Brief 标题 |
| `status` | enum | 是 | 见第 4 节审核状态 | 控制是否可进入 prompt/eval |
| `quality_score` | object | 是 | 见第 5 节质量评分 | Trust Score / 数据可信度 |
| `scenario_tags` | string[] | 是 | 如 `助眠场景`、`低糖`、`儿童`、`银发` | 检索、few-shot 选择 |
| `target_user` | string | 是 | 目标人群和核心需求 | Product Brief.target_user |
| `product_format` | string | 是 | 剂型/食品形态 | Product Brief.剂型 |
| `regulatory_path` | enum | 是 | `普通食品优先` / `保健食品路径` / `特殊食品路径` / `待确认` | Product Brief.法规路径 |
| `positioning` | string | 是 | 一句话产品定位 | Markdown summary / 卡片摘要 |
| `consumer_job` | string | 否 | 用户购买/使用任务 | Product Brief.使用场景 |
| `formula_routes` | array | 是 | 2-3 条路线，建议保守/主流/创新 | Formula Routes |
| `core_ingredients` | array | 是 | 原料名称、角色、平台收录状态、法规收录状态 | Formula Routes + Trust Score |
| `supporting_ingredients` | array | 否 | 甜味、风味、酸味、膳食纤维、稳定体系等 | 工艺/口感注意点 |
| `compliance_boundaries` | object | 是 | 可用表达、不建议/禁用表达、需复核法规点 | Compliance Checks / Claim Suggestions |
| `supplier_match_logic` | array | 是 | 供应商/产品匹配思路，可含平台已有产品 ID | Supplier Matches |
| `risk_points` | string[] | 是 | 法规、配方、工艺、感官、供应链、适用人群风险 | Trust Score + Next Steps |
| `evidence_notes` | string[] | 是 | 数据依据说明，避免编造标准编号 | Trust Score.证据说明 |
| `next_steps` | string[] | 是 | 打样、法规复核、供应商资料、内部评审动作 | Next Steps |
| `review_owner` | enum[] | 是 | `研发` / `法规` / `采购` / `供应商应用` / `市场` | 人工复核分工 |
| `last_updated` | date | 是 | 最近更新日期 | 版本追踪 |
| `source_notes` | string[] | 否 | 内部数据来源，如原料库/法规库/供应商资料 | Trust Layer 可解释性 |

### 3.1 `formula_routes` 子字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `route_name` | string | 例如“保守普通食品路线”“高蛋白清爽路线” |
| `route_type` | enum | `保守` / `主流` / `创新` / `供应商驱动` |
| `best_for` | string | 适合什么用户/渠道/成本约束 |
| `core_ingredients` | string[] | 核心原料名称，不写最终定量结论 |
| `function_roles` | string[] | 原料在配方中的研发角色，如蛋白来源、口感、风味、营养强化 |
| `suggested_range_note` | string | 只写“需按法规/供应商建议/打样确认”，避免无依据精确剂量 |
| `cost_level` | enum | `低` / `中` / `高` / `待确认` |
| `evidence_level` | enum | `平台验证` / `部分验证` / `外部待核` / `概念假设` |
| `process_notes` | string[] | 溶解性、热稳定、pH、胶凝、包埋、沉淀、货架期等 |
| `main_risks` | string[] | 该路线主要风险 |

### 3.2 `core_ingredients` 子字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | 通用原料名 |
| `role` | string | 配方角色 |
| `platform_ingredient_match` | string | 平台原料库匹配，如 `GLA-A282 Avonlac 282`；无则写 `暂无平台匹配` |
| `platform_supplier_match` | string | 平台供应商匹配；无则写 `暂无平台匹配` |
| `regulation_match` | string | 法规库匹配状态，如 `法规库已收录：维生素D` / `法规库暂未收录` |
| `usage_boundary` | string | 普通食品/保健食品/新食品原料/营养强化剂等边界 |
| `review_required` | boolean | 是否必须人工复核 |

### 3.3 `compliance_boundaries` 子字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `ordinary_food_allowed_claims` | string[] | 普通食品更稳妥的表达，如“夜间轻负担”“蛋白质补充” |
| `avoid_or_forbidden_claims` | string[] | 禁用或不建议表达，如“改善睡眠”“增强免疫力”“降糖”“治疗骨质疏松” |
| `health_food_path_notes` | string[] | 若要使用保健功能声称，需要进入保健食品注册/备案路径的提醒 |
| `new_food_ingredient_notes` | string[] | GABA、透明质酸钠、乳矿物盐、HMB 等新食品原料的使用范围/人群/用量需核对公告 |
| `nutrition_fortification_notes` | string[] | 维生素、矿物质、DHA 等营养强化剂需核对 GB 14880 对食品类别和用量的限制 |
| `labeling_review_points` | string[] | 标签、适用人群、过敏原、营养成分表、渠道文案复核点 |

## 4. 审核状态

| 状态 | 含义 | 是否可用于 prompt | 是否可用于 eval | 说明 |
|---|---|---:|---:|---|
| `draft` | 数据 worker 初稿 | 否 | 可作为人工评审输入 | 当前 seed 案例默认状态 |
| `data_checked` | 已与平台原料库/法规库做基础对齐 | 可用于内部 prompt 实验 | 可用于结构完整性 eval | 不代表法规专家确认 |
| `regulatory_review` | 等待法规专家逐条复核 | 谨慎 | 可用于风险识别 eval | 涉及儿童、保健声称、新食品原料时常见 |
| `expert_approved` | 研发/法规/采购复核通过 | 可 | 可 | 可作为 v1 few-shot 正样例 |
| `deprecated` | 已过期或发现错误 | 否 | 否 | 不删除，保留变更原因 |

## 5. 质量评分

`quality_score.total` 建议 0-100，先用解释型评分，不做复杂算法。

| 维度 | 权重 | 评分说明 |
|---|---:|---|
| 结构完整度 | 20 | 是否覆盖 Product Brief、Routes、Compliance、Supplier、Risk、Next Steps |
| 法规边界清晰度 | 25 | 是否区分普通食品/保健食品/新食品原料/营养强化剂，是否列出禁用表达 |
| 原料库覆盖度 | 15 | 核心原料是否能映射到 `src/data/ingredients.json` 或明确未收录 |
| 供应商匹配价值 | 15 | 是否能给到平台供应商/产品 ID、询样资料动作或明确暂无匹配 |
| 配方可落地性 | 15 | 是否考虑剂型、口感、稳定性、成本、打样路径 |
| 风险提示完整度 | 10 | 是否覆盖法规、工艺、适用人群、渠道文案、供应链风险 |

### 建议门槛

- `<60`：只作灵感，不进入 prompt/eval。
- `60-74`：可用于结构化输出训练，但需显著人工标注。
- `75-84`：可用于 Week 1 eval 参考。
- `85+`：可作为 few-shot 正样例候选，但仍需法规专家确认。

## 6. 如何服务 Formula Brief v1

### 6.1 Prompt 侧

按用户问题选择 1-3 条相似案例，只喂：

- `positioning`
- `formula_routes`
- `compliance_boundaries`
- `supplier_match_logic`
- `risk_points`
- `next_steps`

不要把 `quality_score`、审核结论直接暴露给用户。

### 6.2 Evaluation 侧

每个 golden question 对应至少 1 条 seed case，评测时检查：

- 是否生成 2-3 条路线，而不是单一路线。
- 是否把高风险声称放进 `avoid_or_forbidden_claims`。
- 是否把普通食品可用表达和保健食品路径分开。
- 是否明确标注“平台暂无匹配/法规库暂未收录”。
- 是否提出供应商资料索取动作，如 COA、规格书、过敏原、稳定性、适用食品类别声明。

### 6.3 Trust Score 侧

案例库可为 Trust Score 提供解释：

- **法规覆盖度**：核心原料在法规库中有多少已匹配，哪些必须复核。
- **原料库覆盖度**：平台已有产品匹配数量，未收录原料数量。
- **供应商匹配度**：是否有明确供应商/产品 ID，是否能发起询样动作。
- **风险提示完整度**：是否覆盖声称、剂型、适用人群、工艺和渠道文案。

## 7. 人工复核优先级

P0 必须复核：

- 涉及儿童、孕产妇、银发慢病联想等敏感人群。
- 涉及“改善睡眠、增强免疫力、辅助降血糖、减肥、增加骨密度、美容”等保健功能或疾病联想。
- 涉及新食品原料、营养强化剂、可用于食品菌种、透明质酸钠、GABA、乳矿物盐、HMB、DHA 等限定使用范围的原料。
- 涉及直播电商、小红书等强营销渠道的宣称边界。

P1 建议复核：

- 添加量、成本测算、热加工稳定性、货架期、感官遮蔽、过敏原和特殊标签。
- 供应商规格书中是否允许该食品类别和加工条件。
