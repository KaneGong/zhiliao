"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Spinner } from "../components/ui";


function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderMarkdownLite(markdown: string): string {
  return escapeHtml(markdown)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function renderFormulaBriefHtml(brief: any): string {
  if (!brief || typeof brief !== "object") return "";
  const pb = brief.product_brief || {};
  const score = brief.trust_score || {};
  const routes = Array.isArray(brief.formula_routes) ? brief.formula_routes.slice(0, 3) : [];
  const checks = Array.isArray(brief.compliance_checks) ? brief.compliance_checks.slice(0, 4) : [];
  const suppliers = Array.isArray(brief.supplier_matches) ? brief.supplier_matches.slice(0, 4) : [];
  const list = (items: unknown[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  return `
    <div class="brief-saved">
      <div class="brief-saved-head">
        <div><span>Formula Brief v1</span><h3>${escapeHtml(pb.product_type || "结构化方案包")}</h3><p>${escapeHtml(brief.markdown_summary || score.evidence_summary || "已保存结构化方案。")}</p></div>
        <b>${escapeHtml(score.total_score ?? "--")}</b>
      </div>
      <div class="brief-meta">
        <span>人群：${escapeHtml(pb.target_audience || "待确认")}</span>
        <span>剂型：${escapeHtml(pb.dosage_form || "待确认")}</span>
        <span>路径：${escapeHtml(pb.regulatory_path || "待确认")}</span>
        <span>成本：${escapeHtml(pb.cost_constraint || "待确认")}</span>
      </div>
      <h3>配方路线</h3>
      <div class="brief-routes">${routes.map((r: any) => `<section><b>${escapeHtml(r.route_name || r.route_type)}</b><p>${escapeHtml(r.functional_logic || r.recommendation_reason || "")}</p>${list([...(r.core_ingredients || []), ...(r.supporting_ingredients || [])].slice(0,4).map((i: any) => `${i.name || "原料"}｜${i.suggested_dosage || "用量待确认"}｜${i.regulatory_note || "法规待复核"}`))}</section>`).join("")}</div>
      <h3>合规与表达</h3>
      <div class="brief-checks">${checks.map((c: any) => `<section><b>${escapeHtml(c.check_item || "合规检查")}</b><p>${escapeHtml(c.general_food_allowed || "需复核")}</p>${list([...(c.prohibited_expressions || []), ...(c.human_review_points || [])].slice(0,4))}</section>`).join("")}</div>
      <h3>供应商匹配</h3>
      ${suppliers.length ? list(suppliers.map((m: any) => `${m.ingredient || "原料"}｜${m.supplier_name || "暂无"}｜${m.next_action || "询样/报价"}`)) : '<p>暂无明确平台供应商匹配。</p>'}
    </div>`;
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    const auth = await fetch("/api/auth/me").then((r) => r.json());
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
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return d; }
  };

  return (
    <div className="recipes-page">
      <div className="recipes-inner">
        <header className="recipes-hero">
          <div>
            <p className="eyebrow">SAVED FORMULAS</p>
            <h1>我的配方</h1>
            <p>保存的 AI 推荐方案、法规判断和原料路径。</p>
          </div>
          <Link href="/recommend" className="new-btn"><Plus className="w-4 h-4" /> 新建方案</Link>
        </header>

        {loading ? <div className="loading"><Spinner className="w-8 h-8 text-amber-400" /></div>
        : recipes.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon"><ClipboardList className="w-9 h-9" /></div>
            <h2>还没有保存的配方</h2>
            <p>使用 AI 推荐生成配方方案，然后点击保存。</p>
            <Link href="/recommend" className="new-btn"><Plus className="w-4 h-4" /> 去新建</Link>
          </div>
        ) : (
          <div className="recipe-list">
            {recipes.map((r) => (
              <article key={r.id} className="recipe-card">
                <div className="recipe-head" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                  <div>
                    <h3>{r.query}</h3>
                    <div className="chip-row"><span>{formatDate(r.created_at)}</span>{r.formula_brief && <span className="structured"><ShieldCheck className="w-3 h-3" /> 结构化方案</span>}<span>{expanded === r.id ? "已展开" : "点击查看方案"}</span></div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteRecipe(r.id); }}><Trash2 className="w-4 h-4" /> 删除</button>
                </div>
                {expanded === r.id && (
                  <div
                    className="recipe-body"
                    dangerouslySetInnerHTML={{
                      __html: r.formula_brief
                        ? `${renderFormulaBriefHtml(r.formula_brief)}<div class="legacy-md">${renderMarkdownLite(r.recommendation || "")}</div>`
                        : renderMarkdownLite(r.recommendation || ""),
                    }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <style jsx>{`
        .recipes-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .recipes-inner { max-width:980px; margin:0 auto; padding:44px 24px 72px; }
        .recipes-hero { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:26px; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        h1 { margin:0 0 10px; color:#f2ede4; font:900 36px/1.12 "Noto Serif SC",serif; }
        .recipes-hero p { margin:0; color:#b8ad9a; line-height:1.8; }
        .new-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; height:42px; padding:0 16px; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; text-decoration:none; font-weight:800; box-shadow:0 0 22px rgba(240,165,80,.16); white-space:nowrap; }
        .empty-card,.recipe-card { border:1px solid rgba(242,237,228,.09); border-radius:15px; background:rgba(25,34,44,.72); box-shadow:0 24px 80px rgba(0,0,0,.18); }
        .empty-card { min-height:360px; display:grid; place-items:center; text-align:center; padding:44px; }
        .empty-icon { width:64px;height:64px;border-radius:18px;display:grid;place-items:center;color:#f0a550;background:rgba(240,165,80,.1); margin:auto; }
        .empty-card h2 { color:#f2ede4; font:800 22px/1.2 "Noto Serif SC",serif; margin:18px 0 8px; }
        .empty-card p { color:#b8ad9a; margin:0 0 22px; }
        .recipe-list { display:grid; gap:12px; }
        .recipe-card { overflow:hidden; }
        .recipe-head { display:flex; justify-content:space-between; gap:18px; padding:18px; cursor:pointer; }
        .recipe-head h3 { margin:0 0 10px; color:#f2ede4; font-size:16px; line-height:1.5; }
        .chip-row { display:flex; gap:8px; flex-wrap:wrap; }
        .chip-row span { border:1px solid rgba(242,237,228,.09); border-radius:999px; padding:4px 9px; color:#7e7464; font-size:12px; }
        .recipe-head button { display:flex; align-items:center; gap:5px; align-self:flex-start; border:0; background:transparent; color:#e07373; cursor:pointer; font-size:13px; }
        .recipe-body { border-top:1px solid rgba(242,237,228,.09); padding:18px; color:#b8ad9a; line-height:1.8; font-size:14px; }
        .recipe-body :global(h3) { color:#f2ede4; font-size:16px; margin:16px 0 8px; }
        .recipe-body :global(strong) { color:#f2ede4; }

        .chip-row .structured { display:inline-flex; align-items:center; gap:4px; color:#64b987; border-color:rgba(100,185,135,.18); background:rgba(100,185,135,.06); }
        .recipe-body :global(.brief-saved) { border:1px solid rgba(240,165,80,.13); border-radius:16px; background:rgba(14,18,23,.38); padding:16px; margin-bottom:18px; }
        .recipe-body :global(.brief-saved-head) { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; border-bottom:1px solid rgba(242,237,228,.08); padding-bottom:12px; margin-bottom:12px; }
        .recipe-body :global(.brief-saved-head span) { color:#f0a550; font:800 10px/1 var(--font-mono); letter-spacing:.14em; text-transform:uppercase; }
        .recipe-body :global(.brief-saved-head h3) { margin:6px 0 6px; color:#f2ede4; font-size:18px; }
        .recipe-body :global(.brief-saved-head p) { margin:0; color:#b8ad9a; }
        .recipe-body :global(.brief-saved-head b) { width:56px; height:56px; border-radius:16px; display:grid; place-items:center; color:#f0a550; background:rgba(240,165,80,.09); border:1px solid rgba(240,165,80,.16); font-size:20px; }
        .recipe-body :global(.brief-meta) { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:14px; }
        .recipe-body :global(.brief-meta span) { border:1px solid rgba(242,237,228,.08); border-radius:10px; padding:8px; color:#8f8574; font-size:12px; }
        .recipe-body :global(.brief-routes), .recipe-body :global(.brief-checks) { display:grid; gap:10px; margin-bottom:14px; }
        .recipe-body :global(.brief-routes) { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .recipe-body :global(.brief-routes section), .recipe-body :global(.brief-checks section) { border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.025); padding:12px; }
        .recipe-body :global(.brief-routes b), .recipe-body :global(.brief-checks b) { color:#f2ede4; font-size:13px; }
        .recipe-body :global(.brief-saved ul) { margin:8px 0 0; padding-left:16px; color:#b8ad9a; }
        .recipe-body :global(.legacy-md) { margin-top:14px; opacity:.9; }
        .loading { min-height:280px; display:grid; place-items:center; }
        @media (max-width: 760px) { .recipe-body :global(.brief-meta), .recipe-body :global(.brief-routes) { grid-template-columns:1fr; } }
        @media (max-width: 640px) { .recipes-hero { display:grid; align-items:start; } h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}
