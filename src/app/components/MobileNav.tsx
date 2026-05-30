"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink { href: string; label: string; }

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-colors" aria-label={open ? "关闭菜单" : "打开菜单"}>
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setOpen(false)} />}

      <div className={`fixed top-16 right-0 w-64 h-[calc(100dvh-4rem)] bg-[#131a25]/95 border-l border-white/[0.08] z-50 transform transition-transform duration-200 ease-out shadow-2xl shadow-black/30 backdrop-blur-xl ${open ? "translate-x-0" : "translate-x-full"}`}>
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-amber-500/10 text-amber-300 border border-amber-500/15" : "text-slate-400 hover:text-slate-300 hover:bg-white/[0.04]"}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
