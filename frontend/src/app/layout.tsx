import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { MobileNav } from "./components/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "知料 ZhiLiao — 食品原料智能平台",
  description:
    "帮食品企业快速找到合适的原料，同时确保符合法规。AI 驱动的食品原料推荐与法规速查平台。",
};

const navLinks = [
  { href: "/search", label: "原料搜索" },
  { href: "/recommend", label: "AI 推荐" },
  { href: "/regulations", label: "法规速查" },
  { href: "/supplier/register", label: "供应商入驻" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  知
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">
                  知料
                  <span className="text-blue-600 ml-0.5">ZhiLiao</span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <MobileNav links={navLinks} />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    知
                  </div>
                  <span className="font-bold text-gray-900">知料 ZhiLiao</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  开放的食品原料智能平台，连接供应商与食品企业。AI 驱动的原料推荐与法规速查。
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  产品功能
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="/search" className="hover:text-gray-900 transition-colors">
                      原料搜索
                    </Link>
                  </li>
                  <li>
                    <Link href="/recommend" className="hover:text-gray-900 transition-colors">
                      AI 智能推荐
                    </Link>
                  </li>
                  <li>
                    <Link href="/regulations" className="hover:text-gray-900 transition-colors">
                      法规速查
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  原料品类
                </h3>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="/search?category=乳清蛋白" className="hover:text-gray-900 transition-colors">
                      乳清蛋白
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?category=鱼油" className="hover:text-gray-900 transition-colors">
                      鱼油 / Omega-3
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?category=胶原蛋白" className="hover:text-gray-900 transition-colors">
                      胶原蛋白
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  联系我们
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  ANG 爱联康营养
                </p>
                <a
                  href="mailto:info@ang-ingredients.com"
                  className="text-sm text-blue-600 hover:underline"
                >
                  info@ang-ingredients.com
                </a>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <p>© {new Date().getFullYear()} 知料 ZhiLiao. All rights reserved.</p>
              <p>仅供参考，不构成商业建议。数据来自公开渠道整理。</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
