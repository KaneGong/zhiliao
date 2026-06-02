# Formula Brief 证据状态 UI 验收记录

> 日期：2026-06-03  
> 来源：01-Formula Brief 会话本轮改动  
> 范围：`/recommend` 结构化 Formula Brief 卡片展示层  
> 结论：主控验收通过，建议部署。

## 1. 改动范围

文件：

```text
src/app/recommend/components/FormulaBriefView.tsx
```

主要新增：

1. 原料卡状态 badge：
   - `公开证据`
   - `待复核`
   - `平台资料`
   - `需确认`

2. Formula Brief 顶部三块状态摘要：
   - `公开证据`：提示是否命中公开法规/证据参考。
   - `待复核`：提示类别、用量或标签需要人工确认。
   - `供应商边界`：提示是否有平台目录匹配，以及仍需索资。

3. 合规检查区域强化：
   - 风险等级 badge 更明显。
   - 新增“需复核”小块，集中展示人工复核点。

4. 供应商区域强化：
   - 显示 `Public Evidence ≠ Supplier Verified`。
   - `platform_available=false` 时明确显示“暂无核验供应商”。
   - 将未核验项说明为“仅作为索资动作，不作为真实供应商推荐”。

## 2. 主控验收要点

| 验收点 | 结果 | 备注 |
|---|---|---|
| 不新增大页面 | PASS | 仅修改 Formula Brief 展示组件 |
| 不改 Warm Lab 主题 | PASS | 延续暗色玻璃、amber/emerald/sky 状态色 |
| Public Evidence 不等于 Supplier Verified | PASS | 供应商区显性显示该边界 |
| 未核验供应商不显示为真实推荐 | PASS | `platform_available=false` 显示“暂无核验供应商” |
| 待复核信息更明显 | PASS | 顶部摘要、合规卡、原料 badge 均有体现 |
| AI/SSE 输出逻辑不变 | PASS | 仅 UI 展示层改动 |

## 3. 验证命令

```bash
npm run check
npm run build
npm run smoke:local
GOLDEN_SET=all GOLDEN_IDS=GQ-001,GQ-003,GQ-014 GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=0 npm run test:golden:all
```

结果：

- `npm run check`：PASS
- `npm run build`：PASS
- `npm run smoke:local`：PASS
- Golden 子集：3/3 PASS
  - GQ-001 助眠软糖：PASS
  - GQ-003 儿童益生菌：PASS
  - GQ-014 咖啡因能量饮：PASS

## 4. 备注

Playwright CLI 对 textarea 的中文输入曾出现 React 状态未触发导致按钮仍显示 disabled 的工具层现象；检查代码确认 `/recommend` 输入逻辑未被 01 修改，且 API Golden 子集通过，因此不作为本轮阻塞。

## 5. 主控结论

本轮 UI 改动符合任务目标，可以提交并部署。上线后用户在方案卡片里会更清楚看到：

- 哪些是公开证据参考；
- 哪些需要法规/标签/用量人工复核；
- 哪些只是供应商索资动作，不是已验证供应商。
