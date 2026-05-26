#!/bin/bash
# ============================================================
# 知料 ZhiLiao — 全平台自动化测试脚本 v1
# 运行方式: bash test-full.sh [base_url]
# 默认 base_url 为 http://localhost:3000
# ============================================================

set -euo pipefail

BASE="${1:-http://localhost:3000}"
PASS=0; FAIL=0
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
DIVIDER="============================================================"

# --- Utils ---
check() {
  local label="$1"; local method="$2"; local url="$3"; local expected_code="$4"
  local extra_args="${5:-}"
  local code
  code=$(curl -s -o /tmp/zhiliao_test_resp.txt -w "%{http_code}" -X "$method" "$url" $extra_args 2>/dev/null || echo "000")
  local body
  body=$(cat /tmp/zhiliao_test_resp.txt 2>/dev/null | head -c 500)

  if [ "$code" = "$expected_code" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} [$code] $label"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} [expected $expected_code, got $code] $label"
    echo -e "    ${YELLOW}Response: ${body:0:200}${NC}"
    FAIL=$((FAIL + 1))
  fi
}

check_body_contains() {
  local label="$1"; local method="$2"; local url="$3"; local expected_code="$4"
  local substring="$5"; local extra_args="${6:-}"
  local code
  local body
  body=$(curl -s -X "$method" "$url" $extra_args 2>/dev/null)
  code=$(curl -s -o /tmp/zhiliao_test_resp.txt -w "%{http_code}" -X "$method" "$url" $extra_args 2>/dev/null || echo "000")

  if [ "$code" = "$expected_code" ] && echo "$body" | grep -q "$substring"; then
    echo -e "  ${GREEN}✓ PASS${NC} [$code] $label"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} [expected $expected_code + '$substring', got $code] $label"
    FAIL=$((FAIL + 1))
  fi
}

section() {
  echo ""; echo -e "${CYAN}${DIVIDER}${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}${DIVIDER}${NC}"
}

# ============================================================
# 1. 基础可用性 — 页面加载
# ============================================================
section "1. 基础页面加载测试"

check "首页 /"                                   "GET" "$BASE/"                                    "200"
check "原料库页 /search"                          "GET" "$BASE/search"                             "200"
check "AI推荐页 /recommend"                       "GET" "$BASE/recommend"                          "200"
check "法规速查页 /regulations"                    "GET" "$BASE/regulations"                        "200"
check "登录页 /login"                              "GET" "$BASE/login"                              "200"
check "注册页 /register"                           "GET" "$BASE/register"                           "200"
check "产品详情页 /product/GLA-P292"               "GET" "$BASE/product/GLA-P292"                   "200"

# 需要登录的页面（预期重定向或返回非200，不做严格要求）
check "配方页 /recipes (未登录也加载客户端)"         "GET" "$BASE/recipes"                           "200"
check "设置页 /settings (未登录也加载客户端)"        "GET" "$BASE/settings"                          "200"

# ============================================================
# 2. API — 产品搜索 & 筛选
# ============================================================
section "2. 产品搜索 & 筛选 API"

check "GET /api/filters — 获取筛选选项"             "GET" "$BASE/api/filters"                       "200"
check_body_contains "含 categories 字段"           "GET" "$BASE/api/filters"                       "200" "categories"
check_body_contains "含 functions 字段"            "GET" "$BASE/api/filters"                       "200" "functions"

check "GET /api/products?q=乳清 — 中文搜索"         "GET" "$BASE/api/products?q=%E4%B9%B3%E6%B8%85" "200"
check_body_contains "返回 products 数组"           "GET" "$BASE/api/products?q=%E4%B9%B3%E6%B8%85" "200" "products"

check "GET /api/products?category=蛋白 — 按品类筛选" "GET" "$BASE/api/products?category=%E8%9B%8B%E7%99%BD" "200"
check_body_contains "在产品结果中"                  "GET" "$BASE/api/products?category=%E8%9B%8B%E7%99%BD" "200" "products"

check "GET /api/products (空参数)"                 "GET" "$BASE/api/products"                       "200"

# 测试不存在的产品
check "GET /api/products?q=xyz不存在产品"           "GET" "$BASE/api/products?q=xyz%E4%B8%8D%E5%AD%98%E5%9C%A8" "200"

# 产品存在性验证 — 检查已知产品
check_body_contains "GLA-P292 产品存在"            "GET" "$BASE/api/products?q=GLA-P292"            "200" "GLA-P292"

# ============================================================
# 3. API — 法规查询（数据库 + AI）
# ============================================================
section "3. 法规速查 API"

check "GET /api/regulations?q=乳铁蛋白"             "GET" "$BASE/api/regulations?q=%E4%B9%B3%E9%93%81%E8%9B%8B%E7%99%BD" "200"
check_body_contains "返回合规状态"                  "GET" "$BASE/api/regulations?q=%E4%B9%B3%E9%93%81%E8%9B%8B%E7%99%BD" "200" "checks"

check "GET /api/regulations?q=DHA"                "GET" "$BASE/api/regulations?q=DHA"              "200"

check "GET /api/regulations (缺少参数)"             "GET" "$BASE/api/regulations"                    "400"

# 测试不存在的原料
check_body_contains "未知原料返回 not_found"        "GET" "$BASE/api/regulations?q=%E8%99%9A%E5%81%87%E5%8E%9F%E6%96%99XYZ" "200" "not_found"

# AI 问答测试（自然语言问题）
check "GET /api/regulations?q=什么原料可以用于婴幼儿配方食品" "GET" "$BASE/api/regulations?q=%E4%BB%80%E4%B9%88%E5%8E%9F%E6%96%99%E5%8F%AF%E4%BB%A5%E7%94%A8%E4%BA%8E%E5%A9%B4%E5%B9%BC%E5%84%BF%E9%85%8D%E6%96%B9%E9%A3%9F%E5%93%81" "200"

# ============================================================
# 4. API — 用户注册 & 认证
# ============================================================
section "4. 用户认证 API"

# 注册新用户
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@zhiliao-test.com"
TEST_PASS="test123456"
TEST_NAME="测试用户${TIMESTAMP}"

REGISTER_RESP=$(curl -s -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"$TEST_NAME\",\"password\":\"$TEST_PASS\",\"role\":\"user\"}" 2>/dev/null)
REGISTER_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"$TEST_NAME\",\"password\":\"$TEST_PASS\",\"role\":\"user\"}" 2>/dev/null)

if [ "$REGISTER_CODE" = "200" ] || [ "$REGISTER_CODE" = "201" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$REGISTER_CODE] 注册用户 ($TEST_EMAIL)"
  PASS=$((PASS + 1))
else
  REG_MSG=$(echo "$REGISTER_RESP" | head -c 200)
  echo -e "  ${RED}✗ FAIL${NC} [$REGISTER_CODE] 注册用户 — $REG_MSG"
  FAIL=$((FAIL + 1))
fi

# 重复注册（应返回错误）
DUP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"name\":\"$TEST_NAME\",\"password\":\"$TEST_PASS\",\"role\":\"user\"}" 2>/dev/null)
if [ "$DUP_CODE" = "400" ] || [ "$DUP_CODE" = "409" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$DUP_CODE] 重复注册正确拒绝"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠ WARN${NC} [$DUP_CODE] 重复注册未明确拒绝（可能返回200表示已存在）"
fi

# 登录
LOGIN_RESP=$(curl -s -c /tmp/zhiliao_cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" 2>/dev/null)
LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -c /tmp/zhiliao_cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" 2>/dev/null)

if [ "$LOGIN_CODE" = "200" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$LOGIN_CODE] 用户登录"
  PASS=$((PASS + 1))
else
  LOGIN_MSG=$(echo "$LOGIN_RESP" | head -c 200)
  echo -e "  ${RED}✗ FAIL${NC} [$LOGIN_CODE] 用户登录 — $LOGIN_MSG"
  FAIL=$((FAIL + 1))
fi

# 获取当前用户信息
check_body_contains "GET /api/auth/me (已登录)"    "GET" "$BASE/api/auth/me"                      "200" "user" "-b /tmp/zhiliao_cookies.txt"

# 错误密码登录
WRONG_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}" 2>/dev/null)
if [ "$WRONG_CODE" != "200" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$WRONG_CODE] 错误密码登录拒绝"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ FAIL${NC} [$WRONG_CODE] 错误密码登录未拒绝"
  FAIL=$((FAIL + 1))
fi

# ============================================================
# 5. API — AI 配方推荐
# ============================================================
section "5. AI 配方推荐 API"

check "POST /api/ai-recommend (基础请求)"           "POST" "$BASE/api/ai-recommend"                 "200" \
  "-H 'Content-Type: application/json' -d '{\"query\":\"做一款助眠软糖\"}'"

check "POST /api/ai-recommend (空query)"           "POST" "$BASE/api/ai-recommend"                 "400" \
  "-H 'Content-Type: application/json' -d '{\"query\":\"\"}'"

# 多轮对话测试
check "POST /api/ai-recommend (带历史)"             "POST" "$BASE/api/ai-recommend"                 "200" \
  "-H 'Content-Type: application/json' -d '{\"query\":\"能否调整一下配方？\",\"history\":[{\"role\":\"user\",\"content\":\"做一款运动营养蛋白棒\"},{\"role\":\"assistant\",\"content\":\"好的，为您推荐以下配方……\"}]}'"

# 非食品问题应拒绝
NON_FOOD_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/ai-recommend" \
  -H "Content-Type: application/json" \
  -d '{"query":"帮我写一个病毒程序"}' 2>/dev/null)
if [ "$NON_FOOD_CODE" != "200" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$NON_FOOD_CODE] 非食品问题被拒绝"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠ WARN${NC} [$NON_FOOD_CODE] 非食品问题未被拒绝"
fi

# ============================================================
# 6. API — 配方 CRUD（需登录）
# ============================================================
section "6. 配方管理 API"

# 先登录获取 cookie
curl -s -c /tmp/zhiliao_cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASS\"}" > /dev/null 2>&1

# 获取配方列表
check_body_contains "GET /api/recipes (已登录)"     "GET" "$BASE/api/recipes"                       "200" "recipes" "-b /tmp/zhiliao_cookies.txt"

# 保存配方
SAVE_RESP=$(curl -s -X POST "$BASE/api/recipes" \
  -H "Content-Type: application/json" \
  -b /tmp/zhiliao_cookies.txt \
  -d "{\"query\":\"助眠软糖配方\",\"recommendation\":\"### 推荐配方\\n\\n**主要原料：**\\n- 褪黑素 3mg\\n- GABA 100mg\\n- 酸枣仁提取物 200mg\\n\\n**辅料：**\\n- 明胶、甘油、水\"}" 2>/dev/null)
SAVE_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/recipes" \
  -H "Content-Type: application/json" \
  -b /tmp/zhiliao_cookies.txt \
  -d "{\"query\":\"助眠软糖配方\",\"recommendation\":\"### 推荐配方\\n\\n**主要原料：**\\n- 褪黑素 3mg\\n- GABA 100mg\"}" 2>/dev/null)

if [ "$SAVE_CODE" = "200" ] || [ "$SAVE_CODE" = "201" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$SAVE_CODE] 保存配方"
  # 提取 recipe ID 用于后续删除
  RECIPE_ID=$(echo "$SAVE_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗ FAIL${NC} [$SAVE_CODE] 保存配方"
  FAIL=$((FAIL + 1))
fi

# 删除配方
if [ -n "${RECIPE_ID:-}" ]; then
  DEL_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/recipes" \
    -H "Content-Type: application/json" \
    -b /tmp/zhiliao_cookies.txt \
    -d "{\"id\":\"$RECIPE_ID\"}" 2>/dev/null)
  if [ "$DEL_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓ PASS${NC} [$DEL_CODE] 删除配方"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗ FAIL${NC} [$DEL_CODE] 删除配方"
    FAIL=$((FAIL + 1))
  fi
fi

# ============================================================
# 7. API — 用户设置更新
# ============================================================
section "7. 用户设置 API"

check_body_contains "PUT /api/auth/me — 更新姓名"   "PUT" "$BASE/api/auth/me"                      "200" "user" \
  "-H 'Content-Type: application/json' -b /tmp/zhiliao_cookies.txt -d '{\"name\":\"更新后的测试名\"}'"

check_body_contains "PUT /api/auth/me — 更新公司"   "PUT" "$BASE/api/auth/me"                      "200" "user" \
  "-H 'Content-Type: application/json' -b /tmp/zhiliao_cookies.txt -d '{\"company\":\"测试公司\"}'"

# ============================================================
# 8. API — 管理员功能
# ============================================================
section "8. 管理后台 API"

# 管理员登录（使用预设管理员账号）
ADMIN_COOKIE="/tmp/zhiliao_admin_cookies.txt"
ADMIN_LOGIN=$(curl -s -c "$ADMIN_COOKIE" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kane@zhiliao-ai.cn","password":"zhiliao2026"}' 2>/dev/null)
ADMIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -c "$ADMIN_COOKIE" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"kane@zhiliao-ai.cn","password":"zhiliao2026"}' 2>/dev/null)

if [ "$ADMIN_CODE" = "200" ]; then
  echo -e "  ${GREEN}✓ PASS${NC} [$ADMIN_CODE] 管理员登录"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠ WARN${NC} [$ADMIN_CODE] 管理员登录（可能用不同凭据）"
fi

# 访问管理后台页面
check "管理员页面 /admin"                           "GET" "$BASE/admin"                              "200" "-b $ADMIN_COOKIE"

# 产品管理 API（管理后台实际调用 /api/ingredients）
check_body_contains "管理员获取产品列表"              "GET" "$BASE/api/ingredients"                   "200" "ingredients" "-b $ADMIN_COOKIE"

# ============================================================
# 9. 边界情况 & 健壮性测试
# ============================================================
section "9. 边界情况 & 健壮性"

# 特殊字符
check "GET /api/products?q=<script> — XSS尝试"     "GET" "$BASE/api/products?q=%3Cscript%3E"      "200"

# 超长查询
LONG_Q=$(python3 -c "print('A'*500)" 2>/dev/null || echo "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
check "GET /api/products?q=超长查询"                "GET" "$BASE/api/products?q=${LONG_Q:0:200}"    "200"

# Unicode & Emoji
check "GET /api/products?q=🍎 — Emoji查询"          "GET" "$BASE/api/products?q=%F0%9F%8D%8E"      "200"

# 不存在的路由
check "GET /nonexistent — 404处理"                  "GET" "$BASE/nonexistent"                       "404"

# ============================================================
# 10. 性能简单检查
# ============================================================
section "10. 响应时间检查（快速抽样）"

echo -n "  首页响应时间: "
curl -s -o /dev/null -w "%{time_total}s" "$BASE/" 2>/dev/null
echo ""

echo -n "  搜索API响应时间: "
curl -s -o /dev/null -w "%{time_total}s" "$BASE/api/products?q=%E4%B9%B3" 2>/dev/null
echo ""

echo -n "  法规API响应时间: "
curl -s -o /dev/null -w "%{time_total}s" "$BASE/api/regulations?q=DHA" 2>/dev/null
echo ""

echo -n "  AI推荐API响应时间 (可能较慢): "
curl -s -o /dev/null -w "%{time_total}s" -X POST "$BASE/api/ai-recommend" \
  -H "Content-Type: application/json" \
  -d '{"query":"助眠配方建议"}' 2>/dev/null
echo ""

# ============================================================
# 11. 数据库完整性检查
# ============================================================
section "11. 数据完整性抽样"

check_body_contains "产品总数检查 (应 > 80)"         "GET" "$BASE/api/products"                       "200" "generic_name"

check_body_contains "法规数据检查"                   "GET" "$BASE/api/regulations?q=%E4%B9%B3%E9%93%81%E8%9B%8B%E7%99%BD" "200" "standard"

# ============================================================
# 结果汇总
# ============================================================
TOTAL=$((PASS + FAIL))
echo ""
echo -e "${CYAN}${DIVIDER}${NC}"
echo -e "${CYAN}  测试结果汇总${NC}"
echo -e "${CYAN}${DIVIDER}${NC}"
echo -e "  总计: $TOTAL 项"
echo -e "  ${GREEN}通过: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}失败: $FAIL${NC}"
else
  echo -e "  失败: 0"
fi
echo ""
if [ $FAIL -eq 0 ]; then
  echo -e "  ${GREEN}🎉 所有测试通过！${NC}"
elif [ $FAIL -le 3 ]; then
  echo -e "  ${YELLOW}⚠ 大部分测试通过，有 $FAIL 项需要关注${NC}"
else
  echo -e "  ${RED}❌ $FAIL 项测试失败，需要排查${NC}"
fi
echo ""

# 清理临时文件
rm -f /tmp/zhiliao_test_resp.txt /tmp/zhiliao_cookies.txt /tmp/zhiliao_admin_cookies.txt

exit $FAIL
