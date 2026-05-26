v1

## User Profile

Works on the 知料 (zhiliao) project — a food-industry AI platform (Next.js 16 + React 19 + Tailwind CSS 4 + DeepSeek API via SSE), deployed to 8.153.99.9. Uses a dual-machine model: this machine writes code, a Macmini (openclaw) handles deployment/testing. Operates in Codex Desktop (GPT-5.5) and has also used Claude Code CLI. Recently expanded into Skillhub-based Codex skill management and UI design tools. Values memory persistence, proactive context awareness, and UI/UX polish. Considers session-end memory recording a standard step.

## User preferences

- when working on 知料, default to /Users/kgong/Work/AI Work/AI Projects/知料/ without asking
- user said "根据你觉得最佳的方案来吧" and "直接操作重新修复一下吧" -> wants execution over explanation; don't discuss options, just fix
- user said "还在吗" during long waits -> provide periodic progress updates
- when user reports "回复的表现形式" and "页面跳动" problems, stream scroll smoothness is critical — fix thoroughly on first attempt
- user said "后面新装的技能都帮我放到codex能扫到的位置吧" -> all skill installations must land in Codex-visible global directories (~/.codex/skills/ or ~/.agents/skills/)
- user expects skills to be usable immediately after installation without manual path setup
- user favors warm dark tones (amber/orange), chose Warm Lab design theme
- user said "再整体往上提" repeatedly -> homepage content should maximize above-the-fold space, avoid animation truncation
- user expects session-end memory recording
- user said "可以做到有三种不同内容, 重复动的方式吗?" -> animated demos should showcase platform capability diversity through multiple scenarios
- when user provides a specific URL for installation instructions, follow that URL rather than guessing
- when user says 继续修这两个问题 about known bugs, execute directly without discussing implementation
- clarify tool availability differences between Codex Desktop and Claude Code CLI upfront (Hermes MCP is Desktop-only)
- user values usage data accessible without extra requests

## General Tips

- Memory writing: Always write memory at session end. User expects session-end recording.
- SSH: Port 22 blocked in sandbox. Use sandbox_permissions require_escalated as first attempt. Do not try sshpass/expect. For 知料, use tar+curl POST to port 9000 webhook.
- PM2 + standalone: If next.config.ts has output standalone, PM2 must use node .next/standalone/server.js (absolute path), not next start. Use pm2 delete then pm2 start. See skills/zhiliao-nextjs-standalone-pm2/SKILL.md.
- react-markdown v10: does not include GFM by default. Install remark-gfm for table rendering.
- Streaming scroll: Replace smooth scrollIntoView with immediate scrollTop = scrollHeight. Use autoScrollRef (~120px threshold).
- Deploy (知料): tar -czf /tmp/deploy.tar.gz --exclude=node_modules --exclude=.next --exclude=.git . && curl -X POST --data-binary @/tmp/deploy.tar.gz http://8.153.99.9:9000/
- TypeScript check: Use npx tsc --noEmit (npx next build --no-lint is not valid).
- Fast file edits: Use direct cat > file rewrite rather than apply_patch for rapid large edits.
- Skill installation: Codex discovers from ~/.codex/skills/ and ~/.agents/skills/. Skillhub wrapper at ~/.local/bin/skillhub modified to default --dir ~/.codex/skills. npx skills add installs to workspace .agents/skills/ — must copy globally.
- React effect timer bug: State-driven flags as effect dependencies cause cleanup to clear pending timers. Use useRef for all timer/flag values across effect boundaries.
- AIDemo multi-scenario pattern: scenarios array + scenarioIndex state + useRef for pause/timer. Three demo scenarios: 助眠软糖, 运动蛋白粉, 儿童益生菌.

## What's in Memory

### /Users/kgong/Work/AI Work/AI Projects/知料/

#### 2026-05-22

- Regulations page chat redesign: regulations, chat interface, page.tsx, SSE, proxy_buffering, multi-turn, zhiliao-ai.cn
  - desc: Complete rewrite of regulations page from search layout to chat interface. Chat bubble layout, SSE streaming, Markdown, nginx proxy_buffering off, multi-turn history, empty state. [ad-hoc note]
  - learnings: nginx must have proxy_buffering off + proxy_cache off for SSE. Regulations page grew from ~215 to ~310 lines.

#### 2026-05-21

- Homepage visual rhythm + AIDemo 3-scenario loop: visual rhythm, 8px grid, Warm Lab, amber, hero padding, AIDemo, useRef, scenario loop
  - desc: Homepage spacing unified to 8px grid, hero padding reduced, cards standardized. AIDemo upgraded to 3-scenario infinite loop with useRef timer control. Key React effect cleanup bug fixed.
  - learnings: 8px grid spacing (mb-8=32, mb-6=24, mb-10=40). AIDemo loop: useRef for timers/flags, not React state.

- Markdown tables + streaming scroll fix: remark-gfm, react-markdown, GFM, scrollIntoView, scrollTop, streaming, recommend/page.tsx
  - desc: Fixed Markdown tables (remark-gfm plugin) and streaming scroll jitter (scrollTop instead of smooth scrollIntoView). Deployed via tar+curl webhook.
  - learnings: Direct scrollTop avoids smooth animation overlap. remark-gfm required for table rendering.

### /Users/kgong (cross-project tooling)

#### 2026-05-21

- Skillhub + Codex skill directory config: skillhub, ~/.codex/skills, ~/.agents/skills, wrapper modification, npx skills add, baoyu-skills, frontend-design-3, ui-ux-pro-max
  - desc: Installed Skillhub CLI, modified wrapper for global --dir. Installed frontend-design-3, ui-ux-pro-max, 23 baoyu-skills.
  - learnings: Codex discovers from ~/.codex/skills/ and ~/.agents/skills/. Skillhub wrapper modified for global installs. npx skills installs workspace-local — must copy globally.

### Older Memory Topics

#### /Users/kgong/Work/AI Work/AI Projects/知料/

- PM2 crash fix + standalone deployment: pm2, standalone, next start, server.js, absolute path, pm2 delete, pm2 save
  - desc: PM2 62x crash fix when standalone config used with next start. Standalone deployment steps, absolute paths, post-build steps. See skills/zhiliao-nextjs-standalone-pm2/SKILL.md.
  - learnings: Always absolute paths. pm2 restart preserves old command — use delete then start.

- Logger + AI content verification: logger, appendLog, Exa API, ingredient verification
  - desc: Logger integrated into AI API routes. Exa API verified 8 ingredient descriptions accurate.

- Project path + tech stack + dual-machine: 知料, zhiliao, project path, /Users/kgong/Work/AI Work/AI Projects/知料/, Next.js 16, DeepSeek API
  - desc: Project root, tech stack, dual-machine model. SSH port 22 blocked — use require_escalated or port 9000 webhook.

#### /Users/kgong (cross-project tooling)

- Hermes MCP environment awareness: Hermes MCP, Claude Desktop only, Claude Code CLI, Codex Desktop
  - desc: Hermes MCP is Claude Desktop exclusive. Clarify upfront when user expects Hermes tools.
  - learnings: Hermes tools (terminal, file, search, web, vision, browser) are Desktop-only.
