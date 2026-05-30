import Link from "next/link";
import { ArrowRight, Building2, Globe, Mail, MapPin, Package } from "lucide-react";

export default function SupplierANGPage() {
  return (
    <div className="ang-page">
      <div className="ang-inner">
        <nav className="breadcrumb"><Link href="/">首页</Link><span>/</span><b>供应商</b></nav>

        <header className="ang-hero">
          <div className="ang-mark">ANG</div>
          <div>
            <p className="eyebrow">SUPPLIER PROFILE</p>
            <h1>荷兰爱联康营养</h1>
            <p className="subtitle">ANG Ingredients · 普洛钦（上海）商贸有限公司</p>
            <p className="desc">专业食品原料分销商，代理多个国际知名品牌，为大中华区客户提供优质原料和技术支持。</p>
          </div>
        </header>

        <section className="brand-panel">
          <div className="section-head"><div><p className="eyebrow">BRANDS</p><h2>代理品牌 & 产品线</h2></div><span>10+ 品牌</span></div>
          <div className="brand-grid">
            <BrandCard brand="Glanbia 哥兰比亚" country="爱尔兰 / 美国" products="乳清蛋白、乳铁蛋白、乳矿物盐等乳蛋白原料" href="/search?supplier=Glanbia" />
            <BrandCard brand="Ingredia 安迪亚" country="法国" products="酪蛋白、乳铁蛋白、酪蛋白磷酸肽、牛初乳等乳蛋白原料" href="/search?supplier=Ingredia" />
            <BrandCard brand="Kerry 凯爱瑞" country="爱尔兰" products="酵母 β-葡聚糖、功能性原料" href="/search?supplier=Kerry" />
            <BrandCard brand="Novosana" country="荷兰" products="鱼油、藻油等 Omega-3 原料" href="/search?supplier=Novosana" />
            <BrandCard brand="Weishardt" country="法国" products="鱼胶原蛋白肽（Naticol）" href="/search?supplier=Weishardt" />
            <BrandCard brand="更多品牌" country="全球" products="Armor, Seperex, Tatua, Cargill 等" href="/search" />
          </div>
        </section>

        <section className="stats-grid">
          <StatCard number="60+" label="产品" icon={<Package className="w-5 h-5" />} />
          <StatCard number="10+" label="品牌" icon={<Building2 className="w-5 h-5" />} />
          <StatCard number="2" label="产品线" icon={<Globe className="w-5 h-5" />} />
          <StatCard number="5+" label="国家" icon={<MapPin className="w-5 h-5" />} />
        </section>

        <section className="contact-panel">
          <div className="section-head"><div><p className="eyebrow">CONTACT</p><h2>联系我们</h2></div></div>
          <div className="contact-grid">
            <Info title="公司全称" value="普洛钦（上海）商贸有限公司" />
            <Info title="品牌名" value="荷兰爱联康营养 ANG Ingredients" />
            <Info title="地址" value="上海市普陀区" />
            <div className="info-card"><span><Mail className="w-4 h-4" />邮箱</span><a href="mailto:info@ang-ingredients.com">info@ang-ingredients.com</a></div>
          </div>
        </section>

        <div className="tip-card">通过知料平台搜索原料，可直接查看 ANG 代理产品详情、价格参考和法规状态。</div>
      </div>
      <style>{`
        .ang-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .ang-inner { max-width:1040px; margin:0 auto; padding:32px 24px 72px; }
        .breadcrumb { display:flex; gap:9px; align-items:center; color:#7e7464; font-size:13px; margin-bottom:24px; }
        .breadcrumb a { color:#7e7464; text-decoration:none; } .breadcrumb a:hover { color:#b8ad9a; } .breadcrumb b { color:#f2ede4; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        .ang-hero { display:flex; gap:22px; align-items:flex-start; border:1px solid rgba(242,237,228,.09); border-radius:16px; background:rgba(25,34,44,.72); padding:28px; box-shadow:0 24px 80px rgba(0,0,0,.18); margin-bottom:18px; }
        .ang-mark { width:74px;height:74px;border-radius:18px;display:grid;place-items:center;background:linear-gradient(135deg,#f0a550,#ef7e42);color:white;font:900 20px/1 var(--font-mono); box-shadow:0 0 32px rgba(240,165,80,.2); flex-shrink:0; }
        h1 { margin:0 0 8px; color:#f2ede4; font:900 36px/1.12 "Noto Serif SC",serif; }
        .subtitle { color:#7e7464; margin:0 0 12px; font-size:14px; }
        .desc { color:#b8ad9a; line-height:1.8; margin:0; max-width:720px; }
        .brand-panel,.contact-panel { border:1px solid rgba(242,237,228,.09); border-radius:16px; background:rgba(25,34,44,.72); padding:20px; margin-bottom:18px; }
        .section-head { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(242,237,228,.09); padding-bottom:15px; margin-bottom:16px; }
        .section-head h2 { margin:0; color:#f2ede4; font:800 20px/1.2 "Noto Serif SC",serif; }
        .section-head > span { color:#f0a550; border:1px solid rgba(240,165,80,.18); background:rgba(240,165,80,.08); border-radius:999px; padding:5px 10px; font-size:12px; font-weight:800; }
        .brand-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        .brand-card { display:block; border:1px solid rgba(242,237,228,.08); border-radius:12px; padding:16px; background:rgba(255,255,255,.025); text-decoration:none; transition:.18s ease; }
        .brand-card:hover { border-color:rgba(240,165,80,.2); background:rgba(240,165,80,.05); transform:translateY(-1px); }
        .brand-card h3 { margin:0 0 6px; color:#f2ede4; font-size:15px; }
        .brand-card small { display:block; color:#7e7464; margin-bottom:9px; }
        .brand-card p { color:#b8ad9a; margin:0; font-size:13px; line-height:1.7; }
        .brand-card span { display:inline-flex; align-items:center; gap:4px; color:#f0a550; font-size:12px; margin-top:12px; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
        .stat-card { border:1px solid rgba(242,237,228,.09); border-radius:14px; background:rgba(25,34,44,.72); padding:18px; }
        .stat-card i { color:#f0a550; background:rgba(240,165,80,.1); width:36px;height:36px;border-radius:10px;display:grid;place-items:center;margin-bottom:14px; font-style:normal; }
        .stat-card b { display:block; color:#f2ede4; font:900 28px/1 var(--font-mono); } .stat-card span { color:#7e7464; font-size:13px; }
        .contact-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        .info-card { border:1px solid rgba(242,237,228,.08); border-radius:12px; padding:15px; background:rgba(255,255,255,.025); }
        .info-card span { display:flex; align-items:center; gap:6px; color:#7e7464; font-size:12px; margin-bottom:8px; }
        .info-card b,.info-card a { color:#f2ede4; text-decoration:none; font-size:14px; } .info-card a { color:#f0a550; }
        .tip-card { border:1px solid rgba(240,165,80,.18); border-radius:13px; background:rgba(240,165,80,.08); color:#f0a550; padding:15px; font-size:14px; }
        @media (max-width:720px) { .ang-hero { display:grid; } .brand-grid,.stats-grid,.contact-grid { grid-template-columns:1fr; } h1 { font-size:30px; } }
      `}</style>
    </div>
  );
}

function BrandCard({ brand, country, products, href }: { brand: string; country: string; products: string; href: string }) {
  return <Link href={href} className="brand-card"><h3>{brand}</h3><small>{country}</small><p>{products}</p><span>查看产品 <ArrowRight className="w-3.5 h-3.5" /></span></Link>;
}
function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return <div className="stat-card"><i>{icon}</i><b>{number}</b><span>{label}</span></div>;
}
function Info({ title, value }: { title: string; value: string }) {
  return <div className="info-card"><span>{title}</span><b>{value}</b></div>;
}
