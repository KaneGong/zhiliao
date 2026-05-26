"use client";

import { useState, useEffect } from "react";
import { TagPicker } from "../components/TagPicker";
import { Button, Input, Select, Spinner, Badge } from "../components/ui";
import { ComboSelect } from "../components/ComboSelect";

type Tab = "products" | "suppliers" | "tags" | "import";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("products");

  useEffect(() => { fetch("/api/admin/auth").then(r => { if (r.ok) setAuthed(true); }); }, []);

  const login = async () => {
    const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) { setAuthed(true); setErr(""); } else setErr("密码错误");
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-white/[0.03]">
      <div className="bg-[var(--bg-surface)] rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-200 mb-6 text-center">🔐 管理后台</h1>
        <Input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="输入管理密码" />
        {err && <p className="text-red-400 text-xs mt-3">{err}</p>}
        <Button onClick={login} className="w-full mt-4">登录</Button>
      </div>
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [{key:"products",label:"📦 产品管理"},{key:"suppliers",label:"🏢 供应商管理"},{key:"tags",label:"🏷️ 标签管理"},{key:"import",label:"📥 数据导入"}];

  return (
    <div className="min-h-screen bg-white/[0.03]">
      <header className="bg-[var(--bg-surface)] border-b border-white/[0.06] px-6 py-3"><div className="max-w-7xl mx-auto flex items-center justify-between"><h1 className="text-lg font-bold text-slate-200">⚙️ 知料管理后台</h1><a href="/" className="text-sm text-amber-400">← 返回首页</a></div></header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1 mb-6">{tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-[var(--bg-surface)] text-slate-200 shadow-sm" : "text-slate-400 hover:text-slate-300"}`}>{t.label}</button>)}</div>
        {tab === "products" && <ProductsTab />}
        {tab === "suppliers" && <SuppliersTab />}
        {tab === "tags" && <TagsTab />}
        {tab === "import" && <ImportTab />}
      </div>
    </div>
  );
}

function ProductsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetch("/api/ingredients").then(r => r.json()).then(d => { setItems(d.ingredients); setLoading(false); });
    fetch("/api/tags").then(r => r.json()).then(d => setTags(d));
  }, []);

  const refresh = async () => { const r = await fetch("/api/ingredients"); setItems((await r.json()).ingredients); };
  const del = async (id: string) => { if (!confirm("确定删除？")) return; await fetch(`/api/ingredients/${id}`, { method: "DELETE" }); setItems(items.filter(i => i.id !== id)); };
  const save = async () => {
    if (!editing) return;
    const method = editing._isNew ? "POST" : "PUT";
    const url = editing._isNew ? "/api/ingredients" : `/api/ingredients/${editing.id}`;
    const { _isNew, ...body } = editing;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { await refresh(); setEditing(null); setShow(false); } else { const e = await r.json(); alert(e.error || "保存失败"); }
  };
  const edit = (item: any) => { setEditing({ ...item }); setShow(true); };
  const add = () => { setEditing({ _isNew: true, id:"", product_name:"", supplier_id:"", supplier_name:"", manufacturer:"", supplier:"", generic_name:"", generic_name_en:"", category:"", source:"", process:"", functional_tags:[], applications:[], certifications:[], key_specs:{}, function:"", mechanism:"", dosage_range:"", clinical_evidence:"", regulatory_status:{}, price_range:null, origin:"", data_source:"", confidence:"medium" }); setShow(true); };

  const tagOpts = (dim: string): string[] => tags?.dimensions?.[dim]?.values || [];
  const filtered = items.filter(i => !search || i.product_name?.toLowerCase().includes(search.toLowerCase()) || i.generic_name?.toLowerCase().includes(search.toLowerCase()) || i.supplier_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="text-center py-8"><Spinner className="w-6 h-6 mx-auto text-amber-400"/></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索产品名称、通用名、供应商..." className="flex-1" />
        <Button onClick={add}>+ 新增产品</Button>
      </div>
      <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-500"><tr>
            <th className="text-left px-3 py-2.5 font-medium text-sm">产品名</th><th className="text-left px-3 py-2.5 font-medium">通用名</th><th className="text-left px-3 py-2.5 font-medium">品类</th><th className="text-left px-3 py-2.5 font-medium">厂家</th><th className="text-left px-3 py-2.5 font-medium">代理商</th><th className="text-right px-3 py-2.5 font-medium">操作</th>
          </tr></thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filtered.map(i => <tr key={i.id} className="hover:bg-white/[0.03]">
              <td className="px-3 py-2.5 font-medium text-slate-200">{i.product_name}</td>
              <td className="px-3 py-2.5 text-slate-400">{i.generic_name}</td>
              <td className="px-3 py-2.5"><Badge variant="blue">{i.category}</Badge></td>
              <td className="px-3 py-2.5 text-slate-400 text-sm">{i.manufacturer || i.supplier_name}</td>
              <td className="px-3 py-2.5 text-slate-400 text-sm">{i.supplier || ""}</td>
              <td className="px-3 py-2.5 text-right text-sm"><button onClick={() => edit(i)} className="text-amber-400 hover:text-amber-300 mr-2 text-sm">编辑</button><button onClick={() => del(i.id)} className="text-red-400 hover:text-red-400 text-sm">删除</button></td>
            </tr>)}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">无匹配产品</div>}
      </div>

      {/* Edit Modal */}
      {show && editing && <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) { setShow(false); setEditing(null); }}}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]"><h2 className="text-lg font-bold text-slate-200">{editing._isNew ? "➕ 新增产品" : `✏️ 编辑：${editing.product_name}`}</h2><button onClick={() => { setShow(false); setEditing(null); }} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] text-slate-400">✕</button></div>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            <div><label className="block text-sm font-medium text-slate-300 mb-1">产品名称 <span className="text-red-400">*</span></label><Input value={editing.product_name||""} onChange={e => setEditing({...editing, product_name: e.target.value})} placeholder="如: Provon 292"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-slate-300 mb-1">通用名（中文）</label><Input value={editing.generic_name||""} onChange={e => setEditing({...editing, generic_name:e.target.value})} placeholder="如: 分离乳清蛋白粉"/></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-1">通用名（英文）</label><Input value={editing.generic_name_en||""} onChange={e => setEditing({...editing, generic_name_en:e.target.value})} placeholder="如: WPI90"/></div>
            </div>
            <div className="border-t pt-4"><h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">分类信息</h3>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">品类</label><ComboSelect value={editing.category||""} onChange={v => setEditing({...editing, category:v})} options={tagOpts("category")} placeholder="选择或输入品类..."/></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">来源</label><ComboSelect value={editing.source||""} onChange={v => setEditing({...editing, source:v})} options={tagOpts("source")} placeholder="选择或输入来源..."/></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">工艺/形态</label><ComboSelect value={editing.process||""} onChange={v => setEditing({...editing, process:v})} options={tagOpts("process")} placeholder="选择或输入工艺..."/></div>
              </div>
            </div>
            <div className="border-t pt-4"><h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">功能与应用</h3>
              <TagPicker label="功能标签" selected={editing.functional_tags||[]} options={tagOpts("functional_tags")} onChange={v => setEditing({...editing, functional_tags:v})} placeholder="选择功能标签..." />
              <div className="mt-3"><TagPicker label="应用场景" selected={editing.applications||[]} options={tagOpts("applications")} onChange={v => setEditing({...editing, applications:v})} placeholder="选择应用场景..." /></div>
            </div>
            <div className="border-t pt-4"><h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">厂家与供应商</h3>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">生产厂家</label><Input value={editing.manufacturer||""} onChange={e => setEditing({...editing, manufacturer:e.target.value})} placeholder="如: Glanbia 哥兰比亚（美国）"/></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">代理商/供应商</label><Input value={editing.supplier||""} onChange={e => setEditing({...editing, supplier:e.target.value})} placeholder="如: 荷兰爱联康营养集团"/></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">供应商名称</label><Input value={editing.supplier_name||""} onChange={e => setEditing({...editing, supplier_name:e.target.value})} placeholder="如: Glanbia 哥兰比亚"/></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">供应商ID</label><Input value={editing.supplier_id||""} onChange={e => setEditing({...editing, supplier_id:e.target.value})} placeholder="如: glanbia"/></div>
              </div>
            </div>
            <div className="border-t pt-4"><h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">产品详情</h3>
              <div><label className="block text-sm font-medium text-slate-300 mb-1">功能描述</label><textarea value={editing.function||""} onChange={e => setEditing({...editing, function:e.target.value})} rows={3} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500/20" placeholder="描述产品的主要功能..."/></div>
              <div className="mt-3"><label className="block text-sm font-medium text-slate-300 mb-1">作用机理</label><textarea value={editing.mechanism||""} onChange={e => setEditing({...editing, mechanism:e.target.value})} rows={2} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500/20" placeholder="描述作用机理..."/></div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div><label className="block text-sm font-medium text-slate-300 mb-1">用量范围</label><Input value={editing.dosage_range||""} onChange={e => setEditing({...editing, dosage_range:e.target.value})} placeholder="如: 2-5g/天"/></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-1">产地</label><Input value={editing.origin||""} onChange={e => setEditing({...editing, origin:e.target.value})} placeholder="如: 爱尔兰"/></div>
              </div>
            </div>
            <div><TagPicker label="认证" selected={editing.certifications||[]} options={tagOpts("certifications")} onChange={v => setEditing({...editing, certifications:v})} placeholder="选择认证..." /></div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.02] rounded-b-2xl">
            <Button variant="secondary" onClick={() => { setShow(false); setEditing(null); }}>取消</Button>
            <Button onClick={save}>💾 保存</Button>
          </div>
        </div>
      </div>}
    </div>
  );
}

function SuppliersTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => { fetch("/api/suppliers").then(r=>r.json()).then(d=>{setItems(d.suppliers);setLoading(false);}); },[]);
  const refresh = async () => { const r = await fetch("/api/suppliers"); setItems((await r.json()).suppliers); };
  const del = async (id:string) => { if(!confirm("确定删除？")) return; await fetch(`/api/suppliers/${id}`,{method:"DELETE"}); setItems(items.filter(s=>s.id!==id)); };
  const save = async () => { if(!edit) return; const m = edit._isNew?"POST":"PUT"; const u = edit._isNew?"/api/suppliers":`/api/suppliers/${edit.id}`; const {_isNew,...body}=edit; const r=await fetch(u,{method:m,headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); if(r.ok){await refresh(); setEdit(null); setShow(false);} else {const e=await r.json(); alert(e.error||"保存失败");}};
  const openEdit = (item?:any) => { setEdit(item ? {...item} : {_isNew:true,id:"",name:"",name_en:"",description:"",contact:{},website:"",location:"",brands:[],is_master:false}); setShow(true); };

  if(loading) return <div className="text-center py-8"><Spinner className="w-6 h-6 mx-auto text-amber-400"/></div>;

  return <div>
    <div className="flex justify-end mb-4"><Button onClick={()=>openEdit()}>+ 新增供应商</Button></div>
    <div className="grid gap-3">{items.map(s=><div key={s.id} className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-4 flex items-start justify-between"><div><h3 className="font-semibold text-slate-200 text-sm">{s.name} <span className="font-normal text-slate-500">({s.name_en})</span></h3><p className="text-xs text-slate-500 mt-1">{s.description}</p><div className="flex flex-wrap gap-1 mt-2">{(s.brands||[]).map((b:string)=><Badge key={b} variant="blue">{b}</Badge>)}</div></div><div className="flex gap-2 shrink-0"><button onClick={()=>openEdit(s)} className="text-amber-400 text-xs">编辑</button><button onClick={()=>del(s.id)} className="text-red-400 text-sm">删除</button></div></div>)}</div>

    {/* Modal */}
    {show && edit && <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 overflow-y-auto" onClick={e=>{if(e.target===e.currentTarget){setShow(false);setEdit(null);}}}>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-[var(--bg-surface)] rounded-2xl shadow-2xl w-full max-w-lg mx-4 slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h2 className="text-lg font-bold text-slate-200">{edit._isNew?"➕ 新增供应商":`✏️ 编辑：${edit.name}`}</h2>
          <button onClick={()=>{setShow(false);setEdit(null);}} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-slate-400">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[{k:"id",l:"供应商ID"},{k:"name",l:"中文名称"},{k:"name_en",l:"英文名称"},{k:"location",l:"所在地"},{k:"website",l:"网站"}].map(f=><div key={f.k}><label className="block text-sm font-medium text-slate-300 mb-1">{f.l}</label><Input value={(edit as any)[f.k]||""} onChange={e=>setEdit({...edit,[f.k]:e.target.value})}/></div>)}
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1">描述</label><textarea value={edit.description||""} onChange={e=>setEdit({...edit,description:e.target.value})} rows={2} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500/15 focus:border-amber-500/20"/></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1">代理品牌 (逗号分隔)</label><Input value={(edit.brands||[]).join(", ")} onChange={e=>setEdit({...edit,brands:e.target.value.split(",").map((s:string)=>s.trim()).filter(Boolean)})}/></div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.02] rounded-b-2xl">
          <Button variant="secondary" onClick={()=>{setShow(false);setEdit(null);}}>取消</Button>
          <Button onClick={save}>💾 保存</Button>
        </div>
      </div>
    </div>}
  </div>;
}

function TagsTab() {
  const [tags, setTags] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nv, setNv] = useState({dimension:"category",value:""});
  const [ed, setEd] = useState<{dim:string;old:string;val:string}|null>(null);

  useEffect(()=>{fetch("/api/tags").then(r=>r.json()).then(d=>{setTags(d);setLoading(false);});},[]);
  const addTag = async ()=>{if(!nv.value.trim())return;const r=await fetch("/api/tags",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(nv)});if(r.ok){const d=await r.json();setTags(d.tags);setNv({...nv,value:""});}};
  const saveEd = async ()=>{if(!ed||!ed.val.trim())return;const r=await fetch("/api/tags",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({dimension:ed.dim,oldValue:ed.old,newValue:ed.val})});if(r.ok){const d=await r.json();setTags(d.tags);setEd(null);}};
  const delTag = async (dim:string,val:string)=>{if(!confirm(`删除"${val}"？`))return;const r=await fetch(`/api/tags?dimension=${encodeURIComponent(dim)}&value=${encodeURIComponent(val)}`,{method:"DELETE"});if(r.ok){const d=await r.json();setTags(d.tags);}};

  if(loading||!tags) return <div className="text-center py-8"><Spinner className="w-6 h-6 mx-auto text-amber-400"/></div>;

  return <div>
    <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5 mb-4"><h3 className="font-semibold text-slate-200 text-sm mb-3">新增标签</h3>
      <div className="flex gap-2"><Select value={nv.dimension} onChange={e=>setNv({...nv,dimension:e.target.value})}>{Object.entries(tags.dimensions).map(([k,dim]:[string,any])=><option key={k} value={k}>{dim.label}</option>)}</Select><Input value={nv.value} onChange={e=>setNv({...nv,value:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="标签名称" className="flex-1"/><Button onClick={addTag} size="sm">添加</Button></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{Object.entries(tags.dimensions).map(([k,dim]:[string,any])=><div key={k} className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-4"><h4 className="font-semibold text-slate-200 text-sm mb-3">{dim.label}</h4><div className="flex flex-wrap gap-1.5">{dim.values.map((v:string)=>{const isEd=ed&&ed.dim===k&&ed.old===v;if(isEd)return <div key={v} className="flex items-center gap-1"><input value={ed!.val} onChange={e=>setEd({...ed!,val:e.target.value})} onKeyDown={e=>{if(e.key==="Enter")saveEd();if(e.key==="Escape")setEd(null);}} className="px-2 py-1 border border-amber-500/20 rounded-lg text-xs w-24" autoFocus/><button onClick={saveEd} className="text-emerald-400 text-xs">✓</button><button onClick={()=>setEd(null)} className="text-slate-400 text-xs">✕</button></div>;return <span key={v} className="inline-flex items-center gap-1 px-2 py-1 bg-white/[0.06] text-slate-300 rounded-lg text-xs"><button onClick={()=>setEd({dim:k,old:v,val:v})} className="text-amber-300 hover:text-amber-400 text-[10px]" title="编辑">✎</button>{v}<button onClick={()=>delTag(k,v)} className="text-red-400 hover:text-red-400 text-[10px]" title="删除">✕</button></span>})}</div></div>)}</div>
  </div>;
}

function ImportTab() {
  const [json,setJson]=useState("");const [result,setResult]=useState("");
  const doImport=async()=>{try{const data=JSON.parse(json);const items=Array.isArray(data)?data:[data];let s=0,e=0;for(const item of items){const r=await fetch("/api/ingredients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});r.ok?s++:e++}setResult(`导入完成: ${s} 成功, ${e} 失败`)}catch(e:any){setResult(`JSON 错误: ${e.message}`)}};
  return <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5"><h3 className="font-semibold text-slate-200 mb-2 text-sm">批量导入产品 (JSON)</h3><p className="text-xs text-slate-500 mb-3">粘贴 JSON 数组，每个对象需含 id, product_name, supplier_id, generic_name 等字段</p><textarea value={json} onChange={e=>setJson(e.target.value)} rows={12} className="w-full px-3 py-2.5 border border-white/[0.08] rounded-xl font-mono text-xs" placeholder={`[\n  {"id":"NEW-001","product_name":"示例产品",...}\n]`}/><div className="flex items-center gap-3 mt-3"><Button onClick={doImport}>导入</Button>{result&&<span className={`text-xs ${result.includes("错误")||result.includes("失败")?"text-red-400":"text-emerald-400"}`}>{result}</span>}</div></div>;
}
