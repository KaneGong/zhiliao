# 2026-05-25 知料项目目录整理

## 整理内容
- 删除根目录 5 个旧 tar.gz 部署包
- 删除 zhiliao/ 内部 4 个旧 tar.gz
- 删除旧版 zhiliao-mvp-v2 子目录
- 删除全局备份文件（globals-cool-backup.css, ingredients_old_backup.json）
- 9 个历史分析报告移入 docs/archive/
- 2 个旧 HTML 概念文件移入 docs/archive/
- gen_products.py 移入 scripts/
- test-full.sh 移入 zhiliao/scripts/

## 新建文件
- `zhiliao/AGENTS.md` — 完整项目记忆入口（目录结构、技术栈、约定、当前状态）
- `zhiliao/docs/deploy.md` — 部署指南
- `zhiliao/scripts/deploy.sh` — 一键部署脚本（tar+curl）
- `AGENTS.md` — 根目录入口，指向 zhiliao/AGENTS.md

## 整理后结构
```
知料/
├── AGENTS.md              # 根入口
├── docs/archive/          # 历史报告归档
├── zhiliao/               # Next.js 应用
│   ├── AGENTS.md          # ★ Agent 协作入口
│   ├── docs/              # 文档 + deploy.md
│   ├── scripts/           # deploy.sh, gen_products.py, test-full.sh
│   ├── src/               # 源代码
│   └── ...
```

## Agent 开工流程
1. 读取 `zhiliao/AGENTS.md` 获取完整上下文
2. 参考 `zhiliao/docs/deploy.md` 了解部署方式
3. 用 `zhiliao/scripts/deploy.sh` 或手动 tar+curl 部署
