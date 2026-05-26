---
name: zhiliao-nextjs-standalone-pm2
description: Fix PM2 crash when Next.js uses output: standalone but PM2 starts with next start.
argument-hint: "[server-ip] [remote-path] [pm2-process-name]"
disable-model-invocation: false
allowed-tools: [Read, Write, Bash, Grep]
---

# PM2 Next.js Standalone Deployment Fix

## When to use

- PM2 crashes repeatedly (62+ restarts) for a Next.js app
- Error shows: next start does not work with output: standalone configuration
- PM2 restart count keeps increasing
- After Next.js build with standalone, static files return 404

Triggers: server crash report, checking server status, deploying standalone output app.

## Inputs / context to gather

1. Check if next.config.ts has output: "standalone"
2. Run pm2 list to check restart count and current command
3. Run pm2 show <name> for environment details
4. Check error logs: pm2 logs <name> --lines 50
5. Verify server IP, remote path, PM2 process name

## Procedure

1. SSH into server (try require_escalated first)
2. Delete current process: pm2 delete <name> (restart preserves old command)
3. Start with absolute path: ENV_VAR=value pm2 start node --name <name> -- <path>/.next/standalone/server.js
4. Run pm2 save
5. Verify: curl returns 200 for main page
6. Verify: pm2 show shows restart count 0

## Post-build steps

- Copy static: cp -r .next/static .next/standalone/.next/static
- Copy env: cp .env.local .next/standalone/.env.local

## Pitfalls and fixes

- MODULE_NOT_FOUND: use absolute paths (cwd is /root)
- Static 404: standalone dir missing static/ folder
- Env not available: copy .env.local
- Restart uses old command: use delete then start
- API returns 400 with Chinese params: URL-encode test.sh parameters

## Verification checklist

- [ ] PM2 restart count = 0
- [ ] Main page returns HTTP 200
- [ ] Static assets load
- [ ] API routes work
- [ ] PM2 process persists after restart (pm2 save done)
- [ ] Env vars available in production
