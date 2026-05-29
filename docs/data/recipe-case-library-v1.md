# 知料种子配方案例库 v1 — Schema 与首批草案

> 日期：2026-05-29
> 状态：draft，仅用于 AI 方案质量训练、Golden Questions 回归和人工评审，不作为最终法规或配方建议。
> 定位：这是“种子案例 / 标杆样例 / 评测资产”，不是未来平台需要手工维护的完整商业案例数据库。
> 目标：为 Formula Brief v1 提供可复用的食品研发案例结构和少量高质量样板，后续可转成 JSON 数据并注入 prompt / RAG / 案例推荐。

## 0. 使用边界

这份文档不是要人工穷举所有食品行业案例，而是先固定一套可迭代的案例结构：

- **少量高质量种子案例**：用于定义平台输出标准、覆盖典型品类和高风险声称边界。
- **Golden Questions 评测样本**：用于回归测试 Formula Brief 是否稳定、严谨、可用。
- **后续数据入口模板**：未来供应商资料、用户项目、法规整理和公开案例都可以按同一 schema 结构化沉淀。
- **非完整数据库**：真正的方案应由 AI 结合用户需求、原料/法规/供应商数据动态生成，而不是依赖人工预写所有答案。

## 1. 案例 Schema 草案

每条案例应至少包含：

| 字段 | 说明 |
|---|---|
| case_id | 案例编号，例如 `CASE-001` |
| category | 品类，例如运动营养、儿童营养、银发营养 |
| product_concept | 一句话产品概念 |
| target_audience | 目标人群 |
| dosage_form | 剂型/形态 |
| core_ingredients | 核心原料，写通用名 |
| supporting_ingredients | 辅助原料或风味/工艺体系 |
| formula_logic | 配方逻辑，不写疾病治疗承诺 |
| compliance_flags | 普通食品、保健食品、新食品原料、营养强化剂等提醒 |
| supplier_fit | 平台已有供应商 / 暂无平台匹配 / 需补库 |
| claim_boundary | 可用表达与禁用表达边界 |
| next_research | 下一步需要查证或补充的数据 |
| review_status | draft / reviewed / verified |

## 2. 首批案例草案

### CASE-001 低糖夜间场景软糖

- category：睡前场景 / 休闲糖果
- product_concept：面向办公人群的低糖夜间场景软糖，以 GABA、茶氨酸等原料事实和风味体验建立差异化。
- target_audience：办公人群、轻压力人群、夜间零食用户
- dosage_form：果胶软糖
- core_ingredients：GABA、茶氨酸、果胶、赤藓糖醇/其他甜味体系
- supporting_ingredients：西柚、柠檬、白桃、洋甘菊风味
- formula_logic：围绕“睡前场景、低糖轻负担、温和风味”设计，不承诺改善睡眠。
- compliance_flags：GABA、茶氨酸适用范围和每日摄入量需复核；不得使用助眠、改善睡眠、安神等表达。
- supplier_fit：Lactium 方向平台有供应商；GABA、茶氨酸、软糖基料需补库。
- claim_boundary：可用“睡前场景、低糖、含 GABA”；禁用“助眠、改善睡眠、放松身心”。
- next_research：补充 GABA/茶氨酸法规公告、甜味体系、软糖稳定性案例。
- review_status：draft

### CASE-002 清爽高蛋白运动饮

- category：运动营养
- product_concept：运动后蛋白补充饮，强调高蛋白、清爽口感和成本可控。
- target_audience：健身男性、轻运动人群
- dosage_form：RTD 蛋白饮 / 固体饮料二选一
- core_ingredients：浓缩乳清蛋白、分离乳清蛋白、水解乳清蛋白
- supporting_ingredients：酸味体系、甜味体系、稳定剂、风味遮蔽体系
- formula_logic：以 WPC 控成本，以 WPI/水解蛋白改善清爽度和溶解性。
- compliance_flags：高蛋白、低糖等表达需满足营养标签条件；避免增肌、缓解疲劳等表达。
- supplier_fit：平台已有 Glanbia、Wheyco 等蛋白供应商。
- claim_boundary：可用“运动后蛋白补充、高蛋白、清爽口感”；禁用“快速增肌、恢复体能”。
- next_research：补耐酸乳清、UHT/低 pH 稳定性、RTD 打样工艺。
- review_status：draft

### CASE-003 儿童益生菌固体饮料

- category：儿童营养
- product_concept：家长容易理解的儿童益生菌固体饮料，以菌株信息和日常营养场景表达。
- target_audience：3 岁以上儿童家庭
- dosage_form：果味固体饮料
- core_ingredients：益生菌菌株、低聚果糖、低聚半乳糖
- supporting_ingredients：水果粉、抗结剂、包埋保护体系
- formula_logic：用“菌株 + 益生元 + 好喝”建立产品力，但不承诺调节肠道菌群。
- compliance_flags：需确认菌株适用人群、活菌数、固体饮料标准和标签要求。
- supplier_fit：平台暂无核心益生菌菌株供应商，需补库。
- claim_boundary：可用“添加 XX 菌株、日常营养、果味冲饮”；禁用“调节肠道菌群、增强免疫、改善消化”。
- next_research：补儿童适用菌株、活菌稳定性、供应商规格书模板。
- review_status：draft

### CASE-004 银发高钙高蛋白乳制品

- category：银发营养
- product_concept：面向银发人群的日常高钙高蛋白乳制品。
- target_audience：中老年人、银发家庭消费人群
- dosage_form：调制乳 / 含乳饮料 / 营养粉
- core_ingredients：乳矿物盐、乳清蛋白、牛奶蛋白、维生素 D
- supporting_ingredients：稳定剂、乳化体系、低糖甜味体系
- formula_logic：以钙、蛋白、维 D 的营养事实构建日常营养方案。
- compliance_flags：GB 14880 食品类别限制、乳矿物盐公告范围、营养标签条件需复核。
- supplier_fit：平台已有乳矿物盐和蛋白供应商。
- claim_boundary：可用“高钙、含维生素 D、高蛋白”；禁用“预防骨质疏松、增强骨骼、促进钙吸收”。
- next_research：补调制乳/含乳饮料中维 D 和钙强化限制。
- review_status：draft

### CASE-005 女性轻负担胶原饮

- category：口服美容 / 女性营养
- product_concept：轻负担胶原蛋白饮，适配小红书和直播渠道。
- target_audience：年轻女性、轻养生用户
- dosage_form：瓶装饮料 / 条包固体饮料
- core_ingredients：胶原蛋白肽、透明质酸钠、维生素 C
- supporting_ingredients：水果风味、酸味体系、低糖甜味体系
- formula_logic：用原料事实、口感和轻负担构建产品力，不承诺改善皮肤。
- compliance_flags：透明质酸钠公告限量、维 C 强化范围、胶原原料属性需复核。
- supplier_fit：平台已有多款胶原蛋白供应商；透明质酸钠需补库。
- claim_boundary：可用“添加胶原蛋白肽、清爽低糖、日常饮用”；禁用“美容养颜、锁水、抗氧化、逆龄”。
- next_research：补透明质酸钠法规和供应商资料。
- review_status：draft

### CASE-006 控糖代餐奶昔

- category：体重管理 / 代餐
- product_concept：早餐代餐奶昔，强调高蛋白、膳食纤维、低糖和饱腹场景。
- target_audience：体重管理人群、办公室早餐用户
- dosage_form：固体饮料
- core_ingredients：乳清蛋白/植物蛋白、膳食纤维、低 GI 碳水来源
- supporting_ingredients：可可粉、咖啡粉、甜味体系、增稠体系
- formula_logic：通过蛋白和纤维提升营养密度与饮用满足感。
- compliance_flags：避免减肥、燃脂、降糖等表达；低糖/高蛋白需满足标签条件。
- supplier_fit：蛋白类平台已有，纤维和代餐基料需补库。
- claim_boundary：可用“早餐代餐、低糖、高蛋白、含膳食纤维”；禁用“减肥、燃脂、降血糖”。
- next_research：补代餐类法规边界和饱腹感表达模板。
- review_status：draft

### CASE-007 植物基蛋白饮

- category：植物基 / 蛋白补充
- product_concept：适合轻健身和素食用户的植物基蛋白饮。
- target_audience：素食用户、轻健身用户、乳糖不耐受人群
- dosage_form：RTD 饮料 / 固体饮料
- core_ingredients：豌豆蛋白、大豆蛋白、米蛋白
- supporting_ingredients：植物油脂、稳定体系、风味遮蔽体系
- formula_logic：通过复配改善氨基酸组成与口感粉感。
- compliance_flags：蛋白质声称需满足营养标签条件；避免增肌等功效承诺。
- supplier_fit：平台需补植物蛋白核心供应商。
- claim_boundary：可用“植物基、高蛋白、乳糖友好”；禁用“快速增肌、代谢提升”。
- next_research：补植物蛋白供应商、口感遮蔽和砂感控制案例。
- review_status：draft

### CASE-008 电解质运动果冻

- category：运动补给
- product_concept：低糖便携电解质果冻，面向跑步和户外场景。
- target_audience：跑步、骑行、户外运动人群
- dosage_form：吸吸果冻
- core_ingredients：钠、钾、镁等电解质来源
- supporting_ingredients：果汁风味、凝胶体系、低糖甜味体系
- formula_logic：用便携剂型和清爽口感建立补给场景，不医疗化。
- compliance_flags：避免治疗脱水、快速恢复、缓解疲劳等表达。
- supplier_fit：电解质盐和果冻基料需补库。
- claim_boundary：可用“运动后补给、清爽低糖、便携”；禁用“治疗脱水、快速恢复体能”。
- next_research：补电解质添加范围、口感和渗透压体验案例。
- review_status：draft

### CASE-009 低钠鲜味调味粉

- category：健康厨房 / 调味品
- product_concept：低钠但保留鲜味的家庭厨房调味粉。
- target_audience：中老年家庭、减盐意识用户
- dosage_form：调味粉
- core_ingredients：氯化钾、酵母抽提物、鲜味肽、香辛料
- supporting_ingredients：天然香辛料、蘑菇粉、海带风味
- formula_logic：通过鲜味增强和钠钾平衡降低减盐后的寡淡感。
- compliance_flags：低钠/减盐表达需满足标签条件；不得宣称降血压或预防疾病。
- supplier_fit：鲜味原料、酵母抽提物、调味基料需补库。
- claim_boundary：可用“低钠、鲜味、家庭烹饪”；禁用“降血压、保护心血管”。
- next_research：补调味品标签和低钠宣称条件。
- review_status：draft

### CASE-010 膳食纤维气泡水

- category：轻负担饮料
- product_concept：含膳食纤维的低糖气泡水，适合下午茶和轻负担饮用场景。
- target_audience：控糖意识用户、办公室下午茶用户
- dosage_form：气泡饮料
- core_ingredients：可溶性膳食纤维、低糖甜味体系、酸味体系
- supporting_ingredients：水果风味、气泡水基底
- formula_logic：用低糖、清爽、含纤维建立轻负担体验。
- compliance_flags：避免减肥、燃脂、降血糖等表达；注意纤维添加口感和胃肠耐受。
- supplier_fit：膳食纤维和风味体系供应商需补库。
- claim_boundary：可用“低糖、含膳食纤维、清爽气泡”；禁用“减肥、燃脂、控血糖”。
- next_research：补纤维溶解性、稳定性和标签表达案例。
- review_status：draft
