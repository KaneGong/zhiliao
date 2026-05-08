# 共享数据格式标准

## 供应商数据 (suppliers.json)

```json
{
  "last_updated": "2026-05-08",
  "suppliers": [
    {
      "supplier_id": "ang",
      "name": "荷兰爱联康营养（上海普洛钦）",
      "short_name": "ANG",
      "country": "荷兰/中国",
      "product_lines": ["Prochin", "Novosana"],
      "description": "乳蛋白原料 + 鱼油/藻油/特种油脂",
      "contact": "待补充",
      "website": "待补充",
      "status": "active",
      "data_completeness": "high"
    }
  ]
}
```

## 产品数据格式 (products.json)

```json
{
  "last_updated": "2026-05-08",
  "data_status": "v3 - 多供应商开放平台版",
  "product_lines": {
    "{supplier_id}_{product_line}": {
      "description": "产品线描述",
      "products": [
        {
          "id": "SUP-XXX-001",
          "supplier_id": "ang",
          "supplier_name": "ANG 爱联康",
          "product_name": "产品名称",
          "product_code": "产品型号",
          "category": "品类",
          "origin": "产地",
          "function": "功能描述",
          "mechanism": "作用机制",
          "applications": ["应用方向"],
          "dosage_range": "建议添加量",
          "key_specifications": {
            "composition": "成分组成",
            "form": "形态",
            "epa_dha_content": "EPA/DHA含量（如适用）"
          },
          "clinical_evidence": "临床证据",
          "regulatory_status": {
            "china": "中国法规状态",
            "eu": "欧盟法规状态",
            "us": "美国法规状态",
            "certifications": ["认证"]
          },
          "confidence": "high/medium/low",
          "data_source": "数据来源文件",
          "last_verified": "最后验证日期"
        }
      ]
    }
  }
}
```

## 价格数据格式 (pricing.json)

```json
{
  "last_updated": "2026-05-08",
  "disclaimer": "所有价格仅供参考，不作为交易依据。实际价格请向供应商直接询价。",
  "currency": "RMB",
  "incoterm": "DDU/DDP",
  "pricing": [
    {
      "supplier_id": "ang",
      "brand": "品牌",
      "product": "产品名",
      "price": 100,
      "price_range": "80-120",
      "unit": "元/kg",
      "trend": "↑/→/↓",
      "volumes": "批量信息",
      "note": "备注",
      "source": "价格来源（如：ANG Pricelist week18）",
      "valid_until": "价格有效截止日期",
      "disclaimer": "参考价，非最终成交价"
    }
  ]
}
```

## 任务格式 (input/task-XXX.json)

```json
{
  "task_id": "001",
  "from": "艾希",
  "to": "子Agent名称",
  "type": "data_collection | data_analysis | content_creation | regulatory_check",
  "description": "任务描述",
  "details": {},
  "output_path": "output/task-001-result.json",
  "deadline": "2026-05-15",
  "priority": "high | medium | low",
  "status": "pending | in_progress | completed"
}
```

## 任务结果格式 (output/task-XXX-result.json)

```json
{
  "task_id": "001",
  "status": "completed",
  "completed_by": "子Agent名称",
  "completed_at": "2026-05-10T10:00:00+08:00",
  "result": {},
  "files_produced": ["path/to/file1", "path/to/file2"],
  "notes": "备注"
}
```

## 协作日志格式 (logs/coordination.log)

每条日志格式：
```
[2026-05-08 10:00:00] [Agent名称] [操作类型] 描述
```
