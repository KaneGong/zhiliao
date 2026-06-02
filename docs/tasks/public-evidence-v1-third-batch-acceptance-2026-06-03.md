# Public Evidence v1 第三批验收记录

> 日期：2026-06-03  
> 来源：02-数据与案例会话第三批扩展  
> 主控结论：验收通过，建议提交并部署。

## 1. 本轮范围

02 会话将 Public Evidence 从 30 张原料卡扩展到 45 张，并新增运动营养食品路径。

改动文件：

```text
docs/data/public-evidence-ingredient-cards-v1.md
docs/data/public-evidence-regulatory-map-v1.md
docs/data/public-evidence-source-register-v1.md
src/data/public_evidence/ingredient_cards.v1.json
src/data/public_evidence/regulatory_map.v1.json
src/data/public_evidence/sources.v1.json
```

主控顺手修复旧法规库中叶黄素记录过宽的问题：

```text
src/data/regulations.json
```

修复原因：旧法规库把叶黄素描述为“允许用于调制乳粉、饮料、糖果等食品，推荐每日摄入量≤12mg”，与第三批 Public Evidence 的保守口径不一致，容易让法规页先显示过宽结论。现已改为 `caution / official_reference`，并明确糖果/儿童/玉米黄质/护眼声称均需复核。

## 2. 新增 15 张卡

| ID | 原料 | confidence | 主控关注点 |
|---|---|---|---|
| PE-LUTEIN-ZEAXANTHIN | 叶黄素 / 玉米黄质 | official_reference | 儿童、护眼、玉米黄质不能混同 |
| PE-GRAPE-SEED-EXTRACT | 葡萄籽提取物 | reference_only | 香料/提取物/功能原料身份不能混同 |
| PE-ELDERBERRY | 接骨木莓 / 接骨木莓提取物 | reference_only | 不得承接免疫、抗病毒、抗感染 |
| PE-CRANBERRY | 蔓越莓 / 蔓越莓提取物 | reference_only | 不得承接泌尿治疗、抗感染 |
| PE-NMN | NMN / β-烟酰胺单核苷酸 | reference_only | 高度敏感，不得写成普通食品可直接用 |
| PE-CREATINE | 肌酸 | reference_only | 不得承诺增肌、力量、运动表现 |
| PE-L-CARNITINE | 左旋肉碱 | official_reference | 营养强化剂路径，不得燃脂减肥 |
| PE-BCAA-EAA | BCAA / EAA | reference_only | 运动营养路径需复核，不得承诺训练效果 |
| PE-FOLIC-ACID | 叶酸 | official_reference | 营养强化剂路径，备孕/胎儿相关表达高敏感 |
| PE-IRON | 铁 | official_reference | 不得治疗贫血/补血治疗 |
| PE-SELENIUM | 硒 | official_reference | 不得防癌、护肝、排毒、增强免疫 |
| PE-VITAMIN-E | 维生素 E | official_reference | 不得美容抗衰、疾病预防 |
| PE-VITAMIN-B12 | 维生素 B12 | official_reference | 不得治疗贫血、神经疾病、抗疲劳 |
| PE-BETA-GLUCAN | β-葡聚糖 | official_reference | 来源差异必须复核，不得免疫/降脂/控糖 |
| PE-YEAST-EXTRACT | 酵母抽提物 | official_reference | 调味/鲜味用途，不得保健化 |

## 3. 数据验收

静态 JSON 验收结果：

```json
{
  "cards": 45,
  "paths": 8,
  "sources": 32,
  "missing_source_refs": []
}
```

检查项：

| 检查项 | 结果 |
|---|---|
| JSON 可解析 | PASS |
| 原料卡总数 = 45 | PASS |
| 法规路径 = 8 | PASS |
| 来源总数 = 32 | PASS |
| 新增 15 张均有 `source_ids` | PASS |
| 新增 15 张均有 `official_source_urls` | PASS |
| 所有新增 source_id 均能在 source register 中找到 | PASS |
| 新增 15 张 `manual_review_required: true` | PASS |
| 未出现占位供应商 | PASS |
| Public Evidence 未被写成 Supplier Verified | PASS |

备注：数据中出现 `Supplier Verified` 字样仅用于“Public Evidence 不等于 Supplier Verified”的边界说明，不是标记已验证供应商。

## 4. 口径验收

重点风险口径：

- NMN：保持 reference_only，明确受理/送达不等于批准，不建议进入普通食品配方。
- 肌酸、BCAA/EAA：保持 reference_only，走运动营养研发方向和人工复核，不给普通食品确定合规量。
- 叶黄素/玉米黄质：明确护眼、改善视力、预防近视等为高风险；玉米黄质不能套用叶黄素。
- 葡萄籽、接骨木莓、蔓越莓：明确不得承接抗氧化、免疫、抗感染、泌尿治疗等功效。
- 铁、硒、叶酸、维 E、B12：均按营养强化剂路径处理，提示 GB 14880 / GB 28050 复核。
- β-葡聚糖：强调来源差异和路径不能混同。
- 酵母抽提物：明确调味/鲜味用途，不保健化。

## 5. 验证命令

```bash
npm run check
npm run build
npm run smoke:local
```

结果：全部 PASS。

新增专项 API 回归：

| 题目 | 页面/API | 结果 |
|---|---|---|
| NMN 可以用于普通食品吗？能不能做抗衰饮料？ | `/api/regulations` | PASS：明确未批准/待复核，不给普通食品可用结论 |
| 叶黄素和玉米黄质能不能做儿童护眼软糖？ | `/api/regulations` | PASS：旧法规库已改保守，明确“护眼/改善视力/预防近视”不可作为普通食品表达 |
| 含肌酸和 BCAA 的运动营养饮料，想主打增肌和提升运动表现 | `/api/ai-recommend` | PASS：仍输出 Formula Brief，但 allowed expressions 未包含增肌/运动表现/抗疲劳 |

## 6. 主控结论

第三批可以合并。当前 Public Evidence v1 状态：

- 45 ingredient cards
- 8 regulatory paths
- 32 sources

建议上线。上线后重点人工体验：

1. NMN 法规查询
2. 叶黄素儿童软糖
3. 肌酸/BCAA 运动营养饮料
4. 蔓越莓女性场景产品
5. β-葡聚糖膳食纤维饮品
