# Supplier Candidate Pack v2 — 第三批 Public Evidence 后索资候选包

> 日期：2026-06-03
> 状态：lead_only / 待索资 / 不进入运行数据
> 输入：Public Evidence v1 第三批扩展、Demo v2 场景、旧版真实供应商候选索资表
> 边界：本文件只记录真实公司、官方入口、待索资料和风险 gate；不标 `Supplier Verified`，不写入 `src/data`，不代表平台已有真实供应商合作或已完成索资。

## 1. 使用原则

1. **Public Evidence ≠ Supplier Verified**：公开法规/公开资料只能帮助判断方向，不能替代供应商规格书、COA、检测报告和适用食品类别声明。
2. **只进候选池，不进推荐链路**：本表所有记录默认状态均为 `lead_only`，仅供后续人工索资。
3. **高风险品类先 gate 后索资**：儿童、护眼、运动营养、饮酒、免疫、抗氧化、植物甾醇等场景必须先确定法规路径和声称边界。
4. **只引用官方入口**：候选优先使用公司官网、产品页、官方联系入口、官方技术资料；行业文章、竞品页面不得作为入库依据。
5. **拿不到关键资料就不升级**：没有规格书/COA/适用食品类别/标签建议/中国供货信息时，不进入 Supplier Spec JSON。

## 2. 本轮覆盖场景

| 场景 | 对应平台能力 | 当前目标 | 风险级别 |
|---|---|---|---|
| 儿童益生菌 | Formula Brief / 儿童益生菌 Demo | 补真实菌株供应商索资入口 | 高 |
| 植物蛋白 | 高蛋白运动饮 / 植物蛋白饮 | 补饮料级蛋白与工艺资料 | 中 |
| 低钠调味 | 低钠调味粉 Demo | 补氯化钾、酵母抽提物、减盐体系 | 中 |
| 植物甾醇 | 植物甾醇酸奶 / 功能乳品 | 补原料形态、公告边界、标签提醒 | 高 |
| 运动营养 | 肌酸 / BCAA / 左旋肉碱 | 补运动营养原料索资入口，先按待复核处理 | 高 |
| 眼部营养 | 叶黄素 / 玉米黄质 | 补官方原料资料，护眼声称强 gate | 高 |
| 植物提取物 | 蔓越莓 / 接骨木莓 / 葡萄籽 | 只作索资候选，不进入普通食品功效推荐 | 高 |

## 3. v2 候选索资表

| # | 公司 | 产品 / 产品线 | 官方入口 | 目标场景 | 目标剂型 | 待索资料 | 风险等级 | 当前状态 |
|---:|---|---|---|---|---|---|---|---|
| 1 | Novonesis | `BB-12®` / `LGG®` probiotic strains | [BB-12](https://www.novonesis.com/en/biosolutions/human-health/b-lactis-bb-12)；[LGG](https://www.novonesis.com/en/biosolutions/human-health/l-rhamnosus-lgg)；[联系入口](https://www.novonesis.com/en/contact-us) | 儿童益生菌 | 条包粉、固体饮料、发酵乳、滴剂 | strain identity、规格书、COA、推荐 CFU、终产品货架期活菌数、儿童年龄段、中国食品类别声明、标签表达建议 | 高 | lead_only |
| 2 | IFF | `HOWARU®` probiotics | [HOWARU](https://www.iff.com/food-beverage/food-bioscience/cultures-dairy-cultures/howaru/)；[联系入口](https://www.iff.com/contact-us) | 儿童益生菌 / 微生态 | 发酵乳、固体饮料、条包粉 | 具体菌株号、儿童方向配方组成、CFU/剂量、粉剂稳定性、食品类别、儿童标签边界、中国供货 | 高 | lead_only |
| 3 | Lallemand Health Solutions | `ProbioKid®` / early-life probiotic solutions | [Babies solutions](https://www.lallemand-health-solutions.com/en/babies/)；[联系入口](https://www.lallemand-health-solutions.com/en/contact-us/) | 儿童益生菌 | 条包粉、咀嚼片、滴剂 | 菌株清单、儿童年龄段、COA、稳定性、推荐添加量、中国法规/供货、普通食品声称建议 | 高 | lead_only |
| 4 | Roquette | `NUTRALYS®` pea protein | [NUTRALYS 产品入口](https://info.roquette.com/nutralys-product)；[联系入口](https://www.roquette.com/contact-us) | 植物蛋白饮 / 运动蛋白 | RTD、奶昔、固体饮料 | 饮料级型号、蛋白含量、溶解/分散、黏度、热稳定、风味遮蔽、过敏原、非转基因/清真/犹太证书、中国供货 | 中 | lead_only |
| 5 | ADM | `ProFam®` pea protein / plant proteins | [Pea protein](https://www.adm.com/en-us/products-services/human-nutrition/products/plant-proteins/pea-protein/)；[联系入口](https://www.adm.com/en-us/contact-us/) | 植物蛋白饮 / 运动营养 | RTD、粉剂、蛋白棒 | ProFam 具体型号、饮料稳定性、分散性、感官遮蔽、MOQ、样品、中国法规支持 | 中 | lead_only |
| 6 | Ingredion | `VITESSENCE®` plant protein isolates | [VITESSENCE](https://www.ingredion.com/na/en-us/ingredients/ingredient-product-families/vitessence-plant-protein-isolates.html)；[联系入口](https://www.ingredion.com/na/en-us/contact-us.html) | 植物蛋白饮 | RTD、RTM 粉剂、蛋白棒 | 蛋白含量、溶解性、乳化/稳定性、目标 pH、风味、过敏原、中国供货和食品级资质 | 中 | lead_only |
| 7 | Cargill | `Potassium Pro®` potassium chloride | [Potassium chloride](https://www.cargill.com/food-beverage/na/potassium-chloride-products)；[联系入口](https://www.cargill.com/page/contact-us) | 低钠调味 | 复合调味粉、低钠盐、汤料 | KCl 规格、粒径、钾含量、钠钾换算、苦味/金属味遮蔽建议、食品级资质、中国供货、低钠标签支持 | 中 | lead_only |
| 8 | Biospringer | Yeast extract for salt reduction | [Salt reduction](https://biospringer.com/en/salt-reduction/)；[联系入口](https://biospringer.com/en/contact-us/) | 低钠调味 / 鲜味增强 | 调味粉、汤料、零食调味 | 具体型号、推荐添加量、钠贡献、鲜味增强数据、感官案例、过敏原、证书、中国供货 | 中 | lead_only |
| 9 | Ohly | `SAV-R-SEL` sodium reduction yeast product | [SAV-R-SEL](https://www.ohly.com/en/product-repository/ohly-sav-r-sel/)；[联系入口](https://www.ohly.com/en/contact/) | 低钠调味 | 调味粉、咸味零食、汤料 | 规格书、钠含量、推荐添加量、口感遮蔽、过敏原、清真/犹太、中国供货 | 中 | lead_only |
| 10 | BASF | `Vegapure®` plant sterols | [Vegapure](https://nutrition.basf.com/global/en/human-nutrition/portfolio/plant-sterols)；[联系入口](https://nutrition.basf.com/global/en/contact) | 植物甾醇 / 功能乳品 | 酸奶、乳饮料、营养食品、补充剂 | 植物甾醇/甾醇酯类型、产品形态、目标食品类别、推荐量、不适宜人群、标签提示、中国公告适配 | 高 | lead_only |
| 11 | Cargill | `CoroWise®` plant sterols | [CoroWise](https://www.cargill.com/food-bev/na/corowise-plant-sterols)；[联系入口](https://www.cargill.com/page/contact-us) | 植物甾醇 / 功能乳品 | 酸奶、饮料、粉剂 | 产品形态、酸奶体系应用、添加量、稳定性、食品级资质、中国供货、普通食品声称边界 | 高 | lead_only |
| 12 | Alzchem | `Creapure®` creatine monohydrate | [Creapure](https://www.creapure.com/)；[Alzchem nutrition](https://www.alzchem.com/en/products/creapure/)；[联系入口](https://www.alzchem.com/en/contact/) | 运动营养 / 肌酸 | 运动饮、粉剂、咀嚼片 | 规格书、纯度、杂质指标、推荐用量、适用食品类别、中国法规资料、运动营养标签边界 | 高 | lead_only |
| 13 | Lonza | `Carnipure®` L-Carnitine | [Carnipure](https://www.carnipure.com/)；[联系入口](https://www.lonza.com/contact-us) | 运动营养 / 左旋肉碱 | 运动饮、粉剂、胶囊/片剂 | 产品形态、规格书、COA、推荐量、普通食品与特殊食品路径、中国供货、不得宣称燃脂/减肥的标签建议 | 高 | lead_only |
| 14 | Ajinomoto | Amino acids / BCAA ingredients | [Amino acids](https://www.ajinomoto.com/amino-acids)；[联系入口](https://www.ajinomoto.com/contact) | 运动营养 / BCAA-EAA | 粉剂、运动饮、蛋白复配 | 氨基酸规格、BCAA/EAA 比例、溶解性、苦味遮蔽、食品类别、中国供货、运动营养声称边界 | 高 | lead_only |
| 15 | Kemin | `FloraGLO®` lutein | [FloraGLO](https://www.kemin.com/na/en-us/markets/human-nutrition/products/floraglo-lutein)；[联系入口](https://www.kemin.com/na/en-us/contact-us) | 眼部营养 / 叶黄素 | 软糖、乳品、饮料、补充剂 | 叶黄素来源、规格、稳定性、推荐添加量、中国 GB 14880/GB 2760 路径支持、儿童/护眼声称边界 | 高 | lead_only |
| 16 | Lycored | Lutein / carotenoid ingredients | [Lycored human nutrition](https://www.lycored.com/)；[联系入口](https://www.lycored.com/contact/) | 眼部营养 / 类胡萝卜素 | 软糖、饮料、营养食品 | 产品规格、玉米黄质/叶黄素比例、应用稳定性、中国法规路径、儿童标签建议、不可宣称改善视力说明 | 高 | lead_only |
| 17 | Ocean Spray | Cranberry ingredients | [Ingredients](https://www.oceanspray.com/en/Our-Story/Ingredients)；[联系入口](https://www.oceanspray.com/en/Contact-Us) | 蔓越莓 / 女性健康方向 | 饮料、粉剂、软糖 | 原汁/粉末规格、原花青素指标、推荐用量、食品类别、标签表达边界、不得作泌尿治疗声称 | 高 | lead_only |
| 18 | Givaudan / Naturex | Elderberry / botanical extracts | [Givaudan Taste & Wellbeing](https://www.givaudan.com/taste-wellbeing)；[联系入口](https://www.givaudan.com/contact) | 接骨木莓 / 植物提取物 | 饮料、软糖、粉剂 | 具体接骨木莓产品、花青素/多酚指标、食品属性、中国适用性、免疫/抗病毒声称禁区 | 高 | lead_only |
| 19 | Indena | `Enovita®` grape seed extract | [Enovita](https://www.indena.com/product/enovita/)；[联系入口](https://www.indena.com/contact-us/) | 葡萄籽 / 植物提取物 | 饮料、粉剂、软糖 | OPC/多酚指标、食品级资质、溶解/稳定性、中国适用性、抗氧化表达边界、不得作疾病/美容治疗暗示 | 高 | lead_only |

## 4. 高风险候选处理规则

### 4.1 儿童益生菌

- 必须到 strain level；只写“益生菌复配”不合格。
- 终产品必须考虑货架期末活菌数，不只看投料量。
- 儿童年龄段、食用量、不适宜人群和普通食品表达必须单列。

### 4.2 运动营养

- 肌酸、BCAA/EAA、左旋肉碱不得直接导向“增肌、燃脂、减肥、抗疲劳、提升运动表现”的确定功效表达。
- 优先作为运动营养食品或特殊场景研发路径进行人工复核，不直接作为普通食品无条件推荐。
- 需要确认目标剂型、食品类别、添加量、标签提示和中国供货资料。

### 4.3 眼部营养

- 叶黄素/玉米黄质在儿童软糖、护眼场景必须强制人工复核。
- 普通食品不得表达“改善视力、预防近视、缓解眼疲劳、保护视网膜”等医疗/保健式结论。
- 供应商资料只能证明产品规格和应用稳定性，不能替代中国法规适用判断。

### 4.4 植物提取物

- 蔓越莓、接骨木莓、葡萄籽只作为线索，不作为平台已验证供应商。
- 抗氧化、免疫、泌尿健康、抗病毒、美容抗衰等表达都需单独进入标签/广告复核。
- 没有食品属性、规格书、COA、目标剂型应用资料时，不进入运行数据。

## 5. 升级到 Supplier Verified 的最小资料包

候选从 `lead_only` 升级前，至少要收齐：

1. 公司主体与联系人信息；
2. 产品规格书 / TDS；
3. COA 或 COA 样例；
4. 食品级资质和关键检测项目；
5. 目标食品类别、目标剂型、推荐添加量；
6. 不适宜人群、过敏原、标签注意；
7. 中国供货、代理、MOQ、交期、样品政策；
8. 对应 Public Evidence 卡和法规路径的人工复核记录；
9. 平台内部审核状态变更记录。

## 6. 下一步动作

| 优先级 | 动作 | 负责人建议 | 产出 |
|---|---|---|---|
| P0 | 先从儿童益生菌、植物蛋白、低钠调味各选 2 家发起索资 | 03 商业 / Kane | 真实供应商资料包 |
| P0 | 运动营养、眼部营养先由 02 补法规路径，不急于入库 | 02 数据 | 高风险 gate 记录 |
| P1 | 把收到的资料按模板录入 intake 表 | 00/01/02 协同 | `supplier_verified` 候选草案 |
| P1 | 只有通过审核后再考虑写入运行 JSON | 00 主控 | Supplier Spec seed 或后台数据 |
