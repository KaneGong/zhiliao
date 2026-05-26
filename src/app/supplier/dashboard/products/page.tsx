"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Input, Select, Spinner, Badge } from "../../../components/ui";
import { ComboSelect } from "../../../components/ComboSelect";
import { TagPicker } from "../../../components/TagPicker";

export default function SupplierProductsPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [tags, setTags] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(r => r.json()),
      fetch("/api/ingredients").then(r => r.json()),
      fetch("/api/tags").then(r => r.json()),
    ]).then(([auth, ingData, tagData]) => {
      if (!auth.user || (auth.user.role !== "supplier" && auth.user.role !== "admin")) {
        window.location.href = "/login"; return;
      }
      setUser(auth.user);
      setAllItems(ingData.ingredients || []);
      setTags(tagData);

      // Filter by supplier's company — only show THEIR products
      const company = (auth.user.company || "").trim();
      if (!company) {
        // New supplier with no company set: show 0 products
        setItems([]);
      } else {
        // Match: product.supplier (agent name) === user.company, OR
        //        product.supplier_name or manufacturer contains user.company
        const filtered = (ingData.ingredients || []).filter((i: any) =>
          (i.supplier && i.supplier.trim() === company) ||
          (i.supplier_name && i.supplier_name.includes(company)) ||
          (i.manufacturer && i.manufacturer.includes(company))
        );
        setItems(filtered);
      }
      setLoading(false);
    });
  }, []);

  const refresh = async () => {
    const r = await fetch("/api/ingredients"); const all = (await r.json()).ingredients || [];
    setAllItems(all);
    const company = (user?.company || "").trim();
    if (!company) { setItems([]); return; }
    setItems(all.filter((i: any) =>
      (i.supplier && i.supplier.trim() === company) ||
      (i.supplier_name && i.supplier_name.includes(company)) ||
      (i.manufacturer && i.manufacturer.includes(company))
    ));
  };

  const del = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await fetch(`/api/ingredients/${id}`, { method: "DELETE" });
    setItems(items.filter(i => i.id !== id));
  };

  const save = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew ? "/api/ingredients" : `/api/ingredients/${editing.id}`;
    const { _isNew, ...body } = editing;
    // Auto-fill supplier info from user's company
    if (editing._isNew && user?.company) {
      body.supplier = user.company;
      body.supplier_name = user.company;
    }
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { await refresh(); setEditing(null); setShow(false); }
    else { const e = await r.json(); alert(e.error || "保存失败"); }
  };

  const edit = (item: any) => { setEditing({ ...item }); setShow(true); };
  const add = () => {
    setEditing({
      _isNew: true, id: "", product_name: "", supplier_id: "", supplier_name: user?.company || "",
      manufacturer: "", supplier: user?.company || "", generic_name: "", generic_name_en: "",
      category: "", source: "", process: "", functional_tags: [], applications: [], certifications: [],
      key_specs: {}, function: "", mechanism: "", dosage_range: "", clinical_evidence: "",
      regulatory_status: {}, price_range: null, origin: "", data_source: "", confidence: "medium"
    });
    setShow(true);
  };

  const tagOpts = (dim: string): string[] => tags?.dimensions?.[dim]?.values || [];
  const filtered = items.filter(i => !search ||
    i.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.generic_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Spinner className="w-8 h-8 text-amber-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/supplier/dashboard" className="text-sm text-amber-400 hover:text-amber-300 mb-2 inline-block">← 返回工作台</Link>
          <h1 className="text-2xl font-bold text-slate-200">产品管理</h1>
          <p className="text-sm text-slate-400 mt-1">管理 {user?.company || "贵司"} 的产品 ({items.length} 个)</p>
        </div>
        <Button onClick={add}>+ 新增产品</Button>
      </div>

      <div className="mb-4">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索产品..." className="max-w-sm" />
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-[var(--bg-surface)] rounded-xl border border-white/[0.06]">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-base font-medium text-slate-200">还没有产品</h3>
          <p className="text-sm text-slate-400 mt-1">点击"新增产品"添加第一个产品</p>
          <Button onClick={add} className="mt-4">+ 新增产品</Button>
        </div>
      ) : (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="text-left px-3 py-2.5 font-medium">产品名</th>
                <th className="text-left px-3 py-2.5 font-medium">通用名</th>
                <th className="text-left px-3 py-2.5 font-medium">品类</th>
                <th className="text-left px-3 py-2.5 font-medium">厂家</th>
                <th className="text-right px-3 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(i => (
                <tr key={i.id} className="hover:bg-white/[0.03]">
                  <td className="px-3 py-2.5 font-medium text-slate-200">{i.product_name}</td>
                  <td className="px-3 py-2.5 text-slate-400">{i.generic_name}</td>
                  <td className="px-3 py-2.5"><Badge variant="blue">{i.category}</Badge></td>
                  <td className="px-3 py-2.5 text-slate-400 text-[11px]">{i.manufacturer || ""}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => edit(i)} className="text-amber-400 hover:text-amber-200 mr-2 text-xs">编辑</button>
                    <button onClick={() => del(i.id)} className="text-red-500 hover:text-red-700 text-xs">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal — same as admin but supplier-scoped */}
      {show && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) { setShow(false); setEditing(null); } }}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <h2 className="text-lg font-bold text-slate-200">{editing._isNew ? "➕ 新增产品" : `✏️ 编辑：${editing.product_name}`}</h2>
              <button onClick={() => { setShow(false); setEditing(null); }} className="w-8 h-8 rounded-lg hover:bg-white/[0.05] text-slate-400">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div><label className="block text-xs font-medium text-slate-300 mb-1">产品名称 <span className="text-red-400">*</span></label><Input value={editing.product_name || ""} onChange={e => setEditing({ ...editing, product_name: e.target.value })} placeholder="如: Provon 292" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-medium text-slate-300 mb-1">通用名（中文）</label><Input value={editing.generic_name || ""} onChange={e => setEditing({ ...editing, generic_name: e.target.value })} placeholder="如: 分离乳清蛋白粉" /></div>
                <div><label className="block text-xs font-medium text-slate-300 mb-1">通用名（英文）</label><Input value={editing.generic_name_en || ""} onChange={e => setEditing({ ...editing, generic_name_en: e.target.value })} placeholder="如: WPI90" /></div>
              </div>
              <div className="border-t pt-4"><h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">分类信息</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">品类</label><ComboSelect value={editing.category || ""} onChange={v => setEditing({ ...editing, category: v })} options={tagOpts("category")} placeholder="选择或输入品类..." /></div>
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">来源</label><ComboSelect value={editing.source || ""} onChange={v => setEditing({ ...editing, source: v })} options={tagOpts("source")} placeholder="选择或输入来源..." /></div>
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">工艺/形态</label><ComboSelect value={editing.process || ""} onChange={v => setEditing({ ...editing, process: v })} options={tagOpts("process")} placeholder="选择或输入工艺..." /></div>
                </div>
              </div>
              <div className="border-t pt-4"><h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">功能与应用</h3>
                <TagPicker label="功能标签" selected={editing.functional_tags || []} options={tagOpts("functional_tags")} onChange={(v: string[]) => setEditing({ ...editing, functional_tags: v })} placeholder="选择功能标签..." />
                <div className="mt-3"><TagPicker label="应用场景" selected={editing.applications || []} options={tagOpts("applications")} onChange={(v: string[]) => setEditing({ ...editing, applications: v })} placeholder="选择应用场景..." /></div>
              </div>
              <div className="border-t pt-4"><h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">厂家与供应商</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">生产厂家</label><Input value={editing.manufacturer || ""} onChange={e => setEditing({ ...editing, manufacturer: e.target.value })} placeholder="如: Glanbia 哥兰比亚（美国）" /></div>
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">代理商/供应商</label><Input value={editing.supplier || ""} onChange={e => setEditing({ ...editing, supplier: e.target.value })} placeholder={user?.company || "供应商名称"} /></div>
                </div>
              </div>
              <div className="border-t pt-4"><h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">产品详情</h3>
                <div><label className="block text-xs font-medium text-slate-300 mb-1">功能描述</label><textarea value={editing.function || ""} onChange={e => setEditing({ ...editing, function: e.target.value })} rows={3} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" placeholder="描述产品的主要功能..." /></div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">用量范围</label><Input value={editing.dosage_range || ""} onChange={e => setEditing({ ...editing, dosage_range: e.target.value })} placeholder="如: 2-5g/天" /></div>
                  <div><label className="block text-xs font-medium text-slate-300 mb-1">产地</label><Input value={editing.origin || ""} onChange={e => setEditing({ ...editing, origin: e.target.value })} placeholder="如: 爱尔兰" /></div>
                </div>
              </div>
              <div><TagPicker label="认证" selected={editing.certifications || []} options={tagOpts("certifications")} onChange={(v: string[]) => setEditing({ ...editing, certifications: v })} placeholder="选择认证..." /></div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.03]/50 rounded-b-2xl">
              <Button variant="secondary" onClick={() => { setShow(false); setEditing(null); }}>取消</Button>
              <Button onClick={save}>💾 保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
