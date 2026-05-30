"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, ChevronRight, Database, FileText, Package, Pencil, Plus, ShieldCheck } from "lucide-react";
import { Spinner } from "../../components/ui";

export default function SupplierDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [supplierInfo, setSupplierInfo] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/ingredients").then((r) => r.json()),
      fetch("/api/suppliers").then((r) => r.json()),
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
        const match = suppliers.find((s: any) => s.name === company || s.name_en === company || s.id === company);
        setSupplierInfo(match);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="supplier-loader"><Spinner className="w-8 h-8 text-amber-400" /></div>;

  const cards = [
    { label: "上架产品", value: items.length.toString(), sub: "个原料产品", Icon: Package, tone: "amber" },
    { label: "代理品牌", value: supplierInfo?.brands?.length?.toString() || "—", sub: "个品牌", Icon: Database, tone: "blue" },
    { label: "所在地", value: supplierInfo?.location || "—", sub: "企业资料", Icon: Building2, tone: "green" },
  ];

  return (
    <div className="supplier-console">
      <div className="supplier-inner">
        <header className="supplier-hero">
          <div>
            <p className="eyebrow">SUPPLIER WORKBENCH</p>
            <h1>{user?.company || "供应商工作台"}</h1>
            <p>你好，{user?.name}。这里是产品上架、企业资料与采购线索的统一工作台。</p>
          </div>
          <Link href="/supplier/dashboard/products" className="primary-action">
            <Plus className="w-4 h-4" /> 管理产品
          </Link>
        </header>

        <section className="metric-grid">
          {cards.map((c) => (
            <article key={c.label} className={`metric-card ${c.tone}`}>
              <div className="metric-icon"><c.Icon className="w-5 h-5" /></div>
              <span>{c.label}</span>
              <strong>{c.value}</strong>
              <small>{c.sub}</small>
            </article>
          ))}
        </section>

        <section className="supplier-grid">
          <div className="work-panel large">
            <div className="panel-head">
              <div>
                <p className="eyebrow">NEXT ACTIONS</p>
                <h2>快捷操作</h2>
              </div>
              <ShieldCheck className="w-5 h-5 muted-icon" />
            </div>
            <div className="action-list">
              <Action href="/supplier/dashboard/products" icon={<Plus className="w-4 h-4" />} title="新增产品" desc="添加新的食品原料产品，完善功能标签、适用场景和合规信息。" />
              <Action href="/supplier/dashboard/products" icon={<Package className="w-4 h-4" />} title="管理产品列表" desc="查看、编辑或下架已录入的产品。" />
              <Action href="/supplier/dashboard/profile" icon={<Pencil className="w-4 h-4" />} title="编辑供应商信息" desc="维护企业简介、代理品牌、联系方式和所在地。" />
            </div>
          </div>

          <div className="work-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">PROFILE</p>
                <h2>入驻信息</h2>
              </div>
              <FileText className="w-5 h-5 muted-icon" />
            </div>
            <div className="info-list">
              <Info label="公司" value={supplierInfo?.name || user?.company || "—"} />
              <Info label="英文名" value={supplierInfo?.name_en || "—"} />
              <Info label="代理品牌" value={(supplierInfo?.brands || []).join(", ") || "—"} />
              <Info label="产品数量" value={`${items.length} 个`} />
              <Info label="所在地" value={supplierInfo?.location || "—"} />
            </div>
            <Link href="/supplier/dashboard/profile" className="secondary-link">完善企业资料 <ChevronRight className="w-4 h-4" /></Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .supplier-console {
          min-height: calc(100vh - 56px);
          background:
            linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,.015) 1px, transparent 1px),
            radial-gradient(circle at 14% 4%, rgba(240,165,80,.12), transparent 30%),
            #0e1217;
          background-size: 64px 64px, 64px 64px, auto, auto;
        }
        .supplier-inner { max-width: 1180px; margin: 0 auto; padding: 44px 24px 72px; }
        .supplier-hero { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; margin-bottom:28px; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        .supplier-hero h1 { margin:0 0 10px; color:#f2ede4; font:900 38px/1.12 "Noto Serif SC",serif; letter-spacing:.02em; }
        .supplier-hero p:not(.eyebrow) { margin:0; max-width:680px; color:#b8ad9a; font-size:15px; line-height:1.8; }
        .primary-action { display:inline-flex; align-items:center; gap:8px; height:44px; padding:0 18px; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; text-decoration:none; font-weight:700; box-shadow:0 0 24px rgba(240,165,80,.16); white-space:nowrap; }
        .metric-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:18px; }
        .metric-card { border:1px solid rgba(242,237,228,.09); border-radius:14px; background:rgba(25,34,44,.72); padding:18px; min-height:150px; }
        .metric-icon { width:36px;height:36px;border-radius:10px;display:grid;place-items:center;margin-bottom:16px; }
        .metric-card.amber .metric-icon { color:#f0a550; background:rgba(240,165,80,.1); }
        .metric-card.blue .metric-icon { color:#78a6c8; background:rgba(120,166,200,.1); }
        .metric-card.green .metric-icon { color:#64b987; background:rgba(100,185,135,.1); }
        .metric-card span { display:block; color:#7e7464; font-size:13px; margin-bottom:5px; }
        .metric-card strong { display:block; color:#f2ede4; font:800 30px/1 var(--font-mono); }
        .metric-card small { display:block; color:#7e7464; margin-top:8px; font-size:12px; }
        .supplier-grid { display:grid; grid-template-columns: 1.3fr .9fr; gap:18px; }
        .work-panel { border:1px solid rgba(242,237,228,.09); border-radius:14px; background:rgba(25,34,44,.72); overflow:hidden; }
        .panel-head { display:flex; justify-content:space-between; align-items:center; padding:18px; border-bottom:1px solid rgba(242,237,228,.09); }
        .panel-head h2 { margin:0; color:#f2ede4; font:800 18px/1.2 "Noto Serif SC",serif; }
        .muted-icon { color:#7e7464; }
        .action-list { display:grid; gap:0; }
        .action-row { display:flex; align-items:flex-start; gap:14px; padding:18px; border-bottom:1px solid rgba(242,237,228,.06); text-decoration:none; color:inherit; transition:.18s ease; }
        .action-row:hover { background:rgba(255,255,255,.035); }
        .action-icon { width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:rgba(240,165,80,.1);color:#f0a550; flex-shrink:0; }
        .action-row h3 { margin:0 0 5px; color:#f2ede4; font-size:15px; }
        .action-row p { margin:0; color:#b8ad9a; font-size:13px; line-height:1.7; }
        .action-row > svg { margin-left:auto; color:#7e7464; flex-shrink:0; margin-top:7px; }
        .info-list { padding:16px 18px; display:grid; gap:12px; }
        .info-row { display:flex; justify-content:space-between; gap:18px; padding-bottom:12px; border-bottom:1px solid rgba(242,237,228,.06); color:#b8ad9a; font-size:14px; }
        .info-row span { color:#7e7464; }
        .info-row b { color:#f2ede4; text-align:right; font-weight:600; }
        .secondary-link { margin:0 18px 18px; display:flex; align-items:center; justify-content:center; gap:6px; height:40px; border-radius:10px; border:1px solid rgba(242,237,228,.09); color:#f0a550; text-decoration:none; font-weight:700; font-size:13px; }
        .secondary-link:hover { background:rgba(240,165,80,.08); }
        .supplier-loader { min-height:50vh; display:grid; place-items:center; }
        @media (max-width: 900px) { .supplier-hero,.supplier-grid { grid-template-columns:1fr; display:grid; } .metric-grid { grid-template-columns:1fr; } .supplier-hero h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}

function Action({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="action-row">
      <div className="action-icon">{icon}</div>
      <div><h3>{title}</h3><p>{desc}</p></div>
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span>{label}</span><b>{value}</b></div>;
}
