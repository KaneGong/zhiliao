# 知料部署指南

最后更新：2026-05-28

## 1. 当前结论
首选部署方式：本地打包 → SSH/SFTP 上传到服务器 → 服务器执行 `npm install`、`npm run build`、补齐 standalone 文件 → PM2 delete/start。

不再首选 9000 webhook：最近一次部署时 9000 端口 TCP 可连，但 HTTP 请求挂起；它只作为 legacy/fallback 记录。

## 2. 基本信息
| 项 | 值 |
| --- | --- |
| 线上域名 | `https://zhiliao-ai.cn` |
| 服务器 | `8.153.99.9` |
| 服务器系统 | Ubuntu 22.04 |
| App 目录 | `/opt/zhiliao` |
| PM2 进程 | `zhiliao` |
| Next.js 模式 | `output: "standalone"` |

敏感信息不要写进文档；SSH 凭据、API Key、管理员口令从安全凭据库、`.env.local` 或服务器现有配置读取。

## 3. 本地打包
部署前先跑当前 checklist：`docs/tasks/deploy-readiness-checklist-2026-05-30.md`。至少确认：

```bash
npm run verify
npm run smoke:local
git diff --check
```

```bash
cd "/Users/kgong/Work/AI Work/AI Projects/知料/zhiliao"
tar -czf /tmp/zhiliao-deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude='*.tar.gz' \
  .
```

上传到服务器 `/tmp/zhiliao-deploy.tar.gz`。可用任一安全方式：SFTP、scp、paramiko 脚本或人工上传。

## 4. 服务器部署步骤
在服务器执行：
```bash
set -e
APP_DIR=/opt/zhiliao
TAR_FILE=/tmp/zhiliao-deploy.tar.gz
BACKUP_DIR=/opt/zhiliao_backup_$(date +%Y%m%d_%H%M%S)

# 1. 备份当前版本
if [ -d "$APP_DIR" ]; then
  cp -a "$APP_DIR" "$BACKUP_DIR"
fi

# 2. 解压新包
mkdir -p "$APP_DIR"
cd "$APP_DIR"
tar -xzf "$TAR_FILE"

# 3. 安装与构建
npm install
npm run build

# 4. 补齐 standalone 运行目录
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public
cp .env.local .next/standalone/.env.local

# 5. 用正确入口重建 PM2 进程
pm2 delete zhiliao 2>/dev/null || true
NODE_ENV=production pm2 start node --name zhiliao -- /opt/zhiliao/.next/standalone/server.js
pm2 save
```

## 5. 验证
服务器本机验证：
```bash
pm2 status zhiliao
curl -sS -o /tmp/z-home.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/
curl -sS -o /tmp/z-recommend.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/recommend
curl -sS -o /tmp/z-regulations.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/regulations
curl -sS -o /tmp/z-admin.html -w "%{http_code} %{size_download}\n" http://127.0.0.1:3000/admin
curl -k -sS -o /tmp/z-https.html -w "%{http_code} %{size_download}\n" https://127.0.0.1/recommend
```

外网验证：
```bash
curl -I https://zhiliao-ai.cn/
curl -I https://zhiliao-ai.cn/recommend
curl -I https://zhiliao-ai.cn/regulations
```

本机浏览器打不开但服务器验证正常时，先查 DNS/VPN：
```bash
dig +short zhiliao-ai.cn
dig +short www.zhiliao-ai.cn
```
正确 A 记录应为 `8.153.99.9`。如果解析到 `198.18.x.x`，通常是 VPN/代理 fake-ip。

## 6. 常见故障
### PM2 online 但页面 404 / 静态资源缺失
通常是 standalone 目录缺少静态资源：
```bash
cd /opt/zhiliao
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public
pm2 restart zhiliao
```

### PM2 反复 crash
检查是否错误使用 `next start`。standalone 模式必须用：
```bash
pm2 delete zhiliao
NODE_ENV=production pm2 start node --name zhiliao -- /opt/zhiliao/.next/standalone/server.js
pm2 save
```

### API Key 不生效
确认 `.env.local` 被复制到了 standalone 目录：
```bash
ls -la /opt/zhiliao/.next/standalone/.env.local
```
不要把 `.env.local` 内容输出到日志或聊天中。

### SSE 不流式 / 法规或推荐回答卡顿
检查 Nginx 对相关路径是否关闭缓冲：
```nginx
proxy_buffering off;
proxy_cache off;
```

## 7. Legacy webhook 说明
仓库中的 `scripts/deploy.sh` 仍是 tar+curl webhook 方式。该方式历史上可用，但 2026-05-28 部署时出现请求挂起，因此仅作 fallback。若未来修复 webhook，需要同步更新本文件和脚本注释。
