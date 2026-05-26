"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Spinner } from "../../components/ui";

export default function SupplierDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<any[]>([]);
  const [supplierInfo, setSupplierInfo] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/ingredients").then(r => r.json()),
      fetch("/api/suppliers").then(r => r.json()),
    ]).then(([auth, ingData, supData]) => {
      if (!auth.user || (auth.user.role !== "supplier" && auth.user.role !== "admin")) window.location.href = "/";
      else {
        setUser(auth.user);
        const company = (auth.user.company || "").trim();
        const allIngredients = ingData.ingredients || [];
        const filtered = company
          ? allIngredients.filter((i: any) =>
              (i.supplier && i.supplier.trim() === company) ||
              (i.supplier_name && i.supplier_name.includes(company)) ||
              (i.manufacturer && i.manufacturer.includes(company))
            )
          : [];
        setItems(filtered);
        const suppliers = supData.suppliers || [];
        const match = suppliers.find((s: any) =>
          s.name === company || s.name_en === company || s.id === company
        );
        setSupplierInfo(match);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner className="w-8 h-8 text-amber-400"/></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-slate-200">供应商工作台</h1><p className="text-sm text-slate-400 mt-1">你好，{user?.name}</p></div>
        <Link href="/supplier/dashboard/products" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-200 rounded-xl hover:from-amber-400 hover:to-orange-400 text-sm font-medium">管理产品 →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[{label:"上架产品",value:items.length.toString(),sub:"个原料产品"},{label:"代理品牌",value:supplierInfo?.brands?.length?.toString() || "—",sub:"个品牌"},{label:"所在地",value:supplierInfo?.location || "—",sub:""}].map(s => (
          <div key={s.label} className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5"><div className="text-xs text-slate-400 mb-1">{s.label}</div><div className="text-2xl font-bold text-slate-200">{s.value}</div><div className="text-xs text-slate-400 mt-1">{s.sub}</div></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5">
          <h2 className="font-semibold text-slate-200 mb-4 text-sm">快捷操作</h2>
          <div className="space-y-2">
            <Link href="/supplier/dashboard/products" className="block px-4 py-3 bg-white/[0.03] rounded-xl hover:bg-orange-500/8 text-sm text-slate-300 hover:text-amber-300 transition-colors">➕ 新增产品</Link>
            <Link href="/supplier/dashboard/products" className="block px-4 py-3 bg-white/[0.03] rounded-xl hover:bg-orange-500/8 text-sm text-slate-300 hover:text-amber-300 transition-colors">📋 管理产品列表</Link>
            <Link href="/supplier/dashboard/profile" className="block px-4 py-3 bg-white/[0.03] rounded-xl hover:bg-orange-500/8 text-sm text-slate-300 hover:text-amber-300 transition-colors">🏢 编辑供应商信息</Link>
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5">
          <h2 className="font-semibold text-slate-200 mb-4 text-sm">入驻信息</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-slate-400">公司：</span><span className="text-slate-300">{supplierInfo?.name || user?.company || "—"}</span></div>
            <div><span className="text-slate-400">英文名：</span><span className="text-slate-300">{supplierInfo?.name_en || "—"}</span></div>
            <div><span className="text-slate-400">代理品牌：</span><span className="text-slate-300">{(supplierInfo?.brands || []).join(", ") || "—"}</span></div>
            <div><span className="text-slate-400">产品数量：</span><span className="text-slate-300">{items.length} 个</span></div>
            <div><span className="text-slate-400">所在地：</span><span className="text-slate-300">{supplierInfo?.location || "—"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
