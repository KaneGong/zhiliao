import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  icons: { icon: "/icon-light.png", apple: "/icon-light.png" },
  title: "知料 ZhiLiao — AI 驱动的食品原料智能平台",
  description: "知料 ZhiLiao — AI 驱动的食品原料智能平台。基于真实数据与法规，为研发和产品经理提供精准配方方案。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col ">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <img src="/icon-light.png" alt="知料" className="h-8 w-8 mb-3" />
            <p className="text-sm text-slate-500">AI 驱动的食品原料智能平台，连接供应商与食品企业。</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">功能</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/recommend" className="hover:text-slate-300">AI 推荐</Link></li>
              <li><Link href="/search" className="hover:text-slate-300">原料搜索</Link></li>
              <li><Link href="/regulations" className="hover:text-slate-300">法规速查</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">平台</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/register" className="hover:text-slate-300">免费注册</Link></li>
              <li><Link href="/supplier/register" className="hover:text-slate-300">供应商入驻</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">联系</h3>
            <p className="text-sm text-slate-500 mb-1">知料 ZhiLiao</p>
            <a href="mailto:contact@zhiliao-ai.cn" className="text-sm text-amber-400 hover:underline">contact@zhiliao-ai.cn</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} 知料 ZhiLiao. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-slate-400">管理入口</Link>
            <span>仅供参考，不构成商业建议</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
