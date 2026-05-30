# Deploy Readiness Checklist — 2026-05-30

> Scope: prepare ZhiLiao for the next production deploy. This checklist does not deploy by itself.

## 1. Current Local Baseline

- Branch: `main`
- Local demo URL: `http://localhost:3010`
- Current local verification commands:
  - `npm run verify`
  - `npm run smoke:local`
  - `git diff --check`
- Latest demo readiness commits:
  - `20e9bd2 fix: expose demo workflow entry points`
  - `b7ca60a docs: record demo e2e acceptance`
  - `2cc740f fix: extract ingredients in regulation queries`

## 2. Do Not Deploy Until These Pass

| Gate | Command / Check | Required Result |
|---|---|---:|
| Git scope | `git status --short --branch` | Only intentional changes staged/committed; local scratch files remain unstaged |
| Type/build | `npm run verify` | PASS |
| Local smoke | Start `npm run dev:demo`, then `npm run smoke:local` | PASS |
| Whitespace | `git diff --check` | PASS |
| Demo flow | `/`, `/recommend`, `/regulations`, `/recipes`, `/admin` | Pages render locally |
| AI formula | POST `/api/ai-recommend` | SSE chunks returned |
| Regulation | POST `/api/regulations` | DB result + SSE chunks returned |
| Regulation extraction | `DHA 能不能用于普通食品？` | DB card matches `DHA（二十二碳六烯酸）` |
| Auth recipes | register/login + POST/GET `/api/recipes` | Save/read flow works |
| Admin gate | `/admin` and admin auth endpoint | Login screen and configured local auth work |

## 3. Packaging Command

```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao"
tar -czf /tmp/zhiliao-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude='*.tar.gz' \
  .
```

Upload `/tmp/zhiliao-deploy.tar.gz` to the server by an approved secure method.

## 4. Server Deployment Reminder

Follow `docs/deploy.md`. The key production truth remains:

1. deploy to `/opt/zhiliao`;
2. run `npm install`;
3. run `npm run build`;
4. copy `.next/static`, `public`, and `.env.local` into `.next/standalone`;
5. rebuild PM2 with `node /opt/zhiliao/.next/standalone/server.js`;
6. do not rely on the legacy 9000 webhook unless it has been revalidated first.

## 5. Required Server Smoke

Run these on the server after PM2 restarts:

```bash
pm2 status zhiliao
curl -sS -o /tmp/z-home.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/
curl -sS -o /tmp/z-recommend.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/recommend
curl -sS -o /tmp/z-regulations.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/regulations
curl -sS -o /tmp/z-admin.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/admin
curl -k -sS -o /tmp/z-https.html -w "%{http_code} %{size_download}\n" https://127.0.0.1/recommend
```

External smoke:

```bash
curl -I https://zhiliao-ai.cn/
curl -I https://zhiliao-ai.cn/recommend
curl -I https://zhiliao-ai.cn/regulations
```

## 6. Rollback Trigger

Rollback to the timestamped `/opt/zhiliao_backup_*` if any of these happen after deploy:

- PM2 process is not online;
- home or `/recommend` returns non-200 from server localhost;
- static assets are missing;
- AI routes fail because environment variables are missing;
- SSE responses hang due to proxy buffering.

## 7. Known Non-Blockers

- `scripts/auto-research.ts` is currently an untracked local helper and should stay out of deploy commits unless intentionally stabilized.
- Commercial validation remains paused until the website is stable enough for external demos.
- Full-site AI assistant is a product decision, not a deployment blocker.
