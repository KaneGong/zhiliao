# 知料 ZhiLiao MVP v2 — 部署与验收说明

> **来源：** Claude（架构与代码）
> **部署：** 艾希（运维与验收）
> **日期：** 2026-05-15

---

## 一、部署步骤

### 1. 备份现有代码
```bash
cp -r /opt/zhiliao /opt/zhiliao_backup_$(date +%Y%m%d)
```

### 2. 解压新代码
```bash
cd /opt/zhiliao
tar xzf zhiliao-mvp-v2.tar.gz
```

### 3. 安装新依赖（本次新增了 bcryptjs 和 jsonwebtoken）
```bash
npm install
```

### 4. 生成 Kane 的密码哈希
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('Kane975237',10).then(h=>console.log(h))"
```
把输出的哈希值替换掉 `src/data/users.json` 中 `REPLACE_WITH_BCRYPT_HASH`

### 5. 构建
```bash
npm run build
```

### 6. 重启
```bash
pm2 restart zhiliao
```

### 7. 运行自动化测试
```bash
bash /opt/zhiliao/test.sh
```

---

## 二、验收清单

### 基础页面
- [ ] 首页 http://8.153.99.9/ — 搜索框可用，9大分类卡片可点击，统计数字正确
- [ ] 原料库 /search — 搜索"乳清蛋白"返回结果，筛选下拉有内容
- [ ] 产品详情 /product/GLA-P292 — 厂家显示"Glanbia 哥兰比亚（美国）"，供应商显示"荷兰爱联康营养集团"
- [ ] AI推荐 /recommend — 输入"做一款助眠软糖"能正常返回
- [ ] 法规速查 /regulations — 查询"乳铁蛋白"返回法规信息+分类标签
- [ ] 登录页 /login — 页面正常显示
- [ ] 注册页 /register — 页面正常显示
- [ ] 管理后台 /admin — 密码 zhiliao2026 可登录，产品列表显示94条

### 用户系统
- [ ] 注册 — 填写邮箱+姓名+密码，能成功注册并自动登录
- [ ] 登录 — 注册的账号能登录
- [ ] 导航栏 — 登录后显示用户头像+姓名
- [ ] 登出 — 点击登出后恢复未登录状态
- [ ] 配方页 /recipes — 登录后能访问

### 移动端
- [ ] 手机浏览器访问 — 汉堡菜单可用，页面布局正常

### 数据验证
- [ ] 法规数据库 — 70条，查询"乳清蛋白"不应显示为GB 14880营养强化剂
- [ ] 产品数据库 — 94条，每条有 manufacturer 和 supplier 字段
- [ ] TypeScript build — 零错误

### 防回归
- [ ] AI推荐不误杀"减重"等正常食品关键词
- [ ] 首页字体正常显示（不是Google Fonts）
- [ ] search/SearchContent.tsx 使用 SearchResultItem 类型（不是旧 ProductWithPrice）
- [ ] 法规页面标题是"法规速查"（不是"AI法规速查"）

---

## 三、本次变更说明

**新增文件：**
- `src/lib/auth.ts` — JWT 签发/验证 + bcrypt 密码哈希
- `src/lib/users.ts` — 用户数据读写
- `src/data/users.json` — 用户存储
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/recipes/page.tsx` — 用户配方管理

**新增依赖：**
- `bcryptjs` + `@types/bcryptjs`
- `jsonwebtoken` + `@types/jsonwebtoken`

**法规数据：**
- `src/data/regulations.json` — 从旧版30条（含错误分类）替换为70条已验证数据

**全部重写的文件（设计统一、移动端适配、功能完整）：**
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/search/SearchContent.tsx`
- `src/app/product/[id]/page.tsx`
- `src/app/recommend/page.tsx`
- `src/app/regulations/page.tsx`
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/supplier/dashboard/page.tsx`
- `src/components/Navbar.tsx`
- `src/app/components/ui.tsx`
- `src/app/api/regulations/route.ts`
- `package.json`

---

*部署完成后回复验收结果。*
