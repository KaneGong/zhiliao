# 知料本地 memory 说明

最后整理：2026-05-28

这里不再保存完整历史 rollout 快照或明文凭据副本。

原因：
- 旧 `docs/memory/*.md` 多数是 Codex Memory 的重复快照，内容过长，容易让新 Agent 读取过量上下文。
- 部分旧快照包含过期部署方式或敏感信息引用，不适合作为项目文档长期保留。
- 当前长期记忆以 `~/.codex/memories/` 为准；需要查历史时从 Codex Memory 检索。

新 Agent 开工顺序：
1. 读取 `AGENTS.md`。
2. 部署相关读取 `docs/deploy.md`。
3. 服务器相关读取 `docs/server-config.md`。
4. 如需历史细节，再检索 `~/.codex/memories/MEMORY.md` 和相关 rollout summaries。

本次清理保留的关键结论已写入：
- `AGENTS.md`
- `docs/deploy.md`
- `docs/SETUP.md`
- `docs/server-config.md`
- Codex Memory ad-hoc note
