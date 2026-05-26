# 知料部署指南

## 服务器信息
- IP: 8.153.99.9
- SSH: root@8.153.99.9
- App 路径: /opt/zhiliao
- PM2 进程: zhiliao
- Webhook: 端口 9000

## 部署方式：tar + curl webhook

### 一键部署
```bash
cd /path/to/zhiliao
tar -czf /tmp/zhiliao-deploy.tar.gz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  .
curl -X POST --data-binary @/tmp/zhiliao-deploy.tar.gz http://8.153.99.9:9000/
# 等待文件同步…
curl http://8.153.99.9:9000/   # 触发构建
```

### 构建步骤（服务器端自动执行）
1. `npm install`
2. `npm run build`
3. `cp -r .next/static .next/standalone/.next/static`
4. `cp .env.local .next/standalone/.env.local`
5. `pm2 restart zhiliao && pm2 save`

## PM2 注意事项
- Next.js standalone 模式：必须用 `node .next/standalone/server.js`
- `pm2 restart` 保留旧启动命令 → 用 `pm2 delete` + `pm2 start` 来改命令
- 当前进程配置：`pm2 start /usr/bin/node -- /opt/zhiliao/.next/standalone/server.js --name zhiliao`

## 验证命令
```bash
# 检查 PM2 状态
ssh root@8.153.99.9 "pm2 status"

# 检查端口
ssh root@8.153.99.9 "netstat -tlnp | grep node"

# HTTP 状态码
curl -s -o /dev/null -w "%{http_code}" https://zhiliao-ai.cn/
```
