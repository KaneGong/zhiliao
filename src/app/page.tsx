import Link from "next/link";
import { getAllProducts } from "@/lib/data";

const categories = [
  { name: "乳清蛋白", icon: "🥛", desc: "浓缩/分离/水解乳清蛋白", gradient: "from-blue-500 to-blue-600" },
  { name: "酪蛋白", icon: "🧀", desc: "酪蛋白、酪蛋白酸盐", gradient: "from-amber-500 to-amber-600" },
  { name: "乳铁蛋白", icon: "🛡️", desc: "免疫调节、铁吸收", gradient: "from-emerald-500 to-emerald-600" },
  { name: "乳矿物盐", icon: "🦴", desc: "骨骼健康、矿物质补充", gradient: "from-stone-500 to-stone-600" },
  { name: "鱼油", icon: "🐟", desc: "Omega-3 EPA/DHA", gradient: "from-cyan-500 to-cyan-600" },
  { name: "藻油", icon: "🌿", desc: "植物源 DHA", gradient: "from-green-500 to-green-600" },
  { name: "胶原蛋白", icon: "✨", desc: "鱼胶原蛋白肽", gradient: "from-pink-500 to-pink-600" },
  { name: "牛初乳", icon: "🐄", desc: "免疫球蛋白 IgG", gradient: "from-orange-500 to-orange-600" },
  { name: "功能性原料", icon: "⚡", desc: "益生菌、后生元等", gradient: "from-violet-500 to-violet-600" },
];

const features = [
  {
    icon: "🤖",
    title: "AI 智能推荐",
    desc: "描述产品需求，AI 从 60+ 原料中匹配最佳方案",
  },
  {
    icon: "📋",
    title: "法规速查",
    desc: "实时检查原料是否符合中国食品安全法规",
  },
  {
    icon: "💰",
    title: "价格参考",
    desc: "提供市场参考价格，辅助采购决策",
  },
];

export default function HomePage() {
  // Get real category stats from data
  const products = getAllProducts();
  const categoryStats = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category.includes(cat.name.replace(/🥛|🧀|🛡️|🦴|🐟|🌿|✨|🐄|⚡/g, "").trim() || cat.name)).length,
  }));

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white">
        {/* Grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6 text-sm text-blue-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AI 驱动的食品原料平台
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              食品原料
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                智能推荐
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              告诉我们你的产品需求，AI 帮你从 60+ 原料中找到最合适的方案。
              <br className="hidden sm:block" />
              同时确保符合中国食品安全法规。
            </p>

            {/* AI Recommend Entry */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-2 max-w-2xl mx-auto">
              <form action="/recommend" method="get" className="flex gap-2">
                <input
                  type="text"
                  name="q"
                  placeholder="描述你的产品需求，如：高蛋白低糖运动饮料..."
                  className="flex-1 px-5 py-3.5 text-white bg-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-blue-200/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25 whitespace-nowrap"
                >
                  AI 推荐
                </button>
              </form>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <Link
                href="/search"
                className="text-blue-300 hover:text-white transition-colors flex items-center gap-1"
              >
                按品类浏览
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <span className="text-white/20">|</span>
              <Link
                href="/regulations"
                className="text-blue-300 hover:text-white transition-colors flex items-center gap-1"
              >
                法规速查
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <span className="text-white/20">|</span>
              <Link
                href="/supplier/register"
                className="text-blue-300 hover:text-white transition-colors flex items-center gap-1"
              >
                供应商入驻
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">原料品类</h2>
            <p className="text-sm text-gray-500 mt-1">浏览 ANG 供应的所有原料品类</p>
          </div>
          <Link
            href="/search"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hidden sm:flex items-center gap-1"
          >
            查看全部
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryStats.map((cat) => (
            <Link
              key={cat.name}
              href={`/search?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 card-hover"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-xl shrink-0 shadow-sm`}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">{cat.count} 个</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {products.length}+
              </div>
              <div className="text-sm text-gray-400 mt-2">原料产品</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                {categories.length}
              </div>
              <div className="text-sm text-gray-400 mt-2">产品品类</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                5+
              </div>
              <div className="text-sm text-gray-400 mt-2">国际品牌</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AI
              </div>
              <div className="text-sm text-gray-400 mt-2">智能推荐</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 md:p-14 text-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              还在为找原料发愁？
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
              输入你的产品需求，AI 帮你从 {products.length}+ 原料中筛选最佳方案，
              并自动检查法规合规性。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/recommend"
                className="px-8 py-3.5 bg-white text-blue-700 font-medium rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                立即试试 AI 推荐
              </Link>
              <Link
                href="/search"
                className="px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                浏览全部原料
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Master Link */}
      <footer className="text-center py-8 text-xs text-gray-400">
        <Link href="/admin" className="hover:text-gray-600 transition-colors">
          管理入口
        </Link>
      </footer>
    </div>
  );
}
