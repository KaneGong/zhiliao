# 知料服务器配置清单

最后更新：2026-05-28

## 1. 基本信息
- 服务器：阿里云 Ubuntu 22.04
- 公网 IP：`8.153.99.9`
- 域名：`zhiliao-ai.cn`、`www.zhiliao-ai.cn`
- App 目录：`/opt/zhiliao`
- PM2 进程：`zhiliao`
- Node 服务端口：`3000`
- 对外访问：Nginx 80/443 反代到 `127.0.0.1:3000`

## 2. 目录结构
```text
/opt/zhiliao/
├── .next/standalone/server.js        # PM2 入口
├── .next/standalone/.next/static/    # standalone 运行所需静态资源
├── .next/standalone/public/          # standalone 运行所需 public 资源
├── .next/standalone/.env.local       # standalone 环境变量副本
├── .env.local                        # 服务器环境变量源文件
├── public/                           # 源 public 资源
├── src/data/                         # JSON 数据源
└── logs/                             # AI 调用日志
```

敏感文件只留在服务器，不输出、不写入仓库文档。

## 3. PM2
当前应使用 standalone server：
```text
name:   zhiliao
script: node
args:   /opt/zhiliao/.next/standalone/server.js
env:    NODE_ENV=production
```

常用命令：
```bash
pm2 status zhiliao
pm2 logs zhiliao --lines 50
pm2 restart zhiliao
pm2 delete zhiliao
pm2 save
```

改启动命令时必须 delete 后 start：
```bash
pm2 delete zhiliao 2>/dev/null || true
NODE_ENV=production pm2 start node --name zhiliao -- /opt/zhiliao/.next/standalone/server.js
pm2 save
```

## 4. Next.js standalone 部署要点
每次 `npm run build` 后执行：
```bash
cd /opt/zhiliao
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static
rm -rf .next/standalone/public
cp -r public .next/standalone/public
cp .env.local .next/standalone/.env.local
```

缺少 `public` 会导致 logo/mascot 等静态资源丢失；缺少 `.next/static` 会导致 Next 静态 chunk 404。

## 5. Nginx / HTTPS
预期行为：
- HTTP 80 跳转到 HTTPS 443
- HTTPS 443 反向代理到 `127.0.0.1:3000`
- SSE 接口建议关闭代理缓冲：
```nginx
proxy_buffering off;
proxy_cache off;
```

证书由 certbot/Let's Encrypt 管理。续期检查：
```bash
certbot renew --dry-run
```

## 6. 日志
- PM2 stdout：`/root/.pm2/logs/zhiliao-out.log`
- PM2 stderr：`/root/.pm2/logs/zhiliao-error.log`
- AI 日志：`/opt/zhiliao/logs/ai-YYYY-MM-DD.jsonl`

查看：
```bash
pm2 logs zhiliao --lines 50
```

## 7. 安全组 / 防火墙
需要对外开放：
- 80 HTTP
- 443 HTTPS
- 22 SSH（按安全策略限制来源更好）

9000 webhook 端口为历史部署方案使用；若不再维护，应限制或关闭。

## 8. 新服务器初始化简版
```bash
# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx
npm install -g pm2

# App 目录
mkdir -p /opt/zhiliao/logs

# Nginx 配置反代 127.0.0.1:3000
# certbot 配置 HTTPS
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot
certbot --nginx -d zhiliao-ai.cn -d www.zhiliao-ai.cn
```

完整发布步骤见 `docs/deploy.md`。
