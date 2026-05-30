"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Trash2, ShieldCheck } from "lucide-react";
import { Spinner } from "../components/ui";
import type { FormulaBrief } from "@/lib/formula-brief";
import FormulaBriefView from "../recommend/components/FormulaBriefView";


function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function splitMarkdownTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

function isMarkdownTableDivider(line: string): boolean {
  const cells = splitMarkdownTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isMarkdownTable(lines: string[], index: number): boolean {
  return (
    index + 1 < lines.length &&
    lines[index].includes("|") &&
    isMarkdownTableDivider(lines[index + 1]) &&
    splitMarkdownTableRow(lines[index]).length === splitMarkdownTableRow(lines[index + 1]).length
  );
}

function renderMarkdownTable(lines: string[], startIndex: number): { html: string; nextIndex: number } {
  const headers = splitMarkdownTableRow(lines[startIndex]);
  const rows: string[][] = [];
  let cursor = startIndex + 2;

  while (cursor < lines.length && lines[cursor].includes("|") && lines[cursor].trim() !== "") {
    const cells = splitMarkdownTableRow(lines[cursor]);
    if (cells.length !== headers.length) break;
    rows.push(cells);
    cursor += 1;
  }

  const head = `<thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  return { html: `<div class="md-table-wrap"><table>${head}${body}</table></div>`, nextIndex: cursor };
}

function renderMarkdownLite(markdown: string): string {
  const lines = String(markdown ?? "").split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInlineMarkdown(paragraph.join(" ").trim())}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isMarkdownTable(lines, i)) {
      flushParagraph();
      flushList();
      const table = renderMarkdownTable(lines, i);
      html.push(table.html);
      i = table.nextIndex - 1;
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      html.push(`<h3>${renderInlineMarkdown(heading[2])}</h3>`);
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      listItems.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return html.join("\n");
}

function renderScoreRing(scoreValue: unknown): string {
  const numericScore = Number(scoreValue);
  const pct = Number.isFinite(numericScore) ? Math.max(0, Math.min(100, Math.round(numericScore))) : 0;
  return `
    <div class="score-ring" style="--score-deg:${pct * 3.6}deg">
      <div class="score-ring-inner">
        <b>${escapeHtml(pct)}</b>
        <span>trust</span>
      </div>
    </div>`;
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
        ${renderScoreRing(score.total_score)}
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
          <Link href="/recommend" className="recipes-primary-action hero-action" aria-label="新建配方方案">
            <Plus className="w-4 h-4" />
            <span>新建方案</span>
          </Link>
        </header>

        {loading ? <div className="loading"><Spinner className="w-8 h-8 text-amber-400" /></div>
        : recipes.length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon"><ClipboardList className="w-9 h-9" /></div>
            <h2>还没有保存的配方</h2>
            <p>使用 AI 推荐生成配方方案，然后点击保存。</p>
            <Link href="/recommend" className="recipes-primary-action empty-action" aria-label="去 AI 推荐新建配方方案">
              <Plus className="w-4 h-4" />
              <span>去新建</span>
            </Link>
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
                  <div className="recipe-body">
                    {r.formula_brief ? (
                      <>
                        <FormulaBriefView brief={r.formula_brief as FormulaBrief} />
                        {r.recommendation && (
                          <details className="legacy-details">
                            <summary>查看原始摘要</summary>
                            <div className="legacy-md" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(r.recommendation || "") }} />
                          </details>
                        )}
                      </>
                    ) : (
                      <div className="legacy-md" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(r.recommendation || "") }} />
                    )}
                  </div>
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
        :global(.recipes-primary-action) {
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-height:46px;
          padding:0 18px;
          border-radius:12px;
          border:1px solid rgba(240,165,80,.34);
          background:linear-gradient(135deg,#f0a550,#ef7e42)!important;
          color:white!important;
          text-decoration:none;
          font-weight:900;
          font-size:15px;
          line-height:1;
          box-shadow:0 14px 34px rgba(240,126,66,.18), inset 0 1px 0 rgba(255,255,255,.18);
          white-space:nowrap;
          transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, filter .18s ease;
        }
        :global(.recipes-primary-action:hover) { transform:translateY(-1px); border-color:rgba(240,165,80,.52); box-shadow:0 18px 42px rgba(240,126,66,.26), inset 0 1px 0 rgba(255,255,255,.22); filter:saturate(1.05); }
        :global(.recipes-primary-action:focus-visible) { outline:2px solid rgba(240,165,80,.5); outline-offset:4px; }
        :global(.recipes-primary-action svg) { flex:0 0 auto; }
        :global(.recipes-primary-action span) { display:inline-block; }
        .hero-action { min-width:136px; }
        .empty-card,.recipe-card { border:1px solid rgba(242,237,228,.09); border-radius:15px; background:rgba(25,34,44,.72); box-shadow:0 24px 80px rgba(0,0,0,.18); }
        .empty-card { min-height:360px; display:grid; place-items:center; text-align:center; padding:44px; }
        .empty-icon { width:64px;height:64px;border-radius:18px;display:grid;place-items:center;color:#f0a550;background:rgba(240,165,80,.1); margin:auto; }
        .empty-card h2 { color:#f2ede4; font:800 22px/1.2 "Noto Serif SC",serif; margin:18px 0 8px; }
        .empty-card p { color:#b8ad9a; margin:0 0 22px; }
        .empty-action { min-width:154px; min-height:48px; }
        .recipe-list { display:grid; gap:12px; }
        .recipe-card { overflow:hidden; }
        .recipe-head { display:flex; justify-content:space-between; gap:18px; padding:18px; cursor:pointer; }
        .recipe-head h3 { margin:0 0 10px; color:#f2ede4; font-size:16px; line-height:1.5; }
        .chip-row { display:flex; gap:8px; flex-wrap:wrap; }
        .chip-row span { border:1px solid rgba(242,237,228,.09); border-radius:999px; padding:4px 9px; color:#7e7464; font-size:12px; }
        .recipe-head button { display:flex; align-items:center; gap:5px; align-self:flex-start; border:0; background:transparent; color:#e07373; cursor:pointer; font-size:13px; }
        .recipe-body { border-top:1px solid rgba(242,237,228,.09); padding:18px; color:#b8ad9a; line-height:1.8; font-size:14px; }
        .recipe-body :global(.legacy-md h3) { color:#f2ede4; font-size:16px; margin:16px 0 8px; }
        .recipe-body :global(.legacy-md strong) { color:#f2ede4; }
        .recipe-body :global(.legacy-md p) { margin:0 0 10px; }
        .recipe-body :global(.legacy-md ul) { margin:8px 0 12px; padding-left:18px; }
        .recipe-body :global(.legacy-md li) { margin:3px 0; }
        .recipe-body :global(.legacy-md .md-table-wrap) { overflow-x:auto; margin:12px 0 16px; border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.02); }
        .recipe-body :global(.legacy-md .md-table-wrap table) { width:100%; border-collapse:collapse; min-width:560px; }
        .recipe-body :global(.legacy-md .md-table-wrap th) { padding:10px 12px; text-align:left; color:#f2ede4; background:rgba(240,165,80,.07); border-bottom:1px solid rgba(242,237,228,.08); font-size:12px; font-weight:800; }
        .recipe-body :global(.legacy-md .md-table-wrap td) { padding:10px 12px; color:#b8ad9a; border-bottom:1px solid rgba(242,237,228,.06); vertical-align:top; }
        .recipe-body :global(.legacy-md .md-table-wrap tr:last-child td) { border-bottom:0; }

        .chip-row .structured { display:inline-flex; align-items:center; gap:4px; color:#64b987; border-color:rgba(100,185,135,.18); background:rgba(100,185,135,.06); }
        .recipe-body :global(.brief-saved) { border:1px solid rgba(240,165,80,.13); border-radius:16px; background:rgba(14,18,23,.38); padding:16px; margin-bottom:18px; }
        .recipe-body :global(.brief-saved-head) { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; border-bottom:1px solid rgba(242,237,228,.08); padding-bottom:12px; margin-bottom:12px; }
        .recipe-body :global(.brief-saved-head span) { color:#f0a550; font:800 10px/1 var(--font-mono); letter-spacing:.14em; text-transform:uppercase; }
        .recipe-body :global(.brief-saved-head h3) { margin:6px 0 6px; color:#f2ede4; font-size:18px; }
        .recipe-body :global(.brief-saved-head p) { margin:0; color:#b8ad9a; }
        .recipe-body :global(.score-ring) { width:64px; height:64px; flex:0 0 auto; display:grid; place-items:center; border-radius:18px; background:conic-gradient(rgba(240,165,80,.95) var(--score-deg), rgba(255,255,255,.06) 0deg); box-shadow:inset 0 0 0 1px rgba(255,255,255,.06); }
        .recipe-body :global(.score-ring-inner) { width:48px; height:48px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; border-radius:14px; background:#121a24; text-align:center; }
        .recipe-body :global(.score-ring-inner b) { color:#fcd34d; font-size:18px; line-height:1; font-weight:900; }
        .recipe-body :global(.score-ring-inner span) { color:#64748b; font:800 8px/1 var(--font-mono); letter-spacing:.18em; text-transform:uppercase; }
        .recipe-body :global(.brief-meta) { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-bottom:14px; }
        .recipe-body :global(.brief-meta span) { border:1px solid rgba(242,237,228,.08); border-radius:10px; padding:8px; color:#8f8574; font-size:12px; }
        .recipe-body :global(.brief-routes), .recipe-body :global(.brief-checks) { display:grid; gap:10px; margin-bottom:14px; }
        .recipe-body :global(.brief-routes) { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .recipe-body :global(.brief-routes section), .recipe-body :global(.brief-checks section) { border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.025); padding:12px; }
        .recipe-body :global(.brief-routes b), .recipe-body :global(.brief-checks b) { color:#f2ede4; font-size:13px; }
        .recipe-body :global(.brief-saved ul) { margin:8px 0 0; padding-left:16px; color:#b8ad9a; }
        .recipe-body :global(.legacy-md) { margin-top:14px; opacity:.9; }
        .legacy-details { margin-top:14px; border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.02); padding:10px 12px; }
        .legacy-details summary { cursor:pointer; color:#8f8574; font-size:12px; font-weight:800; }
        .loading { min-height:280px; display:grid; place-items:center; }
        @media (max-width: 760px) { .recipe-body :global(.brief-meta), .recipe-body :global(.brief-routes) { grid-template-columns:1fr; } }
        @media (max-width: 640px) { .recipes-hero { display:grid; align-items:start; } h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}
