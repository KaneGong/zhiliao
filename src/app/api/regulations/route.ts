import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

interface RegulationCheck {
  ingredient: string;
  standard: string;
  status: "compliant" | "caution" | "not_found" | "restricted";
  detail: string;
  source: string;
}

// Simple rule-based regulation check
function checkRegulation(ingredient: string): RegulationCheck[] {
  const results: RegulationCheck[] = [];
  const lower = ingredient.toLowerCase();

  // Search products matching the ingredient
  const products = searchProducts({ query: ingredient });

  if (products.length === 0) {
    results.push({
      ingredient,
      standard: "通用检查",
      status: "not_found",
      detail: `未在数据库中找到"${ingredient}"的相关信息，建议向供应商确认法规状态`,
      source: "知料数据库",
    });
    return results;
  }

  for (const product of products.slice(0, 3)) {
    const reg = product.regulatory_status;

    // GB 14880 check
    if (reg?.gb14880) {
      results.push({
        ingredient: product.product_name,
        standard: "GB 14880 食品营养强化剂使用标准",
        status: "compliant",
        detail: reg.gb14880,
        source: product.data_source,
      });
    } else if (reg?.china) {
      results.push({
        ingredient: product.product_name,
        standard: "中国法规状态",
        status: reg.china.includes("允许") ? "compliant" : "caution",
        detail: reg.china,
        source: product.data_source,
      });
    } else {
      results.push({
        ingredient: product.product_name,
        standard: "中国法规状态",
        status: "not_found",
        detail: "法规状态待确认，建议向供应商获取最新合规文件",
        source: product.data_source,
      });
    }

    // Certifications check
    if (reg?.certifications && Array.isArray(reg.certifications)) {
      results.push({
        ingredient: product.product_name,
        standard: "国际认证",
        status: "compliant",
        detail: `持有认证: ${reg.certifications.join(", ")}`,
        source: product.data_source,
      });
    }

    // GRAS check
    if (reg?.us === "GRAS") {
      results.push({
        ingredient: product.product_name,
        standard: "FDA GRAS",
        status: "compliant",
        detail: "美国 FDA GRAS 认证",
        source: product.data_source,
      });
    }
  }

  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ingredient = searchParams.get("q");

  if (!ingredient) {
    return NextResponse.json(
      { error: "请输入原料名称或功能声称" },
      { status: 400 }
    );
  }

  const checks = checkRegulation(ingredient);

  return NextResponse.json({
    query: ingredient,
    checks,
    disclaimer:
      "法规信息仅供参考，不构成法律建议。实际合规情况请咨询专业法规顾问或向监管部门确认。",
  });
}
