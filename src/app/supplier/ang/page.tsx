import Link from "next/link";

export default function SupplierANGPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          首页
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">供应商</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0">
            ANG
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              荷兰爱联康营养（ANG Ingredients）
            </h1>
            <p className="text-gray-500 mb-4">
              普洛钦（上海）商贸有限公司
            </p>
            <p className="text-gray-700 leading-relaxed">
              ANG Ingredients 是一家专业的食品原料分销商，代理多个国际知名品牌的食品原料产品。
              公司总部位于荷兰，在中国上海设有办事处，为大中华区客户提供优质原料和专业技术支持。
            </p>
          </div>
        </div>
      </div>

      {/* Product Lines */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">代理品牌 & 产品线</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BrandCard
            brand="Glanbia 哥兰比亚"
            country="爱尔兰/美国"
            products="乳清蛋白、乳铁蛋白、乳矿物盐等乳蛋白原料"
            href="/search?supplier=Glanbia"
          />
          <BrandCard
            brand="Ingredia 安迪亚"
            country="法国"
            products="酪蛋白、乳铁蛋白、酪蛋白磷酸肽、牛初乳等乳蛋白原料"
            href="/search?supplier=Ingredia"
          />
          <BrandCard
            brand="Kerry 凯爱瑞"
            country="爱尔兰"
            products="酵母β-葡聚糖、功能性原料"
            href="/search?supplier=Kerry"
          />
          <BrandCard
            brand="Novosana"
            country="荷兰"
            products="鱼油、藻油等 Omega-3 原料"
            href="/search?supplier=Novosana"
          />
          <BrandCard
            brand="Weishardt"
            country="法国"
            products="鱼胶原蛋白肽（Naticol）"
            href="/search?supplier=Weishardt"
          />
          <BrandCard
            brand="更多品牌"
            country="全球"
            products="Armor, Seperex, Tatua, Cargill 等"
            href="/search"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard number="60+" label="产品" />
        <StatCard number="10+" label="品牌" />
        <StatCard number="2" label="产品线" />
        <StatCard number="5+" label="国家" />
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">联系我们</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">公司信息</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">公司全称</dt>
                <dd className="text-gray-900">
                  普洛钦（上海）商贸有限公司
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">品牌名</dt>
                <dd className="text-gray-900">荷兰爱联康营养 ANG Ingredients</dd>
              </div>
              <div>
                <dt className="text-gray-400">地址</dt>
                <dd className="text-gray-900">上海市普陀区</dd>
              </div>
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">联系方式</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">邮箱</dt>
                <dd>
                  <a
                    href="mailto:info@ang-ingredients.com"
                    className="text-blue-600 hover:underline"
                  >
                    info@ang-ingredients.com
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-gray-400">业务咨询</dt>
                <dd className="text-gray-900">请通过邮箱联系，我们将尽快回复</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        💡 提示：通过知料平台搜索原料，可直接查看 ANG 代理的所有产品详情、价格参考和法规状态。
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  country,
  products,
  href,
}: {
  brand: string;
  country: string;
  products: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors"
    >
      <div className="font-medium text-gray-900 mb-1">{brand}</div>
      <div className="text-xs text-gray-400 mb-2">{country}</div>
      <div className="text-sm text-gray-600">{products}</div>
    </Link>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold text-blue-600">{number}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}
