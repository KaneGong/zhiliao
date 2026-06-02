import type { FormulaBrief } from "@/lib/formula-brief";

type IngredientViewModel = {
  name?: string;
  suggested_dosage?: string;
  role?: string;
  regulatory_note?: string;
  evidence_level?: string;
};

function containsAny(value: string | undefined, patterns: RegExp[]): boolean {
  const text = value || "";
  return patterns.some((pattern) => pattern.test(text));
}

const REVIEW_PATTERNS = [/待确认/, /待复核/, /需复核/, /待验证/, /未收录/, /人工/, /自行确认/, /资料不足/];
const PUBLIC_EVIDENCE_PATTERNS = [/公开证据/i, /证据卡/, /法规明确/, /法规路径/, /GB\s*\d+/i, /公告/, /标准/];

function getIngredientStatus(ingredient: IngredientViewModel): {
  label: string;
  className: string;
  note: string;
} {
  const evidence = ingredient.evidence_level || "";
  const regulatoryNote = ingredient.regulatory_note || "";
  const statusText = `${evidence} ${regulatoryNote}`;
  if (containsAny(statusText, REVIEW_PATTERNS)) {
    return {
      label: "待复核",
      className: "border-amber-300/15 bg-amber-400/[0.07] text-amber-200",
      note: "用量/类别需人工确认",
    };
  }
  if (containsAny(statusText, PUBLIC_EVIDENCE_PATTERNS)) {
    return {
      label: "公开证据",
      className: "border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-200",
      note: "法规路径参考",
    };
  }
  if (/平台数据/.test(evidence)) {
    return {
      label: "平台资料",
      className: "border-sky-300/15 bg-sky-400/[0.06] text-sky-200",
      note: "不等于 Supplier Verified",
    };
  }
  return {
    label: "需确认",
    className: "border-white/[0.08] bg-white/[0.04] text-slate-300",
    note: "证据来源待确认",
  };
}

function getRiskBadgeClass(riskLevel?: string): string {
  if (/高/.test(riskLevel || "")) return "border-red-300/20 bg-red-400/[0.08] text-red-200";
  if (containsAny(riskLevel, REVIEW_PATTERNS)) return "border-amber-300/20 bg-amber-400/[0.08] text-amber-200";
  if (/中/.test(riskLevel || "")) return "border-orange-300/15 bg-orange-400/[0.07] text-orange-200";
  return "border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-200";
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  return (
    <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#111923] ring-1 ring-white/[0.06]" style={{ background: `conic-gradient(rgba(240,165,80,.95) ${pct * 3.6}deg, rgba(255,255,255,.06) 0deg)` }}>
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#121a24] text-center">
        <b className="text-lg leading-none text-amber-300">{pct}</b>
        <span className="text-[8px] uppercase tracking-[0.18em] text-slate-500">trust</span>
      </div>
    </div>
  );
}

function MiniList({ items, empty = "暂无" }: { items?: string[]; empty?: string }) {
  const shown = (items || []).filter(Boolean).slice(0, 4);
  if (shown.length === 0) return <p className="text-xs leading-relaxed text-slate-500">{empty}</p>;
  return <ul className="space-y-1.5">{shown.map((item, idx) => <li key={idx} className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />{item}</li>)}</ul>;
}

function IngredientTile({
  ingredient,
  routeName,
}: {
  ingredient: IngredientViewModel;
  routeName: string;
}) {
  const status = getIngredientStatus(ingredient);
  return (
    <div key={`${routeName}-${ingredient.name}`} className="rounded-2xl border border-white/[0.045] bg-[#090f16]/70 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.025)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <b className="min-w-0 text-[13px] leading-snug text-slate-100">{ingredient.name || "待定原料"}</b>
        <span className="rounded-full border border-sky-300/10 bg-sky-400/[0.065] px-2 py-0.5 text-right text-[10px] font-semibold leading-relaxed text-sky-200/80">
          {ingredient.suggested_dosage || "剂量待定"}
        </span>
      </div>
      <div className="mt-2 grid gap-1.5 text-[11px] leading-relaxed">
        {ingredient.role && (
          <p className="m-0 flex gap-2 text-slate-400">
            <span className="shrink-0 font-bold text-amber-300/85">作用</span>
            <span>{ingredient.role}</span>
          </p>
        )}
        {ingredient.regulatory_note && (
          <p className="m-0 flex gap-2 text-slate-500">
            <span className="shrink-0 font-bold text-emerald-300/75">合规</span>
            <span>{ingredient.regulatory_note}</span>
          </p>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}>{status.label}</span>
        <span className="text-[10px] leading-relaxed text-slate-500">{status.note}</span>
      </div>
    </div>
  );
}

export default function FormulaBriefView({ brief }: { brief: FormulaBrief }) {
  const pb = brief.product_brief;
  const score = brief.trust_score?.total_score ?? 0;
  const routes = (brief.formula_routes || []).slice(0, 3);
  const checks = (brief.compliance_checks || []).slice(0, 3);
  const suppliers = (brief.supplier_matches || []).slice(0, 4);
  const allIngredients = routes.flatMap((route) => [
    ...(route.core_ingredients || []),
    ...(route.supporting_ingredients || []),
  ]);
  const publicEvidenceCount = allIngredients.filter((ingredient) => getIngredientStatus(ingredient).label === "公开证据").length;
  const reviewCount =
    allIngredients.filter((ingredient) => ["待复核", "需确认"].includes(getIngredientStatus(ingredient).label)).length +
    checks.filter((check) => containsAny(`${check.risk_level} ${check.general_food_allowed}`, REVIEW_PATTERNS)).length;
  const availableSupplierCount = suppliers.filter((supplier) => supplier.platform_available).length;
  const unavailableSupplierCount = suppliers.length - availableSupplierCount;

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-amber-400/10 bg-[#0d141d] shadow-[0_18px_50px_rgba(0,0,0,.2)]">
      <div className="relative border-b border-white/[0.06] bg-[radial-gradient(circle_at_10%_0%,rgba(240,165,80,.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,.05),rgba(255,255,255,.015))] p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <ScoreRing score={score} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300/80">Formula Brief v1</p>
            <h3 className="mt-1 text-base font-black text-slate-100 sm:text-lg">{pb.product_type || "新品配方方案包"}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{brief.markdown_summary || brief.trust_score?.evidence_summary}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {[["目标人群", pb.target_audience], ["剂型", pb.dosage_form], ["法规路径", pb.regulatory_path], ["成本约束", pb.cost_constraint]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/[0.06] bg-black/15 px-3 py-2">
              <p className="text-[10px] text-slate-500">{k}</p><p className="mt-0.5 truncate text-xs font-bold text-slate-300">{v || "待确认"}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-300/10 bg-emerald-400/[0.035] px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-200">公开证据</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{publicEvidenceCount > 0 ? `已命中 ${publicEvidenceCount} 个公开法规/证据参考` : "未命中明确证据卡，按待复核处理"}</p>
          </div>
          <div className="rounded-xl border border-amber-300/10 bg-amber-400/[0.04] px-3 py-2">
            <p className="text-[10px] font-bold text-amber-200">待复核</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{reviewCount > 0 ? `${reviewCount} 处类别、用量或标签需人工确认` : "仍建议法规/标签人工复核"}</p>
          </div>
          <div className="rounded-xl border border-sky-300/10 bg-sky-400/[0.035] px-3 py-2">
            <p className="text-[10px] font-bold text-sky-200">供应商边界</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{availableSupplierCount > 0 ? `${availableSupplierCount} 个平台目录匹配，仍需索资` : "暂无平台核验供应商 / 待索资"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:p-5">
        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-xs font-black text-slate-200">三条配方路线</p><span className="text-[10px] text-slate-500">可比较 · 可追问 · 可保存</span></div>
          <div className="grid gap-3 xl:grid-cols-3">
            {routes.map((route, idx) => (
              <div key={`${route.route_name}-${idx}`} className="rounded-3xl border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.018))] p-4 shadow-[0_18px_42px_rgba(0,0,0,.16)]">
                <div className="flex items-center justify-between gap-2">
                  <p className="rounded-full bg-amber-400/[0.08] px-2.5 py-1 text-[11px] font-black text-amber-300">{route.route_type}</p>
                  <span className="rounded-full border border-white/[0.07] bg-black/10 px-2.5 py-1 text-[10px] font-semibold text-slate-400">成本 {route.cost_level || "待评估"}</span>
                </div>
                <h4 className="mt-3 text-[17px] font-black leading-snug text-slate-100">{route.route_name}</h4>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{route.functional_logic}</p>
                <div className="mt-4 space-y-2.5">
                  {[...(route.core_ingredients || []), ...(route.supporting_ingredients || [])].slice(0, 4).map((ing) => (
                    <IngredientTile key={`${route.route_name}-${ing.name}`} ingredient={ing} routeName={route.route_name} />
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.035] p-3">
                  <p className="mb-2 text-[11px] font-black text-amber-200/90">主要注意点</p>
                  <MiniList items={route.main_risks} empty="暂无主要风险" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black text-slate-200">合规边界与表达建议</p>
              <span className="rounded-full border border-amber-300/10 bg-amber-400/[0.055] px-2.5 py-1 text-[10px] font-bold text-amber-200">需人工复核后用于标签/宣称</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {checks.map((check, idx) => (
                <div key={`${check.check_item}-${idx}`} className="rounded-xl border border-white/[0.045] bg-black/16 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <b className="min-w-0 text-xs text-slate-300">{check.check_item || "合规检查"}</b>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRiskBadgeClass(check.risk_level)}`}>{check.risk_level || "需复核"}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{check.general_food_allowed || "普通食品适用性需人工确认。"}</p>
                  <div className="mt-2"><MiniList items={check.alternative_expressions} empty="暂无替代表达" /></div>
                  <div className="mt-2 rounded-lg border border-amber-300/10 bg-amber-400/[0.035] px-2.5 py-2">
                    <p className="mb-1 text-[10px] font-bold text-amber-200">需复核</p>
                    <MiniList items={check.human_review_points} empty="食品类别、添加量、标签表达需人工确认。" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3">
              <p className="text-[11px] font-bold text-red-300">高风险表达</p>
              <MiniList items={brief.claim_suggestions?.risky_expressions} empty="暂未识别高风险表达" />
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black text-slate-200">供应商匹配</p>
                <span className="rounded-full border border-slate-300/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-bold text-slate-300">Public Evidence ≠ Supplier Verified</span>
              </div>
              {unavailableSupplierCount > 0 && (
                <p className="mb-2 rounded-xl border border-amber-300/10 bg-amber-400/[0.035] px-3 py-2 text-[11px] leading-relaxed text-amber-100/80">
                  有 {unavailableSupplierCount} 项暂无平台核验供应商，以下仅作为索资动作，不作为真实供应商推荐。
                </p>
              )}
              {suppliers.length > 0 ? <div className="space-y-2">{suppliers.map((s, idx) => (
                <div key={`${s.ingredient}-${idx}`} className={`rounded-xl border p-3 ${s.platform_available ? "border-emerald-300/10 bg-emerald-400/[0.025]" : "border-amber-300/10 bg-black/16"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <b className="min-w-0 text-xs text-slate-300">{s.ingredient || "待匹配原料"}</b>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${s.platform_available ? "border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-200" : "border-amber-300/15 bg-amber-400/[0.06] text-amber-200"}`}>{s.platform_available ? "平台目录匹配" : "暂无核验供应商"}</span>
                  </div>
                  {s.platform_available ? (
                    <p className="mt-1 text-[11px] text-slate-500">{s.supplier_name || "待确认供应商"} · {s.product_name || "待确认产品"}（仍需索取 COA/规格书）</p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-500">当前不是供应商推荐；需补充真实供应商资料后再确认。</p>
                  )}
                  {s.match_reason && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{s.match_reason}</p>}
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{s.next_action || "建议询样并索取规格书、COA、法规声明。"}</p>
                </div>
              ))}</div> : <p className="text-xs leading-relaxed text-slate-500">暂无明确平台供应商匹配，建议先补充产品资料或人工询样。</p>}
            </div>
            <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
              <p className="mb-2 text-xs font-black text-amber-200">下一步</p>
              <MiniList items={brief.next_steps} empty="建议先确认法规路径、样品规格和核心原料可得性。" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
