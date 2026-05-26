"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Input, Spinner, Badge } from "../../../components/ui";

export default function SupplierProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/suppliers").then(r => r.json()),
    ]).then(([auth, supData]) => {
      if (!auth.user || (auth.user.role !== "supplier" && auth.user.role !== "admin")) {
        window.location.href = "/login"; return;
      }
      setUser(auth.user);
      const company = auth.user.company || "";
      const suppliers = supData.suppliers || [];
      const match = suppliers.find((s: any) =>
        s.name === company || s.name_en === company || s.id === company
      );
      if (match) {
        setSupplier({
          ...match,
          contact_email: match.contact?.email || "",
          contact_phone: match.contact?.phone || "",
          contact_person: match.contact?.person || "",
          brands_str: (match.brands || []).join(", "),
        });
      } else {
        // No supplier record yet — create blank form pre-filled with company name
        setSupplier({
          id: company.toLowerCase().replace(/\s+/g, "-"),
          name: company,
          name_en: "",
          description: "",
          contact_email: "",
          contact_phone: "",
          contact_person: "",
          website: "",
          location: "",
          brands_str: "",
          _isNew: true,
        });
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!supplier) return;
    const body = {
      id: supplier.id,
      name: supplier.name,
      name_en: supplier.name_en,
      description: supplier.description,
      contact: { email: supplier.contact_email, phone: supplier.contact_phone, person: supplier.contact_person },
      website: supplier.website,
      location: supplier.location,
      brands: supplier.brands_str.split(",").map((s: string) => s.trim()).filter(Boolean),
      is_master: false,
    };
    const method = supplier._isNew ? "POST" : "PUT";
    const url = supplier._isNew ? "/api/suppliers" : `/api/suppliers/${supplier.id}`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (supplier._isNew) setSupplier({ ...supplier, _isNew: false });
    } else {
      const e = await r.json();
      alert(e.error || "保存失败");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner className="w-8 h-8 text-amber-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="mb-6">
        <Link href="/supplier/dashboard" className="text-sm text-amber-400 hover:text-amber-300 mb-2 inline-block">← 返回工作台</Link>
        <h1 className="text-2xl font-bold text-slate-200">供应商信息</h1>
        <p className="text-sm text-slate-400 mt-1">管理 {user?.company || "贵司"} 的基本信息和联系方式</p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-6 space-y-4">
        {saved && <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">✅ 保存成功</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">供应商ID</label>
            <Input value={supplier?.id || ""} onChange={e => setSupplier({ ...supplier, id: e.target.value })} placeholder="唯一标识" disabled={!supplier?._isNew} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">公司名称 <span className="text-red-400">*</span></label>
            <Input value={supplier?.name || ""} onChange={e => setSupplier({ ...supplier, name: e.target.value })} placeholder="中文名称" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">英文名称</label>
            <Input value={supplier?.name_en || ""} onChange={e => setSupplier({ ...supplier, name_en: e.target.value })} placeholder="English Name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">所在地</label>
            <Input value={supplier?.location || ""} onChange={e => setSupplier({ ...supplier, location: e.target.value })} placeholder="如: 上海" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">网站</label>
            <Input value={supplier?.website || ""} onChange={e => setSupplier({ ...supplier, website: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">联系人</label>
            <Input value={supplier?.contact_person || ""} onChange={e => setSupplier({ ...supplier, contact_person: e.target.value })} placeholder="联系人姓名" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">联系电话</label>
            <Input value={supplier?.contact_phone || ""} onChange={e => setSupplier({ ...supplier, contact_phone: e.target.value })} placeholder="电话" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">邮箱</label>
            <Input type="email" value={supplier?.contact_email || ""} onChange={e => setSupplier({ ...supplier, contact_email: e.target.value })} placeholder="email@company.com" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">公司简介</label>
          <textarea value={supplier?.description || ""} onChange={e => setSupplier({ ...supplier, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="简要描述公司业务和主要产品线..." />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">代理品牌（逗号分隔）</label>
          <Input value={supplier?.brands_str || ""} onChange={e => setSupplier({ ...supplier, brands_str: e.target.value })} placeholder="如: Glanbia, Ingredia, Kerry" />
          {supplier?.brands_str && (
            <div className="flex flex-wrap gap-1 mt-2">
              {supplier.brands_str.split(",").filter(Boolean).map((b: string) => <Badge key={b.trim()} variant="blue">{b.trim()}</Badge>)}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/[0.05]">
          <Button onClick={save}>💾 保存供应商信息</Button>
        </div>
      </div>
    </div>
  );
}
