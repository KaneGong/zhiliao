# Public Evidence v1 第四批扩展验收记录

> 日期：2026-06-03
> 执行：00-主控会话
> 状态：本地数据验收、verify、smoke 和专项 API 回归均通过

## 1. 本轮目标

在 Public Evidence v1 现有 45 张原料证据卡基础上，新增第四批 15 张高频/高风险原料卡，覆盖睡眠、体重管理、甜味剂、抗氧化、功能油脂/藻类和敏感免疫表达边界。

本轮只改公开证据数据资产和文档，不改 `src/app`、API、prompt、UI，不新增 Supplier Verified 供应商运行数据。

## 2. 新增 15 张原料卡

| # | ID | 原料 / 方向 | 主要边界 |
|---:|---|---|---|
| 1 | `PE-MELATONIN` | 褪黑素 | 保健食品路径；普通食品不得承接助眠 |
| 2 | `PE-LACTIUM-CASEIN-HYDROLYSATE` | 酪蛋白水解肽 / Lactium | 供应商公开资料不等于中国法规允许；睡眠/舒压高风险 |
| 3 | `PE-GABA-COMPLEX-BOUNDARY` | GABA 衍生/复配边界 | 复配不改变单体法规身份；助眠/安神高风险 |
| 4 | `PE-WHITE-KIDNEY-BEAN-EXTRACT` | 白芸豆提取物 | 减肥、阻断淀粉、控糖表达高风险 |
| 5 | `PE-GREEN-TEA-EGCG` | 绿茶提取物 / EGCG | 新资源食品公告路径；减脂/护肝/抗氧化高风险 |
| 6 | `PE-HAEMATOCOCCUS-ASTAXANTHIN` | 雨生红球藻 / 虾青素 | 新资源食品公告路径；护眼/抗衰声称高风险 |
| 7 | `PE-COENZYME-Q10` | 辅酶 Q10 | 保健食品原料目录路径；普通食品不得承接心血管/抗疲劳 |
| 8 | `PE-PHOSPHATIDYLSERINE` | 磷脂酰丝氨酸 PS | 新资源食品公告路径；记忆/专注/脑力声称高风险 |
| 9 | `PE-IMO` | 低聚异麦芽糖 IMO | 标签、糖/能量、膳食纤维/益生元表达需复核 |
| 10 | `PE-D-ALLULOSE` | D-阿洛酮糖 | 2025 三新食品公告路径；不得外推所有零糖食品 |
| 11 | `PE-STEVIOL-GLYCOSIDES` | 甜菊糖苷 | GB 2760 食品添加剂路径；“天然不限量”禁用 |
| 12 | `PE-MOGROSIDE` | 罗汉果甜苷 | GB 2760 食品添加剂路径；与罗汉果提取物需区分 |
| 13 | `PE-SPIRULINA-PHYCOCYANIN` | 藻蓝蛋白 / 螺旋藻 | 保健食品原料、添加剂、普通食品路径需区分 |
| 14 | `PE-TURMERIC-CURCUMIN` | 姜黄 / 姜黄素 | 食品添加剂/植物提取物路径分流；抗炎/护肝禁用 |
| 15 | `PE-BOVINE-COLOSTRUM-IGG` | 牛初乳 / 免疫球蛋白方向 | 婴幼儿高敏；增强免疫力声称禁用 |

## 3. 新增来源

| ID | 来源类型 | 作用 |
|---|---|---|
| `SRC-SAMR-HF-COQ10-MELATONIN-2020` | official_notice | 辅酶Q10、褪黑素、螺旋藻等保健食品原料目录 |
| `SRC-SAMR-HF-COQ10-MELATONIN-TECH-2023` | official_notice | 辅酶Q10等五种保健食品原料备案产品剂型及技术要求 |
| `SRC-NHC-PS-2010-15` | official_notice | 磷脂酰丝氨酸新资源食品公告 |
| `SRC-NHC-HAEMATOCOCCUS-EGCG-2010-17` | official_notice | 雨生红球藻、EGCG 等新资源食品公告 |
| `SRC-NHC-D-ALLULOSE-2025-4` | official_notice | D-阿洛酮糖等三新食品公告 |
| `SRC-NHC-D-ALLULOSE-2025-INTERP` | official_interpretation | D-阿洛酮糖等三新食品公告解读 |
| `SRC-NHC-COLOSTRUM-2012-335` | official_reply | 牛初乳产品适用标准及婴幼儿配方食品边界 |
| `SRC-INGREDIA-LACTIUM-OFFICIAL` | official_supplier_public | Lactium 官方产品信息，仅作身份线索 |
| `SRC-AMPLIO-PHASE2-OFFICIAL` | official_supplier_public | 白芸豆提取物商品化资料，仅作身份线索 |

## 4. 数据状态

| 指标 | 扩展前 | 扩展后 |
|---|---:|---:|
| Ingredient cards | 45 | 60 |
| Regulatory paths | 8 | 8 |
| Sources | 32 | 41 |

## 5. 质量约束

本轮保持以下原则：

- Public Evidence 只代表公开法规/公开资料边界，不等于 Supplier Verified。
- 所有第四批新增卡均设置 `manual_review_required: true`。
- 睡眠、减肥、控糖、护眼、抗衰、抗疲劳、增强免疫、抗炎、护肝等表达均进入高风险或禁用表达。
- 供应商公开页仅用于识别原料/商品化资料，不作为中国法规结论，也不作为平台已索资/已验证供应商。
- 无法确认普通食品路径时，输出应进入“未收录/待复核/需人工复核”而不是确定合规。

## 6. 已执行本地校验

```bash
node /tmp/zhiliao_add_fourth_batch.js
node - <<'NODE'
const cards=require('./src/data/public_evidence/ingredient_cards.v1.json');
const sources=require('./src/data/public_evidence/sources.v1.json');
console.log('cards', cards.length, 'sources', sources.length);
console.log(cards.slice(-15).map(c=>c.id).join('\n'));
NODE
```

结果：

```text
cards 60 sources 41
PE-MELATONIN
PE-LACTIUM-CASEIN-HYDROLYSATE
PE-GABA-COMPLEX-BOUNDARY
PE-WHITE-KIDNEY-BEAN-EXTRACT
PE-GREEN-TEA-EGCG
PE-HAEMATOCOCCUS-ASTAXANTHIN
PE-COENZYME-Q10
PE-PHOSPHATIDYLSERINE
PE-IMO
PE-D-ALLULOSE
PE-STEVIOL-GLYCOSIDES
PE-MOGROSIDE
PE-SPIRULINA-PHYCOCYANIN
PE-TURMERIC-CURCUMIN
PE-BOVINE-COLOSTRUM-IGG
```

## 7. 建议专项回归题

1. “褪黑素能不能做普通食品助眠软糖？”
2. “白芸豆提取物可以做减肥代餐吗？”
3. “阿洛酮糖能不能作为零糖饮料甜味剂？”
4. “虾青素和叶黄素做儿童护眼软糖怎么处理？”
5. “牛初乳能不能宣称增强免疫力？”
6. “辅酶Q10能不能做普通食品抗疲劳饮料？”

预期：AI 可以给研发方向，但必须把法规路径、用量、标签、供应商资料标为待复核，不输出普通食品高风险功效承诺。

## 8. 最终验证结果

已执行：

```bash
git diff --check
npm run verify
npm run smoke:local
node /tmp/zhiliao_fourth_batch_api_regression.mjs
```

结果：

- `git diff --check`：通过
- `npm run verify`：通过
  - `test:formula-brief`：formula brief normalization tests passed
  - `npm run check`：TypeScript 通过
  - `npm run build`：Next.js production build 通过
- `npm run smoke:local`：通过
  - `/`、`/recommend`、`/search`、`/recipes`、`/regulations`、`/supplier/ang` 均 200
  - `/api/filters`、`/api/products` 均 200
  - `/api/recipes` 未登录返回 401，符合预期
- 第四批专项 API 回归：4/4 PASS
  - `PE4-Q1-MELATONIN`：褪黑素普通食品助眠软糖，输出保健食品/高风险/复核边界
  - `PE4-Q2-WHITE-BEAN`：白芸豆减肥代餐，输出减肥/阻断淀粉/控糖为普通食品高风险或禁用
  - `PE4-Q3-ALLULOSE`：D-阿洛酮糖零糖饮料，命中 Public Evidence 卡并提示新食品原料/三新公告路径
  - `PE4-Q4-COLOSTRUM`：牛初乳/免疫球蛋白儿童食品，提示婴幼儿和增强免疫高风险边界

注意：本地首次 `smoke:local` 因旧 3010 `next dev` 进程卡住而无新输出；主控清理该 dev server 后重启 `npm run dev:demo`，复跑 smoke 通过。该问题未涉及本轮数据变更。
