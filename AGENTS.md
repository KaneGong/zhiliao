# 知料 ZhiLiao — Agent 协作指南

最后整理：2026-05-28

## 0. 快速启动
新 Agent 开工先读本文件。如需要多会话分工，参考 [SESSION-SETUP.md](SESSION-SETUP.md)，内有每个会话的启动提示词，直接粘贴即可。

## 1. 项目定位
知料是面向食品行业 B 端用户的 AI 配方研发与合规信息平台，核心能力包括：
- AI 配方推荐与配方工作台
- 原料库 / 产品详情 / 供应商资料
- 法规查询与证据卡片
- 普通用户、供应商用户、平台管理员相关页面

线上地址：<https://zhiliao-ai.cn>

## 2. 本地路径与技术栈
- 项目路径：`/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/`
- 服务器路径：`/opt/zhiliao`
- 框架：Next.js 16 App Router + React 19 + TypeScript
- 样式：Tailwind CSS 4，当前视觉为 Warm Lab / Food AI Bench 风格
- AI：DeepSeek API，SSE 流式输出
- 数据：`src/data/*.json` 为主，少量服务端文件队列/日志在服务器 `/opt/zhiliao/`
- 运行：`next.config.ts` 使用 `output: "standalone"`

敏感信息不写入文档；API Key、管理员口令、SSH 凭据只从 `.env.local`、服务器环境或安全凭据库读取。

## 3. 当前页面状态
截至 2026-05-28，全站 UI/UX 已按新版 Warm Lab 工作台风格统一，已覆盖：
- `/` 首页
- `/recommend` AI 推荐
- `/search` 原料库
- `/product/[id]` 产品详情
- `/regulations` 法规查询
- `/recipes` 配方库
- `/login`、`/register`、`/settings`
- `/supplier/register`、`/supplier/ang`
- `/supplier/dashboard`、`/supplier/dashboard/products`、`/supplier/dashboard/profile`
- `/admin` 平台管理员后台

已统一清理的旧风格组件：`TagPicker`、`ComboSelect`、`MobileNav`、`src/app/components/ui.tsx`、`TrustBar`、搜索 loading fallback。

## 4. 关键目录
```text
zhiliao/
├── AGENTS.md                         # 本文件：Agent 开工入口
├── docs/
│   ├── deploy.md                     # 当前部署指南
│   ├── SETUP.md                      # 本地启动/新环境恢复
│   ├── server-config.md              # 服务器配置清单
│   ├── archive/                      # 历史文档归档
│   └── memory/README.md              # 本地记忆说明；主记忆以 Codex Memory 为准
├── scripts/
│   ├── deploy.sh                     # 旧 webhook 部署脚本，仅作 fallback/legacy
│   ├── auto-research.ts
│   └── test-full.sh
├── src/
│   ├── app/                          # 页面与 API Routes
│   ├── components/                   # 共享组件
│   ├── data/                         # JSON 数据
│   ├── lib/                          # auth/data/logger/trust/verify 等工具
│   └── types/
├── public/                           # logo / mascot / 静态资源
└── next.config.ts                    # standalone 输出
```

## 5. 核心实现备忘
### AI 推荐
- API：`src/app/api/ai-recommend/route.ts`
- Prompt：`src/app/api/ai-recommend/prompt.ts`
- 输出验证：`src/lib/verify-output.ts`
- 前端：`src/app/recommend/page.tsx`
- Markdown 表格依赖 `remark-gfm`；如涉及原始 HTML 换行依赖 `rehype-raw`。

### 法规查询
- API：`src/app/api/regulations/route.ts`
- Prompt：`src/app/api/regulations/prompt.ts`
- 数据：`src/data/regulations.json`
- 前端：`src/app/regulations/page.tsx`
- SSE 相关问题优先检查 Nginx `proxy_buffering off` / `proxy_cache off`。

### Public Evidence v1
- 文档：`docs/data/public-evidence-regulatory-map-v1.md`、`docs/data/public-evidence-ingredient-cards-v1.md`、`docs/data/public-evidence-source-register-v1.md`
- 数据：`src/data/public_evidence/regulatory_map.v1.json`、`src/data/public_evidence/ingredient_cards.v1.json`、`src/data/public_evidence/sources.v1.json`
- Loader：`src/lib/public-evidence.ts`
- 集成：`/recommend` Formula Brief prompt 注入命中原料证据卡；`/regulations` prompt 注入法规路径地图与未收录处理规则。
- 质量原则：Public Evidence 只代表公开法规/公开资料边界，不等于 Supplier Verified；未收录或证据不足必须提示“待复核/未收录”，不得给确定性合规结论。

### 流式滚动
- 避免在高频 token 输出中使用 `scrollIntoView({ behavior: "smooth" })`。
- 推荐直接设置 `scrollTop = scrollHeight`，并用约 120px 阈值判断用户是否仍在底部。

## 6. 当前部署真相
当前可靠部署方式：SSH/SFTP 上传 tar 包，然后在服务器执行 standalone 构建与 PM2 重建。详见 `docs/deploy.md`。

核心原则：
- `npm run build` 后必须补齐 standalone 运行目录：
  - `.next/static` → `.next/standalone/.next/static`
  - `public` → `.next/standalone/public`
  - `.env.local` → `.next/standalone/.env.local`
- PM2 改启动命令时不要只 `restart`，必须 `pm2 delete zhiliao` 后重新 `pm2 start node -- /opt/zhiliao/.next/standalone/server.js`。
- 9000 webhook 曾出现 TCP 可连但 HTTP 挂起；只作为 legacy/fallback，不作为首选。

## 7. 验证命令
本地改动后至少运行：
```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao"
npx tsc --noEmit
npm run build
```

服务器 smoke test：
```bash
pm2 status zhiliao
curl -sS -o /tmp/z.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/recommend
curl -k -sS -o /tmp/z.html -w "%{http_code} %{size_download}\n" https://127.0.0.1/recommend
```

外网访问异常时先排查 VPN / 代理 fake-ip：
```bash
dig +short zhiliao-ai.cn
```
正确解析应指向 `8.153.99.9`；如果出现 `198.18.x.x`，通常是本机 VPN/代理 fake-ip，不是服务器故障。

## 8. 协作规则
- 开始知料相关任务时，默认使用本项目路径，不要反复询问。
- 用户偏好：直接执行最佳方案，少讲选项；长任务要阶段性报进度。
- 重大变更完成后更新本文件或 `docs/` 中对应文档，并写入 Codex Memory ad-hoc note。
- 不要把口令、API Key、token 写入仓库文档或聊天输出。
- 不要修改 AiMaMi 本地代理配置。

## 9. 最近状态记录
### 2026-05-28 晚 — 全站 UI/UX 重设计与部署
- 已完成新版 Food AI Bench / Warm Lab 风格全站落地。
- `npx tsc --noEmit` 与 `npm run build` 在部署前通过。
- 已使用 SSH/SFTP + standalone + PM2 delete/start 成功部署。
- 服务器本机 `/recommend` smoke test 返回 200，PM2 online。
- 用户浏览器无法访问的问题最终判断为 VPN/代理 fake-ip DNS；关闭 VPN 后恢复。

### 2026-05-28 晚 — 文档/记忆清理
- 清理项目文档中的明文敏感信息。
- 将部署文档改为当前可靠的 SSH/SFTP standalone 流程。
- 将冗余本地 memory 快照收敛为说明文件；长期记忆以 `~/.codex/memories/` 为准。

### 2026-05-30 晚 — Public Evidence v1 数据资产与最小集成
- 建立法规路径地图 v1、20 个高频/高风险原料证据卡、来源登记表，并同步 JSON 数据资产。
- 新增 `src/lib/public-evidence.ts` loader，将命中证据卡注入 `/recommend`，将法规路径地图和未收录处理规则注入 `/regulations`。
- 约束 AI：Public Evidence 不等于 Supplier Verified；非官方/供应商公开资料不得当成确定性法规结论；未知原料走“未收录/待复核”。
- 本地 `npm run verify`、页面 smoke、Golden 子集和法规专项查询均通过。

### 2026-05-30 晚 — Public Evidence v1 第二批扩展与表达硬化
- Public Evidence 原料证据卡从 20 张扩展到 30 张，新增咖啡因、牛磺酸、维生素 B6、镁、钾盐、聚葡萄糖、抗性糊精、赤藓糖醇、葛根、枳椇子。
- 新增上线状态说明：`docs/tasks/public-evidence-v1-status-2026-05-30.md`。
- Formula Brief 增加“证据不足也要给可打样研发路线，但把法规/用量/标签/供应商标为待复核”的风格约束。
- 修复输出清洗副作用：负面风险语境中的“解酒/护肝”等禁词不再被替换成奇怪表达；只清洗过度确定和正向功效暗示。

### 2026-06-02 — Public Evidence v1 第二批深度复核验收
- 02 会话已将第二批 10 张卡补充到更细的官方标准深链与类别/用量边界；主控验收通过。
- Public Evidence 当前为 30 cards / 7 paths / 21 sources。
- 运行时 Evidence prompt 摘要已压缩，避免深度卡片过长拖慢 `/recommend`；完整证据仍保留在 docs/data 与 JSON。
- 目标回归 GQ-003、GQ-011、GQ-013、GQ-014、GQ-015、GQ-017、GQ-018 通过。

### 2026-06-03 — Public Evidence v1 第三批扩展验收
- 02 会话完成第三批 15 张高频/高风险原料证据卡，Public Evidence 当前为 45 cards / 8 paths / 32 sources。
- 新增运动营养食品路径 `sports_nutrition`，覆盖肌酸、BCAA/EAA、左旋肉碱等运动营养高风险场景。
- 第三批重点原料包括叶黄素/玉米黄质、葡萄籽、接骨木莓、蔓越莓、NMN、肌酸、左旋肉碱、BCAA/EAA、叶酸、铁、硒、维生素 E、维生素 B12、β-葡聚糖、酵母抽提物。
- 主控补修旧 `src/data/regulations.json` 中叶黄素记录，避免把儿童软糖/护眼场景解释得过宽；叶黄素、玉米黄质、护眼表达统一按待复核和高风险声称处理。
- 本地 `npm run verify`、`npm run smoke:local`、GQ-014/GQ-018 回归、新增 NMN/叶黄素/肌酸专项 API 回归均通过。
