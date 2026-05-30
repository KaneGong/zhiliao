import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { Badge } from "../../components/ui";

interface ProductDetail {
  id: string; product_name: string; product_code: string;
  generic_name: string; generic_name_en: string;
  manufacturer: string; supplier: string; supplier_name: string;
  category: string; source: string; process: string; origin: string;
  function: string; mechanism?: string;
  applications: string[]; functional_tags: string[]; certifications: string[];
  key_specs?: Record<string, string | undefined>;
  dosage_range?: string; clinical_evidence?: string;
  regulatory_status?: Record<string, string | string[] | undefined>;
  confidence: string; data_source: string;
  price?: number | null; price_range?: string | null; price_unit?: string | null; price_trend?: string | null;
}

async function getProduct(id: string): Promise<ProductDetail | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="product-page">
      <div className="product-inner">
        <nav className="breadcrumb"><Link href="/">首页</Link><span>/</span><Link href="/search">原料库</Link><span>/</span><b>{product.generic_name || product.product_name}</b></nav>

        <header className="product-hero">
          <div>
            <p className="eyebrow">INGREDIENT PROFILE</p>
            <div className="title-row"><h1>{product.generic_name || product.product_name}</h1><span>{product.product_name}</span></div>
            <div className="badge-row"><Badge variant="blue">{product.category}</Badge><Badge variant="gray">{product.origin}</Badge>{product.confidence === "high" && <Badge variant="green">高可信度</Badge>}{product.confidence === "medium" && <Badge variant="amber">中可信度</Badge>}</div>
            <p className="hero-desc">{product.function}</p>
          </div>
          <div className="quote-card">
            <span>参考价格</span>
            <b>{product.price ? `¥${product.price}` : product.price_range || "待询价"}</b>
            <small>{product.price_unit || "联系供应商确认"}</small>
            <a href={`mailto:info@ang-ingredients.com?subject=咨询：${product.product_name}`}><Mail className="w-4 h-4" /> 联系供应商</a>
          </div>
        </header>

        <div className="detail-grid">
          <main className="detail-main">
            {product.mechanism && <Section title="作用机制"><p>{product.mechanism}</p></Section>}
            {product.key_specs && Object.keys(product.key_specs).length > 0 && (
              <Section title="关键规格"><div className="spec-grid">{Object.entries(product.key_specs).map(([k, v]) => v ? <div key={k} className="spec-card"><span>{k.replace(/_/g, " ")}</span><b>{v}</b></div> : null)}</div></Section>
            )}
            <Section title="应用场景"><div className="badge-row">{product.applications.map((a) => <Badge key={a} variant="blue">{a}</Badge>)}</div></Section>
            {product.clinical_evidence && <Section title="临床证据"><p>{product.clinical_evidence}</p></Section>}
            {product.functional_tags.length > 0 && <Section title="功能标签"><div className="badge-row">{product.functional_tags.map((t) => <Badge key={t} variant="purple">{t}</Badge>)}</div></Section>}
            {product.certifications.length > 0 && <Section title="认证"><div className="badge-row">{product.certifications.map((c) => <Badge key={c} variant="green">{c}</Badge>)}</div></Section>}
          </main>

          <aside className="detail-side">
            {product.dosage_range && <SideCard title="建议用量">{product.dosage_range}</SideCard>}
            <SideCard title="厂家与供应商"><Info label="厂家" value={product.manufacturer || product.supplier_name} />{product.supplier && product.supplier !== product.manufacturer && <Info label="供应商" value={product.supplier} />}</SideCard>
            {product.regulatory_status && Object.keys(product.regulatory_status).length > 0 && <SideCard title="法规状态">{Object.entries(product.regulatory_status).map(([k, v]) => <div key={k} className="reg-row"><span>{k}</span><b>{Array.isArray(v) ? v.join("、") : String(v)}</b></div>)}</SideCard>}
            <div className="source-card"><span>数据来源</span><p>{product.data_source}</p><small>可信度：{product.confidence === "high" ? "高" : "中"}</small></div>
          </aside>
        </div>

        <div className="disclaimer">以上产品信息仅供参考，不构成购买建议。价格为参考价，请向供应商确认最新信息。</div>
      </div>
      <style>{`
        .product-page { min-height:calc(100vh - 56px); background:linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.015) 1px,transparent 1px),radial-gradient(circle at 18% 6%,rgba(240,165,80,.12),transparent 30%),#0e1217; background-size:64px 64px,64px 64px,auto,auto; }
        .product-inner { max-width:1120px; margin:0 auto; padding:32px 24px 72px; }
        .breadcrumb { display:flex; gap:9px; align-items:center; color:#7e7464; font-size:13px; margin-bottom:24px; }
        .breadcrumb a { color:#7e7464; text-decoration:none; } .breadcrumb a:hover { color:#b8ad9a; } .breadcrumb b { color:#f2ede4; }
        .eyebrow { margin:0 0 8px; color:#7e7464; font:700 10px/1 var(--font-mono); letter-spacing:.16em; text-transform:uppercase; }
        .product-hero { display:grid; grid-template-columns:1fr 280px; gap:24px; border:1px solid rgba(242,237,228,.09); border-radius:16px; background:rgba(25,34,44,.72); padding:28px; box-shadow:0 24px 80px rgba(0,0,0,.18); margin-bottom:18px; }
        .title-row { display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
        h1 { margin:0; color:#f2ede4; font:900 34px/1.15 "Noto Serif SC",serif; }
        .title-row span { color:#7e7464; border:1px solid rgba(242,237,228,.09); background:rgba(255,255,255,.035); border-radius:7px; padding:4px 8px; font:700 11px/1 var(--font-mono); }
        .badge-row { display:flex; flex-wrap:wrap; gap:7px; margin:14px 0; }
        .hero-desc, .detail-main p { color:#b8ad9a; line-height:1.85; margin:0; }
        .quote-card { border:1px solid rgba(240,165,80,.18); background:rgba(240,165,80,.06); border-radius:14px; padding:18px; align-self:start; }
        .quote-card span { color:#7e7464; font-size:12px; } .quote-card b { display:block; color:#f0a550; font:900 26px/1.2 var(--font-mono); margin:8px 0 2px; } .quote-card small { color:#7e7464; display:block; }
        .quote-card a { margin-top:16px; display:flex; align-items:center; justify-content:center; gap:7px; height:40px; border-radius:10px; background:linear-gradient(135deg,#f0a550,#ef7e42); color:white; text-decoration:none; font-weight:800; }
        .detail-grid { display:grid; grid-template-columns:1fr 320px; gap:18px; }
        .detail-main { display:grid; gap:14px; }
        .section,.side-card,.source-card { border:1px solid rgba(242,237,228,.09); border-radius:14px; background:rgba(25,34,44,.72); padding:18px; }
        .section h2,.side-card h3 { margin:0 0 12px; color:#f2ede4; font:800 18px/1.2 "Noto Serif SC",serif; }
        .spec-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        .spec-card { border:1px solid rgba(242,237,228,.08); border-radius:10px; background:rgba(255,255,255,.025); padding:12px; }
        .spec-card span { display:block; color:#7e7464; font:700 10px/1.2 var(--font-mono); letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px; } .spec-card b { color:#f2ede4; }
        .detail-side { display:grid; gap:14px; align-content:start; }
        .side-card { color:#b8ad9a; font-size:14px; line-height:1.7; }
        .info-row,.reg-row { display:grid; gap:3px; margin-bottom:10px; } .info-row span,.reg-row span,.source-card span { color:#7e7464; font-size:12px; } .info-row b,.reg-row b { color:#f2ede4; font-weight:600; }
        .source-card p { color:#b8ad9a; font-size:13px; line-height:1.7; margin:6px 0; } .source-card small { color:#f0a550; }
        .disclaimer { margin-top:18px; border:1px solid rgba(240,165,80,.18); border-radius:13px; background:rgba(240,165,80,.08); color:#f0a550; padding:15px; font-size:13px; }
        @media (max-width:900px) { .product-hero,.detail-grid { grid-template-columns:1fr; } .spec-grid { grid-template-columns:1fr 1fr; } h1 { font-size:30px; } }
        @media (max-width:560px) { .spec-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="section"><h2>{title}</h2>{children}</section>;
}
function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="side-card"><h3>{title}</h3>{children}</div>;
}
function Info({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span>{label}</span><b>{value}</b></div>;
}
