# 知料数据入口 Schema v1 — Ingredient / Supplier / Regulatory

> 日期：2026-05-29
> 阶段：Formula Brief v1 数据线启动
> 状态：draft，用于后续供应商补库、法规结构化、原料参数整理和 Formula Brief 质量提升。
> 边界：本文件只定义数据字段，不录入具体法规结论，不作为配方、标签或广告合规意见。

## 1. 设计目标

这套 schema 是知料数据资产的最小入口层，目标是让后续补充的原料、供应商和法规资料可以被统一挂接到 Formula Brief v1。

它服务四个输出模块：

| Formula Brief 模块 | Schema 支撑方式 |
|---|---|
| 配方路线 | 从原料功能角色、适用剂型、工艺稳定性中生成可解释路线 |
| 合规检查 | 从法规风险、适用范围、限量、禁用表达中生成复核清单 |
| 供应商匹配 | 从 supplier_id、spec、证书、样品和资料完整度中生成匹配建议 |
| Trust Score 解释 | 从资料来源、审核状态、数据完整度中解释可信度 |

## 2. 通用字段约定

所有数据记录都应包含以下通用字段：

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| id | string | 是 | 稳定唯一 ID，例如 `ING-GABA-001`、`SUP-ANG-001`、`REG-GB28050-001` |
| status | enum | 是 | `draft` / `reviewed` / `verified` / `deprecated` |
| confidence | enum | 是 | `low` / `medium` / `high`，表示资料可信度，不代表合规保证 |
| source_refs | string[] | 是 | 来源文件、URL、供应商资料、法规文本或人工记录 |
| owner | string | 否 | 资料维护人或负责 agent |
| last_reviewed_at | string | 否 | 最近复核日期，格式 `YYYY-MM-DD` |
| notes | string | 否 | 内部备注 |

## 3. Ingredient Profile Schema

用于描述一个原料或原料类别的研发、工艺、法规和供应商连接信息。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| ingredient_id | string | 是 | 原料 ID，例如 `ING-GABA-001` |
| name_cn | string | 是 | 中文通用名 |
| name_en | string | 否 | 英文名或国际通用名 |
| aliases | string[] | 否 | 别名、商品名、常见写法 |
| category | string | 是 | 原料类别，如蛋白、益生菌、膳食纤维、新食品原料、营养强化剂 |
| function_roles | string[] | 是 | 在配方中的角色，如蛋白补充、风味遮蔽、凝胶体系、营养强化 |
| applicable_forms | string[] | 是 | 适用剂型，如软糖、固体饮料、RTD 饮料、气泡水、酸奶、烘焙、调味粉 |
| dosage_range_draft | string | 否 | 内部草案添加量范围；未复核时必须写“待复核” |
| sensory_notes | string | 否 | 口感、气味、颜色、苦味、腥味、砂感等 |
| process_stability | object | 否 | 热稳定性、pH 稳定性、溶解性、货架期风险等 |
| regulatory_flags | string[] | 是 | 新食品原料、营养强化剂、可用于食品菌种、保健路径、特殊人群等提醒 |
| forbidden_claim_domains | string[] | 否 | 不应作为普通食品可用表达的方向，如睡眠、免疫、降糖、减肥、护肝 |
| supplier_ids | string[] | 否 | 可关联的供应商 ID |
| data_gaps | string[] | 否 | 还缺什么资料，如公告限量、稳定性、COA、应用案例 |
| review_status | enum | 是 | `draft` / `needs_regulatory_review` / `needs_supplier_docs` / `reviewed` |

### Ingredient Profile 示例骨架

```json
{
  "ingredient_id": "ING-GABA-001",
  "name_cn": "GABA",
  "name_en": "Gamma-aminobutyric acid",
  "aliases": ["γ-氨基丁酸"],
  "category": "待复核原料",
  "function_roles": ["睡前场景原料事实", "风味卖点辅助"],
  "applicable_forms": ["软糖", "固体饮料"],
  "dosage_range_draft": "待复核",
  "sensory_notes": "可能影响苦味，需搭配酸甜风味或遮蔽体系",
  "process_stability": {
    "heat": "待复核",
    "pH": "待复核",
    "solubility": "待复核"
  },
  "regulatory_flags": ["适用食品类别待复核", "每日摄入量待复核"],
  "forbidden_claim_domains": ["助眠", "改善睡眠", "安神"],
  "supplier_ids": [],
  "data_gaps": ["法规公告", "供应商规格书", "软糖应用案例"],
  "review_status": "needs_regulatory_review"
}
```

## 4. Supplier Spec Schema

用于描述供应商可提供的原料规格、商业条件和资料完整度。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| supplier_id | string | 是 | 供应商 ID，例如 `SUP-ANG-001` |
| supplier_name | string | 是 | 供应商名称 |
| ingredient_ids | string[] | 是 | 可供应的原料 ID |
| spec_name | string | 是 | 规格名称或型号 |
| active_content | string | 否 | 活性含量、纯度、蛋白含量、菌数等 |
| dosage_form_fit | string[] | 否 | 适用剂型或推荐应用 |
| certificates | string[] | 否 | ISO、HACCP、Halal、Kosher、有机、非转基因等 |
| coa_required | boolean | 是 | 是否必须索取 COA |
| required_docs | string[] | 是 | 规格书、COA、检测报告、过敏原声明、应用建议等 |
| moq | string | 否 | 最小起订量 |
| lead_time | string | 否 | 交期 |
| sample_available | enum | 否 | `yes` / `no` / `unknown` |
| application_cases | string[] | 否 | 供应商提供的应用案例或推荐品类 |
| data_completeness | enum | 是 | `low` / `medium` / `high` |
| next_contact_action | string | 是 | 下一步联系动作，如索取规格书、询样、确认适用食品类别 |

### Supplier Spec 示例骨架

```json
{
  "supplier_id": "SUP-PROBIOTIC-001",
  "supplier_name": "待补充益生菌供应商",
  "ingredient_ids": ["ING-PROBIOTIC-CHILD-001"],
  "spec_name": "儿童益生菌菌株规格待确认",
  "active_content": "待供应商确认",
  "dosage_form_fit": ["固体饮料", "条包"],
  "certificates": [],
  "coa_required": true,
  "required_docs": ["规格书", "COA", "菌株身份证明", "活菌稳定性资料", "适用食品类别声明"],
  "moq": "待询价",
  "lead_time": "待询价",
  "sample_available": "unknown",
  "application_cases": [],
  "data_completeness": "low",
  "next_contact_action": "寻找儿童适用菌株供应商并索取完整资料包"
}
```

## 5. Regulatory Record Schema

用于把法规、标准、公告和内部声称边界整理为可查询记录。

| 字段 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| regulatory_id | string | 是 | 法规记录 ID，例如 `REG-GB28050-LOW-SUGAR-001` |
| source_type | enum | 是 | `standard` / `announcement` / `catalog` / `internal_rule` / `expert_note` |
| source_name | string | 是 | 来源名称，如 GB 28050、GB 14880、新食品原料公告 |
| applies_to | string[] | 是 | 适用对象，如原料、营养声称、食品类别、特殊人群 |
| allowed_scope | string | 否 | 可用范围；不确定时写“待复核” |
| limit_or_threshold | string | 否 | 限量、阈值或条件；不确定时写“待复核” |
| excluded_population | string[] | 否 | 不适用人群或需警示人群 |
| label_requirements | string[] | 否 | 标签、警示语、营养成分表等要求 |
| forbidden_expressions | string[] | 否 | 普通食品路径下禁止或高风险表达 |
| safe_expression_examples | string[] | 否 | 可考虑的弱表达或替代表达 |
| manual_review_required | boolean | 是 | 是否必须人工复核 |
| linked_ingredient_ids | string[] | 否 | 关联原料 ID |
| linked_golden_questions | string[] | 否 | 关联 Golden Questions |

### Regulatory Record 示例骨架

```json
{
  "regulatory_id": "REG-CLAIM-SLEEP-001",
  "source_type": "internal_rule",
  "source_name": "普通食品高风险声称内部规则",
  "applies_to": ["睡前场景", "普通食品表达"],
  "allowed_scope": "可描述睡前场景、风味、低糖、原料事实；不得承诺改善睡眠效果",
  "limit_or_threshold": "待法规复核",
  "excluded_population": [],
  "label_requirements": [],
  "forbidden_expressions": ["助眠", "改善睡眠", "安神", "治疗失眠"],
  "safe_expression_examples": ["睡前场景", "夜间轻负担", "含某某原料"],
  "manual_review_required": true,
  "linked_ingredient_ids": ["ING-GABA-001"],
  "linked_golden_questions": ["GQ-001"]
}
```

## 6. Formula Brief 对接规则

- 配方路线只能引用 `Ingredient Profile` 中的原料角色、剂型适配和工艺风险，不能把 `draft` 添加量写成最终建议。
- 合规检查必须优先读取 `Regulatory Record` 的禁用表达、人工复核字段和适用范围。
- 供应商匹配必须读取 `Supplier Spec` 的资料完整度；资料不完整时输出“暂无平台匹配”或“需补资料”，不得伪造确认。
- Trust Score 应受到 `confidence`、`review_status`、`data_completeness` 和 `source_refs` 影响。
- 所有 `draft` / `low confidence` 数据只能用于内部方案草案，不得作为最终法规或标签结论。

## 7. 下一步落地顺序

1. 用本 schema 建立第一批 `supplier-gap-shortlist-v1.md`，优先覆盖儿童益生菌、GABA/茶氨酸、透明质酸钠。
2. 将 20 条 Golden Questions 的评测模板与 `linked_golden_questions` 对齐。
3. 选 3 个样板案例做高质量版本，验证 schema 是否足够支撑 Formula Brief。
4. 等 schema 稳定后，再决定是否转为 JSON 数据文件或接入 RAG。
