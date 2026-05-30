# 知料 Demo-ready 状态记录（2026-05-30）

## 1. 当前结论

截至 2026-05-30 晚，知料线上站点已进入 **Demo-ready v0.1** 状态：核心页面可访问，AI 推荐与法规查询可演示，Formula Brief v1 能输出结构化方案卡片，配方保存与后台基础管理功能已恢复。

线上地址：<https://zhiliao-ai.cn>

当前阶段重点从“功能恢复”切换为：

1. 线上稳定性观察
2. 演示问题与案例准备
3. 真实数据补充
4. 用户体验小步优化

商业验证暂缓，等网站稳定展示后再启动。

---

## 2. 本轮上线范围

### 首页

- 输入框改为更清晰的多行需求输入区域，解决图标、占位文案和输入内容间距不足的问题。
- 右侧静态 Live Formula Engine 改为「示例输出预览」动效演示，明确告诉用户：
  - AI 会理解需求
  - 推荐原料组合
  - 检查合规与风险
  - 给出可信度
  - 支持继续追问
- 文案明确标注“下面是动画演示，不是固定结论”，避免用户误解为真实可操作面板。

### AI 推荐页

- “正在整理结构化方案卡片”状态改为更明显的动态等待提示，表达输出尚未结束。
- AI 助手消息宽度放宽，Formula Brief 卡片获得更多展示空间。
- 三条配方路线卡片重新设计：
  - 路线标签、成本标签更清楚
  - 原料剂量以蓝色胶囊样式突出
  - “作用 / 合规”拆分展示
  - 风险注意点独立成块

### 配方页与后台

- 配方页 CTA 与空状态已优化。
- 管理后台已补充退出功能，登录/退出接口验证通过。

---

## 3. 最近关键提交

- `38dbca5 fix: clarify homepage output preview`
- `a6b53dc fix: polish formula UI states`
- `ce35127 fix: strengthen recipe CTA and admin logout`
- `aa43f9b fix: polish recipe and admin empty states`
- `5cf2944 docs: add deploy readiness checklist`

---

## 4. 部署记录

最近一次部署时间：2026-05-30 19:13-19:15 CST

服务器备份目录：

```text
/opt/zhiliao_backup_20260530_191335
```

部署方式：

1. 本地生成 tar 包，排除 `.env.local`、`.git`、`.next`、`node_modules`、`scripts/auto-research.ts`
2. 上传到服务器 `/tmp/zhiliao-deploy.tar.gz`
3. 服务器保留原 `.env.local`
4. 服务器执行 `npm install` 与 `npm run build`
5. 补齐 Next.js standalone 运行目录
6. `pm2 delete zhiliao` 后重新 `pm2 start node -- /opt/zhiliao/.next/standalone/server.js`
7. `pm2 save`
8. 删除服务器临时部署包

---

## 5. 验证结果

本地验证：

```bash
npm run verify
```

通过。

服务器 smoke：

| 路径 | 结果 |
| --- | --- |
| `/` | 200 |
| `/recommend` | 200 |
| `/regulations` | 200 |
| `/recipes` | 200 |
| `/admin` | 200 |
| `/search` | 200 |

公网 smoke：

| 路径 | 结果 |
| --- | --- |
| `/` | 200 |
| `/recommend` | 200 |
| `/regulations` | 200 |
| `/recipes` | 200 |
| `/admin` | 200 |
| `/search` | 200 |

PM2：`zhiliao online`

---

## 6. 当前已知事项

1. `npm install` 仍提示依赖审计问题：32 vulnerabilities。当前不阻塞 Demo-ready，但后续需要单独安排依赖安全修复。
2. 仓库中 `scripts/auto-research.ts` 为本地未跟踪 helper，不提交、不部署。
3. 当前数据仍以 JSON 文件为主，暂不做数据库迁移。
4. 当前只有 `/recommend` 与 `/regulations` 是对话型 AI 页面；全站 AI 助手暂不做。
5. 商业验证继续暂停，等待用户筛选合适对象和时机。

---

## 7. 下一步分工

### 00-主控

- 推送远端备份
- 维护上线记录和会话记忆
- 验收 01 / 02 会话产出

### 01-Formula Brief

- 做线上/本地 Formula Brief 回归
- 重点检查等待态、卡片排版、保存配方、移动端错位

### 02-数据与案例

- 准备 Demo-ready 问题集
- 输出 `docs/data/demo-question-set-v1.md`
- 标注推荐页面、预期看点、风险和演示备注

### 03-商业验证

- 暂停

---

## 8. 推荐演示路径

1. 首页：展示“输入需求 → 示例输出预览”
2. `/recommend`：输入儿童益生菌或助眠软糖问题
3. 等待 AI 输出正文和结构化 Formula Brief 卡片
4. 保存方案
5. `/recipes` 查看沉淀结果
6. `/regulations` 查询一个法规问题，例如 DHA 或乳铁蛋白相关边界
7. `/admin` 简单展示后台可维护数据入口
