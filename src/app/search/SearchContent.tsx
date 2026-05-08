"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ProductWithPrice } from "@/types";
import { Badge, Card, PriceDisplay, EmptyState, Spinner, Skeleton } from "../components/ui";

interface Filters {
  categories: string[];
  functions: string[];
  suppliers: string[];
}

type SortKey = "relevance" | "price_asc" | "price_desc" | "name";

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [fn, setFn] = useState("");
  const [supplier, setSupplier] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("relevance");
  const [results, setResults] = useState<ProductWithPrice[]>([]);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    functions: [],
    suppliers: [],
  });
  const [loading, setLoading] = useState(false);

  // Load filter options
  useEffect(() => {
    fetch("/api/filters")
      .then((r) => r.json())
      .then(setFilters)
      .catch(console.error);
  }, []);

  // Search
  const doSearch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (fn) params.set("function", fn);
    if (supplier) params.set("supplier", supplier);

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setResults(data.products || []);
    } catch (e) {
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }, [query, category, fn, supplier]);

  useEffect(() => {
    doSearch();
  }, [doSearch]);

  // Sort results
  const sortedResults = useMemo(() => {
    const sorted = [...results];
    switch (sortBy) {
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
        break;
      case "name":
        sorted.sort((a, b) => a.product_name.localeCompare(b.product_name, "zh"));
        break;
      default:
        // relevance = default order
        break;
    }
    return sorted;
  }, [results, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
          原料搜索
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          从 {filters.categories.length} 个品类中搜索你需要的食品原料
        </p>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doSearch()}
              placeholder="搜索原料名称、功能、应用..."
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <button
            onClick={doSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            搜索
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">所有品类</option>
            {filters.categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={fn}
            onChange={(e) => setFn(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">所有功能</option>
            {filters.functions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">所有供应商</option>
            {filters.suppliers.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">排序：</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="relevance">相关度</option>
              <option value="price_asc">价格 ↑</option>
              <option value="price_desc">价格 ↓</option>
              <option value="name">名称</option>
            </select>
          </div>

          {(category || fn || supplier) && (
            <button
              onClick={() => {
                setCategory("");
                setFn("");
                setSupplier("");
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center gap-2">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner className="w-4 h-4" />
            搜索中...
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            找到 <span className="font-medium text-gray-900">{sortedResults.length}</span> 个产品
          </p>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedResults.length > 0 ? (
        <div className="space-y-3">
          {sortedResults.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 sm:p-6 hover:border-blue-300 card-hover"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">
                      {product.product_name}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {product.product_code}
                    </span>
                    {product.confidence === "high" && (
                      <Badge variant="green">高可信度</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.function}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="blue">{product.category}</Badge>
                    <Badge variant="gray">{product.supplier}</Badge>
                    {product.applications.slice(0, 3).map((app) => (
                      <Badge key={app} variant="default">{app}</Badge>
                    ))}
                    {product.applications.length > 3 && (
                      <Badge variant="default">+{product.applications.length - 3}</Badge>
                    )}
                  </div>
                </div>
                <PriceDisplay
                  price={product.price}
                  priceRange={product.price_range}
                  unit={product.price_unit}
                  trend={product.price_trend}
                  size="md"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="没有找到匹配的产品"
          description="尝试调整搜索关键词或筛选条件，或清除筛选查看全部产品"
        />
      )}
    </div>
  );
}
