# 知料 Regulatory Schema 草案 v1

> 日期：2026-05-30
> 阶段：20Q 评测闭环后的法规结构化启动
> 用途：把当前 Formula Brief 里大量依赖 prompt 约束的“合规边界判断”，开始沉淀成可查询的法规记录结构。
> 边界：本文件定义的是**数据结构和记录类型**，不是正式法规结论。所有字段都允许先写“待复核”。

## 1. 为什么现在要补这份 schema

从首轮 20Q 回归结果看，自动化稳定性已经够用，但多个低分题仍然暴露出同一个问题：

- AI 能大致知道哪些表达危险；
- 但平台还没有把这些判断沉淀成**可复用、可引用、可更新**的法规记录；
- 结果就是每次都更像 prompt 临场发挥，而不是数据驱动。

这份 schema 的目标是先把法规记录固定成四类可存数据：

1. **Claim Boundary Rule**：可用/禁用/需复核表达边界
2. **Ingredient Scope Rule**：原料可用范围、适用类别、限量、排除人群
3. **Population Rule**：儿童、银发、女性、饮酒场景等特殊人群边界
4. **Channel Risk Rule**：直播、小红书、电商详情页等渠道风险

## 2. 与现有 `Regulatory Record Schema` 的关系

`data-intake-schemas-v1.md` 已经定义了最小版 `Regulatory Record Schema`。这份文档是在那个最小版之上，进一步明确：

- 记录应该分哪几种类型
- 每种类型最关键的字段是什么
- 哪些字段最适合先服务 Formula Brief

也就是说：
- `data-intake-schemas-v1.md` = 基础入库字段
- `regulatory-schema-v1.md` = 法规记录如何分类和使用

## 3. 推荐记录类型

### 3.1 Claim Boundary Rule

用于描述某一类卖点在普通食品路径下的表达边界。

| 字段 | 说明 |
|---|---|
| regulatory_id | 稳定 ID，例如 `REG-CLAIM-SLEEP-001` |
| rule_type | 固定为 `claim_boundary` |
| scenario | 如睡前场景、肠道场景、饮酒场景、体重管理 |
| forbidden_expressions | 明确禁用或高风险表达 |
| risky_expressions | 容易踩线、需谨慎人工复核的表达 |
| safe_expression_examples | 可考虑的弱表达 |
| applies_to_categories | 适用产品类别 |
| linked_golden_questions | 关联评测题 |
| manual_review_required | 是否必须人工复核 |

### 3.2 Ingredient Scope Rule

用于描述某类原料的适用范围和复核点。

| 字段 | 说明 |
|---|---|
| regulatory_id | 稳定 ID |
| rule_type | 固定为 `ingredient_scope` |
| ingredient_name | 原料名称 |
| source_name | 公告 / 标准 / 目录来源 |
| allowed_scope | 可用范围 |
| limit_or_threshold | 限量或阈值 |
| excluded_population | 不适用人群 |
| label_requirements | 标签或警示要求 |
| linked_ingredient_ids | 关联原料 ID |
| linked_golden_questions | 关联评测题 |

### 3.3 Population Rule

用于处理儿童、银发、女性、饮酒场景等特殊人群边界。

| 字段 | 说明 |
|---|---|
| regulatory_id | 稳定 ID |
| rule_type | 固定为 `population_rule` |
| population | 目标人群 |
| scenario | 应用场景 |
| sensitive_terms | 容易误导或高风险的表达 |
| review_points | 必须人工复核的点 |
| linked_golden_questions | 关联题目 |

### 3.4 Channel Risk Rule

用于处理直播、小红书、电商详情页等渠道表达差异。

| 字段 | 说明 |
|---|---|
| regulatory_id | 稳定 ID |
| rule_type | 固定为 `channel_risk` |
| channel | 渠道名称 |
| risky_terms | 渠道中高风险词 |
| safe_rewrite_examples | 可替代话术 |
| moderation_notes | 平台审核风险说明 |
| linked_golden_questions | 关联题目 |

## 4. 首批最值得结构化的 3 个规则方向

### REG-SEED-001 儿童益生菌普通食品表达边界

```json
{
  "regulatory_id": "REG-CLAIM-CHILD-PROBIOTIC-001",
  "source_type": "internal_rule",
  "source_name": "儿童益生菌普通食品表达边界（内部规则）",
  "rule_type": "claim_boundary",
  "scenario": "儿童益生菌 / 日常营养支持",
  "forbidden_expressions": [
    "调节肠道菌群",
    "增强免疫",
    "改善消化",
    "治疗便秘"
  ],
  "risky_expressions": [
    "肠道健康",
    "肚肚舒服",
    "守护吸收"
  ],
  "safe_expression_examples": [
    "添加益生菌菌株",
    "儿童日常营养补充",
    "果味固体饮料"
  ],
  "applies_to": [
    "儿童普通食品",
    "儿童固体饮料"
  ],
  "manual_review_required": true,
  "linked_golden_questions": [
    "GQ-003"
  ]
}
```

### REG-SEED-002 植物基蛋白普通食品表达边界

```json
{
  "regulatory_id": "REG-CLAIM-PLANT-PROTEIN-001",
  "source_type": "internal_rule",
  "source_name": "植物基蛋白普通食品表达边界（内部规则）",
  "rule_type": "claim_boundary",
  "scenario": "植物基蛋白饮 / 轻健身场景",
  "forbidden_expressions": [
    "快速增肌",
    "代谢提升",
    "燃脂",
    "塑形效果"
  ],
  "risky_expressions": [
    "健身恢复",
    "能量提升"
  ],
  "safe_expression_examples": [
    "植物基高蛋白",
    "轻负担营养补充",
    "乳糖友好"
  ],
  "applies_to": [
    "植物蛋白饮",
    "植物基奶昔"
  ],
  "manual_review_required": true,
  "linked_golden_questions": [
    "GQ-007"
  ]
}
```

### REG-SEED-003 饮酒场景高风险表达边界

```json
{
  "regulatory_id": "REG-CLAIM-SOCIAL-DRINKING-001",
  "source_type": "internal_rule",
  "source_name": "饮酒场景普通食品表达边界（内部规则）",
  "rule_type": "claim_boundary",
  "scenario": "聚会 / 饮酒场景软糖",
  "forbidden_expressions": [
    "解酒",
    "护肝",
    "保护肝脏",
    "降低酒精伤害"
  ],
  "risky_expressions": [
    "酒前准备",
    "聚会保护",
    "轻松续杯"
  ],
  "safe_expression_examples": [
    "聚会场景小食",
    "清爽口味软糖",
    "含某某食材"
  ],
  "applies_to": [
    "普通食品",
    "软糖",
    "社交场景零食"
  ],
  "manual_review_required": true,
  "linked_golden_questions": [
    "GQ-015"
  ]
}
```

## 5. 这份 schema 未来怎么喂给 Formula Brief

| Formula Brief 模块 | 未来读取的法规记录 |
|---|---|
| Compliance Checks | Claim Boundary Rule + Ingredient Scope Rule |
| Claim Suggestions | Claim Boundary Rule + Channel Risk Rule |
| Supplier Matches | Ingredient Scope Rule（确认适用类别后才推荐） |
| Trust Score | 是否有法规记录、是否需人工复核、是否存在未覆盖项 |

## 6. 第一批落地建议

1. 先把 `GQ-003 / GQ-007 / GQ-015` 的边界规则做成可查询记录。
2. 再扩展到 `GQ-013 / GQ-017 / GQ-019` 这类也明显依赖规则边界的场景。
3. 等法规记录稳定后，再考虑是否把 Claim Boundary Rule 接进 prompt 或 API 侧数据读取。
