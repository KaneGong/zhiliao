# Git Cleanup Plan — 2026-05-30

> 状态：主控拆分建议，尚未 stage / commit。
> 当前分支：`main`，相对 `origin/main` ahead 14，工作树仍有大量未提交改动。
> 原则：不要 `git add .`；按组逐个 stage、验证、提交。
> 最新验证：`npm run verify` 通过；`npm run smoke:local` 通过；`git diff --check` 通过。

## 1. 当前问题

当前 dirty tree 混合了 7 类改动：

1. 项目文档、部署方式、会话分工和 memory 清理；
2. Warm Lab / Food AI Bench 全站 UI；
3. 法规查询、Trust Layer、证据卡片；
4. Formula Brief v1 核心代码和供应商真实性硬化；
5. Golden Questions、seed 数据、数据修复包、demo 案例库；
6. Partner Brief / 商业材料；
7. Demo-ready 本地运行和 smoke 配置。

这些改动都混在一个工作树里，不能直接全量提交。

## 2. 建议提交顺序

### Commit 1 — docs: refresh project operations and session setup

目的：先把项目协作入口、部署真相和 memory 迁移收干净。

建议包含：

- `AGENTS.md`
- `SESSION-SETUP.md`
- `docs/SETUP.md`
- `docs/deploy.md`
- `docs/server-config.md`
- `docs/archive/DEPLOY-v2.md`
- `docs/memory/README.md`
- 删除旧 `docs/memory/*.md`
- 删除旧 `docs/memory/skills/zhiliao-pm2-standalone-skill.md`
- 删除旧 `docs/DEPLOY-v2.md`
- `deploy.sh`

注意：

- 提交前确认文档里没有明文 key、密码、token、SSH 凭据。
- `AGENTS.md` 中管理员口令相关历史内容已经被清理，这是好事。

### Commit 2 — feat: apply Warm Lab product UI across app

目的：把全站 Warm Lab / Food AI Bench 视觉落地作为一个完整 UI 提交。

建议包含：

- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/search/page.tsx`
- `src/app/search/SearchContent.tsx`
- `src/app/product/[id]/page.tsx`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/supplier/ang/page.tsx`
- `src/app/supplier/register/page.tsx`
- `src/app/supplier/dashboard/page.tsx`
- `src/app/supplier/dashboard/products/page.tsx`
- `src/app/supplier/dashboard/profile/page.tsx`
- `src/app/components/ComboSelect.tsx`
- `src/app/components/MobileNav.tsx`
- `src/app/components/TagPicker.tsx`
- `src/app/components/ui.tsx`
- `public/mascot-clean.png`
- `public/mascot-hero.png`
- `public/mascot-pose1.png`
- `public/mascot-pose2.png`
- `public/mascot-pose3.png`
- `ppt/`

注意：

- `ppt/` 是 UI 设计过程资产，体量约 1.9M，可以提交，但建议作为 UI commit 的辅助材料。
- 如果只想保留最终产品代码，可把 `ppt/` 延后到单独 design-assets 提交。

### Commit 3 — feat: add trust layer and regulations evidence cards

目的：把法规页、TrustBar、trust API 和验证工具作为可信层提交。

建议包含：

- `src/app/regulations/page.tsx`
- `src/app/api/regulations/route.ts`
- `src/app/api/regulations/prompt.ts`
- `src/app/api/trust/check/route.ts`
- `src/app/components/TrustBar.tsx`
- `src/lib/trust.ts`
- `src/lib/verify-output.ts`
- `src/lib/baidu-search.ts`
- `src/data/regulations.json`
- `package-lock.json` 中与 `rehype-raw` 相关的依赖变化
- `package.json` 中 `rehype-raw` 依赖

注意：

- `src/app/regulations/page.tsx` 同时含 UI 改造和 Trust Layer 接入；如果严格拆分，需要 hunk stage。
- 本轮已修复该文件第 28 行附近的 trailing whitespace。

### Commit 4 — feat: ship Formula Brief v1 and supplier truthfulness

目的：提交核心��品能力：结构化方案包、供应商真实性校验、Trust Score 服务端重算。

建议包含：

- `src/app/api/ai-recommend/route.ts`
- `src/app/recommend/page.tsx`
- `src/lib/formula-brief.ts`
- `src/lib/formula-brief-seeds.ts`
- `scripts/test-formula-brief.mjs`
- `package.json` 中 `test:formula-brief` 脚本
- 与 Formula Brief 相关的 `package-lock.json` 变化

注意：

- `package.json` 同时有 demo/check/smoke 脚本，若要严格拆 commit，建议用 `git add -p package.json`。
- 此提交应附带验证：`npm run test:formula-brief`。

### Commit 5 — test: add golden evaluation workflow and regression artifacts

目的：提交 Golden Questions 自动化、20Q 结果和关键回归日志。

建议包含：

- `scripts/run-golden-questions.mjs`
- `docs/tasks/golden-questions.md`
- `docs/tasks/golden-question-results-2026-05-29.md`
- `docs/tasks/golden-question-results-2026-05-30-20q.md`
- `docs/tasks/golden-question-results-2026-05-30-20q-rerun.md`
- `docs/tasks/golden-question-results-20q-template.md`
- `docs/tasks/regression-runs/golden-20q-supplier-truthfulness-20260530-094102.log`
- `docs/tasks/regression-runs/golden-20q-supplier-truthfulness-20260530-094102.summary.json`
- `docs/tasks/regression-runs/golden-targeted-data-repair-2-4q-20260530-094120.log`
- 可选：其他 `docs/tasks/regression-runs/*.log`
- `docs/tasks/regression-runs/recommend-browser-smoke-20260530.png`

注意：

- 回归日志目录目前约 728K，可以提交。
- 建议只提交关键最终日志和定向日志；中间失败/调试日志可以保留在本地或后续归档，不一定全部入库。

### Commit 6 — data: add Formula Brief seeds and demo case library

目的：提交 seed 数据链、数据修复包、真实供应商候选和 demo 案例库。

建议包含：

- `src/data/formula_brief_seeds/ingredient_profiles.seed.json`
- `src/data/formula_brief_seeds/regulatory_rules.seed.json`
- `src/data/formula_brief_seeds/supplier_specs.seed.json`
- `src/data/recipes.json`
- `src/data/users.json`
- `src/data/_archive/ingredients_new.json`
- `src/data/_archive/regulations.backup.json`
- 删除 `src/data/ingredients_new.json`
- `docs/data/low-score-repair-matrix-v1.md`
- `docs/data/recipe-cases-seed-2026-05-30.md`
- `docs/data/data-repair-package-1-2026-05-30.md`
- `docs/data/data-repair-package-2-2026-05-30.md`
- `docs/data/real-supplier-intake-plan-2026-05-30.md`
- `docs/data/real-supplier-candidates-2026-05-30.md`
- `docs/data/recipe-case-demo-library-2026-05-30.md`

注意：

- 本组不要包含 `src/app/` 代码。
- `real-supplier-candidates` 只是候选索资表，不能被理解为已入库真实供应商。

### Commit 7 — chore: add demo-ready local verification commands

目的：提交展示前本地验证链路。

建议包含：

- `scripts/smoke-local.mjs`
- `package.json` 中 `dev:demo` / `check` / `smoke:local` / `verify`
- `next.config.ts` 中 `devIndicators: false`
- `SESSION-SETUP.md` 和 `docs/tasks/90-day-backlog.md` 中 Demo-ready 状态记录

注意：

- 如果 Commit 1 已经提交了 `SESSION-SETUP.md` 和 `docs/tasks/90-day-backlog.md`，这里需要用 hunk stage 或把 Demo-ready 文档变更留在 Commit 7。
- 本提交验证命令：`npm run verify` + `npm run smoke:local`。

### Commit 8 — docs: add partner brief and validation materials

目的：提交商业/融资/partner 相关材料，但不让它阻塞产品展示主线。

建议包含：

- `docs/decks/zhiliao-partner-2026-05-29/`
- `docs/growth/commercial-validation-command-center-2026-05-30.md`
- `docs/growth/contact-pool-v1-2026-05-30.md`
- `docs/growth/interview-scorecard-template-2026-05-30.md`
- `docs/growth/partner-one-pager-2026-05-30.md`
- `docs/growth/supplier-outreach-sequence-2026-05-30.md`
- `docs/growth/validation-contact-tracker-template-2026-05-30.md`
- `docs/tasks/validation-interviews.md`
- `docs/strategy/`
- `docs/tasks/morning-meeting-notes-2026-05-29.md`

注意：

- `docs/decks` 约 7.0M，包含 PDF、PPTX、截图和 HTML 源文件，可以提交；如果要控制仓库体量，先只提交 `README.md`、`index.html`、`slides/`、`shared/`、最终 PDF/PPTX。
- `contact-pool-v1` 仍是 Kane 待填写模板，不是真实联系人池。

## 3. 暂缓或谨慎处理

- 不建议直接提交所有 `docs/tasks/regression-runs/` 中间日志，优先挑最终日志。
- 不建议在未复核前把真实供应商候选写入 `src/data/formula_brief_seeds/supplier_specs.seed.json`。
- 不建议现在重启 03 商业验证执行，只保留材料。
- 不建议把 `.env.local`、服务器凭据、API Key、管理密码写进任何提交。

## 4. 每组提交前验证

最小验证：

```bash
npm run check
npm run build
git diff --check
```

展示验证：

```bash
npm run verify
npm run dev:demo
npm run smoke:local
```

Golden 验证：

```bash
npm run test:formula-brief
GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden
GOLDEN_TIMEOUT_MS=180000 GOLDEN_RETRIES=1 npm run test:golden:all
```

## 5. 主控建议

下一步只做两件事：

1. 先按本计划逐组 stage，必要时用 `git add -p` 拆 `package.json`、`SESSION-SETUP.md`、`docs/tasks/90-day-backlog.md` 这类跨组文件；
2. 每组提交后至少跑一次 `npm run check`，全部提交完成后跑 `npm run verify` 和 `npm run smoke:local`。

不要继续新增功能，直到这些改动被拆干净。
