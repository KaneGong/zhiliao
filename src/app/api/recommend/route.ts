import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";
import type { ProductWithPrice } from "@/types";

const MIMO_API_URL = "https://api.xiaomimimo.com/v1/chat/completions";

function buildContext(products: ProductWithPrice[]): string {
  return products
    .map(
      (p) =>
        `[${p.id}] ${p.product_name} (${p.product_code})\n` +
        `供应商: ${p.supplier}\n` +
        `品类: ${p.category}\n` +
        `功能: ${p.function}\n` +
        `${p.mechanism ? `机制: ${p.mechanism}\n` : ""}` +
        `应用: ${p.applications.join(", ")}\n` +
        `${p.dosage_range ? `用量: ${p.dosage_range}\n` : ""}` +
        `${p.clinical_evidence ? `临床证据: ${p.clinical_evidence}\n` : ""}` +
        `${p.regulatory_status ? `法规状态: ${JSON.stringify(p.regulatory_status)}\n` : ""}` +
        `${p.price ? `参考价: ${p.price} ${p.price_unit || "元/kg"}\n` : ""}` +
        `${p.price_range ? `参考价区间: ${p.price_range} ${p.price_unit || "元/kg"}\n` : ""}`
    )
    .join("\n---\n");
}

export async function POST(request: NextRequest) {
  const { query } = (await request.json()) as { query: string };

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "请输入您的产品需求描述" },
      { status: 400 }
    );
  }

  // Step 1: Search relevant products using keyword matching
  const keywords = query
    .replace(/[，。！？、]/g, " ")
    .split(/\s+/)
    .filter((k) => k.length > 0);

  let matchedProducts: ProductWithPrice[] = [];
  for (const keyword of keywords) {
    const results = searchProducts({ query: keyword });
    matchedProducts.push(...results);
  }

  // Deduplicate and limit to top 15 most relevant
  const seen = new Set<string>();
  matchedProducts = matchedProducts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).slice(0, 15);

  // If no matches, get all products (fallback)
  if (matchedProducts.length === 0) {
    matchedProducts = searchProducts({}).slice(0, 15);
  }

  // Step 2: Build context and call MiMo
  const context = buildContext(matchedProducts);

  const apiKey = process.env.XIAOMI_API_KEY;
  if (!apiKey) {
    // Fallback: return simple keyword-based recommendations
    return NextResponse.json({
      recommendations: matchedProducts.slice(0, 5).map((p) => ({
        product_id: p.id,
        product_name: p.product_name,
        category: p.category,
        supplier: p.supplier,
        function: p.function,
        suggested_dosage: p.dosage_range || "待确认",
        price_range: p.price
          ? `${p.price} ${p.price_unit || "元/kg"}`
          : p.price_range
            ? `${p.price_range} ${p.price_unit || "元/kg"}`
            : "待询价",
        regulatory_status: p.regulatory_status?.china || "待确认",
        source: p.data_source,
        confidence: p.confidence,
      })),
      reasoning:
        "基于关键词匹配的推荐结果（AI 推荐功能需要配置 XIAOMI_API_KEY）",
      disclaimer:
        "以上推荐基于数据库中的产品信息，仅供参考。实际使用前请向供应商确认最新信息。",
    });
  }

  const systemPrompt = `你是知料 ZhiLiao 食品原料智能推荐助手。你的任务是根据用户的产品需求，从提供的原料数据库中推荐最合适的原料组合。

规则：
1. 只推荐数据库中已有的原料，不要编造不存在的产品
2. 每个推荐必须引用产品 ID 和数据来源
3. 给出建议添加量（如果数据库中有）
4. 说明法规状态
5. 给出参考价格区间
6. 如果数据库中没有完全匹配的产品，说明"暂无数据，建议向供应商确认"

输出格式（JSON）：
{
  "recommendations": [
    {
      "product_id": "产品ID",
      "product_name": "产品名称",
      "category": "品类",
      "supplier": "供应商",
      "function": "功能说明",
      "suggested_dosage": "建议添加量",
      "price_range": "参考价格",
      "regulatory_status": "法规状态",
      "source": "数据来源",
      "confidence": "high/medium/low"
    }
  ],
  "reasoning": "推荐理由说明",
  "disclaimer": "免责声明"
}`;

  try {
    const response = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "mimo-v2.5",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `用户需求：${query}\n\n可用原料数据库：\n${context}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("MiMo API error:", err);
      throw new Error(`MiMo API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }

    // If JSON parsing fails, return the raw content as reasoning
    return NextResponse.json({
      recommendations: matchedProducts.slice(0, 5).map((p) => ({
        product_id: p.id,
        product_name: p.product_name,
        category: p.category,
        supplier: p.supplier,
        function: p.function,
        suggested_dosage: p.dosage_range || "待确认",
        price_range: p.price
          ? `${p.price} ${p.price_unit || "元/kg"}`
          : p.price_range
            ? `${p.price_range} ${p.price_unit || "元/kg"}`
            : "待询价",
        regulatory_status: p.regulatory_status?.china || "待确认",
        source: p.data_source,
        confidence: p.confidence,
      })),
      reasoning: content,
      disclaimer:
        "以上推荐基于数据库中的产品信息，仅供参考。实际使用前请向供应商确认最新信息。",
    });
  } catch (error) {
    console.error("Recommend error:", error);
    // Fallback to keyword-based recommendations
    return NextResponse.json({
      recommendations: matchedProducts.slice(0, 5).map((p) => ({
        product_id: p.id,
        product_name: p.product_name,
        category: p.category,
        supplier: p.supplier,
        function: p.function,
        suggested_dosage: p.dosage_range || "待确认",
        price_range: p.price
          ? `${p.price} ${p.price_unit || "元/kg"}`
          : p.price_range
            ? `${p.price_range} ${p.price_unit || "元/kg"}`
            : "待询价",
        regulatory_status: p.regulatory_status?.china || "待确认",
        source: p.data_source,
        confidence: p.confidence,
      })),
      reasoning: "AI 推荐服务暂时不可用，已返回基于关键词匹配的结果",
      disclaimer:
        "以上推荐基于数据库中的产品信息，仅供参考。实际使用前请向供应商确认最新信息。",
    });
  }
}
