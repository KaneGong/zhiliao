#!/bin/bash
# 知料一键部署脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TAR_FILE="/tmp/zhiliao-deploy.tar.gz"
SERVER="8.153.99.9:9000"

cd "$PROJECT_DIR"

echo "📦 打包项目文件..."
tar -czf "$TAR_FILE" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.tar.gz' \
  .

echo "📤 上传到服务器..."
curl -s -X POST --data-binary "@$TAR_FILE" "http://$SERVER/"
echo ""

echo "🔨 触发服务器构建..."
curl -s "http://$SERVER/"
echo ""

echo "⏳ 等待构建完成（约 40 秒）..."
sleep 40

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://zhiliao-ai.cn/)
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ 部署成功！https://zhiliao-ai.cn"
else
  echo "⚠️  HTTP 状态码: $HTTP_CODE，请手动检查"
fi

rm -f "$TAR_FILE"
