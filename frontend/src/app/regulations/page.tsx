"use client";

import { useState } from "react";
import { Badge, Spinner, EmptyState } from "../components/ui";

interface RegulationCheck {
  ingredient: string;
  standard: string;
  status: "compliant" | "caution" | "not_found" | "restricted";
  detail: string;
  source: string;
}

interface RegulationResult {
  query: string;
  checks: RegulationCheck[];
  disclaimer: string;
}

const statusConfig = {
  compliant: {
    label: "合规",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✅",
    badgeVariant: "green" as const,
  },
  caution: {
    label: "需关注",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "⚠️",
    badgeVariant: "yellow" as const,
  },
  not_found: {
    label: "未找到",
    color: "bg-gray-50 text-gray-600 border-gray-200",
    icon: "❓",
    badgeVariant: "gray" as const,
  },
  restricted: {
    label: "受限",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: "🚫",
    badgeVariant: "red" as const,
  },
};

const popularQueries = [
  "乳铁蛋白",
  "DHA",
  "益生菌",
  "胶原蛋白",
  "β-葡聚糖",
  "乳清蛋白",
];

export default function RegulationsPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RegulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    if (q) setQuery(q);

    setLoading(true);
    try {
      const res = await fetch(
        `/api/regulations?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Regulation search error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          📜 法规速查
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          法规速查
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          输入原料名称或功能声称，快速检查是否符合中国食品安全法规。
          <br />
          涵盖 GB 2760、GB 14880、保健食品原料目录等。
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="输入原料名称，如：乳铁蛋白、DHA、β-葡聚糖..."
              className="w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4 text-white" />
                检查中...
              </span>
            ) : (
              "查询法规"
            )}
          </button>
        </div>

        {/* Quick search tags */}
        {!result && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 mr-1">热门查询：</span>
            {popularQueries.map((pq) => (
              <button
                key={pq}
                onClick={() => handleSearch(pq)}
                className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                {pq}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="fade-in">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              查询「<span className="font-medium text-gray-900">{result.query}</span>」
              — 找到 <span className="font-medium text-gray-900">{result.checks.length}</span> 条法规信息
            </p>
            <button
              onClick={() => { setResult(null); setQuery(""); }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              清除结果
            </button>
          </div>

          {result.checks.length > 0 ? (
            <div className="space-y-4">
              {result.checks.map((check, i) => {
                const cfg = statusConfig[check.status];
                return (
                  <div
                    key={i}
                    className={`rounded-xl border p-6 ${cfg.color} fade-in`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl shrink-0">{cfg.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {check.ingredient}
                          </h3>
                          <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                        </div>
                        <div className="bg-white/60 rounded-lg px-3 py-2 mb-3 inline-block">
                          <p className="text-sm font-medium text-blue-700">
                            {check.standard}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {check.detail}
                        </p>
                        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          来源：{check.source}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="📜"
              title="未找到相关法规信息"
              description="尝试使用更常见的原料名称搜索，或查看下方的参考法规标准"
            />
          )}

          {/* Disclaimer */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ {result.disclaimer}
          </div>
        </div>
      )}

      {/* Reference Standards */}
      {!result && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span>📖</span>
            参考法规标准
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                code: "GB 2760-2024",
                name: "食品添加剂使用标准",
                desc: "规定了食品添加剂的使用范围和限量。",
                color: "from-blue-500 to-blue-600",
              },
              {
                code: "GB 14880-2012",
                name: "食品营养强化剂使用标准",
                desc: "规定了营养强化剂的使用范围和添加量。",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                code: "保健食品原料目录",
                name: "保健食品原料",
                desc: "已纳入保健食品原料目录的原料，可用于保健食品生产。",
                color: "from-amber-500 to-amber-600",
              },
              {
                code: "新食品原料",
                name: "新食品原料公告",
                desc: "经国家卫健委批准的新食品原料，可用于普通食品。",
                color: "from-violet-500 to-violet-600",
              },
            ].map((std) => (
              <div key={std.code} className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${std.color} flex items-center justify-center text-white text-xs font-bold`}>
                    法
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{std.code}</h3>
                    <p className="text-xs text-gray-500">{std.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{std.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
