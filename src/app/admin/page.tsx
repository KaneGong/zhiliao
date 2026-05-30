"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Database,
  Home,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Tags,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { TagPicker } from "../components/TagPicker";
import { Button, Input, Spinner } from "../components/ui";
import { ComboSelect } from "../components/ComboSelect";

type Tab = "products" | "suppliers" | "tags" | "import";

const tabs: { key: Tab; label: string; desc: string; Icon: any }[] = [
  { key: "products", label: "产品管理", desc: "原料产品库", Icon: Package },
  { key: "suppliers", label: "供应商管理", desc: "企业与代理品牌", Icon: Building2 },
  { key: "tags", label: "标签管理", desc: "分类维度与语义", Icon: Tags },
  { key: "import", label: "数据导入", desc: "JSON 批量维护", Icon: Upload },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => {
    fetch("/api/admin/auth").then((r) => {
      if (r.ok) setAuthed(true);
    });
  }, []);

  const login = async () => {
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      setAuthed(true);
      setErr("");
    } else setErr("密码错误");
  };

  const logoutAdmin = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
    setPw("");
    setErr("");
  };

  if (!authed) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <div className="auth-mark"><Lock className="w-5 h-5" /></div>
          <p className="eyebrow">ZHILIAO ADMIN</p>
          <h1>管理后台</h1>
          <p className="auth-desc">输入管理密码，进入食品研发数据控制台。</p>
          <div className="auth-form">
            <Input
              className="admin-auth-input"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="输入管理密码"
            />
            {err && <p className="auth-error">{err}</p>}
            <button onClick={login} className="admin-primary-btn auth-submit">进入后台</button>
          </div>
        </div>
        <AdminStyles />
      </div>
    );
  }

  const active = tabs.find((t) => t.key === tab)!;

  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <div className="admin-brand">
          <div className="brand-mark">知</div>
          <div>
            <strong>知料</strong>
            <span>ADMIN CONSOLE</span>
          </div>
        </div>

        <nav className="admin-nav">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "active" : ""}>
              <t.Icon className="w-4 h-4" />
              <div>
                <b>{t.label}</b>
                <small>{t.desc}</small>
              </div>
            </button>
          ))}
        </nav>

        <div className="rail-card">
          <p className="eyebrow">SYSTEM</p>
          <div className="health-row"><span>数据库</span><b>在线</b></div>
          <div className="health-row"><span>管理权限</span><b>已验证</b></div>
          <div className="health-row"><span>控制台</span><b>Ready</b></div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumb">
            <span>知料后台</span><span>/</span><b>{active.label}</b>
          </div>
          <div className="top-actions">
            <button onClick={logoutAdmin} className="top-link top-button"><LogOut className="w-4 h-4" /> 退出后台</button>
            <Link href="/" className="top-link"><Home className="w-4 h-4" /> 返回首页</Link>
          </div>
        </header>

        <section className="admin-content">
          <div className="page-title-row">
            <div>
              <p className="eyebrow">CONTROL SURFACE</p>
              <h1>{active.label}</h1>
              <p>{active.desc}，用于维护知料平台的原料、供应商和分类语义数据。</p>
            </div>
            <div className="title-chip"><ShieldCheck className="w-4 h-4" /> 管理员模式</div>
          </div>

          {tab === "products" && <ProductsTab />}
          {tab === "suppliers" && <SuppliersTab />}
          {tab === "tags" && <TagsTab />}
          {tab === "import" && <ImportTab />}
        </section>
      </main>
      <AdminStyles />
    </div>
  );
}

function StatusPill({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "green" | "blue" | "red" | "violet" }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function ProductsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/ingredients").then((r) => r.json()).then((d) => { setItems(d.ingredients || []); setLoading(false); });
    fetch("/api/tags").then((r) => r.json()).then((d) => setTags(d));
  }, []);

  const refresh = async () => { const r = await fetch("/api/ingredients"); setItems((await r.json()).ingredients || []); };
  const del = async (id: string) => { if (!confirm("确定删除？")) return; await fetch(`/api/ingredients/${id}`, { method: "DELETE" }); setItems(items.filter((i) => i.id !== id)); };
  const save = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew ? "/api/ingredients" : `/api/ingredients/${editing.id}`;
    const { _isNew, ...body } = editing;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { await refresh(); setEditing(null); setShow(false); }
    else { const e = await r.json(); alert(e.error || "保存失败"); }
  };
  const edit = (item: any) => { setEditing({ ...item }); setShow(true); };
  const add = () => {
    setEditing({ _isNew: true, id: "", product_name: "", supplier_id: "", supplier_name: "", manufacturer: "", supplier: "", generic_name: "", generic_name_en: "", category: "", source: "", process: "", functional_tags: [], applications: [], certifications: [], key_specs: {}, function: "", mechanism: "", dosage_range: "", clinical_evidence: "", regulatory_status: {}, price_range: null, origin: "", data_source: "", confidence: "medium" });
    setShow(true);
  };

  const tagOpts = (dim: string): string[] => tags?.dimensions?.[dim]?.values || [];
  const filtered = items.filter((i) => !search || i.product_name?.toLowerCase().includes(search.toLowerCase()) || i.generic_name?.toLowerCase().includes(search.toLowerCase()) || i.supplier_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader />;

  return (
    <div className="console-panel">
      <div className="panel-toolbar">
        <div className="search-box"><Search className="w-4 h-4" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索产品名称、通用名、供应商..." /></div>
        <button onClick={add} className="admin-primary-btn"><Plus className="w-4 h-4" /> 新增产品</button>
      </div>

      <DataTable empty={filtered.length === 0} emptyText="无匹配产品">
        <thead><tr><th>产品名</th><th>通用名</th><th>品类</th><th>厂家</th><th>代理商</th><th className="right">操作</th></tr></thead>
        <tbody>
          {filtered.map((i) => (
            <tr key={i.id}>
              <td><b>{i.product_name}</b></td>
              <td>{i.generic_name}</td>
              <td><StatusPill tone="blue">{i.category || "未分类"}</StatusPill></td>
              <td>{i.manufacturer || i.supplier_name || "—"}</td>
              <td>{i.supplier || "—"}</td>
              <td className="right action-cell"><button onClick={() => edit(i)}><Pencil className="w-3.5 h-3.5" />编辑</button><button className="danger" onClick={() => del(i.id)}><Trash2 className="w-3.5 h-3.5" />删除</button></td>
            </tr>
          ))}
        </tbody>
      </DataTable>

      {show && editing && <ProductModal editing={editing} setEditing={setEditing} onClose={() => { setShow(false); setEditing(null); }} onSave={save} tagOpts={tagOpts} />}
    </div>
  );
}

function ProductModal({ editing, setEditing, onClose, onSave, tagOpts }: any) {
  return (
    <Modal title={editing._isNew ? "新增产品" : `编辑：${editing.product_name}`} onClose={onClose} max="920px">
      <div className="modal-body form-stack">
        <Field label="产品名称 *"><Input value={editing.product_name || ""} onChange={(e) => setEditing({ ...editing, product_name: e.target.value })} placeholder="如: Provon 292" /></Field>
        <div className="form-grid two">
          <Field label="通用名（中文）"><Input value={editing.generic_name || ""} onChange={(e) => setEditing({ ...editing, generic_name: e.target.value })} placeholder="如: 分离乳清蛋白粉" /></Field>
          <Field label="通用名（英文）"><Input value={editing.generic_name_en || ""} onChange={(e) => setEditing({ ...editing, generic_name_en: e.target.value })} placeholder="如: WPI90" /></Field>
        </div>
        <SectionTitle>分类信息</SectionTitle>
        <div className="form-grid three">
          <Field label="品类"><ComboSelect value={editing.category || ""} onChange={(v) => setEditing({ ...editing, category: v })} options={tagOpts("category")} placeholder="选择或输入品类..." /></Field>
          <Field label="来源"><ComboSelect value={editing.source || ""} onChange={(v) => setEditing({ ...editing, source: v })} options={tagOpts("source")} placeholder="选择或输入来源..." /></Field>
          <Field label="工艺/形态"><ComboSelect value={editing.process || ""} onChange={(v) => setEditing({ ...editing, process: v })} options={tagOpts("process")} placeholder="选择或输入工艺..." /></Field>
        </div>
        <SectionTitle>功能与应用</SectionTitle>
        <TagPicker label="功能标签" selected={editing.functional_tags || []} options={tagOpts("functional_tags")} onChange={(v) => setEditing({ ...editing, functional_tags: v })} placeholder="选择功能标签..." />
        <TagPicker label="应用场景" selected={editing.applications || []} options={tagOpts("applications")} onChange={(v) => setEditing({ ...editing, applications: v })} placeholder="选择应用场景..." />
        <SectionTitle>厂家与供应商</SectionTitle>
        <div className="form-grid two">
          <Field label="生产厂家"><Input value={editing.manufacturer || ""} onChange={(e) => setEditing({ ...editing, manufacturer: e.target.value })} /></Field>
          <Field label="代理商/供应商"><Input value={editing.supplier || ""} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} /></Field>
        </div>
        <SectionTitle>产品详情</SectionTitle>
        <Field label="功能描述"><textarea value={editing.function || ""} onChange={(e) => setEditing({ ...editing, function: e.target.value })} rows={3} className="admin-textarea" /></Field>
        <Field label="作用机理"><textarea value={editing.mechanism || ""} onChange={(e) => setEditing({ ...editing, mechanism: e.target.value })} rows={2} className="admin-textarea" /></Field>
        <div className="form-grid two">
          <Field label="用量范围"><Input value={editing.dosage_range || ""} onChange={(e) => setEditing({ ...editing, dosage_range: e.target.value })} /></Field>
          <Field label="产地"><Input value={editing.origin || ""} onChange={(e) => setEditing({ ...editing, origin: e.target.value })} /></Field>
        </div>
        <TagPicker label="认证" selected={editing.certifications || []} options={tagOpts("certifications")} onChange={(v) => setEditing({ ...editing, certifications: v })} placeholder="选择认证..." />
      </div>
      <div className="modal-actions"><button className="ghost-btn" onClick={onClose}>取消</button><button className="admin-primary-btn" onClick={onSave}>保存</button></div>
    </Modal>
  );
}

function SuppliersTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => { fetch("/api/suppliers").then((r) => r.json()).then((d) => { setItems(d.suppliers || []); setLoading(false); }); }, []);
  const refresh = async () => { const r = await fetch("/api/suppliers"); setItems((await r.json()).suppliers || []); };
  const del = async (id: string) => { if (!confirm("确定删除？")) return; await fetch(`/api/suppliers/${id}`, { method: "DELETE" }); setItems(items.filter((s) => s.id !== id)); };
  const save = async () => { if (!edit) return; const m = edit._isNew ? "POST" : "PUT"; const u = edit._isNew ? "/api/suppliers" : `/api/suppliers/${edit.id}`; const { _isNew, ...body } = edit; const r = await fetch(u, { method: m, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); if (r.ok) { await refresh(); setEdit(null); setShow(false); } else { const e = await r.json(); alert(e.error || "保存失败"); } };
  const openEdit = (item?: any) => { setEdit(item ? { ...item } : { _isNew: true, id: "", name: "", name_en: "", description: "", contact: {}, website: "", location: "", brands: [], is_master: false }); setShow(true); };
  if (loading) return <Loader />;

  return (
    <div className="console-panel">
      <div className="panel-toolbar"><div className="panel-count">共 {items.length} 家供应商</div><button onClick={() => openEdit()} className="admin-primary-btn"><Plus className="w-4 h-4" /> 新增供应商</button></div>
      <div className="supplier-grid">
        {items.map((s) => (
          <article key={s.id} className="supplier-card">
            <div className="supplier-head"><div><h3>{s.name}</h3><p>{s.name_en || s.id}</p></div><StatusPill tone={s.is_master ? "green" : "amber"}>{s.is_master ? "MASTER" : "SUPPLIER"}</StatusPill></div>
            <p className="supplier-desc">{s.description || "暂无描述"}</p>
            <div className="tag-row">{(s.brands || []).slice(0, 5).map((b: string) => <StatusPill key={b} tone="blue">{b}</StatusPill>)}</div>
            <div className="card-actions"><button onClick={() => openEdit(s)}><Pencil className="w-3.5 h-3.5" />编辑</button><button className="danger" onClick={() => del(s.id)}><Trash2 className="w-3.5 h-3.5" />删除</button></div>
          </article>
        ))}
      </div>
      {show && edit && <Modal title={edit._isNew ? "新增供应商" : `编辑：${edit.name}`} onClose={() => { setShow(false); setEdit(null); }} max="640px">
        <div className="modal-body form-stack">
          <div className="form-grid two">
            {[{ k: "id", l: "供应商ID" }, { k: "name", l: "中文名称" }, { k: "name_en", l: "英文名称" }, { k: "location", l: "所在地" }, { k: "website", l: "网站" }].map((f) => <Field key={f.k} label={f.l}><Input value={(edit as any)[f.k] || ""} onChange={(e) => setEdit({ ...edit, [f.k]: e.target.value })} /></Field>)}
          </div>
          <Field label="描述"><textarea value={edit.description || ""} onChange={(e) => setEdit({ ...edit, description: e.target.value })} rows={3} className="admin-textarea" /></Field>
          <Field label="代理品牌（逗号分隔）"><Input value={(edit.brands || []).join(", ")} onChange={(e) => setEdit({ ...edit, brands: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })} /></Field>
        </div>
        <div className="modal-actions"><button className="ghost-btn" onClick={() => { setShow(false); setEdit(null); }}>取消</button><button className="admin-primary-btn" onClick={save}>保存</button></div>
      </Modal>}
    </div>
  );
}

function TagsTab() {
  const [tags, setTags] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nv, setNv] = useState({ dimension: "category", value: "" });
  const [ed, setEd] = useState<{ dim: string; old: string; val: string } | null>(null);
  useEffect(() => { fetch("/api/tags").then((r) => r.json()).then((d) => { setTags(d); setLoading(false); }); }, []);
  const addTag = async () => { if (!nv.value.trim()) return; const r = await fetch("/api/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nv) }); if (r.ok) { const d = await r.json(); setTags(d.tags); setNv({ ...nv, value: "" }); } };
  const saveEd = async () => { if (!ed || !ed.val.trim()) return; const r = await fetch("/api/tags", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dimension: ed.dim, oldValue: ed.old, newValue: ed.val }) }); if (r.ok) { const d = await r.json(); setTags(d.tags); setEd(null); } };
  const delTag = async (dim: string, val: string) => { if (!confirm(`删除"${val}"？`)) return; const r = await fetch(`/api/tags?dimension=${encodeURIComponent(dim)}&value=${encodeURIComponent(val)}`, { method: "DELETE" }); if (r.ok) { const d = await r.json(); setTags(d.tags); } };
  if (loading || !tags) return <Loader />;
  return <div className="console-panel">
    <div className="tag-add-panel"><select value={nv.dimension} onChange={(e) => setNv({ ...nv, dimension: e.target.value })}>{Object.entries(tags.dimensions).map(([k, dim]: [string, any]) => <option key={k} value={k}>{dim.label}</option>)}</select><input value={nv.value} onChange={(e) => setNv({ ...nv, value: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="标签名称" /><button className="admin-primary-btn" onClick={addTag}>添加标签</button></div>
    <div className="tag-grid">{Object.entries(tags.dimensions).map(([k, dim]: [string, any]) => <div key={k} className="tag-card"><h3>{dim.label}</h3><div className="tag-list">{dim.values.map((v: string) => { const isEd = ed && ed.dim === k && ed.old === v; if (isEd) return <span key={v} className="tag-edit"><input value={ed!.val} onChange={(e) => setEd({ ...ed!, val: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveEd(); if (e.key === "Escape") setEd(null); }} autoFocus /><button onClick={saveEd}>✓</button><button onClick={() => setEd(null)}>×</button></span>; return <span key={v} className="tag-chip"><button onClick={() => setEd({ dim: k, old: v, val: v })}>✎</button>{v}<button onClick={() => delTag(k, v)}>×</button></span>; })}</div></div>)}</div>
  </div>;
}

function ImportTab() {
  const [json, setJson] = useState("");
  const [result, setResult] = useState("");
  const doImport = async () => { try { const data = JSON.parse(json); const items = Array.isArray(data) ? data : [data]; let s = 0, e = 0; for (const item of items) { const r = await fetch("/api/ingredients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) }); r.ok ? s++ : e++; } setResult(`导入完成: ${s} 成功, ${e} 失败`); } catch (e: any) { setResult(`JSON 错误: ${e.message}`); } };
  return <div className="console-panel import-panel"><p className="panel-count">粘贴 JSON 数组，每个对象需含 id、product_name、supplier_id、generic_name 等字段。</p><textarea value={json} onChange={(e) => setJson(e.target.value)} rows={14} className="code-textarea" placeholder={`[\n  {"id":"NEW-001","product_name":"示例产品"}\n]`} /><div className="import-actions"><button className="admin-primary-btn" onClick={doImport}>开始导入</button>{result && <StatusPill tone={result.includes("错误") || result.includes("失败") ? "red" : "green"}>{result}</StatusPill>}</div></div>;
}

function Loader() { return <div className="loader-wrap"><Spinner className="w-7 h-7 text-amber-400" /></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="admin-field"><span>{label}</span>{children}</label>; }
function SectionTitle({ children }: { children: React.ReactNode }) { return <h3 className="section-title">{children}</h3>; }
function DataTable({ children, empty, emptyText }: { children: React.ReactNode; empty?: boolean; emptyText?: string }) { return <div className="table-wrap"><table>{children}</table>{empty && <div className="empty-table">{emptyText}</div>}</div>; }
function Modal({ title, children, onClose, max = "720px" }: { title: string; children: React.ReactNode; onClose: () => void; max?: string }) { return <div className="modal-root" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}><div className="modal-backdrop" /><div className="modal-panel" style={{ maxWidth: max }}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}><X className="w-4 h-4" /></button></div>{children}</div></div>; }

function AdminStyles() {
  return <style jsx global>{`
    .admin-shell, .admin-auth-page { --bg:#0e1217; --panel:#19222c; --panel-2:#202c37; --line:rgba(242,237,228,.09); --line-strong:rgba(242,237,228,.16); --text:#f2ede4; --muted:#b8ad9a; --dim:#7e7464; --amber:#f0a550; --green:#64b987; --red:#e07373; --blue:#78a6c8; --violet:#b6a0e8; }
    .admin-auth-page { min-height:100vh; display:grid; place-items:center; background: radial-gradient(circle at 20% 8%, rgba(240,165,80,.12), transparent 34%), #0e1217; padding:24px; }
    .admin-auth-card { width:min(390px,100%); padding:34px; border:1px solid var(--line); border-radius:16px; background:rgba(255,255,255,.035); box-shadow:0 24px 80px rgba(0,0,0,.36); }
    .auth-mark { width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#f0a550,#ef7e42);color:white;margin-bottom:18px; }
    .eyebrow { margin:0 0 8px; color:var(--dim); font:600 10px/1 var(--font-mono); letter-spacing:.15em; text-transform:uppercase; }
    .admin-auth-card h1 { margin:0 0 8px; color:var(--text); font:800 26px/1.2 "Noto Serif SC", serif; }
    .auth-desc { color:var(--muted); font-size:14px; line-height:1.7; margin:0 0 22px; }
    .auth-form { display:grid; gap:12px; }
    .admin-auth-input {
      min-height:48px;
      border-color:rgba(242,237,228,.11)!important;
      background:rgba(19,26,37,.9)!important;
      font-size:15px!important;
    }
    .auth-error { color:var(--red); font-size:13px; margin:0; }
    .auth-submit { width:100%; min-height:46px!important; font-size:15px!important; }
    .admin-shell { min-height:100vh; display:grid; grid-template-columns:248px 1fr; color:var(--text); background: linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(180deg, rgba(255,255,255,.015) 1px, transparent 1px), radial-gradient(circle at 16% 4%, rgba(240,165,80,.12), transparent 30%), var(--bg); background-size:64px 64px,64px 64px,auto,auto; }
    .admin-rail { position:sticky; top:0; height:100vh; padding:22px 16px; border-right:1px solid var(--line); background:rgba(14,18,23,.76); backdrop-filter:blur(24px); display:flex; flex-direction:column; gap:22px; }
    .admin-brand { display:flex; gap:12px; align-items:center; padding:4px 6px 14px; border-bottom:1px solid var(--line); }
    .brand-mark { width:38px;height:38px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#f0a550,#ef7e42);color:white;font-family:"Noto Serif SC",serif;font-weight:900;box-shadow:0 0 32px rgba(240,165,80,.2); }
    .admin-brand strong { display:block; font-family:"Noto Serif SC",serif; letter-spacing:.08em; font-size:20px; }
    .admin-brand span { display:block; color:var(--dim); font:500 10px/1.4 var(--font-mono); letter-spacing:.14em; }
    .admin-nav { display:grid; gap:8px; }
    .admin-nav button { width:100%; display:flex; align-items:center; gap:11px; padding:11px 12px; border:1px solid transparent; border-radius:10px; background:transparent; color:var(--muted); text-align:left; transition:.18s ease; }
    .admin-nav button:hover { background:rgba(255,255,255,.04); color:var(--text); }
    .admin-nav button.active { color:var(--text); border-color:rgba(240,165,80,.18); background:rgba(240,165,80,.1); }
    .admin-nav b { display:block; font-size:14px; }
    .admin-nav small { display:block; color:var(--dim); font-size:11px; margin-top:2px; }
    .rail-card { margin-top:auto; border:1px solid var(--line); border-radius:12px; padding:14px; background:rgba(255,255,255,.035); }
    .health-row { display:flex; justify-content:space-between; padding:10px 0 0; margin-top:10px; border-top:1px solid var(--line); color:var(--dim); font-size:13px; }
    .health-row b { color:var(--green); }
    .admin-main { min-width:0; }
    .admin-topbar { height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 28px; border-bottom:1px solid var(--line); background:rgba(14,18,23,.44); backdrop-filter:blur(18px); }
    .breadcrumb { display:flex; gap:10px; color:var(--dim); font-size:14px; }
    .breadcrumb b { color:var(--text); }
    .top-actions { display:flex; align-items:center; gap:10px; }
    .top-link { display:flex; align-items:center; gap:7px; color:var(--muted); font-size:13px; text-decoration:none; border:1px solid var(--line); border-radius:10px; padding:9px 12px; }
    .top-button { background:rgba(255,255,255,.03); cursor:pointer; }
    .top-link:hover { color:var(--text); background:rgba(255,255,255,.04); }
    .admin-content { padding:28px; max-width:1360px; }
    .page-title-row { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:22px; }
    .page-title-row h1 { margin:0 0 8px; font:800 32px/1.15 "Noto Serif SC",serif; color:var(--text); }
    .page-title-row p:not(.eyebrow) { margin:0; color:var(--muted); font-size:14px; line-height:1.6; }
    .title-chip { display:flex; align-items:center; gap:6px; color:var(--green); border:1px solid rgba(100,185,135,.2); background:rgba(100,185,135,.08); border-radius:999px; padding:8px 12px; font-size:13px; white-space:nowrap; }
    .console-panel { border:1px solid var(--line); border-radius:14px; background:rgba(25,34,44,.72); box-shadow:0 24px 80px rgba(0,0,0,.18); overflow:hidden; }
    .panel-toolbar { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:16px; border-bottom:1px solid var(--line); }
    .search-box { flex:1; display:flex; align-items:center; gap:10px; min-width:240px; border:1px solid rgba(242,237,228,.08); background:rgba(255,255,255,.03); border-radius:12px; padding:0 12px; color:var(--dim); }
    .search-box input, .tag-add-panel input, .tag-add-panel select, .code-textarea, .admin-textarea { width:100%; border:0; outline:0; background:transparent; color:var(--text); font:inherit; }
    .search-box input { height:42px; }
    .admin-primary-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:40px; padding:0 15px; border:0; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; font-weight:700; font-size:14px; cursor:pointer; box-shadow:0 0 20px rgba(240,165,80,.12); }
    .admin-primary-btn:hover { transform:translateY(-1px); box-shadow:0 0 30px rgba(240,165,80,.22); }
    .ghost-btn { min-height:40px; padding:0 15px; border-radius:10px; border:1px solid var(--line); background:rgba(255,255,255,.03); color:var(--muted); cursor:pointer; }
    .table-wrap { overflow-x:auto; }
    .table-wrap table { width:100%; border-collapse:collapse; font-size:13px; }
    .table-wrap th { color:var(--dim); font:700 11px/1 var(--font-mono); letter-spacing:.08em; text-transform:uppercase; text-align:left; padding:13px 16px; border-bottom:1px solid var(--line); background:rgba(255,255,255,.025); }
    .table-wrap td { color:var(--muted); padding:14px 16px; border-bottom:1px solid rgba(242,237,228,.06); vertical-align:middle; }
    .table-wrap td b { color:var(--text); }
    .table-wrap tr:hover td { background:rgba(255,255,255,.02); }
    .right { text-align:right!important; }
    .action-cell button, .card-actions button { display:inline-flex; align-items:center; gap:4px; color:var(--amber); background:transparent; border:0; cursor:pointer; font-size:12px; margin-left:10px; }
    .action-cell .danger, .card-actions .danger { color:var(--red); }
    .empty-table { padding:36px; text-align:center; color:var(--dim); }
    .status-pill { display:inline-flex; align-items:center; border-radius:999px; padding:4px 9px; font-size:11px; font-weight:700; border:1px solid; }
    .status-pill.amber { color:#f0a550; background:rgba(240,165,80,.08); border-color:rgba(240,165,80,.18); }
    .status-pill.green { color:#64b987; background:rgba(100,185,135,.08); border-color:rgba(100,185,135,.18); }
    .status-pill.blue { color:#78a6c8; background:rgba(120,166,200,.08); border-color:rgba(120,166,200,.18); }
    .status-pill.red { color:#e07373; background:rgba(224,115,115,.08); border-color:rgba(224,115,115,.18); }
    .status-pill.violet { color:#b6a0e8; background:rgba(182,160,232,.08); border-color:rgba(182,160,232,.18); }
    .modal-root { position:fixed; inset:0; z-index:80; display:flex; align-items:flex-start; justify-content:center; padding:7vh 20px; overflow:auto; }
    .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.52); backdrop-filter:blur(10px); }
    .modal-panel { position:relative; width:100%; border:1px solid var(--line); border-radius:16px; background:#141b23; box-shadow:0 30px 100px rgba(0,0,0,.52); overflow:hidden; }
    .modal-head { height:62px; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid var(--line); }
    .modal-head h2 { margin:0; color:var(--text); font:800 18px/1.2 "Noto Serif SC",serif; }
    .modal-head button { width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:8px;background:rgba(255,255,255,.04);color:var(--muted);cursor:pointer; }
    .modal-body { max-height:65vh; overflow:auto; padding:20px; }
    .modal-actions { display:flex; justify-content:flex-end; gap:10px; padding:14px 20px; border-top:1px solid var(--line); background:rgba(255,255,255,.02); }
    .form-stack { display:grid; gap:16px; }
    .form-grid { display:grid; gap:14px; }
    .form-grid.two { grid-template-columns:repeat(2,minmax(0,1fr)); }
    .form-grid.three { grid-template-columns:repeat(3,minmax(0,1fr)); }
    .admin-field { display:grid; gap:7px; color:var(--muted); }
    .admin-field > span, .section-title { color:var(--dim); font:700 11px/1 var(--font-mono); letter-spacing:.1em; text-transform:uppercase; }
    .section-title { margin:8px 0 0; padding-top:12px; border-top:1px solid var(--line); }
    .admin-textarea, .code-textarea { border:1px solid rgba(242,237,228,.08); background:rgba(255,255,255,.03); border-radius:12px; padding:12px; color:var(--text); resize:vertical; }
    .supplier-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; padding:16px; }
    .supplier-card { border:1px solid var(--line); border-radius:12px; padding:15px; background:rgba(255,255,255,.025); }
    .supplier-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
    .supplier-card h3 { margin:0; color:var(--text); font-size:15px; }
    .supplier-card p { margin:4px 0 0; color:var(--dim); font-size:12px; line-height:1.6; }
    .supplier-desc { min-height:42px; color:var(--muted)!important; margin:12px 0!important; }
    .tag-row,.tag-list { display:flex; flex-wrap:wrap; gap:7px; }
    .card-actions { border-top:1px solid var(--line); margin-top:14px; padding-top:12px; text-align:right; }
    .panel-count { color:var(--muted); font-size:14px; }
    .tag-add-panel { display:grid; grid-template-columns:220px 1fr auto; gap:10px; padding:16px; border-bottom:1px solid var(--line); }
    .tag-add-panel select,.tag-add-panel input { height:40px; border:1px solid rgba(242,237,228,.08); border-radius:12px; padding:0 12px; background:rgba(255,255,255,.03); }
    .tag-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; padding:16px; }
    .tag-card { border:1px solid var(--line); border-radius:12px; padding:14px; background:rgba(255,255,255,.025); }
    .tag-card h3 { margin:0 0 12px; color:var(--text); font:800 15px/1.2 "Noto Serif SC",serif; }
    .tag-chip,.tag-edit { display:inline-flex; align-items:center; gap:5px; border:1px solid var(--line); border-radius:999px; padding:5px 8px; color:var(--muted); font-size:12px; }
    .tag-chip button,.tag-edit button { border:0; background:transparent; color:var(--amber); cursor:pointer; }
    .tag-edit input { width:90px; background:transparent; color:var(--text); border:0; outline:0; }
    .import-panel { padding:16px; display:grid; gap:14px; }
    .code-textarea { font-family:var(--font-mono); font-size:12px; line-height:1.7; min-height:320px; }
    .import-actions { display:flex; align-items:center; gap:12px; }
    .loader-wrap { display:grid; place-items:center; min-height:240px; }
    @media (max-width: 900px) { .admin-shell { grid-template-columns:1fr; } .admin-rail { position:relative; height:auto; } .admin-nav { grid-template-columns:repeat(2,1fr); } .page-title-row,.panel-toolbar { flex-direction:column; align-items:stretch; } .form-grid.two,.form-grid.three,.tag-add-panel { grid-template-columns:1fr; } }
  `}</style>;
}
