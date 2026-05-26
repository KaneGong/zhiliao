# 知料服务器配置清单

> 服务器：阿里云 Ubuntu 22.04，IP: 8.153.99.9

---

## 一、目录结构

```
/opt/zhiliao/
├── .next/standalone/server.js   # PM2 入口
├── .next/static/                # 静态资源
├── .env.local                   # 环境变量
├── src/data/                    # JSON 数据（构建后嵌入 standalone）
├── public/                      # 公共资源
└── logs/                        # AI 调用日志
    └── ai-YYYY-MM-DD.jsonl
```

## 二、PM2 配置

### 当前进程
```
name:     zhiliao
script:   /usr/bin/node
args:     /opt/zhiliao/.next/standalone/server.js
mode:     fork
env:      production
```

### 常用命令
```bash
pm2 status                    # 查看状态
pm2 logs zhiliao --lines 20   # 查看日志
pm2 restart zhiliao           # 重启
pm2 delete zhiliao            # 删除（改启动命令时必须先 delete）
pm2 save                      # 保存进程列表
```

### ⚠️ 重要：修改启动命令
```bash
# 错误：pm2 restart 会保留旧命令
# 正确做法：
pm2 delete zhiliao
pm2 start /usr/bin/node --name zhiliao -- /opt/zhiliao/.next/standalone/server.js
pm2 save
```

## 三、Nginx 配置

### SSL 证书
```bash
# 初次安装 certbot
snap install --classic certbot
ln -sf /snap/bin/certbot /usr/bin/certbot

# 申请证书
certbot --nginx -d zhiliao-ai.cn -d www.zhiliao-ai.cn

# 自动续期（已配置定时任务）
certbot renew --dry-run
```

### Nginx 站点配置（推测）
```
/etc/nginx/sites-available/zhiliao-ai.cn
```
- HTTP (80) → 301 重定向到 HTTPS
- HTTPS (443) → 反向代理到 localhost:3000
- SSL 证书路径由 certbot 自动管理

## 四、自动部署 Webhook

### 服务
- 端口：9000
- 语言：Python 3
- 启动：nohup 后台运行

### 脚本位置
`/opt/deploy-webhook.py`

### 功能
- `POST /` — 接收 tar.gz，解压到 /opt/zhiliao
- `GET /` — 触发构建流程（npm install → build → 复制 static/env → pm2 restart）

### 构建流程（GET 触发）
```bash
cd /opt/zhiliao
npm install >> /opt/deploy.log 2>&1
npm run build >> /opt/deploy.log 2>&1
cp -r .next/static .next/standalone/.next/static
cp .env.local .next/standalone/.env.local
pm2 restart zhiliao
pm2 save
```

### 重启 webhook
```bash
# 如果 webhook 挂了
nohup python3 /opt/deploy-webhook.py > /dev/null 2>&1 &
```

## 五、阿里云安全组

需确保以下端口在安全组中开放：
| 端口 | 用途 | 方向 |
|------|------|------|
| 80 | HTTP（重定向到 HTTPS） | 入方向 |
| 443 | HTTPS | 入方向 |
| 22 | SSH | 入方向 |
| 9000 | 部署 Webhook | 入方向 |

## 六、日志

### AI 调用日志
- 路径：`/opt/zhiliao/logs/ai-YYYY-MM-DD.jsonl`
- 格式：JSONL，每行一条
- 记录：用户ID、API、查询、响应长度、状态码、耗时

### PM2 日志
- 路径：`/root/.pm2/logs/zhiliao-out.log`
- 路径：`/root/.pm2/logs/zhiliao-error.log`

## 七、新服务器搭建步骤

如果需要在全新服务器上搭建：

```bash
# 1. 安装 Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. 安装 PM2
npm install -g pm2

# 3. 安装 Nginx
apt-get install -y nginx

# 4. 安装 certbot（SSL）
snap install --classic certbot

# 5. 创建目录
mkdir -p /opt/zhiliao/logs

# 6. 部署 webhook（复制 deploy-webhook.py 到 /opt/）

# 7. 配置 Nginx（反向代理 localhost:3000）

# 8. 配置 SSL 证书
certbot --nginx -d your-domain.com

# 9. 部署应用（通过 tar+curl 或 git clone + build）
```
