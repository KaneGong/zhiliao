# 知料 Partner Brief HTML Deck

> 生成日期：2026-05-29
> 用途：面向早期合作伙伴、潜在共创者、行业资源方、感兴趣了解知料的人。
> 风格：Warm Lab × 信息建筑 × 高级 B2B 说明书。
> 主题：知料作为「食品研发 AI 工作台」的定位、产品闭环、可信层、商业化路径与 90 天验证计划。

## 已交付文件

- `index.html` — HTML 演示入口，支持键盘翻页、全屏演示。
- `slides/*.html` — 每页独立 HTML 源文件。
- `shared/tokens.css` — 共享视觉样式。
- `output/zhiliao-partner-brief-2026-05-29.pdf` — 12 页 PDF 版，适合发送、归档、打印。
- `output/zhiliao-partner-brief-2026-05-29.editable.pptx` — 12 页可编辑 PPTX 版，适合后期在 PowerPoint / Keynote 中改文字。
- `output/contact-sheet.png` — HTML 渲染总览图。
- `output/pdf-contact-sheet.png` — PDF 导出总览图。
- `output/screens/*.png` — 每页 HTML 截图。
- `output/pdf-pages/*.png` — 每页 PDF 渲染截图。

## 打开 HTML 演示

```bash
open "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/docs/decks/zhiliao-partner-2026-05-29/index.html"
```

键盘：

- 右箭头 / 空格 / PageDown：下一页
- 左箭头 / PageUp：上一页
- Home / End：首尾页
- P：打印

## 页码结构

1. Cover — 把食品研发放回一张清晰的智能实验台
2. Thesis — 不是聊天机器人，而是研发工作台
3. Market Pain — 新品研发仍在碎片里完成
4. Positioning — 食品研发 AI 工作台
5. Workflow — 从一句产品想法到一份方案包
6. Product System — 工作台 + 数据底座 + 供应商网络
7. Trust Layer — 可信本身就是产品体验
8. Moat — 数据与工作流的持续复利
9. Business Model — 研发用户先用起来，供应商为线索付费
10. 90-Day Plan — 90 天跑通一个闭环
11. Partner Fit — 早期共创伙伴画像
12. Closing — 食品研发的新入口应由行业里的人一起定义

## 重新导出 PDF

当前目录已保留 Huashu PDF 导出脚本 `export_deck_pdf.mjs`。如果本机有相关依赖，可执行：

```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/docs/decks/zhiliao-partner-2026-05-29"
node ./export_deck_pdf.mjs --slides slides --out output/zhiliao-partner-brief-2026-05-29.pdf --width 1280 --height 720
```

也可以直接浏览器打开 `index.html` 后打印为 PDF。

## 重新导出可编辑 PPTX

当前目录已保留 Huashu PPTX 导出脚本：

- `export_deck_pptx.mjs`
- `html2pptx.js`

如果本机有 `playwright` / `pptxgenjs` / `sharp` 依赖，可执行：

```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/docs/decks/zhiliao-partner-2026-05-29"
node ./export_deck_pptx.mjs --slides slides --out output/zhiliao-partner-brief-2026-05-29.editable.pptx
```

本次已验证：PPTX 导出 12/12 页通过。注意：HTML/PDF 版保留了更细腻的 CSS 网格与光晕质感；PPTX 版以可编辑为优先，视觉细节可能略低于 PDF。
