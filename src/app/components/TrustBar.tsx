"use client";

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Package, FileText, ShieldCheck, Search } from "lucide-react";
import { type TrustResult, type ServerVerification, type ServerIngredientVerify } from "@/lib/trust";

interface TrustBarProps {
  result: TrustResult;
  serverVerify?: ServerVerification;
}

/** 单条原料的合规标签 */
function IngredientStatusBadge({ ing }: { ing: ServerIngredientVerify }) {
  const config: Record<string, { color: string; Icon: typeof CheckCircle2; label: string }> = {
    compliant: { color: "text-emerald-400", Icon: ShieldCheck, label: "合规" },
    dual_scope: { color: "text-emerald-400", Icon: ShieldCheck, label: "合规" },
    novel_food: { color: "text-amber-300", Icon: CheckCircle2, label: "新食品原料" },
    health_food_only: { color: "text-red-400", Icon: XCircle, label: "仅限保健食品" },
    not_found: { color: "text-amber-400", Icon: Search, label: "未收录" },
    caution: { color: "text-amber-400", Icon: AlertTriangle, label: "需确认" },
  };
  const { Icon, label } = config[ing.status] || config.caution;

  const note = ing.usageNote.length > 60 ? ing.usageNote.slice(0, 60) + "..." : ing.usageNote;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${
        ing.status === "not_found"
          ? "bg-amber-500/5 border border-amber-500/15 text-amber-300"
          : ing.status === "health_food_only"
          ? "bg-red-500/5 border border-red-500/15 text-red-300"
          : "text-slate-400"
      }`}
      title={ing.usageNote}
    >
      <Icon className="w-2.5 h-2.5 shrink-0" strokeWidth={2} />
      <span className="font-medium">{ing.name}</span>
      <span className="opacity-70">· {label}</span>
      {note && ing.status !== "not_found" && (
        <span className="opacity-50 hidden sm:inline">· {note}</span>
      )}
    </span>
  );
}

export default function TrustBar({ result, serverVerify }: TrustBarProps) {
  const { matchedGB, totalGBMentions } = result;

  // 有服务端验证数据时，优先展示详细信息
  if (serverVerify && serverVerify.ingredients.length > 0) {
    const { summary, ingredients } = serverVerify;

    return (
      <div className="flex flex-col gap-2 px-3 py-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30">
        {/* 摘要行 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {/* GB 标准 */}
          {totalGBMentions > 0 && (
            <span className="text-slate-400">
              <FileText className="w-3 h-3 text-slate-500 inline mr-1" strokeWidth={1.5} />
              {matchedGB.length === totalGBMentions
                ? "引用标准已收录"
                : `${matchedGB.length}/${totalGBMentions} 条标准可验证`}
            </span>
          )}

          {/* 原料统计 - 诚实版 */}
          <span className="text-slate-400">
            <Package className="w-3 h-3 text-slate-500 inline mr-1" strokeWidth={1.5} />
            验证 <span className="text-emerald-400 font-medium">{summary.verified}</span>
            <span className="text-slate-500">/{summary.total}</span> 种原料
            {summary.notFound > 0 && (
              <span className="text-amber-400 ml-1">（{summary.notFound} 种未收录，等待补全）</span>
            )}
            {summary.healthFoodOnly > 0 && (
              <span className="text-red-400 ml-1">（{summary.healthFoodOnly} 种仅限保健食品）</span>
            )}
          </span>
        </div>

        {/* 每条原料的详细状态 */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {ingredients.map((ing) => (
            <IngredientStatusBadge key={ing.name} ing={ing} />
          ))}
        </div>
      </div>
    );
  }

  // 无服务端数据时的兼容模式（客户端自检）
  if (totalGBMentions === 0 && result.matchedIngredients.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 text-[11px] rounded-lg border border-emerald-500/8 bg-emerald-500/[0.02]">
      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" strokeWidth={1.5} />

      {totalGBMentions > 0 && (
        <span className="text-slate-400">
          <FileText className="w-3 h-3 text-slate-500 inline mr-1" strokeWidth={1.5} />
          {matchedGB.length === totalGBMentions
            ? "引用标准已收录"
            : `${matchedGB.length}/${totalGBMentions} 条标准可验证`}
        </span>
      )}

      {result.matchedIngredients.length > 0 && (
        <span className="text-slate-400">
          <Package className="w-3 h-3 text-slate-500 inline mr-1" strokeWidth={1.5} />
          {result.matchedIngredients.length} 种原料平台可匹配
        </span>
      )}
    </div>
  );
}
