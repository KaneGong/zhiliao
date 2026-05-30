import type { FormulaBrief } from "@/lib/formula-brief";

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
  ingredient: { name?: string; suggested_dosage?: string; role?: string; regulatory_note?: string };
  routeName: string;
}) {
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
    </div>
  );
}

export default function FormulaBriefView({ brief }: { brief: FormulaBrief }) {
  const pb = brief.product_brief;
  const score = brief.trust_score?.total_score ?? 0;
  const routes = (brief.formula_routes || []).slice(0, 3);
  const checks = (brief.compliance_checks || []).slice(0, 3);
  const suppliers = (brief.supplier_matches || []).slice(0, 4);
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
          {[['目标人群', pb.target_audience], ['剂型', pb.dosage_form], ['法规路径', pb.regulatory_path], ['成本约束', pb.cost_constraint]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/[0.06] bg-black/15 px-3 py-2">
              <p className="text-[10px] text-slate-500">{k}</p><p className="mt-0.5 truncate text-xs font-bold text-slate-300">{v || '待确认'}</p>
            </div>
          ))}
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
            <p className="mb-3 text-xs font-black text-slate-200">合规边界与表达建议</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {checks.map((check, idx) => (
                <div key={`${check.check_item}-${idx}`} className="rounded-xl bg-black/16 p-3">
                  <div className="flex items-center justify-between gap-2"><b className="text-xs text-slate-300">{check.check_item}</b><span className="text-[10px] text-amber-300">{check.risk_level}</span></div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">{check.general_food_allowed}</p>
                  <div className="mt-2"><MiniList items={check.alternative_expressions} empty="暂无替代表达" /></div>
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
              <p className="mb-3 text-xs font-black text-slate-200">供应商匹配</p>
              {suppliers.length > 0 ? <div className="space-y-2">{suppliers.map((s, idx) => (
                <div key={`${s.ingredient}-${idx}`} className="rounded-xl bg-black/16 p-3">
                  <div className="flex items-center justify-between gap-2"><b className="text-xs text-slate-300">{s.ingredient}</b><span className={`text-[10px] ${s.platform_available ? 'text-emerald-300' : 'text-slate-500'}`}>{s.platform_available ? '平台已有' : '待补充'}</span></div>
                  <p className="mt-1 text-[11px] text-slate-500">{s.supplier_name} · {s.product_name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{s.next_action}</p>
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
