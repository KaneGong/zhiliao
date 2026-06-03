# Public Evidence v1 上线状态说明

最后更新：2026-05-30 22:40 CST

## 1. 本次上线内容

本次将知料从 Demo Case 扩展主线切换到 **Public Evidence v1**：先建立法规路径地图和公开证据卡，再将证据层以最小方式注入现有 AI 推荐与法规查询流程。

已上线能力：

- Public Evidence 法规路径地图 v1：普通食品、食品添加剂、营养强化剂、新食品原料、保健食品、婴幼儿/特膳、标签与宣传声称边界。
- Public Evidence 原料证据卡 v1：首批 20 个 + 第二批 10 个，共 30 个高频/高风险原料。
- Source Register：官方法规/国家标准/供应商公开资料来源登记。
- `/recommend` Formula Brief prompt：按用户问题命中并注入最多 5 张证据卡。
- `/regulations` prompt：注入法规路径地图和“未收录/待复核”规则。
- 输出清洗层：对“法规清晰/合规清晰/已验证/体感明确/脑力营养”等过度确定或高风险表达做保守改写。

## 2. 关键文件

文档资产：

- `docs/data/public-evidence-regulatory-map-v1.md`
- `docs/data/public-evidence-ingredient-cards-v1.md`
- `docs/data/public-evidence-source-register-v1.md`

结构化数据：

- `src/data/public_evidence/regulatory_map.v1.json`
- `src/data/public_evidence/ingredient_cards.v1.json`
- `src/data/public_evidence/sources.v1.json`

代码集成：

- `src/lib/public-evidence.ts`
- `src/app/api/ai-recommend/prompt.ts`
- `src/app/api/regulations/prompt.ts`
- `src/app/api/regulations/route.ts`
- `src/lib/formula-brief.ts`

## 3. 质量原则

- Public Evidence 只代表公开法规/公开资料边界，不等于 Supplier Verified。
- 只有官方法规、国家标准、供应商官网/官方资料可作为主来源。
- 行业文章、论文、竞品页面只能作为参考，不得作为法规结论。
- 未收录或证据不足时，AI 必须进入“当前证据库未收录完整卡片，需人工复核/待复核”路径。
- 不得把公开证据卡说成平台已有供应商、已索资或已核验供应商。
- 普通食品路径下不得输出助眠、增强免疫、改善皮肤、辅助降血脂、解酒护肝、脑力益智等高风险正向声称。

## 4. 验证结果

本地验证：

- `npm run verify`：通过
- `npm run smoke:local`：通过
- Public Evidence JSON 验收：30 cards / 7 paths / 17 sources，通过
- Golden 全量 20Q：20/20 PASS
- 重点复测：
  - GQ-001 助眠软糖：PASS，已将“法规清晰/体感”类表达改写为“法规边界需复核/体验定位需打样验证”。
  - GQ-003 儿童益生菌：PASS，供应商无真实菌株匹配时保持“暂无平台匹配”。
  - GQ-011 儿童 DHA：PASS，未输出“提高智力/改善视力/学习成绩”等声称。

法规专项验证：

- GABA：通过
- 透明质酸钠：通过
- 乳铁蛋白：通过
- DHA / Omega-3：通过
- 未知原料：能正确进入“未收录/待复核”路径

线上验证：

- `https://zhiliao-ai.cn/`：200
- `https://zhiliao-ai.cn/recommend`：200
- `https://zhiliao-ai.cn/regulations`：200
- 服务器本机 `/`、`/recommend`、`/regulations`、`/admin`：200
- PM2：`zhiliao` online

## 5. 部署信息

- 分支：`main`
- Public Evidence 主提交：`1435ab2 feat: add public evidence layer`
- 部署方式：本地 Git archive gzip 包 → scp 上传 → 服务器 `npm install` + `npm run build` + standalone 文件补齐 → PM2 delete/start
- 服务器路径：`/opt/zhiliao`
- 最近备份：`/opt/zhiliao_backup_20260530_223506`

备注：legacy webhook 端口 9000 本轮仍不可作为可靠首选，出现 empty reply / 上传失败；已按 SSH/SCP 方式完成部署。

## 6. 当前已知边界

- Public Evidence v1 仍不是完整法规库；它是证据层和风险边界层。
- 已扩展到 30 张卡；调味、电解质、咖啡因、膳食纤维、饮酒场景已有基础证据卡，但仍需逐条官方原文深度复核。
- Source Register 中的供应商公开资料仅能用于索资线索，不代表平台已完成 Supplier Verified。
- 20Q 虽已全量通过，但部分低分场景仍偏保守，主要原因是平台供应商目录暂无对应核心原料或法规证据卡尚未覆盖。

## 7. 下一步建议

1. 对第二批 10 张卡逐条补官方公告原文深链和适用食品类别。
2. 针对 20Q 中供应商缺口较大的场景补真实供应商候选。
3. 后续供应商入驻后，再把 Supplier Verified 和 Public Evidence 分层接起来。

## 8. 2026-06-02 第二批深度复核验收

02 会话对第二批 10 张卡补充了更细的官方标准深链和类别/用量边界；主控已完成验收。

验收结果：

- Public Evidence JSON：30 cards / 7 paths / 21 sources，通过
- 第二批卡仍保持 `manual_review_required: true`
- 未发现占位供应商或 Supplier Verified 过度声明
- `npm run verify`：通过
- 目标回归子集 7/7 PASS：GQ-003、GQ-011、GQ-013、GQ-014、GQ-015、GQ-017、GQ-018

补充说明：

- 本轮新增 CFSA 标准文本详情页深链：GB 2760-2024、GB 14880-2012、GB 28050-2025、GB 7718-2025。
- 为避免 prompt 过长导致 AI 响应卡住，运行时注入的 Public Evidence 摘要做了压缩；完整证据仍保留在文档和 JSON 数据资产中。
- 本地回归初次超时是旧 `next dev` 进程卡住导致，重启 dev server 后恢复。

## 9. 2026-06-03 第四批扩展验收

00-主控会话继续补充第四批 15 张高频/高风险原料证据卡，重点覆盖睡眠、体重管理、甜味剂、抗氧化、功能油脂/藻类和免疫表达边界。

验收结果：

- Public Evidence JSON：60 cards / 8 paths / 41 sources。
- 第四批新增 15 张卡均为 `manual_review_required: true`。
- 新增来源 9 条，包括保健食品原料目录、PS 新资源食品公告、雨生红球藻/EGCG 新资源食品公告、D-阿洛酮糖三新食品公告、牛初乳官方复函、Lactium 和 Phase 2 供应商官方公开入口。
- 未新增 Supplier Verified 运行数据；供应商官方公开资料仅作为身份/索资线索，不作为中国法规结论或平台已核验供应商。
- 数据一致性校验：无重复卡、无缺失 source 引用、无缺失官方/主来源 URL。

新增第四批卡：

- 褪黑素
- 酪蛋白水解肽 / Lactium
- GABA 衍生/复配边界
- 白芸豆提取物
- 绿茶提取物 / EGCG
- 雨生红球藻 / 虾青素
- 辅酶 Q10
- 磷脂酰丝氨酸 PS
- 低聚异麦芽糖 IMO
- D-阿洛酮糖
- 甜菊糖苷
- 罗汉果甜苷
- 藻蓝蛋白 / 螺旋藻
- 姜黄 / 姜黄素
- 牛初乳 / 免疫球蛋白方向

本轮专项原则：

- 褪黑素、辅酶 Q10、螺旋藻优先按保健食品路径或强复核处理，不得外推普通食品功效。
- 白芸豆、绿茶 EGCG、姜黄/姜黄素不得承接减肥、控糖、抗炎、护肝等普通食品声称。
- 阿洛酮糖按 2025 年三新食品公告复核，不得泛化为所有零糖食品或所有工艺产品可用。
- 甜菊糖苷、罗汉果甜苷按 GB 2760 食品添加剂路径逐食品类别复核。
- 牛初乳/免疫球蛋白方向涉及婴幼儿和增强免疫高敏边界，默认强制人工复核。
