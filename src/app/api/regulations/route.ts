import { NextRequest, NextResponse } from "next/server";
import regulationsJson from "@/data/regulations.json";
import { appendLog, getRequestAuth } from "@/lib/logger";

interface RegulationStandard {
  code: string;
  name: string;
  clause: string;
  requirement: string;
  status: string;
  effective_date: string;
}

interface RegulationEntry {
  ingredient: string;
  ingredient_en: string;
  category: string;
  standards: RegulationStandard[];
  special_notes: string[];
  data_confidence: string;
}

const regulations = regulationsJson as RegulationEntry[];

function findRegulation(ingredient: string) {
  const trimmed = ingredient.trim();
  if (!trimmed) return null;
  const exact = regulations.find((r) => r.ingredient === trimmed);
  if (exact) return exact;
  const fuzzy = regulations.find(
    (r) => r.ingredient.includes(trimmed) || trimmed.includes(r.ingredient)
  );
  return fuzzy || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  const rawQuery = searchParams.get("q");

  if (!rawQuery) {
    return NextResponse.json({ error: "请输入原料名称" }, { status: 400 });
  }

  const ingredients = rawQuery.split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
  const results: any[] = [];

  for (const ingredient of ingredients) {
    const found = findRegulation(ingredient);
    if (found) {
      const primaryStandard = found.standards[0] || {};
      results.push({
        ingredient: found.ingredient,
        ingredient_en: found.ingredient_en,
        category: found.category,
        standard: `${primaryStandard.code} — ${primaryStandard.name}`,
        status: primaryStandard.status || "compliant",
        detail: primaryStandard.requirement || "",
        source: `${primaryStandard.code} ${primaryStandard.clause || ""}`.trim(),
        data_confidence: found.data_confidence,
        special_notes: found.special_notes || [],
      });
    } else {
      results.push({
        ingredient,
        standard: "未纳入标准数据库",
        status: "not_found",
        detail: `目前尚无"${ingredient}"的明确法规规范，建议向供应商确认或咨询专业法规顾问。`,
        source: "知料法规数据库",
        data_confidence: "reference_only",
      });
    }
  }

  const hasDbResults = results.some(r => r.status !== "not_found");
  const hasNoResults = results.every(r => r.status === "not_found");

  // Streaming SSE response with DB results first, then AI stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Send DB results first
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "db_results", checks: results })}\n\n`));

      const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
      let fullAiContent = "";

      if (hasDbResults || hasNoResults) {
        try {
          const dbContext = hasDbResults
            ? results.map(r => `【${r.ingredient}】合规状态：${r.status}，适用标准：${r.standard}，细则：${r.detail}。特殊说明：${(r.special_notes || []).join("；")}`).join("\n")
            : "";

          const aiPrompt = hasDbResults
            ? `用户查询原料法规："${rawQuery}"。数据库查到的法规基本信息如下：\n${dbContext}\n\n请基于以上数据库信息和你的法规知识，提供更详细的法规分析和建议。格式要求：\n1. 详细解读每个标准的适用范围和限制\n2. 具体的使用量和添加要求（如有）\n3. 申报路径建议（普通食品/保健食品/特殊膳食等）\n4. 实际应用中需要注意的合规要点\n5. 与类似原料的法规对比（如适用）\n末尾标注"⚠️ AI增强分析，仅供参考，不构成法律建议。"`
            : `用户查询原料法规："${rawQuery}"。该原料在我们的法规数据库中暂未收录。请按以下思路帮用户分析：

1. 该原料是否有直接法规依据？（如实说明）
2. 【关键】是否存在间接使用路径？是否可作为已批准原料的天然组分带入？是否可通过配方注册制间接使用？在国际上是否有FDA GRAS、EU Novel Food等批准？
3. 如要在中国主动使用，最可行的申报路径是什么？
4. 给用户具体的下一步操作建议

注意：不确定的地方明确标注"建议向监管部门确认"。末尾标注"⚠️ AI生成，仅供参考，不构成法律建议。"`;

          const aiRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: `你是资深食品法规顾问，专精中国食品安全法规体系。你的价值不在于背诵法规清单，而在于帮用户找到合规使用原料的路径。

【核心使命】
用户问"这个原料能用吗"，你要回答的不是简单的"能/不能"，而是：
- 如果能用 → 用在什么食品类别？有什么限制？需要什么资质？
- 如果不能直接用 → 有没有间接路径？作为组分带入？走配方注册？申报新食品原料？
- 如果完全空白 → 最接近的参考案例是什么？下一步怎么走？

【铁律 — 不可违反】
1. 只引用100%确定存在的标准编号，不确定的宁可不写
2. 具体限量数值必须是标准原文规定，不知道时说"查阅原文确认"
3. 明确标注信息来源：数据库事实 / 法规推断 / 推测需验证
4. 绝对禁止编造标准编号和法规文件名称
5. 提到"组分带入""配方注册"等间接路径时，要具体解释原理

【回答结构】
- 先说明原料在数据库中的收录状态
- 逐一分析可能的法规路径（直接使用 → 间接使用 → 申报路径）
- 每种路径都给出具体标准编号或法规依据
- 末段给出可操作的下一步建议
- 结尾标注"⚠️ AI增强分析，仅供参考，不构成法律建议。"` },
                { role: "user", content: aiPrompt }
              ],
              temperature: 0.3, max_tokens: 2000, stream: true,
            })
          });

          if (aiRes.ok) {
            const reader = aiRes.body?.getReader();
            if (reader) {
              const decoder = new TextDecoder();
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                for (const line of lines) {
                  if (!line.startsWith("data: ")) continue;
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                      fullAiContent += delta;
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "ai_chunk", content: delta })}\n\n`));
                    }
                  } catch {}
                }
              }
            }
          }
        } catch {}
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "ai_done", disclaimer: "法规数据库信息 + AI增强分析，仅供参考，不构成法律建议。" })}\n\n`));
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();

      const auth = await getRequestAuth();
      appendLog({ user_id: auth.user_id, api: "regulation", query: rawQuery, response_length: fullAiContent.length, response_snippet: fullAiContent.slice(0, 200), status_code: 200, duration_ms: Date.now() - startTime, error_type: auth.error_type });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
