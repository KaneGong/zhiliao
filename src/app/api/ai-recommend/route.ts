import { NextRequest, NextResponse } from "next/server";
import { getAllIngredients } from "@/lib/data";
import { appendLog, getRequestAuth } from "@/lib/logger";
import { CORE_SYSTEM, REGULATION_QUICK_REF, DEEP_REGULATIONS, detectQuestionTypes, buildPrompt } from "./prompt";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

const FOOD_KEYWORDS = [
  "食品", "原料", "配方", "营养", "蛋白", "维生素", "矿物质",
  "添加剂", "乳", "钙", "铁", "锌", "鱼油", "益生菌", "胶原",
  "法规", "标准", "GB", "标签", "声称", "保健", "婴幼儿",
  "运动营养", "特殊膳食", "功能食品", "饮料", "奶粉",
  "乳清", "酪蛋白", "乳铁蛋白", "乳矿物盐", "膳食纤维",
  "褪黑素", "GABA", "肌酸", "BCAA", "左旋肉碱",
  "抗氧化", "免疫力", "骨骼", "肠道", "睡眠", "美容",
  "减肥", "增肌", "代餐", "能量", "蛋白质", "脂肪",
  "碳水", "糖", "盐", "钠", "钾", "镁", "硒",
  "鱼", "藻", "大豆", "植物蛋白", "乳糖",
  "食品安全", "生产许可", "SC认证", "HACCP",
  "知料", "原料库", "供应商",
];

function isFoodRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  if (FOOD_KEYWORDS.some((kw) => lowerQuery.includes(kw.toLowerCase()))) return true;
  const nonFoodPatterns = [
    /写.*(代码|程序|脚本|爬虫)/,
    /^(?:python|java|react|vue|angular|docker|kubernetes|linux)\b/i,
    /(?:炒股|股票|期货|基金|crypto|bitcoin)/i,
    /(?:天气|机票|酒店|旅游攻略)/,
  ];
  return !nonFoodPatterns.some((pattern) => pattern.test(lowerQuery));
}

export async function POST(request: NextRequest) {
  const { query, history } = await request.json();
  const startTime = Date.now();

  if (!query?.trim()) {
    return NextResponse.json({ error: "请输入需求描述" }, { status: 400 });
  }

  if (!isFoodRelated(query) && (!history || history.length === 0)) {
    return NextResponse.json({
      query,
      recommendation: `感谢您的提问。知料平台专注于**食品原料和配方方案**，您的问题似乎不属于食品原料、配方设计或食品法规的范畴。\n\n我能帮您解答的问题包括：\n- 食品原料推荐与配方设计\n- 中国食品安全法规咨询\n- 原料功能与应用场景匹配\n- 标签声称合规性检查\n\n如果您有食品相关的问题，欢迎随时提问！`,
      disclaimer: "知料平台专注于食品原料和配方方案。",
    });
  }

  // 构建系统提示词
  const products = getAllIngredients();
  const productSummary = products
    .map((p) => `${p.generic_name || p.product_name} | 类别: ${p.category} | 来源: ${p.source} | 功能: ${(p.functional_tags || []).join(",")} | 应用: ${(p.applications || []).join(",")}`)
    .join("\n");
  const systemPrompt = buildPrompt(query, productSummary);

  // 流式响应
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        const res = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
              { role: "user", content: query },
            ],
            temperature: 0.3,
            max_tokens: 4000,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `AI 服务错误 (${res.status})` })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();

          appendLog({ user_id: null, api: "recommend", query, response_length: 0, response_snippet: errText.slice(0, 200), status_code: res.status, duration_ms: Date.now() - startTime, error_type: `DeepSeek API ${res.status}` });
          return;
        }

        // 读取 DeepSeek SSE 流并转发
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

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
                fullContent += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
              }
            } catch {}
          }
        }

        // 发送完成标记和元数据
        const auth = await getRequestAuth();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, disclaimer: "以上方案由 AI 生成，仅供参考。实际配方请咨询专业食品研发人员并进行法规确认。" })}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();

        appendLog({ user_id: auth.user_id, api: "recommend", query, response_length: fullContent.length, response_snippet: fullContent.slice(0, 200), status_code: 200, duration_ms: Date.now() - startTime, error_type: auth.error_type });

      } catch (e: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "AI 推荐服务暂时不可用: " + e.message })}\n\n`));
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();

        appendLog({ user_id: null, api: "recommend", query, response_length: 0, response_snippet: "", status_code: 500, duration_ms: Date.now() - startTime, error_type: e.message });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
