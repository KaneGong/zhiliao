import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PriceDisplay } from "../../components/ui";

interface ProductDetail {
  id: string;
  supplier: string;
  product_name: string;
  product_code: string;
  category: string;
  origin: string;
  function: string;
  mechanism?: string;
  applications: string[];
  dosage_range?: string;
  key_specifications?: Record<string, string>;
  clinical_evidence?: string;
  regulatory_status?: Record<string, string | string[]>;
  dosage_form?: string;
  flavor_options?: string;
  stability?: string;
  confidence: string;
  data_source: string;
  price?: number | null;
  price_range?: string;
  price_unit?: string;
  price_trend?: string;
}

async function getProduct(id: string): Promise<ProductDetail | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700 transition-colors">首页</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/search" className="hover:text-gray-700 transition-colors">原料搜索</Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">{product.product_name}</span>
      </nav>

      {/* Product Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {product.product_name}
              </h1>
              <span className="text-sm text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                {product.product_code}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="blue">{product.category}</Badge>
              <Badge variant="gray">{product.supplier}</Badge>
              <Badge variant="default">{product.origin}</Badge>
              {product.confidence === "high" && (
                <Badge variant="green">高可信度</Badge>
              )}
            </div>
            <p className="text-gray-700 leading-relaxed">{product.function}</p>
          </div>
          <div className="sm:text-right shrink-0">
            <PriceDisplay
              price={product.price}
              priceRange={product.price_range}
              unit={product.price_unit}
              trend={product.price_trend}
              size="lg"
            />
            <a
              href={`mailto:info@ang-ingredients.com?subject=咨询：${product.product_name}&body=您好，我想了解 ${product.product_name}（${product.product_code}）的更多信息。`}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              联系供应商
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mechanism */}
          {product.mechanism && (
            <Section title="作用机制" icon="🔬">
              {product.mechanism}
            </Section>
          )}

          {/* Key Specifications */}
          {product.key_specifications &&
            Object.keys(product.key_specifications).length > 0 && (
              <Section title="关键规格" icon="📊">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(product.key_specifications).map(
                    ([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                          {key.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {value}
                        </dd>
                      </div>
                    )
                  )}
                </dl>
              </Section>
            )}

          {/* Applications */}
          <Section title="应用领域" icon="🎯">
            <div className="flex flex-wrap gap-2">
              {product.applications.map((app) => (
                <span
                  key={app}
                  className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
                >
                  {app}
                </span>
              ))}
            </div>
          </Section>

          {/* Clinical Evidence */}
          {product.clinical_evidence && (
            <Section title="临床证据" icon="📚">
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.clinical_evidence}
              </p>
            </Section>
          )}

          {/* Dosage Form */}
          {product.dosage_form && (
            <Section title="剂型" icon="💊">
              {product.dosage_form}
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dosage */}
          {product.dosage_range && (
            <SideCard title="建议用量" icon="📏">
              {product.dosage_range}
            </SideCard>
          )}

          {/* Stability */}
          {product.stability && (
            <SideCard title="稳定性" icon="🧪">
              {product.stability}
            </SideCard>
          )}

          {/* Regulatory Status */}
          {product.regulatory_status && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>📜</span>
                法规状态
              </h3>
              <dl className="space-y-3">
                {Object.entries(product.regulatory_status).map(
                  ([key, value]) => {
                    if (key === "certifications" && Array.isArray(value)) {
                      return (
                        <div key={key}>
                          <dt className="text-xs text-gray-500 mb-1">认证</dt>
                          <dd className="flex flex-wrap gap-1.5">
                            {value.map((cert) => (
                              <Badge key={cert} variant="green">{cert}</Badge>
                            ))}
                          </dd>
                        </div>
                      );
                    }
                    if (typeof value === "string") {
                      const labelMap: Record<string, string> = {
                        china: "中国",
                        us: "美国",
                        eu: "欧盟",
                        gb14880: "GB 14880",
                        gb2760: "GB 2760",
                        health_food_dir: "保健食品目录",
                        australia: "澳大利亚",
                        korea: "韩国",
                      };
                      return (
                        <div key={key}>
                          <dt className="text-xs text-gray-500">
                            {labelMap[key] || key}
                          </dt>
                          <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
                        </div>
                      );
                    }
                    return null;
                  }
                )}
              </dl>
            </div>
          )}

          {/* Supplier Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>🏢</span>
              供应商信息
            </h3>
            <p className="text-sm text-gray-600 mb-3">{product.supplier}</p>
            <div className="space-y-2">
              <Link
                href="/supplier/ang"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                查看供应商详情
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={`mailto:info@ang-ingredients.com?subject=咨询：${product.product_name}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                发送邮件咨询
              </a>
            </div>
          </div>

          {/* Data Source */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-xs font-medium text-gray-500 mb-2">数据来源</h4>
            <p className="text-xs text-gray-400">{product.data_source}</p>
            <p className="text-xs text-gray-400 mt-2">
              可信度：
              <span
                className={
                  product.confidence === "high"
                    ? "text-green-600 font-medium"
                    : product.confidence === "medium"
                      ? "text-yellow-600 font-medium"
                      : "text-red-600 font-medium"
                }
              >
                {product.confidence === "high"
                  ? "高"
                  : product.confidence === "medium"
                    ? "中"
                    : "低"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        ⚠️ 免责声明：以上产品信息仅供参考，不构成购买建议。价格为参考价，实际成交价可能因量、客户关系等因素浮动。请向供应商确认最新信息。
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function SideCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
      </h3>
      <div className="text-gray-700 text-sm">{children}</div>
    </div>
  );
}
