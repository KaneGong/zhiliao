# 知料 Supplier Spec 示例记录 v1

> 日期：2026-05-30
> 阶段：20Q 评测闭环后的低分题数据修复
> 用途：给 `Supplier Spec Schema` 提供首批可复用的示例记录，优先覆盖当前 20Q 里最需要补数据的低分场景。
> 边界：以下记录均为 `draft` 级别的内部示例，不代表已完成供应商验证，也不代表平台已正式上线这些原料。

## 1. 为什么先做这 3 条

本轮优先覆盖 3 个在 20Q 首轮回归中最有代表性、最能暴露平台数据短板的问题：

1. **GQ-003 儿童益生菌**：方案能生成，但核心菌株供应商闭环不足。
2. **GQ-007 植物基蛋白饮**：路线完整，但平台暂无核心植物蛋白匹配。
3. **GQ-015 饮酒场景软糖**：合规表达控制住了，但供应商可用性弱，且高风险场景更需要资料边界。

这些记录的目标不是“装作已有成熟库”，而是先固定：
- 一条记录应该长什么样
- 缺资料时如何诚实标注
- Formula Brief 未来如何引用这些数据

## 2. 记录使用规则

- 所有 `draft` 记录只用于内部方案、评测和补库，不作为最终法规或配方结论。
- `supplier_name` 可以先写“待补充供应商 A/B”，重点是把字段结构先固定下来。
- `required_docs` 必须写实，不能因为暂时没有就省略。
- `data_completeness=low` 时，Formula Brief 必须倾向输出“有线索但资料不完整”而不是“已有可用匹配”。

## 3. 示例记录

### SP-SEED-001 儿童益生菌菌株方向

```json
{
  "id": "SUP-PROBIOTIC-CHILD-SEED-001",
  "status": "draft",
  "confidence": "low",
  "source_refs": [
    "docs/data/supplier-gap-shortlist-v1.md#sg-001",
    "docs/tasks/golden-question-results-2026-05-30-20q.md#gq-003"
  ],
  "owner": "codex-agent",
  "last_reviewed_at": "2026-05-30",
  "notes": "示例记录，先固定儿童益生菌供应商资料结构。",
  "supplier_id": "SUP-PROBIOTIC-CHILD-SEED-001",
  "supplier_name": "待补充儿童益生菌供应商 A",
  "ingredient_ids": [
    "ING-PROBIOTIC-CHILD-001"
  ],
  "spec_name": "3岁以上儿童适用益生菌菌株组合（待确认）",
  "active_content": "≥100亿 CFU/克（待供应商确认）",
  "dosage_form_fit": [
    "固体饮料",
    "条包粉",
    "滴剂"
  ],
  "certificates": [],
  "coa_required": true,
  "required_docs": [
    "菌株规格书",
    "COA",
    "菌株身份证明 / strain identity",
    "活菌稳定性资料",
    "适用食品类别声明",
    "儿童适用年龄说明"
  ],
  "moq": "待询价",
  "lead_time": "待询价",
  "sample_available": "unknown",
  "application_cases": [
    "儿童益生菌固体饮料",
    "儿童营养条包"
  ],
  "data_completeness": "low",
  "next_contact_action": "优先寻找可用于3岁以上儿童普通食品场景的菌株供应商，并索取完整资料包。"
}
```

**当前用途：**
- 对应 `GQ-003` 的“有线索但资料不完整”状态
- 后续可以映射到 `ingredient_ids -> supplier_matches -> next_steps`

### SP-SEED-002 植物基蛋白方向

```json
{
  "id": "SUP-PLANT-PROTEIN-SEED-001",
  "status": "draft",
  "confidence": "low",
  "source_refs": [
    "docs/tasks/golden-question-results-2026-05-30-20q.md#gq-007",
    "docs/data/data-gap-backlog-2026-05-29.md#sup-006"
  ],
  "owner": "codex-agent",
  "last_reviewed_at": "2026-05-30",
  "notes": "植物基蛋白饮方向示例记录，用于补平台暂无核心匹配的问题。",
  "supplier_id": "SUP-PLANT-PROTEIN-SEED-001",
  "supplier_name": "待补充植物蛋白供应商 A",
  "ingredient_ids": [
    "ING-PEA-PROTEIN-001",
    "ING-RICE-PROTEIN-001"
  ],
  "spec_name": "豌豆蛋白 + 大米蛋白饮品级复配方案（待确认）",
  "active_content": "蛋白含量待确认，需区分分离蛋白 / 浓缩蛋白",
  "dosage_form_fit": [
    "RTD 饮料",
    "固体饮料",
    "植物基奶昔"
  ],
  "certificates": [
    "非转基因（待确认）",
    "过敏原声明（待确认）"
  ],
  "coa_required": true,
  "required_docs": [
    "规格书",
    "COA",
    "溶解性与分散性资料",
    "豆腥味 / 砂感控制建议",
    "推荐应用场景说明",
    "过敏原声明"
  ],
  "moq": "待询价",
  "lead_time": "待询价",
  "sample_available": "unknown",
  "application_cases": [
    "植物基蛋白饮",
    "高蛋白奶昔",
    "轻健身营养饮"
  ],
  "data_completeness": "low",
  "next_contact_action": "优先补豌豆蛋白和大米蛋白的饮料级规格、风味遮蔽方案和样品可得性。"
}
```

**当前用途：**
- 对应 `GQ-007` 的“路线有了，但供应商闭环没有”
- 后续可与植物基蛋白饮样板案例联动

### SP-SEED-003 饮酒场景软糖原料方向

```json
{
  "id": "SUP-SOCIAL-GUMMY-SEED-001",
  "status": "draft",
  "confidence": "low",
  "source_refs": [
    "docs/tasks/golden-question-results-2026-05-30-20q.md#gq-015",
    "docs/data/data-gap-backlog-2026-05-29.md#sup-012"
  ],
  "owner": "codex-agent",
  "last_reviewed_at": "2026-05-30",
  "notes": "饮酒场景软糖高风险，示例记录重点在资料边界和禁用表达控制。",
  "supplier_id": "SUP-SOCIAL-GUMMY-SEED-001",
  "supplier_name": "待补充饮酒场景原料供应商 A",
  "ingredient_ids": [
    "ING-GEZHEN-001",
    "ING-ZHIJUZI-001",
    "ING-VB-COMPLEX-001"
  ],
  "spec_name": "聚会场景软糖原料组合（葛根 / 枳椇子 / B族维生素）待确认",
  "active_content": "待供应商确认",
  "dosage_form_fit": [
    "软糖",
    "凝胶糖果",
    "固体饮料"
  ],
  "certificates": [],
  "coa_required": true,
  "required_docs": [
    "规格书",
    "COA",
    "适用食品类别说明",
    "药食同源或原料属性说明",
    "风味遮蔽建议",
    "软糖应用建议"
  ],
  "moq": "待询价",
  "lead_time": "待询价",
  "sample_available": "unknown",
  "application_cases": [
    "聚会场景软糖",
    "社交小食",
    "清爽口味固体饮料"
  ],
  "data_completeness": "low",
  "next_contact_action": "优先确认葛根、枳椇子等原料的食品属性和适用类别，再决定是否进入软糖方案。"
}
```

**当前用途：**
- 对应 `GQ-015` 的“高风险场景 + 资料薄弱 + 首轮解析曾失败”
- 强制平台后续在该类场景里先走“资料校验”而不是“供应商强推荐”

## 4. 这三条记录如何回写 Formula Brief

| 场景 | 当前应展示的状态 | 不应展示的状态 |
|---|---|---|
| 儿童益生菌 | 有线索但资料不完整 | 已确认可用于儿童普通食品 |
| 植物基蛋白饮 | 有待补供应商线索 | 平台已有成熟可打样闭环 |
| 饮酒场景软糖 | 高风险，先核属性再谈原料 | 可直接推荐“解酒/护肝”相关原料 |

## 5. 下一步最自然动作

1. 把这 3 条示例记录拆成真正可录入的数据文件（JSON 或管理后台表单）。
2. 给每条记录补对应的 `Ingredient Profile` 示例记录。
3. 把 `GQ-003 / GQ-007 / GQ-015` 的低分原因直接连接到供应商补库任务。
