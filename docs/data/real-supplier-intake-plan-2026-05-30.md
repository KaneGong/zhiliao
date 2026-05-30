# 知料真实补库方向 — Data Repair Package 3 Intake Plan

> 日期：2026-05-30
> 状态：research shortlist / intake plan
> 边界：本文件只准备下一包真实补库方向，不新增 JSON 占位，不改 `src/app/`、API route 或 prompt。
> 原则：只有拿到真实供应商资料、规格书/COA/应用说明或官方产品页后，才允许把 `Supplier Spec` 从占位改为候选真实记录。

## 1. 为什么下一包不能继续加占位

数据修复包 1 和 2 已经把低分题的“缺什么”讲清楚。继续追加 `待补充供应商 A` 只会让平台看起来有数据，实际不能支撑采购、打样或法规复核。Package 3 的目标应改成：

1. 每个重点 GQ 至少找到 2-3 个真实候选供应商或真实资料入口；
2. 每个候选都必须带官方页面或可索资入口；
3. 每个候选都必须列出进入平台前要索取的资料；
4. 高风险场景先判定“是否应该入库”，而不是为了凑供应商强行入库。

## 2. 五个优先场景

| 优先级 | GQ | 场景 | 当前问题 | Package 3 目标 |
|---|---|---|---|---|
| P0 | GQ-003 | 儿童益生菌 | 核心菌株、儿童适用边界、活菌稳定性弱 | 先找真实菌株供应商和儿童/食品应用资料 |
| P0 | GQ-007 | 植物蛋白饮 | 植物蛋白可写，但饮料级规格、溶解性、遮蔽弱 | 先补饮料级豌豆/米/大豆蛋白真实候选 |
| P0 | GQ-015 | 饮酒场景草本/维生素 | 高风险表达、草本食品属性和平台审核风险叠加 | 先做法规/伦理 gate；B 族维生素可先补真实 premix 供应商 |
| P1 | GQ-017 | 低钠调味 | 氯化钾、酵母抽提物、鲜味增强体系缺真实资料 | 先补低钠盐和酵母抽提物真实供应商 |
| P1 | GQ-019 | 植物甾醇酸奶 | 植物甾醇酯应用、酸奶体系、保健路径边界弱 | 先补植物甾醇/甾醇酯真实供应商和酸奶应用资料 |

## 3. GQ-003 儿童益生菌真实补库方向

### 候选资料入口

| 候选 | 官方资料入口 | 可补价值 | 入库前必须确认 |
|---|---|---|---|
| Novonesis `BB-12®` / `LGG®` | `https://www.novonesis.com/en/biosolutions/human-health/b-lactis-bb-12`；`https://sandbox.novonesis.com/en/biosolutions/human-health/l-rhamnosus-lgg` | 国际知名菌株、菌株身份清晰、临床/应用资料丰富 | 中国目标食品类别、儿童年龄段、终产品活菌数、标签表达边界、是否可用于普通食品 |
| IFF `HOWARU® Protect Kids` | `https://www.iff.com/food-beverage/food-bioscience/cultures/dairy-cultures/howaru/` | 有儿童方向产品线和食品/发酵乳应用入口 | 具体菌株号、CFU/剂量、儿童普通食品适用性、粉剂/固体饮料稳定性 |
| Lallemand `ProbioKid®` / early-life solutions | `https://www.lallemand.com/en/news/probiokid-and-its-specific-probiotic-strains-recognized-safe/`；`https://www.lallemand-health-solutions.com/en/babies/` | 儿童/婴幼儿方向资料丰富，可作为儿童益生菌索资样板 | 中国法规适用性、菌株清单、儿童年龄段、固体饮料/条包粉应用、货架期活菌数 |
| ADM probiotics / Deerland | `https://www.adm.com/en-us/products-services/human-nutrition/products/microbiome-solutions/probiotics` | 可作为更广泛微生态解决方案候选 | 是否有儿童方向、菌株身份、法规资料和中国供应可得性 |

### Package 3 最小入库门槛

- 菌株必须到 strain level，不接受只写“益生菌复配”。
- 必须有规格书、COA、活菌稳定性、推荐添加量、适用食品类别声明。
- 儿童场景必须单列年龄段、不适宜人群和标签表达边界。

## 4. GQ-007 植物蛋白饮真实补库方向

### 候选资料入口

| 候选 | 官方资料入口 | 可补价值 | 入库前必须确认 |
|---|---|---|---|
| Roquette `NUTRALYS®` pea protein | `https://www.roquette.com/fr/view/content/8281/full/1/8016`；`https://info.roquette.com/nutralys-product` | 豌豆蛋白规格、烘焙/植物基/营养应用资料较完整 | 饮料级具体型号、溶解性、黏度、豆腥味、过敏原和中国供货 |
| ADM `ProFam®` pea protein | `https://www.adm.com/en-us/products-services/human-nutrition/products/plant-proteins/pea-protein/` | 明确覆盖 RTD beverages、specialized nutrition 等应用 | ProFam 572/580 等型号差异、饮料稳定性、风味遮蔽、最小订量 |
| Ingredion `VITESSENCE®` pea protein isolates | `https://www.ingredion.com/na/en-us/ingredients/ingredient-product-families/vitessence-plant-protein-isolates` | 宣称适用于 RTM/RTD 饮料、粉剂饮料、蛋白棒等 | 具体蛋白含量、分散性、乳化性、供应区域、中国合规资料 |
| PURIS / Cargill pea protein | `https://www.puris.com/ingredients`；`https://www.cargill.com/food-bev/na/pea-protein` | 北美豌豆蛋白供应和 Cargill 合作入口 | 中国供货、食品级资质、饮料/奶昔应用资料、重金属/农残资料 |

### Package 3 最小入库门槛

- 必须区分：饮料级、烘焙级、蛋白棒级。
- 必须有：蛋白含量、溶解/分散、黏度、风味遮蔽、过敏原、非转基因/清真/犹太等证书状态。
- 不能用“植物蛋白供应商”泛称入库。

## 5. GQ-015 饮酒场景草本/维生素真实补库方向

### Gate 判断

饮酒场景不应先补草本供应商，而应先做法规与平台审核 gate：

1. 葛根、枳椇子等原料食品属性和目标剂型适用性未确认前，不进入推荐供应商；
2. “解酒、护肝、降低酒精伤害”必须保持禁用；
3. 可先补真实 B 族维生素 / 维矿 premix 供应商，用于普通营养事实表达，但不能把维生素包装成饮酒保护。

### 候选资料入口

| 候选 | 官方资料入口 | 可补价值 | 入库前必须确认 |
|---|---|---|---|
| dsm-firmenich Premix solutions | `https://www.dsm-firmenich.com/premixsolutions` | 维生素/矿物质/植物成分 premix，食品饮料应用与法规支持能力 | B 族具体形态、GB 14880 适用类别、添加量、饮酒场景禁用话术 |
| Prinova beverage premixes | `https://www.prinovaglobal.com/us/en/applications/beverage` | 饮料 premix、维生素/矿物质/氨基酸/植物成分供应入口 | 中国供货与合规、维生素规格、饮料稳定性、标签建议 |
| BASF Human Nutrition vitamins | `https://nutrition.basf.com/global/en/human-nutrition.html` | 维生素供应商与人类营养应用入口 | B 族维生素具体产品、食品级资质、GB 14880 对应食品类别 |

### 暂不建议入库的内容

- 不把随机“葛根提取物供应商”“枳椇子提取物供应商”写入 Supplier Spec。
- 只有当供应商能提供食品级资质、目标食品类别适用声明、COA、规格书、应用案例和广告/标签建议时，才进入候选。

## 6. GQ-017 低钠调味真实补库方向

### 候选资料入口

| 候选 | 官方资料入口 | 可补价值 | 入库前必须确认 |
|---|---|---|---|
| Cargill `Potassium Pro®` potassium chloride | `https://www.cargill.com/food-beverage/na/potassium-chloride-products` | 食品级氯化钾、盐替代、seasoning blends / low sodium foods 应用 | 中国法规、氯化钾规格、粒径、苦味/金属味、钠钾计算、低钠标签条件 |
| Biospringer yeast extract salt reduction | `https://biospringer.com/en/salt-reduction/` | 酵母抽提物用于减盐、鲜味增强和 off-note masking | 具体产品、添加量、钠贡献、调味粉应用案例、中国供货 |
| Ohly `SAV-R-SEL` | `https://www.ohly.com/en/product-repository/ohly-sav-r-sel/` | 明确面向 sodium reduction，水溶性干粉，适合调味粉方向评估 | 规格书、推荐添加量、钠含量、过敏原、清真/犹太等证书 |

### Package 3 最小入库门槛

- 必须有钠含量、钾含量或钠钾换算基础数据。
- 必须能支撑 GB 28050 低钠/减盐标签条件复核。
- 必须有感官遮蔽或鲜味增强建议，不能只给化学品规格。

## 7. GQ-019 植物甾醇真实补库方向

### 候选资料入口

| 候选 | 官方资料入口 | 可补价值 | 入库前必须确认 |
|---|---|---|---|
| BASF `Vegapure®` plant sterols | `https://nutrition.basf.com/global/en/human-nutrition/portfolio/plant-sterols` | 植物甾醇/甾醇酯，覆盖膳食补充剂和食品应用 | 中国新食品原料公告范围、酸奶应用、限量、不适宜人群和标签提示 |
| Cargill `CoroWise®` plant sterols | `https://www.cargill.com/food-bev/na/corowise-plant-sterols` | 有食品/饮料/酸奶等应用形态和产品形式信息 | 中国供货、产品形态是否适配酸奶、酸稳定、添加量、声称边界 |
| ADM `CardioAid®` plant sterols | `https://www.adm.com/globalassets/products--services/human-nutrition/products/specialty-health-solutions/19adn007_plantsterols_sellsheet_refresh_031020_v2.pdf/` | 有粉末、水分散、甾醇酯等产品规格信息 | 是否仍可供货、中国渠道、食品级资质、酸奶体系应用资料 |
| Raisio / Benecol plant stanol ester | `https://www.raisiofoodsolutions.com/benecol-licensing/unique-cholesterol-lowering-ingredient` | 更适合作为植物甾醇/甾烷醇路径和海外案例参考 | 注意 plant stanol ester 与 plant sterol ester 不同，不直接替代入库 |

### Package 3 最小入库门槛

- 必须区分植物甾醇、植物甾醇酯、植物甾烷醇酯。
- 必须复核中国公告范围、目标食品类别、使用量、不适宜人群和标签提示。
- 普通食品路径不得表达辅助降血脂、保护心血管；如需该卖点，应单独进入保健食品路径评估。

## 8. 下一步执行顺序

1. 先跑一张供应商索资表，不写 JSON：公司、产品、官方链接、目标 GQ、目标剂型、联系人/表单、待索资料、风险等级。
2. 第一批只做 10 条以内真实候选：
   - 儿童益生菌 3 条；
   - 植物蛋白 3 条；
   - 低钠调味 2 条；
   - 植物甾醇 2 条；
   - 饮酒场景只补 B 族维生素 premix，不补草本供应商，直到法规 gate 通过。
3. 拿到资料后再升级 JSON：
   - `confidence: medium` 起步；
   - `source_refs` 必须含官方页面和资料文件；
   - `data_completeness` 不能低于 `medium`；
   - 如果只是网页线索，先留在 `docs/data/`，不要进 `src/data/`。

## 9. Package 3 验收标准

- 不能出现新的 `待补充供应商 A`。
- 每条候选必须能追溯到真实公司和官方资料入口。
- 每个场景必须写清楚“为什么能补商业闭环”以及“为什么还不能直接推荐给用户”。
- 高风险场景必须允许结论为“不建议入库 / 先法规复核”。
