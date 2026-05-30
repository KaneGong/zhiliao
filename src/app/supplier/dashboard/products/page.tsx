"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button, Input, Spinner, Badge } from "../../../components/ui";
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
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/ingredients").then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([auth, ingData, tagData]) => {
      if (!auth.user || (auth.user.role !== "supplier" && auth.user.role !== "admin")) { window.location.href = "/login"; return; }
      setUser(auth.user);
      setAllItems(ingData.ingredients || []);
      setTags(tagData);
      const company = (auth.user.company || "").trim();
      if (!company) setItems([]);
      else setItems((ingData.ingredients || []).filter((i: any) =>
        (i.supplier && i.supplier.trim() === company) ||
        (i.supplier_name && i.supplier_name.includes(company)) ||
        (i.manufacturer && i.manufacturer.includes(company))
      ));
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
    setItems(items.filter((i) => i.id !== id));
  };

  const save = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew ? "/api/ingredients" : `/api/ingredients/${editing.id}`;
    const { _isNew, ...body } = editing;
    if (editing._isNew && user?.company) { body.supplier = user.company; body.supplier_name = user.company; }
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { await refresh(); setEditing(null); setShow(false); }
    else { const e = await r.json(); alert(e.error || "保存失败"); }
  };

  const edit = (item: any) => { setEditing({ ...item }); setShow(true); };
  const add = () => {
    setEditing({ _isNew: true, id: "", product_name: "", supplier_id: "", supplier_name: user?.company || "", manufacturer: "", supplier: user?.company || "", generic_name: "", generic_name_en: "", category: "", source: "", process: "", functional_tags: [], applications: [], certifications: [], key_specs: {}, function: "", mechanism: "", dosage_range: "", clinical_evidence: "", regulatory_status: {}, price_range: null, origin: "", data_source: "", confidence: "medium" });
    setShow(true);
  };

  const tagOpts = (dim: string): string[] => tags?.dimensions?.[dim]?.values || [];
  const filtered = items.filter((i) => !search || i.product_name?.toLowerCase().includes(search.toLowerCase()) || i.generic_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="products-loader"><Spinner className="w-8 h-8 text-amber-400" /></div>;

  return (
    <div className="products-page">
      <div className="products-inner">
        <Link href="/supplier/dashboard" className="back-link"><ArrowLeft className="w-4 h-4" /> 返回工作台</Link>
        <header className="products-hero">
          <div>
            <p className="eyebrow">SUPPLIER PRODUCTS</p>
            <h1>产品管理</h1>
            <p>管理 {user?.company || "贵司"} 的产品，共 {items.length} 个。产品信息会被 AI 推荐、原料库和供应商线索使用。</p>
          </div>
          <button onClick={add} className="primary-btn"><Plus className="w-4 h-4" /> 新增产品</button>
        </header>

        <section className="products-panel">
          <div className="toolbar">
            <div className="search-box"><Search className="w-4 h-4" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索产品、通用名..." /></div>
            <span className="count-chip"><Package className="w-4 h-4" /> {filtered.length} / {items.length}</span>
          </div>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Package className="w-9 h-9" /></div>
              <h2>还没有产品</h2>
              <p>点击“新增产品”添加第一个可被推荐的原料产品。</p>
              <button onClick={add} className="primary-btn"><Plus className="w-4 h-4" /> 新增产品</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>产品名</th><th>通用名</th><th>品类</th><th>厂家</th><th className="right">操作</th></tr></thead>
                <tbody>
                  {filtered.map((i) => (
                    <tr key={i.id}>
                      <td><b>{i.product_name}</b></td>
                      <td>{i.generic_name || "—"}</td>
                      <td><Badge variant="blue">{i.category || "未分类"}</Badge></td>
                      <td>{i.manufacturer || "—"}</td>
                      <td className="right action-cell"><button onClick={() => edit(i)}><Pencil className="w-3.5 h-3.5" />编辑</button><button className="danger" onClick={() => del(i.id)}><Trash2 className="w-3.5 h-3.5" />删除</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {show && editing && (
        <div className="modal-root" onClick={(e) => { if (e.target === e.currentTarget) { setShow(false); setEditing(null); } }}>
          <div className="modal-backdrop" />
          <div className="modal-panel">
            <div className="modal-head"><h2>{editing._isNew ? "新增产品" : `编辑：${editing.product_name}`}</h2><button onClick={() => { setShow(false); setEditing(null); }}><X className="w-4 h-4" /></button></div>
            <div className="modal-body">
              <div className="form-stack">
                <Field label="产品名称 *"><Input value={editing.product_name || ""} onChange={(e) => setEditing({ ...editing, product_name: e.target.value })} placeholder="如: Provon 292" /></Field>
                <div className="form-grid two"><Field label="通用名（中文）"><Input value={editing.generic_name || ""} onChange={(e) => setEditing({ ...editing, generic_name: e.target.value })} /></Field><Field label="通用名（英文）"><Input value={editing.generic_name_en || ""} onChange={(e) => setEditing({ ...editing, generic_name_en: e.target.value })} /></Field></div>
                <SectionTitle>分类信息</SectionTitle>
                <div className="form-grid three"><Field label="品类"><ComboSelect value={editing.category || ""} onChange={(v) => setEditing({ ...editing, category: v })} options={tagOpts("category")} placeholder="选择或输入品类..." /></Field><Field label="来源"><ComboSelect value={editing.source || ""} onChange={(v) => setEditing({ ...editing, source: v })} options={tagOpts("source")} placeholder="选择或输入来源..." /></Field><Field label="工艺/形态"><ComboSelect value={editing.process || ""} onChange={(v) => setEditing({ ...editing, process: v })} options={tagOpts("process")} placeholder="选择或输入工艺..." /></Field></div>
                <SectionTitle>功能与应用</SectionTitle>
                <TagPicker label="功能标签" selected={editing.functional_tags || []} options={tagOpts("functional_tags")} onChange={(v) => setEditing({ ...editing, functional_tags: v })} placeholder="选择功能标签..." />
                <TagPicker label="应用场景" selected={editing.applications || []} options={tagOpts("applications")} onChange={(v) => setEditing({ ...editing, applications: v })} placeholder="选择应用场景..." />
                <SectionTitle>厂家与供应商</SectionTitle>
                <div className="form-grid two"><Field label="生产厂家"><Input value={editing.manufacturer || ""} onChange={(e) => setEditing({ ...editing, manufacturer: e.target.value })} /></Field><Field label="代理商/供应商"><Input value={editing.supplier || ""} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} placeholder={user?.company || "供应商名称"} /></Field></div>
                <SectionTitle>产品详情</SectionTitle>
                <Field label="功能描述"><textarea value={editing.function || ""} onChange={(e) => setEditing({ ...editing, function: e.target.value })} rows={3} /></Field>
                <Field label="作用机理"><textarea value={editing.mechanism || ""} onChange={(e) => setEditing({ ...editing, mechanism: e.target.value })} rows={2} /></Field>
                <div className="form-grid two"><Field label="用量范围"><Input value={editing.dosage_range || ""} onChange={(e) => setEditing({ ...editing, dosage_range: e.target.value })} /></Field><Field label="产地"><Input value={editing.origin || ""} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} /></Field></div>
                <TagPicker label="认证" selected={editing.certifications || []} options={tagOpts("certifications")} onChange={(v) => setEditing({ ...editing, certifications: v })} placeholder="选择认证..." />
              </div>
            </div>
            <div className="modal-actions"><button className="ghost-btn" onClick={() => { setShow(false); setEditing(null); }}>取消</button><Button onClick={save}>保存</Button></div>
          </div>
        </div>
      )}

      <style jsx>{`
        .products-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .products-inner { max-width:1120px; margin:0 auto; padding:32px 24px 72px; }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#7e7464; text-decoration:none; font-size:13px; margin-bottom:24px; }
        .back-link:hover { color:#b8ad9a; }
        .products-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:22px; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        h1 { margin:0 0 10px; color:#f2ede4; font:900 36px/1.12 "Noto Serif SC",serif; }
        .products-hero p { margin:0; max-width:720px; color:#b8ad9a; line-height:1.8; }
        .primary-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; height:42px; padding:0 16px; border:0; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; font-weight:800; cursor:pointer; box-shadow:0 0 22px rgba(240,165,80,.16); white-space:nowrap; }
        .products-panel { border:1px solid rgba(242,237,228,.09); border-radius:15px; background:rgba(25,34,44,.72); overflow:hidden; box-shadow:0 24px 80px rgba(0,0,0,.18); }
        .toolbar { display:flex; justify-content:space-between; align-items:center; gap:14px; padding:16px; border-bottom:1px solid rgba(242,237,228,.09); }
        .search-box { flex:1; display:flex; align-items:center; gap:10px; border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.03); padding:0 12px; color:#7e7464; }
        .search-box input { width:100%; height:42px; border:0; outline:0; background:transparent; color:#f2ede4; }
        .count-chip { display:inline-flex; align-items:center; gap:6px; color:#78a6c8; border:1px solid rgba(120,166,200,.18); background:rgba(120,166,200,.08); border-radius:999px; padding:8px 11px; font-size:12px; font-weight:800; }
        .empty-state { min-height:360px; display:grid; place-items:center; text-align:center; padding:44px; }
        .empty-icon { width:64px;height:64px;border-radius:18px;display:grid;place-items:center;color:#f0a550;background:rgba(240,165,80,.1); margin:auto; }
        .empty-state h2 { color:#f2ede4; font:800 22px/1.2 "Noto Serif SC",serif; margin:18px 0 8px; }
        .empty-state p { color:#b8ad9a; margin:0 0 22px; }
        .table-wrap { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th { color:#7e7464; font:800 11px/1 var(--font-mono); letter-spacing:.1em; text-transform:uppercase; text-align:left; padding:13px 16px; border-bottom:1px solid rgba(242,237,228,.09); background:rgba(255,255,255,.025); }
        td { color:#b8ad9a; padding:14px 16px; border-bottom:1px solid rgba(242,237,228,.06); }
        td b { color:#f2ede4; }
        tr:hover td { background:rgba(255,255,255,.02); }
        .right { text-align:right; }
        .action-cell button { display:inline-flex; align-items:center; gap:4px; border:0; background:transparent; color:#f0a550; cursor:pointer; font-size:12px; margin-left:10px; }
        .action-cell .danger { color:#e07373; }
        .modal-root { position:fixed; inset:0; z-index:80; display:flex; align-items:flex-start; justify-content:center; padding:7vh 20px; overflow:auto; }
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.52); backdrop-filter:blur(10px); }
        .modal-panel { position:relative; width:100%; max-width:920px; border:1px solid rgba(242,237,228,.09); border-radius:16px; background:#141b23; box-shadow:0 30px 100px rgba(0,0,0,.52); overflow:hidden; }
        .modal-head { height:62px; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid rgba(242,237,228,.09); }
        .modal-head h2 { margin:0; color:#f2ede4; font:800 18px/1.2 "Noto Serif SC",serif; }
        .modal-head button { width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:8px;background:rgba(255,255,255,.04);color:#b8ad9a;cursor:pointer; }
        .modal-body { max-height:65vh; overflow:auto; padding:20px; }
        .modal-actions { display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid rgba(242,237,228,.09); background:rgba(255,255,255,.02); }
        .form-stack { display:grid; gap:16px; }
        .form-grid { display:grid; gap:14px; }
        .form-grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .form-grid.three { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .field { display:grid; gap:7px; color:#b8ad9a; }
        .field > span, .section-title { color:#7e7464; font:800 11px/1 var(--font-mono); letter-spacing:.1em; text-transform:uppercase; }
        .section-title { margin:8px 0 0; padding-top:12px; border-top:1px solid rgba(242,237,228,.09); }
        textarea { width:100%; border:1px solid rgba(242,237,228,.08); background:rgba(255,255,255,.03); border-radius:12px; padding:12px; color:#f2ede4; resize:vertical; outline:none; font:inherit; }
        textarea:focus { border-color:rgba(240,165,80,.3); box-shadow:0 0 0 3px rgba(240,165,80,.08); }
        .ghost-btn { min-height:40px; padding:0 15px; border-radius:10px; border:1px solid rgba(242,237,228,.09); background:rgba(255,255,255,.03); color:#b8ad9a; cursor:pointer; }
        .products-loader { min-height:50vh; display:grid; place-items:center; }
        @media (max-width: 720px) { .products-hero,.toolbar { display:grid; align-items:start; } .form-grid.two,.form-grid.three { grid-template-columns:1fr; } h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="section-title">{children}</h3>;
}
