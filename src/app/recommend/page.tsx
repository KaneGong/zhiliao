"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, Spinner, EmptyState } from "../components/ui";

interface RecommendedProduct {
  product_id: string;
  product_name: string;
  category: string;
  supplier: string;
  function: string;
  suggested_dosage?: string;
  price_range?: string;
  regulatory_status?: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

interface RecommendResult {
  recommendations: RecommendedProduct[];
  reasoning: string;
  disclaimer: string;
}

const exampleQueries = [
  { text: "我要做一款高蛋白低糖的运动后恢复饮料", icon: "💪" },
  { text: "开发一款助眠功能软糖，需要安全的原料", icon: "😴" },
  { text: "寻找适合婴幼儿配方的免疫调节原料", icon: "👶" },
  { text: "需要一款能促进骨骼健康的乳制品原料", icon: "🦴" },
  { text: "开发针对中老年人的 Omega-3 功能性食品", icon: "🐟" },
];

export default function RecommendPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        throw new Error("推荐服务暂时不可用");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发生错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const confidenceConfig = {
    high: { label: "高匹配", variant: "green" as const },
    medium: { label: "中匹配", variant: "yellow" as const },
    low: { label: "参考", variant: "gray" as const },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI 智能推荐
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
          描述你的产品需求
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          AI 从 60+ 原料中为你推荐最合适的方案，
          并自动检查法规合规性。
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          placeholder="描述你的产品需求，例如：&#10;• 我要做一款高蛋白低糖的运动后恢复饮料&#10;• 开发一款助眠功能软糖&#10;• 寻找适合婴幼儿配方的免疫调节原料"
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50"
        />
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => handleSubmit()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/25"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                推荐中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                获取推荐方案
              </>
            )}
          </button>
          <span className="text-xs text-gray-400 hidden sm:block">
            ⌘ + Enter 快速提交
          </span>
        </div>
      </div>

      {/* Example Queries */}
      {!result && !loading && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3">
            💡 试试这些需求描述
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {exampleQueries.map((ex) => (
              <button
                key={ex.text}
                onClick={() => {
                  setQuery(ex.text);
                  handleSubmit(ex.text);
                }}
                className="flex items-start gap-3 text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all card-hover"
              >
                <span className="text-lg shrink-0">{ex.icon}</span>
                <span className="text-sm text-gray-700">{ex.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="fade-in">
          {/* Reasoning */}
          {result.reasoning && (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                推荐分析
              </h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {result.reasoning}
              </p>
            </div>
          )}

          {/* Recommendations */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              推荐方案
            </h2>
            <Badge variant="blue">{result.recommendations.length} 个结果</Badge>
          </div>

          <div className="space-y-4">
            {result.recommendations.map((rec, i) => {
              const conf = confidenceConfig[rec.confidence];
              return (
                <div
                  key={rec.product_id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 card-hover"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 text-sm font-bold">
                          {i + 1}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {rec.product_name}
                        </h3>
                        <Badge variant={conf.variant}>{conf.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {rec.function}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">品类</span>
                          <p className="text-sm font-medium text-gray-900">{rec.category}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">供应商</span>
                          <p className="text-sm font-medium text-gray-900">{rec.supplier}</p>
                        </div>
                        {rec.suggested_dosage && (
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">建议用量</span>
                            <p className="text-sm font-medium text-gray-900">{rec.suggested_dosage}</p>
                          </div>
                        )}
                        {rec.price_range && (
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">参考价</span>
                            <p className="text-sm font-bold text-blue-600">¥{rec.price_range}</p>
                          </div>
                        )}
                      </div>
                      {rec.regulatory_status && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          📜 法规状态：{rec.regulatory_status}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/product/${rec.product_id}`}
                      className="shrink-0 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      详情
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                    来源：{rec.source}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ {result.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}
