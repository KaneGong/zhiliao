import { NextRequest, NextResponse } from "next/server";
import regulationsJson from "@/data/regulations.json";

interface RegulationEntry {
  ingredient: string;
  standards: Array<{ code: string; status: string; requirement: string }>;
  special_notes?: string[];
  data_confidence?: string;
  food_scopes?: string[];
  scope_restrictions?: string[];
}

const regulations = regulationsJson as RegulationEntry[];

export async function POST(request: NextRequest) {
  const { ingredients } = await request.json();

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results: Array<{
    ingredient: string;
    status: "compliant" | "caution" | "not_found";
    label: string;
    detail?: string;
  }> = [];

  for (const name of ingredients) {
    const found = regulations.find(
      (r) => r.ingredient === name || r.ingredient.includes(name) || name.includes(r.ingredient)
    );

    if (found) {
      const primary = found.standards[0] || {};
      const isCompliant = primary.status === "compliant" || !primary.status;
      const scopes = found.food_scopes || ["general_food"];
      const restrictions = found.scope_restrictions || [];

      // 默认按普通食品检查：health_food_only 的原料标为 caution
      const isHealthFoodOnly = restrictions.includes("health_food_only");
      const effectiveStatus = isCompliant && !isHealthFoodOnly ? "compliant" : "caution";
      const effectiveLabel = isHealthFoodOnly ? "仅限保健食品" : (isCompliant ? "合规可用" : "需注意");
      const effectiveDetail = isHealthFoodOnly
        ? "保健食品原料目录收录，不可用于普通食品"
        : primary.requirement || "";

      results.push({
        ingredient: found.ingredient,
        status: effectiveStatus as "compliant" | "caution",
        label: effectiveLabel,
        detail: effectiveDetail,
      });
    } else {
      results.push({
        ingredient: name,
        status: "not_found",
        label: "未收录",
      });
    }
  }

  return NextResponse.json({ results });
}
