import Link from "next/link";
import { Search, Package, ScrollText, Sparkles, FlaskConical, ShieldCheck } from "lucide-react";
import AIDemo from "./components/AIDemo";

export default function Home() {
  return (
    <div className="fade-in">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-amber-500/4 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-orange-500/3 blur-[100px]" />
      </div>

      {/* ═══════════════════════════════════════
          ① Hero — 统一 8px 节奏：32→24→40→48
          ═══════════════════════════════════════ */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-1.5 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(240,165,80,0.5)]" />
            <span className="text-slate-400">食品行业 AI 配方研发平台</span>
            <span className="text-slate-500">·</span>
            <span className="text-amber-400 font-medium">B2B</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-200 text-center leading-[1.08] mb-6">
          食品配方研发的
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            AI 引擎
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg text-center leading-relaxed mb-10 max-w-xl mx-auto">
          输入产品需求，AI 即时匹配原料、核查法规、输出完整方案。每一步推理都可溯源。
        </p>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-14">
          <form action="/recommend" method="get">
            <div className="glass-strong rounded-2xl p-[2px] shadow-[0_0_40px_rgba(240,165,80,0.06)]">
              <div className="bg-[#131a25] rounded-2xl p-3 sm:p-3.5 flex gap-3 items-center">
                <Search className="w-5 h-5 text-slate-500 shrink-0 ml-2" strokeWidth={1.5} />
                <input type="text" name="q"
                  placeholder="描述你的产品需求，例如：做一款助眠功能软糖…"
                  className="flex-1 bg-transparent text-slate-300 placeholder:text-slate-500 text-sm sm:text-base py-2.5 focus:outline-none" />
                <button type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all text-sm shadow-[0_0_20px_rgba(240,165,80,0.15)] whitespace-nowrap">
                  开始分析
                </button>
              </div>
            </div>
          </form>
          <p className="mt-4 text-xs text-slate-500 text-center">
            无需注册，直接使用
            <span className="mx-2.5 text-slate-600">·</span>
            <Link href="/regulations" className="text-amber-400 hover:text-amber-300 transition-colors">法规速查</Link>
            <span className="mx-2.5 text-slate-600">·</span>
            <Link href="/search" className="text-amber-400 hover:text-amber-300 transition-colors">浏览原料库</Link>
          </p>
        </div>

        {/* Demo Animation */}
        <AIDemo />
      </section>

      {/* Subtle section divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/[0.04]" />
      </div>

      {/* ═══════════════════════════════════════
          ② 三大能力 — 统一 gap-8、字号提升
          ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-3">从需求到方案，一步到位</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            不再需要手工翻找原料手册、逐条核对法规标准
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: FlaskConical,
              title: "原料智能匹配",
              desc: "输入产品定位与剂型，AI 从原料库中精准筛选，按功能、法规、成本多维度推荐。",
              highlight: "跨功能分类检索",
            },
            {
              icon: ShieldCheck,
              title: "法规自动核查",
              desc: "每条原料自动对照 GB 2760、GB 14880 等国家标准，合规状态与标准编号一目了然。",
              highlight: "标准编号可溯源",
            },
            {
              icon: Sparkles,
              title: "方案即时生成",
              desc: "配方组成 + 添加量建议 + 合规分析 + 供应商对接，完整方案在数十秒内输出。",
              highlight: "AI 推理过程可见",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-6 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-5 border border-amber-500/10 group-hover:border-amber-500/20 transition-all">
                <item.icon className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-slate-200 text-[15px] mb-2.5">{item.title}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-3">{item.desc}</p>
              <span className="text-xs text-amber-400/60 font-medium">{item.highlight}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Subtle section divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/[0.04]" />
      </div>

      {/* ═══════════════════════════════════════
          ③ 为什么可信 — 去掉外层卡片，统一 gap-8
          ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-3">为什么可以信任知料</h2>
          <p className="text-sm text-slate-500">我们提供依据，你做出判断</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: Package,
              title: "数据有来源",
              desc: "每条原料信息来自供应商产品手册与公开标准文件。不编造、不臆测，不确定的信息明确标注。",
            },
            {
              icon: ScrollText,
              title: "法规可溯源",
              desc: "方案中引用的每条法规均标注 GB 标准编号，可自行查证原文。AI 幻觉问题通过约束提示词严格管控。",
            },
            {
              icon: Sparkles,
              title: "AI 辅助 · 人工判断",
              desc: "AI 提供方向与依据，最终配方决策由专业研发人员完成。知料定位为效率工具，而非替代专业判断。",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/10">
                <item.icon className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-semibold text-slate-200 mb-2.5">{item.title}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subtle section divider */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/[0.04]" />
      </div>

      {/* ═══════════════════════════════════════
          ④ CTA
          ═══════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-28 sm:pb-36">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/6 via-orange-500/4 to-amber-500/6" />
          <div className="absolute inset-0 glass" />
          <div className="relative px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-200 mb-4">
              准备好加速你的配方研发了吗？
            </h2>
            <p className="text-sm text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
              免费使用，无需注册。让 AI 处理重复劳动，你专注做决策。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/recommend"
                className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_30px_rgba(240,165,80,0.15)] text-sm">
                立即试用
              </Link>
              <Link href="/register"
                className="px-8 py-3.5 glass-strong text-slate-300 font-medium rounded-xl hover:bg-white/[0.08] transition-all text-sm">
                注册账号
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center pb-10 text-xs text-slate-600">
        <Link href="/admin" className="hover:text-slate-500 transition-colors">管理入口</Link>
      </div>
    </div>
  );
}
