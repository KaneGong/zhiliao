import Link from "next/link";
import { notFound } from "next/navigation";
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-slate-400">首页</Link><span>/</span>
        <Link href="/search" className="hover:text-slate-400">原料库</Link><span>/</span>
        <span className="text-slate-300 font-medium">{product.generic_name || product.product_name}</span>
      </nav>

      {/* Header Card */}
      <div className="bg-[var(--bg-surface)] rounded-2xl border border-white/[0.06] p-6 sm:p-8 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-200">{product.generic_name || product.product_name}</h1>
              <span className="text-xs text-slate-400 font-mono bg-white/[0.05] px-2 py-0.5 rounded">{product.product_name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="blue">{product.category}</Badge>
              <Badge variant="gray">{product.origin}</Badge>
              {product.confidence === "high" && <Badge variant="green">高可信度</Badge>}
              {product.confidence === "medium" && <Badge variant="amber">中可信度</Badge>}
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">{product.function}</p>
          </div>
          <div className="sm:text-right shrink-0">
            <div className="text-lg font-bold text-amber-400">{product.price ? `¥${product.price}` : product.price_range || "待询价"}</div>
            <div className="text-xs text-slate-400">{product.price_unit || ""}</div>
            <a href={`mailto:info@ang-ingredients.com?subject=咨询：${product.product_name}`}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-200 text-sm font-medium rounded-xl hover:from-amber-400 hover:to-orange-400 transition-colors">✉️ 联系供应商</a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mechanism */}
          {product.mechanism && <Section title="作用机制" icon="🔬"><p className="text-slate-400 text-sm">{product.mechanism}</p></Section>}

          {/* Key Specs */}
          {product.key_specs && Object.keys(product.key_specs).length > 0 && (
            <Section title="关键规格" icon="📊">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(product.key_specs).map(([k, v]) => v ? (
                  <div key={k} className="bg-white/[0.03] rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-0.5 uppercase tracking-wide">{k.replace(/_/g, " ")}</div>
                    <div className="text-sm font-semibold text-slate-300">{v}</div>
                  </div>
                ) : null)}
              </div>
            </Section>
          )}

          {/* Applications */}
          <Section title="应用场景" icon="🎯">
            <div className="flex flex-wrap gap-1.5">{product.applications.map(a => <Badge key={a} variant="blue">{a}</Badge>)}</div>
          </Section>

          {/* Clinical */}
          {product.clinical_evidence && <Section title="临床证据" icon="📚"><p className="text-slate-400 text-sm">{product.clinical_evidence}</p></Section>}

          {/* Functional Tags */}
          {product.functional_tags.length > 0 && <Section title="功能标签" icon="🏷️"><div className="flex flex-wrap gap-1.5">{product.functional_tags.map(t => <Badge key={t} variant="purple">{t}</Badge>)}</div></Section>}

          {/* Certifications */}
          {product.certifications.length > 0 && <Section title="认证" icon="✅"><div className="flex flex-wrap gap-1.5">{product.certifications.map(c => <Badge key={c} variant="green">{c}</Badge>)}</div></Section>}
        </div>

        <div className="space-y-6">
          {/* Dosage */}
          {product.dosage_range && <SideCard title="建议用量" icon="📏">{product.dosage_range}</SideCard>}

          {/* Manufacturer & Supplier */}
          <SideCard title="厂家与供应商" icon="🏢">
            <div className="space-y-2 text-sm">
              <div><span className="text-slate-400">厂家：</span><span className="text-slate-300">{product.manufacturer || product.supplier_name}</span></div>
              {product.supplier && product.supplier !== product.manufacturer && <div><span className="text-slate-400">供应商：</span><span className="text-slate-300">{product.supplier}</span></div>}
            </div>
          </SideCard>

          {/* Regulatory */}
          {product.regulatory_status && Object.keys(product.regulatory_status).length > 0 && (
            <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5">
              <h3 className="font-semibold text-slate-200 mb-3 text-sm">📜 法规状态</h3>
              <div className="space-y-2">
                {Object.entries(product.regulatory_status).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-slate-400">{k}</div>
                    <div className="text-sm text-slate-300">
                      {Array.isArray(v) ? v.map((c, i) => <Badge key={i} variant="green">{String(c)}</Badge>) : String(v)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="bg-white/[0.03] rounded-xl p-4">
            <h4 className="text-xs font-medium text-slate-400 mb-1">数据来源</h4>
            <p className="text-xs text-slate-400">{product.data_source}</p>
            <p className="text-xs text-slate-400 mt-1">可信度：<span className={product.confidence === "high" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{product.confidence === "high" ? "高" : "中"}</span></p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">⚠️ 以上产品信息仅供参考，不构成购买建议。价格为参考价。请向供应商确认最新信息。</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5"><h2 className="font-semibold text-slate-200 mb-3 text-sm flex items-center gap-2">{icon}{title}</h2>{children}</div>;
}
function SideCard({ title, icon, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return <div className="bg-[var(--bg-surface)] rounded-xl border border-white/[0.06] p-5"><h3 className="font-semibold text-slate-200 mb-2 text-sm flex items-center gap-2">{icon}{title}</h3><div className="text-slate-400 text-sm">{children}</div></div>;
}
