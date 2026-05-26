"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

  // Search on filter change
  useEffect(() => { handleSearch(); }, [selCat, selTag]);

  // Search on initial URL params
  useEffect(() => {
    const q = searchParams.get("q") || searchParams.get("category");
    if (q) { setQuery(q); handleSearch(); }
  }, []);

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => a.generic_name.localeCompare(b.generic_name, "zh"));
  }, [results]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <h1 className="text-2xl font-bold text-slate-200 mb-1">原料库</h1>
      <p className="text-sm text-slate-500 mb-6">搜索 94 种食品原料，按品类、功能、应用精准筛选</p>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="搜索原料名称、功能、应用..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm bg-[var(--bg-surface)]"/>
        </div>
        <button onClick={handleSearch} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm shadow-sm">搜索</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <select value={selCat} onChange={e => setSelCat(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">全部品类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selTag} onChange={e => setSelTag(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-[var(--bg-surface)] focus:outline-none focus:ring-2 focus:ring-blue-500/20">
          <option value="">全部功能</option>
          {ftags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(selCat || selTag) && <button onClick={() => { setSelCat(""); setSelTag(""); setQuery(""); }}
          className="px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded-lg">清除筛选</button>}
      </div>

      {/* Results */}
      <p className="text-sm text-slate-400 mb-4">{loading ? "搜索中..." : `找到 ${sorted.length} 个产品`}</p>
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5"><Skeleton className="h-5 w-48 mb-3"/><Skeleton className="h-4 w-full"/></div>)}
        </div>
      ) : sorted.length > 0 ? (
        <div className="space-y-2">
          {sorted.map(p => (
            <Link key={p.id} href={`/product/${p.id}`} className="block bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-4 sm:p-5 card-hover">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-slate-200 text-sm sm:text-base">{p.generic_name || p.product_name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{p.product_code}</span>
                  {p.confidence === "high" && <Badge variant="green">高可信度</Badge>}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{p.function}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="blue">{p.category}</Badge>
                  <Badge variant="gray">{p.manufacturer || p.supplier_name}</Badge>
                  {p.supplier && p.supplier !== p.manufacturer && <Badge variant="gray">供: {p.supplier}</Badge>}
                  {p.applications.slice(0, 2).map(a => <Badge key={a}>{a}</Badge>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔍" title="没有找到匹配的产品" description="尝试调整搜索关键词或清除筛选条件" />
      )}
    </div>
  );
}
