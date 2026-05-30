"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Database, Filter, Package, Search, Sparkles } from "lucide-react";
import { Badge, EmptyState, Skeleton } from "../components/ui";

interface Product {
  id: string; product_name: string; generic_name: string; generic_name_en: string;
  supplier_name: string; manufacturer: string; supplier: string;
  category: string; function: string; mechanism: string;
  functional_tags: string[]; applications: string[]; certifications: string[];
  key_specs: Record<string, string | undefined>; dosage_range: string;
  clinical_evidence: string; origin: string; confidence: "high" | "medium" | "low";
  product_code: string;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || searchParams.get("category") || "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [ftags, setFtags] = useState<string[]>([]);
  const [selCat, setSelCat] = useState("");
  const [selTag, setSelTag] = useState("");

  useEffect(() => {
    fetch("/api/filters").then(r => r.json()).then(d => {
      setCategories(d.categories || []);
      setFtags(d.functions || []);
    }).catch(() => {});
  }, []);

  const handleSearch = useCallback(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selCat) params.set("category", selCat);
    if (selTag) params.set("function", selTag);
    if (!query.trim() && !selCat && !selTag) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch { setResults([]); } finally { setLoading(false); }
  }, [query, selCat, selTag]);

  useEffect(() => { handleSearch(); }, [selCat, selTag]);
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("category");
    if (q) { setQuery(q); handleSearch(); }
  }, []);

  const sorted = useMemo(() => [...results].sort((a, b) => a.generic_name.localeCompare(b.generic_name, "zh")), [results]);

  return (
    <div className="zl-workbench-page">
      <div className="zl-workbench-main">
        <div className="zl-workbench-title max-w-7xl mx-auto">
          <div>
            <p className="zl-kicker">INGREDIENT DATABASE</p>
            <h1>原料库</h1>
            <p>围绕功能方向、合规状态、应用剂型和证据等级筛选原料，把搜索变成方案构建。</p>
          </div>
          <span className="zl-title-pill"><Database className="w-4 h-4" /> 94 种原料</span>
        </div>

        <div className="zl-search-shell">
          <aside className="zl-panel">
            <div className="zl-panel-head">
              <p className="zl-kicker">FILTERS</p>
              <h2>筛选</h2>
              <p>候选池控制</p>
            </div>
            <div className="zl-filter-body">
              <label className="zl-field"><span>功能方向</span><select value={selTag} onChange={e => setSelTag(e.target.value)}><option value="">全部功能</option>{ftags.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
              <label className="zl-field"><span>品类</span><select value={selCat} onChange={e => setSelCat(e.target.value)}><option value="">全部品类</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
              {(selCat || selTag || query) && <button onClick={() => { setSelCat(""); setSelTag(""); setQuery(""); setResults([]); }} className="zl-ghost-btn">清除筛选</button>}
              <div className="zl-rail-card">
                <p className="zl-kicker">STATUS</p>
                <p>搜索结果会带出品类、供应商、应用场景和可信度，用于继续进入产品详情。</p>
              </div>
            </div>
          </aside>

          <main className="zl-panel">
            <div className="zl-search-bar">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="搜索原料名称、功能、应用..." className="pl-10" />
              </div>
              <button onClick={handleSearch} className="zl-primary-btn">搜索</button>
            </div>

            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400 m-0">{loading ? "搜索中..." : `找到 ${sorted.length} 个产品`}</p>
              <span className="text-[11px] text-slate-500 font-mono">LIVE INGREDIENT INDEX</span>
            </div>

            {loading ? (
              <div className="zl-result-list">
                {[1,2,3].map(i => <div key={i} className="zl-result-card"><Skeleton className="h-5 w-48 mb-3"/><Skeleton className="h-4 w-full"/></div>)}
              </div>
            ) : sorted.length > 0 ? (
              <div className="zl-result-list">
                {sorted.map(p => (
                  <Link key={p.id} href={`/product/${p.id}`} className="zl-result-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3>{p.generic_name || p.product_name}</h3>
                          <span className="text-xs text-slate-500 font-mono">{p.product_code}</span>
                          {p.confidence === "high" && <Badge variant="green">高可信度</Badge>}
                        </div>
                        <p>{p.function}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <Badge variant="blue">{p.category}</Badge>
                          <Badge variant="gray">{p.manufacturer || p.supplier_name}</Badge>
                          {p.supplier && p.supplier !== p.manufacturer && <Badge variant="gray">供: {p.supplier}</Badge>}
                          {p.applications.slice(0, 2).map(a => <Badge key={a}>{a}</Badge>)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8"><EmptyState icon="🔍" title="没有找到匹配的产品" description="尝试调整搜索关键词或清除筛选条件" /></div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
