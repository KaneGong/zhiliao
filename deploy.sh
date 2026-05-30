#!/bin/bash
# 知料 ZhiLiao 一键部署脚本
# 用法: bash deploy.sh

set -e

SERVER="root@zhiliao-ai.cn"
REMOTE_PATH="/opt/zhiliao"
LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 知料 ZhiLiao 部署开始..."
echo "   本地: $LOCAL_PATH"
echo "   服务器: $SERVER:$REMOTE_PATH"
echo ""

# Step 1: 同步代码
echo "📦 [1/6] 同步代码到服务器..."
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='.DS_Store' \
  --exclude='deploy.sh' \
  --exclude='ingredients_old_backup.json' \
  --exclude='src/data/_archive' \
  --exclude='gen_products.py' \
  --exclude='scripts' \
  --exclude='logs' \
  "$LOCAL_PATH/" "$SERVER:$REMOTE_PATH/"

# Step 2: 安装依赖
echo ""
echo "📥 [2/6] 安装依赖..."
ssh "$SERVER" "cd $REMOTE_PATH && npm install"

# Step 3: 构建
echo ""
echo "🔨 [3/6] 构建项目..."
ssh "$SERVER" "cd $REMOTE_PATH && npm run build"

# Step 4: 复制静态文件到 standalone（关键！否则 CSS/JS 404）
echo ""
echo "📦 [4/6] 复制静态文件到 standalone..."
ssh "$SERVER" "cp -r $REMOTE_PATH/.next/static $REMOTE_PATH/.next/standalone/.next/static"

# Step 5: 复制 .env.local
echo ""
echo "📋 [5/6] 复制环境变量..."
ssh "$SERVER" "cp $REMOTE_PATH/.env.local $REMOTE_PATH/.next/standalone/.env.local"

# Step 6: 重启
echo ""
echo "🔄 [6/6] 重启服务..."
ssh "$SERVER" "pm2 delete zhiliao 2>/dev/null; \
  DEEPSEEK_API_KEY=\$(grep DEEPSEEK_API_KEY $REMOTE_PATH/.env.local | cut -d= -f2) \
  NODE_ENV=production \
  pm2 start node --name zhiliao -- $REMOTE_PATH/.next/standalone/server.js && \
  pm2 save"

echo ""
echo "🧪 [验证] 运行功能测试..."
sleep 3
ssh "$SERVER" "bash $REMOTE_PATH/test.sh"

echo ""
echo "🌐 访问: http://zhiliao-ai.cn"
