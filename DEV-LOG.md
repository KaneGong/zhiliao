# 知料 ZhiLiao — MVP 开发日志

## 2026-05-08：Phase 1 — MVP 技术框架搭建

### 已完成
1. **项目初始化**
   - Next.js 16 + TypeScript + Tailwind CSS v4 + App Router
   - 安装 lucide-react, class-variance-authority, clsx, tailwind-merge
   - ESLint 配置就绪

2. **TypeScript 类型定义** (`src/types/index.ts`)
   - Product, ProductWithPrice, PricingEntry, PricingData
   - Supplier, Regulation
   - RecommendRequest/Response, SearchFilters/SearchResult

3. **数据层** (`src/lib/data.ts`)
   - ~~从共享 JSON 文件加载产品和价格数据~~ → 已改为 import JSON（2026-05-08 修复 Vercel 构建）
   - 支持关键词搜索、品类/功能/供应商筛选
   - 价格自动匹配（基于产品名/代码模糊匹配）

4. **API Routes**
   - `GET /api/products` — 产品搜索（支持 q/category/function/supplier 参数）
   - `GET /api/products/[id]` — 产品详情
   - `GET /api/filters` — 获取所有筛选选项（品类/功能/供应商）
   - `POST /api/recommend` — AI 推荐（RAG: 关键词匹配 + MiMo API）
   - `GET /api/regulations` — 法规速查（规则引擎）

5. **页面**
   - `/` — 首页（搜索栏 + AI 推荐入口 + 品类导航 + 统计）
   - `/search` — 原料搜索（实时筛选 + 结果列表）
   - `/product/[id]` — 产品详情（完整信息 + 法规状态 + 价格）
   - `/recommend` — AI 推荐（需求输入 + 推荐方案 + 示例）
   - `/regulations` — 法规速查（原料合规检查 + 参考标准）
   - `/supplier/ang` — ANG 供应商信息页

6. **AI 推荐实现**
   - RAG 流程：用户输入 → 关键词匹配产品 → 构建上下文 → 调用 MiMo API
   - 无 API Key 时自动降级为关键词匹配推荐
   - MiMo 调用失败时也有 fallback
   - 幻觉控制：只推荐数据库中的产品

### 技术细节
- 数据源：`shared/products.json`（60+ 产品）+ `shared/pricing.json`（价格）
- AI 模型：MiMo V2.5（通过 XIAOMI_API_KEY 环境变量配置）
- 价格匹配：基于产品名/代码模糊匹配，支持价格区间和阶梯价

### 构建结果（Phase 1）
- ✅ `npm run build` 通过
- TypeScript strict 模式编译无错误

---

## 2026-05-08：Phase 2 — UI 打磨 + 功能完善

### 已完成

1. **全局设计系统升级**
   - 新增 `globals.css`：设计令牌、动画系统（fade-in、shimmer skeleton）、滚动条美化
   - 统一的圆角（12px）、过渡动效、卡片悬停效果
   - 深色 Hero 区域带网格纹理 + 发光效果（Vercel/Linear 风格）

2. **布局重构 (`layout.tsx`)**
   - 毛玻璃效果导航栏（`backdrop-blur`）
   - Logo 改为渐变方块 + 品牌名
   - 导航链接统一圆角 hover 效果
   - Footer 升级为 4 列布局（产品功能 / 原料品类 / 联系我们）

3. **移动端适配**
   - 新增 `MobileNav` 组件：滑出式侧边栏 + 遮罩层
   - 所有页面响应式布局（sm/md/lg 断点）
   - 触摸友好的按钮和链接尺寸

4. **首页重设计 (`page.tsx`)**
   - Hero：深色渐变背景 + 网格纹理 + AI 光晕 + 状态徽章
   - 功能特色条：3 列图标+文字展示
   - 品类卡片：每个品类独立渐变色图标 + 实时产品计数
   - 统计区域：深色背景 + 渐变数字
   - CTA：蓝色渐变卡片 + 双按钮布局

5. **搜索页增强 (`SearchContent.tsx`)**
   - 搜索图标内嵌输入框
   - 新增排序功能（相关度 / 价格↑↓ / 名称）
   - Badge 组件统一标签样式
   - Loading 骨架屏（3 行 shimmer 动画）
   - 空状态组件（图标 + 标题 + 描述）

6. **产品详情页优化 (`product/[id]/page.tsx`)**
   - 面包屑导航改为箭头分隔
   - 新增「联系供应商」邮件按钮（预填主题和产品信息）
   - 侧边栏新增「发送邮件咨询」链接
   - Section/SideCard 加图标
   - 法规状态 labelMap 覆盖更多字段

7. **AI 推荐页美化 (`recommend/page.tsx`)**
   - 顶部徽章 + 更大的标题
   - 输入框区域阴影 + 背景色
   - 快捷键提示（⌘+Enter）
   - 示例查询改为卡片网格（图标+文字）
   - 推荐结果：编号徽章 + 匹配度标签 + 渐变分析卡片

8. **法规速查增强 (`regulations/page.tsx`)**
   - 搜索图标内嵌 + 热门查询标签
   - 结果卡片：左侧状态色背景 + 法规标准高亮块
   - 清除结果按钮
   - 参考法规：每个标准独立渐变色图标卡片

9. **共享 UI 组件 (`components/ui.tsx`)**
   - `Skeleton` — 骨架屏加载
   - `EmptyState` — 空状态展示
   - `Spinner` — 旋转加载指示器
   - `Badge` — 统一标签（6 种颜色变体）
   - `Card` — 可选 hover 效果的卡片
   - `SectionTitle` — 带操作按钮的段落标题
   - `PriceDisplay` — 统一价格展示（3 种尺寸）

10. **部署配置**
    - 创建 `vercel.json`：指定香港/新加坡区域
    - 更新 `next.config.ts`：standalone 输出、图片优化

### 修改的文件
- `src/app/globals.css` — 设计令牌 + 动画
- `src/app/layout.tsx` — 导航 + Footer 重构
- `src/app/page.tsx` — 首页全面重设计
- `src/app/search/SearchContent.tsx` — 搜索排序 + 骨架屏
- `src/app/product/[id]/page.tsx` — 联系供应商 + 布局优化
- `src/app/recommend/page.tsx` — UI 美化
- `src/app/regulations/page.tsx` — 详细结果展示
- `next.config.ts` — 部署配置

### 新建的文件
- `src/app/components/MobileNav.tsx` — 移动端导航
- `src/app/components/ui.tsx` — 共享 UI 组件库
- `vercel.json` — Vercel 部署配置

### 构建结果（Phase 2）
- ✅ `npm run build` 通过
- TypeScript strict 模式编译无错误
- 所有路由正确生成：
  - 静态页：/, /search, /recommend, /regulations, /supplier/ang
  - 动态页：/product/[id]
  - API：/api/products, /api/products/[id], /api/filters, /api/recommend, /api/regulations

### 下一步
- [ ] 配置 XIAOMI_API_KEY 以启用 AI 推荐
- [ ] 导入更多法规数据（目前为简单规则引擎）
- [ ] 产品图片/包装图
- [x] 部署到 Vercel（构建问题已修复）

---

## 2026-05-08：修复 Vercel 部署构建失败

### 问题
Vercel 构建报错：`ENOENT: no such file or directory, open '/Volumes/Mac DiskA/Work/ANG/AI-Consultant/shared/products.json'`

原因：`src/lib/data.ts` 使用 `fs.readFileSync` + `path.join` 读取本地文件系统路径，但 Vercel 服务器上不存在该路径。

### 修复
1. 复制 `shared/products.json` 和 `shared/pricing.json` 到 `src/data/` 目录
2. 重写 `src/lib/data.ts`：用 `import` 替代 `fs.readFileSync`，数据在构建时嵌入
3. 清理 `.env.local` 中的 `PROJECT_ROOT` 环境变量
4. `tsconfig.json` 已有 `resolveJsonModule: true`，无需额外配置

### 验证
- `npm run build` ✅ 编译成功，12 个页面全部生成

---

*最后更新：2026-05-08 16:44*
