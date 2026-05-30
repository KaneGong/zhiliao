# Data Repair Package 3 — 真实供应商候选索资表

> 日期：2026-05-30
> 输入：`docs/data/real-supplier-intake-plan-2026-05-30.md`
> 状态：candidate intake / 待索资，不进入 `src/data`。
> 边界：本文件只记录真实公司和官方资料入口，不新增泛化占位 JSON，不改 `src/app`、API route 或 prompt。
> 使用规则：只有完成索资并通过法规/剂型/标签初筛后，才考虑把候选升级为 `src/data/formula_brief_seeds/supplier_specs.seed.json` 的真实候选记录。

## 1. 入表标准

本表只接收同时满足以下条件的候选：

1. 真实公司或品牌线；
2. 有官方产品页、官方应用页、官方 PDF 或官方联系入口；
3. 能明确对应至少 1 个 Golden Question 的数据缺口；
4. 能写清楚下一步要索取什么资料；
5. 高风险场景允许结论为“先法规 gate，不入库”。

## 2. 10 条以内候选索资表

| # | 公司 | 产品 / 产品线 | 官方链接 | 目标 GQ | 目标剂型 | 联系人 / 表单 | 待索资料 | 风险等级 |
|---:|---|---|---|---|---|---|---|---|
| 1 | Novonesis | `BB-12®` / `LGG®` probiotic strains | [BB-12 官方页](https://www.novonesis.com/en/biosolutions/human-health/b-lactis-bb-12)；[LGG 官方页](https://sandbox.novonesis.com/en/biosolutions/human-health/l-rhamnosus-lgg) | GQ-003 儿童益生菌 | 儿童固体饮料、条包粉、滴剂 | [Novonesis 联系入口](https://www.novonesis.com/en/contact-us) | strain identity、规格书、COA、推荐 CFU、终产品货架期活菌数、儿童年龄段、食品类别声明、中国供货与法规支持 | 高：儿童适用和普通食品表达必须复核 |
| 2 | IFF | `HOWARU® Protect Kids` / HOWARU probiotics | [HOWARU 官方页](https://www.iff.com/food-beverage/food-bioscience/cultures/dairy-cultures/howaru/) | GQ-003 儿童益生菌 | 儿童固体饮料、发酵乳、条包粉 | [IFF 联系入口](https://www.iff.com/contact-us) | 具体菌株号、Protect Kids 配方组成、CFU/剂量、粉剂稳定性、适用食品类别、儿童标签表达建议、中国供应链 | 高：儿童和菌株合规边界高 |
| 3 | Roquette | `NUTRALYS®` pea protein | [NUTRALYS 官方产品入口](https://info.roquette.com/nutralys-product)；[Roquette NUTRALYS 页面](https://www.roquette.com/fr/view/content/8281/full/1/8016) | GQ-007 植物蛋白饮 | RTD 植物蛋白饮、植物基奶昔、固体饮料 | [Roquette 联系入口](https://www.roquette.com/contact-us) | 饮料级具体型号、蛋白含量、溶解/分散性、黏度、热稳定、豆腥味遮蔽、过敏原、非转基因/清真/犹太证书、中国供货 | 中：主要风险是剂型适配和感官稳定 |
| 4 | ADM | `ProFam®` pea protein | [ADM pea protein 官方页](https://www.adm.com/en-us/products-services/human-nutrition/products/plant-proteins/pea-protein/) | GQ-007 植物蛋白饮 | RTD 饮料、运动营养、植物基奶昔 | [ADM 联系入口](https://www.adm.com/en-us/contact-us/) | ProFam 572/580 等型号差异、RTD 饮料应用、溶解性、稳定性、风味遮蔽、最小起订量、中国法规/供货资料 | 中：产品线清楚，但需确认中国供应和饮料级资料 |
| 5 | dsm-firmenich | Premix solutions / 维生素矿物质预混 | [Premix solutions 官方页](https://www.dsm-firmenich.com/premixsolutions) | GQ-015 饮酒场景草本/维生素 | 普通营养饮、固体饮料、软糖维生素预混 | [dsm-firmenich 联系入口](https://www.dsm-firmenich.com/en/businesses/taste-texture-health/contact-us.html) | B 族维生素具体形态、GB 14880 适用食品类别、推荐添加量、COA、标签建议、饮酒场景禁用话术确认 | 高：只可补营养事实，不可包装为解酒/护肝 |
| 6 | Cargill | `Potassium Pro®` potassium chloride | [Potassium chloride products 官方页](https://www.cargill.com/food-beverage/na/potassium-chloride-products) | GQ-017 低钠调味 | 复合调味粉、低钠盐、调味基料 | [Cargill 联系入口](https://www.cargill.com/page/contact-us) | KCl 规格、粒径、钾含量、钠钾换算、苦味/金属味遮蔽建议、低钠标签支持、中国食品级资质 | 中：标签计算和感官遮蔽需复核 |
| 7 | Biospringer | Yeast extract for salt reduction | [Salt reduction 官方页](https://biospringer.com/en/salt-reduction/) | GQ-017 低钠调味 | 调味粉、汤料、咸味零食、复合调味 | [Biospringer 联系入口](https://biospringer.com/en/contact-us/) | 具体酵母抽提物型号、推荐添加量、钠贡献、鲜味增强数据、调味粉应用案例、过敏原/证书、中国供货 | 中：需确认钠贡献和低钠标签影响 |
| 8 | BASF | `Vegapure®` plant sterols | [Vegapure 官方页](https://nutrition.basf.com/global/en/human-nutrition/portfolio/plant-sterols) | GQ-019 植物甾醇酸奶 | 酸奶、乳饮料、营养食品、补充剂 | [BASF Nutrition 联系入口](https://nutrition.basf.com/global/en/contact) | 植物甾醇/甾醇酯类型、目标食品类别、酸奶体系应用、使用量、不适宜人群、标签提示、中国公告适配 | 高：普通食品与保健路径必须分流 |
| 9 | Cargill | `CoroWise®` plant sterols | [CoroWise 官方页](https://www.cargill.com/food-bev/na/corowise-plant-sterols) | GQ-019 植物甾醇酸奶 | 酸奶、乳饮料、饮料、粉剂 | [Cargill 联系入口](https://www.cargill.com/page/contact-us) | 产品形态、酸奶/发酵乳应用、添加量、稳定性、食品级资质、中国供货、普通食品声称边界 | 高：植物甾醇声称和中国公告边界需复核 |

## 3. 暂不入表 / 先 gate 的方向

### GQ-015 葛根 / 枳椇子草本

本轮没有把葛根、枳椇子草本供应商列入 10 条候选，原因：

- 饮酒场景本身高度敏感；
- “解酒 / 护肝 / 降低酒精伤害”必须保持禁用；
- 草本原料必须先确认食品属性、目标剂型适用性、标签边界和平台审核风险；
- 在 gate 通过前，宁可只补 B 族维生素 premix 的普通营养事实资料，不把草本供应商写入推荐链路。

### 其他植物蛋白 / 益生菌候选

`Lallemand ProbioKid®`、`Ingredion VITESSENCE®`、`PURIS pea protein`、`Ohly SAV-R-SEL`、`ADM CardioAid®` 等仍可作为第二批候选，但本轮先控制在 9 条，避免资料表过宽。

## 4. 索资优先级

1. **先索 GQ-003 / GQ-007**：它们最影响 P0/P1 演示可信度。
2. **再索 GQ-017 / GQ-019**：它们适合形成“供应商 + 标签条件 + 工艺边界”的商业闭环。
3. **GQ-015 先做 gate**：只向维生素 premix 供应商索普通营养事实资料；草本方向暂不入库。

## 5. 升级为 JSON 的硬门槛

候选进入 `src/data/formula_brief_seeds/supplier_specs.seed.json` 前，至少应拿到：

- 官方产品页或产品资料 PDF；
- 规格书或可公开的技术参数；
- COA 或 COA 样例字段；
- 推荐剂型和添加量；
- 中国法规/供货/代理信息；
- 目标 GQ 的禁用声称确认；
- 如涉及儿童、植物甾醇、饮酒场景，必须有人工法规复核记录。
