"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle, Globe, Mail, MapPin, Phone, Save, User } from "lucide-react";
import { Spinner, Badge } from "../../../components/ui";

export default function SupplierProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
    ]).then(([auth, supData]) => {
      if (!auth.user || (auth.user.role !== "supplier" && auth.user.role !== "admin")) {
        window.location.href = "/login"; return;
      }
      setUser(auth.user);
      const company = auth.user.company || "";
      const suppliers = supData.suppliers || [];
      const match = suppliers.find((s: any) => s.name === company || s.name_en === company || s.id === company);
      if (match) {
        setSupplier({ ...match, contact_email: match.contact?.email || "", contact_phone: match.contact?.phone || "", contact_person: match.contact?.person || "", brands_str: (match.brands || []).join(", ") });
      } else {
        setSupplier({ id: company.toLowerCase().replace(/\s+/g, "-"), name: company, name_en: "", description: "", contact_email: "", contact_phone: "", contact_person: "", website: "", location: "", brands_str: "", _isNew: true });
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!supplier) return;
    const body = { id: supplier.id, name: supplier.name, name_en: supplier.name_en, description: supplier.description, contact: { email: supplier.contact_email, phone: supplier.contact_phone, person: supplier.contact_person }, website: supplier.website, location: supplier.location, brands: supplier.brands_str.split(",").map((s: string) => s.trim()).filter(Boolean), is_master: false };
    const method = supplier._isNew ? "POST" : "PUT";
    const url = supplier._isNew ? "/api/suppliers" : `/api/suppliers/${supplier.id}`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); if (supplier._isNew) setSupplier({ ...supplier, _isNew: false }); }
    else { const e = await r.json(); alert(e.error || "保存失败"); }
  };

  if (loading) return <div className="profile-loader"><Spinner className="w-8 h-8 text-amber-400" /></div>;

  return (
    <div className="profile-page">
      <div className="profile-inner">
        <Link href="/supplier/dashboard" className="back-link"><ArrowLeft className="w-4 h-4" /> 返回工作台</Link>
        <header className="profile-hero">
          <div>
            <p className="eyebrow">SUPPLIER PROFILE</p>
            <h1>供应商信息</h1>
            <p>管理 {user?.company || "贵司"} 的基本资料、联系方式与代理品牌。</p>
          </div>
          <button onClick={save} className="save-btn"><Save className="w-4 h-4" /> 保存信息</button>
        </header>

        {saved && <div className="notice"><CheckCircle className="w-4 h-4" /> 保存成功</div>}

        <section className="profile-card">
          <div className="section-head"><span>01</span><div><h2>企业基础信息</h2><p>用于平台搜索、供应商背书和产品归属。</p></div></div>
          <div className="form-grid">
            <Field icon={<Building2 className="w-4 h-4" />} label="供应商ID"><input value={supplier?.id || ""} onChange={(e) => setSupplier({ ...supplier, id: e.target.value })} disabled={!supplier?._isNew} /></Field>
            <Field icon={<Building2 className="w-4 h-4" />} label="公司名称 *"><input value={supplier?.name || ""} onChange={(e) => setSupplier({ ...supplier, name: e.target.value })} /></Field>
            <Field icon={<Globe className="w-4 h-4" />} label="英文名称"><input value={supplier?.name_en || ""} onChange={(e) => setSupplier({ ...supplier, name_en: e.target.value })} /></Field>
            <Field icon={<MapPin className="w-4 h-4" />} label="所在地"><input value={supplier?.location || ""} onChange={(e) => setSupplier({ ...supplier, location: e.target.value })} placeholder="如: 上海" /></Field>
            <Field icon={<Globe className="w-4 h-4" />} label="网站"><input value={supplier?.website || ""} onChange={(e) => setSupplier({ ...supplier, website: e.target.value })} placeholder="https://..." /></Field>
            <Field icon={<User className="w-4 h-4" />} label="联系人"><input value={supplier?.contact_person || ""} onChange={(e) => setSupplier({ ...supplier, contact_person: e.target.value })} /></Field>
            <Field icon={<Phone className="w-4 h-4" />} label="联系电话"><input value={supplier?.contact_phone || ""} onChange={(e) => setSupplier({ ...supplier, contact_phone: e.target.value })} /></Field>
            <Field icon={<Mail className="w-4 h-4" />} label="邮箱"><input type="email" value={supplier?.contact_email || ""} onChange={(e) => setSupplier({ ...supplier, contact_email: e.target.value })} /></Field>
          </div>
        </section>

        <section className="profile-card">
          <div className="section-head"><span>02</span><div><h2>品牌与介绍</h2><p>让研发用户快速理解你的产品能力和供应优势。</p></div></div>
          <label className="full-field"><span>公司简介</span><textarea value={supplier?.description || ""} onChange={(e) => setSupplier({ ...supplier, description: e.target.value })} rows={4} placeholder="简要描述公司业务和主要产品线..." /></label>
          <label className="full-field"><span>代理品牌（逗号分隔）</span><input value={supplier?.brands_str || ""} onChange={(e) => setSupplier({ ...supplier, brands_str: e.target.value })} placeholder="如: Glanbia, Ingredia, Kerry" /></label>
          {supplier?.brands_str && <div className="brand-row">{supplier.brands_str.split(",").filter(Boolean).map((b: string) => <Badge key={b.trim()} variant="blue">{b.trim()}</Badge>)}</div>}
        </section>
      </div>
      <style jsx>{`
        .profile-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .profile-inner { max-width:900px; margin:0 auto; padding:32px 24px 72px; }
        .back-link { display:inline-flex; align-items:center; gap:6px; color:#7e7464; text-decoration:none; font-size:13px; margin-bottom:24px; }
        .back-link:hover { color:#b8ad9a; }
        .profile-hero { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:22px; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        h1 { margin:0 0 10px; color:#f2ede4; font:900 36px/1.12 "Noto Serif SC",serif; }
        .profile-hero p { margin:0; color:#b8ad9a; line-height:1.8; }
        .save-btn { display:inline-flex; align-items:center; gap:8px; height:42px; padding:0 16px; border:0; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; font-weight:800; cursor:pointer; box-shadow:0 0 22px rgba(240,165,80,.16); white-space:nowrap; }
        .notice { display:flex; align-items:center; gap:8px; color:#64b987; border:1px solid rgba(100,185,135,.2); background:rgba(100,185,135,.08); border-radius:10px; padding:11px 14px; margin-bottom:16px; font-size:13px; }
        .profile-card { border:1px solid rgba(242,237,228,.09); border-radius:15px; background:rgba(25,34,44,.72); padding:20px; margin-bottom:16px; box-shadow:0 24px 80px rgba(0,0,0,.18); }
        .section-head { display:flex; gap:12px; align-items:flex-start; padding-bottom:16px; border-bottom:1px solid rgba(242,237,228,.09); margin-bottom:18px; }
        .section-head > span { width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:rgba(240,165,80,.1);color:#f0a550;font:800 12px/1 var(--font-mono); }
        .section-head h2 { margin:0 0 5px; color:#f2ede4; font:800 17px/1.2 "Noto Serif SC",serif; }
        .section-head p { margin:0; color:#7e7464; font-size:13px; }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .field,.full-field { display:grid; gap:7px; }
        .field-label,.full-field > span { display:flex; align-items:center; gap:7px; color:#b8ad9a; font-size:12px; font-weight:800; }
        input,textarea { width:100%; border:1px solid rgba(242,237,228,.08); border-radius:12px; background:rgba(255,255,255,.03); color:#f2ede4; padding:0 12px; outline:none; font:inherit; }
        input { height:42px; }
        textarea { padding:12px; resize:vertical; line-height:1.7; }
        input:focus,textarea:focus { border-color:rgba(240,165,80,.3); box-shadow:0 0 0 3px rgba(240,165,80,.08); }
        input:disabled { color:#7e7464; cursor:not-allowed; }
        .full-field { margin-bottom:16px; }
        .brand-row { display:flex; flex-wrap:wrap; gap:7px; }
        .profile-loader { min-height:50vh; display:grid; place-items:center; }
        @media (max-width: 720px) { .profile-hero { display:grid; align-items:start; } .form-grid { grid-template-columns:1fr; } h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return <label className="field"><span className="field-label">{icon}{label}</span>{children}</label>;
}
