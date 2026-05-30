# Public Evidence Regulatory Map v1

> Last checked: 2026-05-30

本文件是法规路径地图，不是完整法规大全。AI 应先判断路径，再决定能否给配方建议、是否需要人工复核。

## 普通食品路径

- Path ID: `general_food`
- Scope: 适用于不以保健功能、疾病预防或治疗为目的的普通预包装或散装食品。
- AI policy: 可以讨论营养事实、配方属性、食用场景和感官体验；不得把保健功能或疾病相关效果作为对外表达。
- Confidence: `official_reference`
- Manual review triggers:
  - 用户要求助眠/增强免疫/降血脂/改善皮肤/改善肠道/骨骼健康等功能卖点
  - 儿童、孕妇、婴幼儿、特殊医学用途等敏感人群
  - 原料在证据库未收录或法规身份不清楚
- Primary sources:
  - `SRC-NHC-GB7718-2025-QA` — GB 7718-2025 预包装食品标签通则问答
  - `SRC-NHC-GB28050-2025-QA` — GB 28050-2025 预包装食品营养标签通则问答

## 食品添加剂路径

- Path ID: `food_additive`
- Scope: 适用于以防腐、着色、甜味、增稠、酸度调节等工艺目的使用的食品添加剂。
- AI policy: 必须按 GB 2760 及增补公告核对食品类别、功能类别和最大使用量；未核对前不得给出确定使用量。
- Confidence: `reference_only`
- Manual review triggers:
  - 用户问具体添加剂用量
  - 复配添加剂或食品类别不明确
  - 儿童/婴幼儿食品中使用添加剂
- Primary sources:
  - `SRC-NHC-NEWFOOD-CATALOG-2023` — 三新食品目录及适用的食品安全标准公告解读 / 目录 PDF

## 营养强化剂路径

- Path ID: `nutrient_fortifier`
- Scope: 适用于维生素、矿物质等以营养强化为目的加入食品的原料。
- AI policy: 必须按 GB 14880 核对食品类别、化合物来源和用量范围；不能把营养强化自动等同于保健功能。
- Confidence: `official_reference`
- Manual review triggers:
  - 食品类别不明确
  - 用量或 NRV 声称不明确
  - 儿童/婴幼儿或特殊膳食产品
- Primary sources:
  - `SRC-NHC-GB14880-2012` — GB 14880-2012 食品安全国家标准 食品营养强化剂使用标准
  - `SRC-NHC-GB28050-2025-QA` — GB 28050-2025 预包装食品营养标签通则问答

## 新食品原料路径

- Path ID: `novel_food`
- Scope: 适用于经公告批准的新食品原料/新资源食品。
- AI policy: 必须回到批准公告确认使用范围、推荐食用量、不适宜人群和标签要求；不得因“已批准”推导为所有食品类别可用。
- Confidence: `official_reference`
- Manual review triggers:
  - 食品类别不在公告范围内
  - 涉及儿童/孕妇/哺乳期
  - 推荐食用量或标签提示未确认
- Primary sources:
  - `SRC-NHC-NEWFOOD-CATALOG-2023` — 三新食品目录及适用的食品安全标准公告解读 / 目录 PDF

## 保健食品路径

- Path ID: `health_food`
- Scope: 适用于希望表达保健功能、营养素补充剂或特定保健食品原料目录的产品。
- AI policy: 普通食品路径不得承接保健功能声称；如用户坚持功能卖点，应提示可能需要保健食品注册/备案路径。
- Confidence: `reference_only`
- Manual review triggers:
  - 改善睡眠、增强免疫、辅助降血脂、缓解疲劳、骨密度等功能诉求
  - 使用保健食品专属原料或剂量
- Primary sources:
  - `SRC-NHC-GB7718-2025-QA` — GB 7718-2025 预包装食品标签通则问答

## 婴幼儿 / 特膳路径

- Path ID: `infant_special_dietary`
- Scope: 适用于婴幼儿配方食品、特殊膳食食品、特殊医学用途配方食品等高敏感类别。
- AI policy: 只能提示资料入口和复核点，不直接给最终添加量、合规结论或标签方案。
- Confidence: `official_reference`
- Manual review triggers:
  - 婴幼儿、孕产妇、特殊医学用途
  - 菌种、乳铁蛋白、DHA、营养强化剂用于婴配或特膳
- Primary sources:
  - `SRC-NHC-PROBIOTIC-2025-INTERP` — D-阿洛酮糖等20种“三新食品”公告解读：婴幼儿食品菌种相关条目
  - `SRC-NHC-GB14880-2012` — GB 14880-2012 食品安全国家标准 食品营养强化剂使用标准

## 标签与宣传声称边界

- Path ID: `claim_labeling`
- Scope: 适用于包装标签、电商详情页、直播、小红书等对外表达。
- AI policy: 优先使用配方属性、原料事实、营养事实和食用场景；功效承诺必须进入风险或人工复核。
- Confidence: `official_reference`
- Manual review triggers:
  - 任何功能性动词：改善、调节、增强、促进、缓解、治疗、预防、修复
  - 渠道话术把普通食品包装成保健/药品效果
- Primary sources:
  - `SRC-NHC-GB7718-2025-QA` — GB 7718-2025 预包装食品标签通则问答
  - `SRC-NHC-GB28050-2025-QA` — GB 28050-2025 预包装食品营养标签通则问答
