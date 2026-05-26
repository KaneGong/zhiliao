# Task Group: Skillhub installation and Codex global skill directory configuration

scope: Installing Skillhub CLI, configuring default install directory for Codex discoverability, installing skills via skillhub install and npx skills add.
applies_to: cwd=/Users/kgong/Documents/Codex; reuse_rule=stable for Codex skill management

## Task 1: Install Skillhub CLI

### rollout_summary_files

- rollout_summaries/2026-05-21T02-23-23-8qTY-skillhub_install_and_skill_directory_preference.md (cwd=/Users/kgong/Documents/Codex/2026-05-21/https-skillhub-cn-install-skillhub-md, updated_at=2026-05-21T14:11:31+00:00, thread_id=019e4858-3e8f-7810-babd-7107001eabb6)

### keywords

- skillhub, skillhub install, curl install, ~/.local/bin/skillhub, find-skills, skillhub-preference, ~/.openclaw/workspace/skills

## Task 2: Install frontend-design-3 skill

### rollout_summary_files

- rollout_summaries/2026-05-21T02-23-23-8qTY-skillhub_install_and_skill_directory_preference.md (cwd=/Users/kgong/Documents/Codex/2026-05-21/https-skillhub-cn-install-skillhub-md, updated_at=2026-05-21T14:11:31+00:00, thread_id=019e4858-3e8f-7810-babd-7107001eabb6)

### keywords

- frontend-design-3, skillhub install, workspace install, ~/.codex/skills, Codex discoverability, --dir

## Task 3: Configure Skillhub default install directory for Codex

### rollout_summary_files

- rollout_summaries/2026-05-21T02-23-23-8qTY-skillhub_install_and_skill_directory_preference.md (cwd=/Users/kgong/Documents/Codex/2026-05-21/https-skillhub-cn-install-skillhub-md, updated_at=2026-05-21T14:11:31+00:00, thread_id=019e4858-3e8f-7810-babd-7107001eabb6)

### keywords

- skillhub wrapper, ~/.local/bin/skillhub, --dir, ~/.codex/skills, modified wrapper script, skills_store_cli.py

## Task 4: Install ui-ux-pro-max skill

### rollout_summary_files

- rollout_summaries/2026-05-21T02-23-23-8qTY-skillhub_install_and_skill_directory_preference.md (cwd=/Users/kgong/Documents/Codex/2026-05-21/https-skillhub-cn-install-skillhub-md, updated_at=2026-05-21T14:11:31+00:00, thread_id=019e4858-3e8f-7810-babd-7107001eabb6)

### keywords

- ui-ux-pro-max, skillhub install, ~/.codex/skills, remote registry, lightmake.site

## Task 5: Install baoyu-skills via npx skills add

### rollout_summary_files

- rollout_summaries/2026-05-21T02-23-23-8qTY-skillhub_install_and_skill_directory_preference.md (cwd=/Users/kgong/Documents/Codex/2026-05-21/https-skillhub-cn-install-skillhub-md, updated_at=2026-05-21T14:11:31+00:00, thread_id=019e4858-3e8f-7810-babd-7107001eabb6)

### keywords

- npx skills add, baoyu-skills, jimliu/baoyu-skills, .agents/skills, ~/.agents/skills, global skills directory, 23 skills

## User preferences

- when asked to install a skill, check if required tooling is already installed first; follow an idempotent check-before-action pattern [Task 1][Task 2]
- user said: "后面新装的技能都帮我放到codex能扫到的位置吧" -> all future skill installs should land in Codex-visible global directories (~/.codex/skills/ or ~/.agents/skills/), not workspace-relative paths [Task 3]
- when user provides a specific URL for installation instructions, follow that URL rather than guessing the method [Task 1]
- user expects skills to be usable immediately after installation without manual path setup [Task 2][Task 5]

## Reusable knowledge

- Skillhub CLI location: ~/.local/bin/skillhub (bash wrapper script that execs python3 skills_store_cli.py). Modified wrapper prepends --dir ~/.codex/skills to args. [Task 3]
- Skillhub install command: curl -fsSL https://skillhub-1388575217.cos.ap-guangzhou.myqcloud.com/install/install.sh | bash [Task 1]
- Skillhub CLI accepts --dir DIR to override default ./skills install path [Task 3]
- Codex discovers skills from ~/.codex/skills/ and ~/.agents/skills/ [Task 2][Task 5]
- npx skills add <github-repo> installs to workspace .agents/skills/ then copies to ~/.agents/skills/ for global discovery [Task 5]
- Modified wrapper script ensures all future skillhub install commands go to ~/.codex/skills/ [Task 3]
- After wrapper modification, skillhub list returns "No installed skills" initially (old installs still in workspace, new default is fresh dir) [Task 3]

## Failures and how to do differently

- skillhub install without --dir or wrapper modification installs to workspace-relative skills/ dir, which Codex cannot discover. Always use --dir ~/.codex/skills (or modify the wrapper) so skills are Codex-visible. [Task 2]
- npx skills add installs to workspace .agents/skills/ -- must copy to ~/.agents/skills/ for global discovery. Anticipate this on first install rather than waiting for the user to ask. [Task 5]
- Skillhub has no built-in config command to set default install dir. Workaround: modify the wrapper script at ~/.local/bin/skillhub. [Task 3]
# Task Group: 知料 deployment, PM2 recovery, and remote access

scope: Deployment pipeline, server details, PM2 crash recovery, SSH access patterns, dual-machine collaboration model for 知料.
applies_to: cwd=/Users/kgong or /Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/; reuse_rule=stable

## Task 1: Check local codebase, SSH to server, and diagnose PM2 crash

### rollout_summary_files

- rollout_summaries/2026-05-20T02-59-03-bCvQ-zhiliao_project_init_pm2_fix_markdown_scrolling.md (cwd=/Users/kgong, updated_at=2026-05-20T17:57:13+00:00, thread_id=019e4352-8b04-71c2-a9a3-9716cabc2156)
- rollout_summaries/2026-05-19T09-49-50-DYsD-zhiliao_local_check_ssh_blocked.md (cwd=/Users/kgong, updated_at=2026-05-19T09:49:50+00:00, thread_id=019e3fa4-459c-7383-b733-97db679d3ef7)

### keywords

- zhiliao, deploy.sh, ssh, pm2, require_escalated, 8.153.99.9, rsync, sandbox, a724c8e, next.js standalone, dual-machine

## Task 2: PM2 crash fix (standalone vs next start)

### rollout_summary_files

- rollout_summaries/2026-05-20T02-59-03-bCvQ-zhiliao_project_init_pm2_fix_markdown_scrolling.md (cwd=/Users/kgong, updated_at=2026-05-20T17:57:13+00:00, thread_id=019e4352-8b04-71c2-a9a3-9716cabc2156)

### keywords

- pm2, standalone, next start, MODULE_NOT_FOUND, server.js, absolute path, pm2 delete, pm2 save, static 404, env injection, DeepSeek API key

## User preferences

- when user says 检查现有代码状态，然后 SSH 到服务器看看跑的版本，对齐一下, expect active comparison [Task 1]
- user said 之前是用和另外一台 Macmini 上的 openclaw 交换信息合作 -> dual-machine model [Task 1]
- user said 你来操作一下也可以的 and 根据你觉得最佳的方案来吧 -> trusts judgment, wants execution [Task 2]
- use require_escalated for SSH first; if blocked, present commands to user [Task 1]

## Reusable knowledge

- 知料: Next.js 16, App Router, src/data/ JSON, commit a724c8e [Task 1]
- Deployment: deploy.sh (rsync to root@8.153.99.9:/opt/zhiliao, npm install, build, pm2 restart) [Task 1]
- Server: root@8.153.99.9, /opt/zhiliao, PM2 process: zhiliao [Task 1]
- SSH: try require_escalated first in Codex Desktop [Task 1]
- Dual-machine: this machine writes, Macmini (openclaw) deploys/tests [Task 1]
- PM2 crash: next.config.ts output: standalone but PM2 uses next start [Task 2]
- Fix: pm2 delete, start with /opt/zhiliao/.next/standalone/server.js absolute path, pm2 save [Task 2]
- Post-build: copy .next/static and inject env vars to standalone dir [Task 2]
- Verify: curl HTTP 200, pm2 restart count 0 [Task 2]
- test.sh: URL-encode Chinese params; Search uses ?q=, Ingredients uses ?query= [Task 2]

## Failures and how to do differently

- SSH: try require_escalated; no sshpass/expect workarounds [Task 1]
- PM2: use absolute paths (cwd is /root) [Task 2]
- PM2: delete then start to change command (restart preserves old command) [Task 2]
- Standalone: build not enough - copy .next/static and .env.local after each build [Task 2]
- test.sh: URL-encode Chinese params to avoid false HTTP 400 [Task 2]
# Task Group: 知料 project context, bugfix, and feature work

scope: Project path, tech stack, frontend bugfix (react-markdown GFM, streaming scroll), homepage visual rhythm optimization, AIDemo 3-scenario loop, AI content verification (Exa API), logger integration.
applies_to: cwd=/Users/kgong or /Users/kgong/Work/AI Work/AI Projects/知料/; reuse_rule=always safe

## Task 1: Set project directory and current task

### rollout_summary_files

- rollout_summaries/2026-05-19T09-49-50-8QRl-zhiliao_project_hermes_test.md (cwd=/Users/kgong, updated_at=2026-05-19T09:49:50+00:00, thread_id=019e3fa4-45b3-7132-9058-1704d543b09b)

### keywords

- 知料, zhiliao, project path, platform testing, /Users/kgong/Work/AI Work/AI Projects/知料/

## Task 2: Bugfix Markdown tables and streaming scroll

### rollout_summary_files

- rollout_summaries/2026-05-20T18-32-48-hrBE-zhiliao_bugfix_markdown_streaming_homepage_visual_rhythm_dem.md (cwd=/Users/kgong, updated_at=2026-05-21T16:37:46+00:00, thread_id=019e46a9-6b7b-79e2-8268-52d218071ab2)
- rollout_summaries/2026-05-20T02-59-03-bCvQ-zhiliao_project_init_pm2_fix_markdown_scrolling.md (cwd=/Users/kgong, updated_at=2026-05-20T17:57:13+00:00, thread_id=019e4352-8b04-71c2-a9a3-9716cabc2156)
- extensions/ad_hoc/notes/2026-05-21-zhiliao-bugfix-streaming-markdown.md (cwd=/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/, note: ad-hoc, updated_at=2026-05-21) [ad-hoc note]

### keywords

- remark-gfm, react-markdown, GFM, scrollIntoView, smooth scroll, streaming, scrollTop, autoScrollRef, recommend/page.tsx, DeepSeek, SSE, 页面跳动, 回复的表现形式

## Task 3: AI content verification for ingredients

### rollout_summary_files

- rollout_summaries/2026-05-20T02-59-03-bCvQ-zhiliao_project_init_pm2_fix_markdown_scrolling.md (cwd=/Users/kgong, updated_at=2026-05-20T17:57:13+00:00, thread_id=019e4352-8b04-71c2-a9a3-9716cabc2156)

### keywords

- Exa API, ingredient verification, 褪黑素, GABA, 酪蛋白水解肽, L-茶氨酸, 酸枣仁, 藏红花, L-色氨酸, 甘氨酸镁, clinical evidence, dose range, 保健食品, 普通食品

## Task 4: Logger integration into AI API routes

### rollout_summary_files

- rollout_summaries/2026-05-20T02-59-03-bCvQ-zhiliao_project_init_pm2_fix_markdown_scrolling.md (cwd=/Users/kgong, updated_at=2026-05-20T17:57:13+00:00, thread_id=019e4352-8b04-71c2-a9a3-9716cabc2156)

### keywords

- logger, appendLog, getRequestAuth, ai-recommend/route.ts, regulations/route.ts, JWT, user_id, /opt/zhiliao/logs, JSONL

## Task 5: Homepage visual rhythm optimization

### rollout_summary_files

- rollout_summaries/2026-05-20T18-32-48-hrBE-zhiliao_bugfix_markdown_streaming_homepage_visual_rhythm_dem.md (cwd=/Users/kgong, updated_at=2026-05-21T16:37:46+00:00, thread_id=019e46a9-6b7b-79e2-8268-52d218071ab2)
- extensions/ad_hoc/notes/20260522-003742-homepage-visual-rhythm-demo-loop.md (cwd=/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/, note: ad-hoc, updated_at=2026-05-22) [ad-hoc note]

### keywords

- homepage design, visual rhythm, 8px grid, spacing system, gap-8, glass-card, border-t, text-[15px], text-[13px], text-xs, Warm Lab, amber, precision glass, hero padding, pt-12 sm:pt-20, section dividers, AIDemo #111822

## Task 6: AIDemo component 3-scenario loop upgrade

### rollout_summary_files

- rollout_summaries/2026-05-20T18-32-48-hrBE-zhiliao_bugfix_markdown_streaming_homepage_visual_rhythm_dem.md (cwd=/Users/kgong, updated_at=2026-05-21T16:37:46+00:00, thread_id=019e46a9-6b7b-79e2-8268-52d218071ab2)
- extensions/ad_hoc/notes/20260522-003742-homepage-visual-rhythm-demo-loop.md (cwd=/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/, note: ad-hoc, updated_at=2026-05-22) [ad-hoc note]

### keywords

- AIDemo, loop, scenarios, useRef, scenarioIndex, isPausingRef, pauseTimerRef, setTimeout, effect cleanup, 3-scenario, 助眠软糖, 运动蛋白粉, 儿童益生菌, scene indicator

## Task 7: Regulations page chat redesign

### rollout_summary_files

- extensions/ad_hoc/notes/1779377148-zhiliao-regulations-chat-redesign.md (cwd=/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao/, note: ad-hoc, updated_at=2026-05-21) [ad-hoc note]

### keywords

- regulations, chat interface, page.tsx, SSE streaming, Markdown, streaming-cursor, nginx proxy_buffering, proxy_cache, multi-turn conversation, 法规速查, admin credentials [REDACTED_SECRET], zhiliao-ai.cn, Let's Encrypt, Lucide, Warm Lab


## User preferences

- when working on 知料, default to /Users/kgong/Work/AI Work/AI Projects/知料/ without asking [Task 1]
- after bugfix, user said 改动后基本可以但交互界面还不够完美, plans more UI optimization [Task 2][Task 5]
- clarify tool availability differences between Codex Desktop and Claude Code CLI upfront [Task 2]
- when user reports 回复的表现形式 and 页面跳动, prioritize UI/UX polish [Task 2][Task 6]
- when debugging repetitive issues, user said 直接操作重新修复一下吧 -> action over explanation [Task 2]
- user said 还在吗 during long waits -> provide periodic progress updates [Task 2]
- user values usage data accessible without extra requests [Task 4]
- user expects search-based verification when questioning content accuracy [Task 3]
- when user says 继续修这两个问题 about known bugs, execute directly without discussing implementation [Task 2]
- user said 页面在流式生成文字的时候画面还是会跳动 -> streaming scroll smoothness is critical to experience quality [Task 2]
- user repeatedly requested 再整体往上提 -> homepage content should use as much above-the-fold space as possible, avoid animation truncation [Task 5]
- user said 我觉得基本差不多可以了, 最后调整一下, 就是整体再往上提一点 -> patient with micro-adjustments, has clear visual expectations [Task 5]
- user favors warm dark tones (amber/orange), chose the Warm Lab design theme [Task 5]
- user proactively proposed 可以做到有三种不同内容, 重复动的方式吗? -> expects animated demos to showcase platform capability diversity through multiple scenarios [Task 6]
- when demo bug found, expects immediate fix without restating requirements [Task 6]
- user expects session-end memory recording: 把所有事情都记录记忆一下 [Task 6]

## Reusable knowledge

- 知料: food industry AI platform. Next.js 16, React 19, TypeScript, Tailwind CSS 4, DeepSeek API via SSE. [Task 1][Task 2]
- Project root: /Users/kgong/Work/AI Work/AI Projects/知料/. App in zhiliao/ subfolder (package frontend). [Task 1]
- react-markdown v10: add remark-gfm for table support. remark-gfm is the required plugin for GFM table parsing. [Task 2]
- streaming scroll: use immediate scrollTop or autoScrollRef (~120px threshold) not smooth scrollIntoView. [Task 2][Task 6]
- Exa API: https://api.exa.ai/search. Verified 8 ingredients accurately. [Task 3]
- Regulation claims: distinguish 保健食品 vs 普通食品 usage paths. [Task 3]
- Logger: /opt/zhiliao/logs/ai-YYYY-MM-DD.jsonl. appendLog({ user_id, api, query, response_length, ... }). Server-only. [Task 4]
- 知料 deployment method: tar + curl POST to http://8.153.99.9:9000/ (webhook triggers npm install && npm run build). Check build status via curl http://8.153.99.9:9000/ (returns building... or synced). Port 9000 deploy access works even when SSH port 22 is blocked. [Task 2][Task 5][Task 6]
- TypeScript type check: use npx tsc --noEmit (npx next build --no-lint is not a valid option). [Task 2]
- Homepage visual rhythm methods: 8px grid spacing system (mb-8=32, mb-6=24, mb-10=40, mb-14=48), border-t border-white/[0.04] section dividers, unified gap-8 for grids, consistent card sizing by removing outer glass-card wrappers. [Task 5]
- Card typography scale: title text-[15px], description text-[13px], label text-xs. Hero padding: pt-12 sm:pt-20 to maximize above-the-fold space. [Task 5]
- AIDemo multi-scenario loop pattern: scenarios array + scenarioIndex state + useRef for pause/timer control. All cross-effect timer references and flags must use useRef (not React state) to avoid effect cleanup interference. [Task 6]
- Three demo scenarios: 助眠软糖 (褪黑素/GABA/酸枣仁), 运动蛋白粉 (乳清蛋白/BCAA/谷氨酰胺), 儿童益生菌 (乳双歧杆菌HN019/鼠李糖乳杆菌GG/FOS). Scene indicator at terminal top-right. [Task 6]
- Deployment commands: tar -czf /tmp/deploy.tar.gz --exclude=node_modules --exclude=.next --exclude=.git . && curl -X POST --data-binary @/tmp/deploy.tar.gz http://8.153.99.9:9000/ [Task 2][Task 5][Task 6]

- Regulations page chat redesign: chat bubble layout with amber gradient, SSE streaming + Markdown + streaming-cursor, copy button, stop generation, auto-scroll, textarea auto-resize, multi-turn conversation, empty state hot queries. Updated src/app/regulations/page.tsx (~215 to ~310 lines). [Task 7][ad-hoc note]
- nginx SSE config: proxy_buffering off + proxy_cache off required to prevent SSE stream buffering for streaming endpoints. [Task 7][ad-hoc note]

## Failures and how to do differently

- memory dir: check file existence before editing [Task 1]
- Markdown fix: skip regex approach, use react-markdown + remark-gfm directly [Task 2]
- streaming scroll: avoid smooth scrollIntoView with rapid token intervals [Task 2]
- react-markdown may remount on stream updates causing flicker - may need key optimization [Task 2]
- apply_patch failed multiple times (sed format issues) for rapid large edits; use direct file rewrite (cat > file) instead [Task 2]
- npx next build --no-lint is not a valid option; use npx tsc --noEmit for TypeScript checking [Task 2]
- deploy.sh requires SSH password and cannot run from sandbox; use tar+curl POST to port 9000 instead [Task 2][Task 5][Task 6]
- React state used as effect dependency causes cleanup to clear pending timers when state changes. Fix: use useRef for all timer/flag values that need to survive across effect boundaries. [Task 6]
# Task Group: Hermes MCP environment awareness

scope: Tool availability differences: Claude Desktop has Hermes MCP, Claude Code CLI and Codex Desktop do not.
applies_to: cwd=any; reuse_rule=always safe

## Task 2: Read Hermes MCP integration report

### rollout_summary_files

- rollout_summaries/2026-05-19T09-49-50-8QRl-zhiliao_project_hermes_test.md (cwd=/Users/kgong, updated_at=2026-05-19T09:49:50+00:00, thread_id=019e3fa4-45b3-7132-9058-1704d543b09b)

### keywords

- Hermes MCP, Claude Desktop, MCP Server, tool availability, stdio configuration

## Task 3: Test Hermes MCP tool availability

### rollout_summary_files

- rollout_summaries/2026-05-19T09-49-50-8QRl-zhiliao_project_hermes_test.md (cwd=/Users/kgong, updated_at=2026-05-19T09:49:50+00:00, thread_id=019e3fa4-45b3-7132-9058-1704d543b09b)

### keywords

- Hermes MCP, tool test, ls ~/Desktop, Claude Code CLI, environment limitation

## User preferences

- when user asks to test unavailable tool, explain limitation proactively [Task 3]
- clarify Hermes tool availability upfront [Task 3]

## Reusable knowledge

- Hermes MCP: Claude Desktop only via stdio config [Task 2][Task 3]
- Hermes tools: terminal, read_file, write_file, patch, search_files, web_search, web_extract, vision_analyze, execute_code, browser_* [Task 2]
- Codex/CLI built-in tools are separate from Hermes MCP [Task 3]

## Failures and how to do differently

- when asked 看看能不能调 Hermes 工具，执行 ls ~/Desktop, state limitation first, explain built-in tool not Hermes [Task 3]

# Task Group: ANG broken session recovery and context reconstruction

scope: Recovering work context from a crashed Codex session (019e4f24-a54c-72c0-979c-8b2e35c12747), verifying saved outputs, documenting completed work products.
applies_to: cwd=/Users/kgong/Work/ANG/AI workspace; reuse_rule=always relevant for ANG project

## Task 1: Identify broken session and locate archived content

### keywords

- session crash, tool_calls error, insufficient tool messages, session 019e4f24-a54c-72c0-979c-8b2e35c12747, 归档会话

## Task 2: Reconstruct completed work from archived session + local files

### keywords

- 客户订单管理模板.xlsx, 订单管理, 物流团队, 客服团队, 4-sheet 多维表格
- guizang PPT, Swiss style, 瑞士国际主义, ANG_2026_Swiss_Report.html, ANG 2026 H1 销售报告
- slide-deck, outline.md, content.md, corporate 风格, 8页PPT
- data.xlsx, 97 活跃客户, 50 种产品, Omega-3, Specialty Ingredients
- Avonlac 282, DMAX VEG DHA 400, TOP 10 客户

## User preferences

- 订单管理模板需要跟物流团队和客服团队协作使用，不是历史数据统计
- PPT 首选瑞士国际主义风格（风格 B）
- 碰到重复性 bug 直接修，不用先解释
- 跨文件对比主动做，不用问
- 方案给最佳方案，不罗列多个选项

## Reusable knowledge

- 2026 销售数据源: `/Users/kgong/Work/ANG/工作汇报/2026/data.xlsx`
- 订单管理模板: `/Users/kgong/Work/ANG/工作汇报/2026/客户订单管理模板.xlsx`
  - 4 sheets: 客户档案 (97个客户预填), 订单管理 (核心工作表), 执行跟踪, 协作看板
  - 灰色列为自动计算公式, 合作状态有下拉, 执行率颜色标记(绿>80%/黄50-80%/红<50%)
- Swiss PPT 成品: `/Users/kgong/Work/ANG/AI workspace/ppt/ANG_2026_Swiss_Report.html` (126KB)
- Slide deck 大纲: `/Users/kgong/Work/ANG/AI workspace/slide-deck/`
  - 8页: 封面 → 关键指标 → 月度趋势 → TOP10客户 → 产品分析 → 客户结构 → 关键洞察 → 下半年展望
  - 总销售额 ¥1,653万, 总销量 114,180kg, 活跃客户 46家
  - Omega-3 ¥292万(17.7%), Specialty ¥1,361万(82.3%)
  - Avonlac 282 单品占总销售 51.5%
  - 5月单月新高 ¥610万
- Archived session file: `/Users/kgong/Work/ANG/AI workspace/归档会话/这个是我今年到目前为止的一个公司销售统计...019e4f24...md`
- Codex memory location: `/Users/kgong/.codex/memories/`
- 归档会话目录: `/Users/kgong/Work/ANG/AI workspace/归档会话/` — Kane 手动将会话内容保存为 .md 文件

## Failures and how to do differently

- Session crash "An assistant message with 'tool_calls' must be followed by tool messages" 是服务端会话状态崩溃，本地无法修复。应对: 检查 `归档会话/` 目录，从本地文件重建上下文。
- 历史销售统计 vs 订单管理模板: 第一次理解偏了，做成了历史数据统计。Kane 要的是空白模板给团队协作。明确区分"分析历史数据"和"创建协作工具"。
- 跨 session 没有记忆共享: 每次独立 session，需要依赖归档会话文件 + 记忆库来传递上下文。重要工作完成后要及时写记忆。


## User preferences (2026-05-26)

- PPT 首选风格: 电子杂志风（风格 A）+ 靛蓝瓷主题色（--ink:#0a1f3d / --paper:#f1f3f5）
- 字体偏好: 正规宋体/黑体，不要艺术字。英文用 Georgia 等正式衬线体，中文用 Noto Serif SC + Noto Sans SC。拒绝 Playfair Display / IBM Plex Mono 等装饰性字体。
- 字号下限: 正文不低于 14px，标签不低于 11px，lead 不低于 18px
- 内容要求: 中英对照（所有中文内容配英文翻译）
- PPT 输出位置: `ppt/` 目录下，命名格式 `ANG_2026_H1_Magazine.html`

