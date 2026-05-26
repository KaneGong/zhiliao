"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { EmptyState, Badge, Spinner } from "../components/ui";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    const auth = await fetch("/api/auth/me").then(r => r.json());
    if (!auth.user) { window.location.href = "/login"; return; }
    const res = await fetch("/api/recipes");
    const data = await res.json();
    setRecipes(data.recipes || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const deleteRecipe = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await fetch("/api/recipes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-slate-200">我的配方</h1><p className="text-sm text-slate-400 mt-1">保存的 AI 推荐方案</p></div>
        <Link href="/recommend" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-200 rounded-xl hover:from-amber-400 hover:to-orange-400 text-sm font-medium shadow-sm">🤖 新建方案</Link>
      </div>

      {loading ? <div className="text-center py-16"><Spinner className="w-8 h-8 mx-auto text-amber-400"/></div>
      : recipes.length === 0 ? (
        <EmptyState icon="📋" title="还没有保存的配方" description="使用 AI 推荐生成配方方案，然后点击 💾 保存" action={<Link href="/recommend" className="text-amber-400 font-medium text-sm hover:underline">去新建 →</Link>} />
      ) : (
        <div className="space-y-2">
          {recipes.map(r => (
            <div key={r.id} className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] card-hover">
              <div className="p-4 flex items-start justify-between cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="font-semibold text-slate-200 text-sm">{r.query}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="gray">{formatDate(r.created_at)}</Badge>
                    <Badge variant="green">{expanded === r.id ? "已展开" : "点击查看方案"}</Badge>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteRecipe(r.id); }} className="text-xs text-red-500 hover:text-red-600 shrink-0">删除</button>
              </div>
              {expanded === r.id && (
                <div className="px-4 pb-4 border-t border-white/[0.05] pt-3">
                  <div className="prose-output text-sm text-slate-400" dangerouslySetInnerHTML={{
                    __html: r.recommendation
                      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-slate-200 mt-3 mb-1.5">$1</h3>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-200">$1</strong>')
                      .replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
