"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Search, ScrollText, ClipboardList, Settings, LayoutDashboard, LogOut, Menu, X, ChevronDown, Building2 } from "lucide-react";

interface UserInfo { id: string; email: string; name: string; role: string; }

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.user) setUser(d.user); }).catch(() => {}).finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));

  const navLinks = [
    { href: "/recommend", label: "AI 推荐", Icon: Sparkles },
    { href: "/search", label: "原料库", Icon: Search },
    { href: "/regulations", label: "法规", Icon: ScrollText },
    { href: "/recipes", label: "我的配方", Icon: ClipboardList },
  ];

  const consoleLinks = [
    { href: "/supplier/register", label: "供应商入口", Icon: Building2 },
    { href: "/admin", label: "管理入口", Icon: Settings },
  ];

  const linkClass = (href: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive(href)
        ? "text-amber-300 bg-amber-500/10 border border-amber-500/15"
        : "text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.05]" style={{ background: "rgba(15,19,24,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-1 sm:gap-6">
          <Link href="/" className="flex items-center shrink-0">
            <img src="/icon-light.png" alt="知料" className="h-8 w-8" />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)}>
                <l.Icon className="w-4 h-4" strokeWidth={1.5} /> {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: User */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1">
            {consoleLinks.map(l => (
              <Link key={l.href} href={l.href} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors">
                <l.Icon className="w-3.5 h-3.5" strokeWidth={1.5} /> {l.label}
              </Link>
            ))}
          </div>
          {loading ? (
            <div className="h-4 w-14 rounded bg-white/[0.04] animate-pulse hidden sm:block" />
          ) : user ? (
            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.05] hover:text-slate-300 transition-colors">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold">
                  {user.name.charAt(0)}
                </div>
                {user.name}
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-white/[0.08] bg-[#141f2d] py-1.5 shadow-xl backdrop-blur-xl">
                    <Link href="/recipes" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"><ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> 我的配方</Link>
                    <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"><Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> 账号设置</Link>
                    {(user.role === "supplier" || user.role === "admin") && (
                      <Link href="/supplier/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"><LayoutDashboard className="w-3.5 h-3.5" strokeWidth={1.5} /> 供应商后台</Link>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"><Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> 管理后台</Link>
                    )}
                    <hr className="my-1 border-white/[0.06]" />
                    <button onClick={() => { handleLogout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"><LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> 登出</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors">登录</Link>
              <Link href="/register" className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_12px_rgba(240,165,80,0.1)]">注册</Link>
            </div>
          )}
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden rounded-lg p-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]">
            {mobileOpen ? <X className="w-5 h-5" strokeWidth={2} /> : <Menu className="w-5 h-5" strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 top-14 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-50 border-b border-white/[0.06] bg-[#131a25] shadow-2xl md:hidden px-4 py-3 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.04] hover:text-slate-300">
                <l.Icon className="w-4 h-4" strokeWidth={1.5} /> {l.label}
              </Link>
            ))}
            {consoleLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.04] hover:text-slate-300">
                <l.Icon className="w-4 h-4" strokeWidth={1.5} /> {l.label}
              </Link>
            ))}
            <hr className="my-2 border-white/[0.06]" />
            {user ? (
              <>
                <div className="px-3 py-1.5 text-sm font-medium text-slate-400">{user.name}</div>
                <Link href="/recipes" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.04]"><ClipboardList className="w-3.5 h-3.5" strokeWidth={1.5} /> 我的配方</Link>
                {user.role === "admin" && <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/[0.04]"><Settings className="w-3.5 h-3.5" strokeWidth={1.5} /> 管理后台</Link>}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10"><LogOut className="w-3.5 h-3.5" strokeWidth={1.5} /> 登出</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.04] text-center">登录</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center">免费注册</Link>
              </>
            )}
          </div>
        </>
      )}
    </nav>
  );
}
