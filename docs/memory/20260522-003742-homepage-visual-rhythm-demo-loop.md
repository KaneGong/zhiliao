# 2026-05-22 首页视觉节奏优化 + 动图循环

## 首页 page.tsx 视觉调整
- Hero 间距对齐 8px 网格：mb-8(32) → mb-6(24) → mb-10(40) → mb-14(48)
- Hero 顶部 padding 从 pt-24 sm:pt-36 降到 pt-12 sm:pt-20，整体上移避免动图截断
- 两个 3 列 Grid 统一 gap-8
- 信任区块去掉外层 glass-card，与能力区块视觉一致
- Section 间加 border-t border-white/[0.04] 微分割线
- 卡片字号提升：标题 text-[15px]、描述 text-[13px]、标签 text-xs
- AIDemo 底色 #0c1016 → #111822 暖化

## AIDemo 组件升级
- 从单场景改为 3 场景循环播放
- 场景1：助眠软糖（褪黑素/GABA/酸枣仁）
- 场景2：运动蛋白粉（乳清蛋白/BCAA/谷氨酰胺）
- 场景3：儿童益生菌（乳双歧杆菌/鼠李糖乳杆菌/FOS）
- 每个场景播完停 3 秒自动切换，无限循环
- 终端右上角显示场景指示器 1/3 2/3 3/3

## Bug Fix
- 循环切换 bug：pausing state 作为 effect 依赖导致 cleanup 清了切换 timer
- 改用 useRef (isPausingRef + pauseTimerRef) 避免 React effect cleanup 干扰

## 下一步
- 完善 AI 推荐页内容
- 完善法规页功能
