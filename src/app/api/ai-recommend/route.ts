import { NextRequest, NextResponse } from "next/server";
import { getAllIngredients } from "@/lib/data";
import { appendLog, getRequestAuth } from "@/lib/logger";
import { buildPrompt } from "./prompt";
import { verifyAIOutput, type VerificationResult } from "@/lib/verify-output";
import { extractFormulaBriefJson, normalizeFormulaBrief, stripFormulaBriefJson } from "@/lib/formula-brief";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function safeAppendLog(entry: Parameters<typeof appendLog>[0]) {
  try {
    appendLog(entry);
  } catch (e) {
    console.warn("[recommend-log] Failed to append log:", e);
  }
}

function getPendingIngredientsPath(fs: typeof import("fs"), path: typeof import("path")): string {
  const candidates = [
    process.env.ZHILIAO_DATA_DIR,
    process.env.NODE_ENV === "production" ? "/opt/zhiliao/data" : undefined,
    path.join(process.cwd(), ".next", "local-data"),
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return path.join(dir, "pending-ingredients.json");
    } catch {}
  }
  throw new Error("No writable pending ingredients directory");
}

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

  const products = getAllIngredients();
  const productSummary = products
    .map((p) => `${p.generic_name || p.product_name} | 类别: ${p.category} | 来源: ${p.source} | 功能: ${(p.functional_tags || []).join(",")} | 应用: ${(p.applications || []).join(",")}`)
    .join("\n");
  const systemPrompt = buildPrompt(query, productSummary);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";
      let visibleContent = "";
      let outgoingTail = "";
      let suppressFormulaJson = false;
      let streamClosed = false;

      const sendEvent = (payload: unknown) => {
        if (streamClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      };

      const sendDoneAndClose = () => {
        if (streamClosed) return;
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
        streamClosed = true;
      };

      const enqueueVisibleContent = (delta: string) => {
        if (!delta || suppressFormulaJson) return;
        const combined = outgoingTail + delta;
        const markerMatch = combined.match(/```formula_brief_json|~~~formula_brief_json/i);

        if (markerMatch?.index !== undefined) {
          const visibleDelta = combined.slice(0, markerMatch.index);
          if (visibleDelta) {
            visibleContent += visibleDelta;
            sendEvent({ content: visibleDelta });
          }
          outgoingTail = "";
          suppressFormulaJson = true;
          return;
        }

        const keepTail = 28;
        if (combined.length <= keepTail) {
          outgoingTail = combined;
          return;
        }

        const visibleDelta = combined.slice(0, -keepTail);
        outgoingTail = combined.slice(-keepTail);
        visibleContent += visibleDelta;
        sendEvent({ content: visibleDelta });
      };

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
            max_tokens: 6500,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          sendEvent({ error: `AI 服务错误 (${res.status})` });
          sendDoneAndClose();

          safeAppendLog({ user_id: null, api: "recommend", query, response_length: 0, response_snippet: errText.slice(0, 200), status_code: res.status, duration_ms: Date.now() - startTime, error_type: `DeepSeek API ${res.status}` });
          return;
        }

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
                enqueueVisibleContent(delta);
              }
            } catch {}
          }
        }

        if (!suppressFormulaJson && outgoingTail) {
          visibleContent += outgoingTail;
          sendEvent({ content: outgoingTail });
          outgoingTail = "";
        }

        const cleanContent = stripFormulaBriefJson(fullContent);
        const rawBrief = extractFormulaBriefJson(fullContent);

        if (cleanContent !== visibleContent) {
          sendEvent({ replace_content: cleanContent });
        }

        // ═══ 运行 AI 输出验证 ═══
        const verification: VerificationResult = verifyAIOutput(cleanContent || fullContent);
        const formulaBrief = normalizeFormulaBrief(rawBrief, query, cleanContent || fullContent, verification);
        sendEvent({ verification });
        if (formulaBrief) {
          sendEvent({ formula_brief: formulaBrief });
        } else {
          sendEvent({ formula_brief_error: rawBrief ? "结构化方案包解析失败，已保留 Markdown 输出" : "未检测到结构化方案包，已保留 Markdown 输出" });
        }

        // ═══ 保存未收录原料到 pending 队列 ═══
        const unknowns = verification.ingredients.filter(i => i.status === "not_found");
        if (unknowns.length > 0) {
          try {
            const fs = require("fs");
            const path = require("path");
            const pendingPath = getPendingIngredientsPath(fs, path);
            
            let pending: any[] = [];
            try { pending = JSON.parse(fs.readFileSync(pendingPath, "utf-8")); } catch {}
            
            const today = new Date().toISOString().split("T")[0];
            // Only save names that look like real ingredients (not descriptions)
            const ingredientPattern = /^[\u4e00-\u9fa5a-zA-Z]{2,12}(?:钙|镁|铁|锌|硒|钾|钠|蛋白|肽|提取物|油|粉|糖|酸|醇|酯|酶|菌|藻|胶|纤维|维生素|维他命|乳|蜜|汁|茶|叶|花|果|根|参|芝|精|素|剂|盐|碱)$/;
            const validNames = [...new Set(unknowns.map((u: any) => u.name))].filter((n: string) => {
              // Must match ingredient pattern or be 2-6 pure Chinese chars without punctuation
              if (ingredientPattern.test(n)) return true;
              if (/^[\u4e00-\u9fa5]{2,6}$/.test(n) && !n.startsWith('补') && !n.startsWith('不') && !n.startsWith('总结') && !n.startsWith('参考') && !n.startsWith('注意')) return true;
              return false;
            });
            for (const name of validNames) {
              const existing = pending.find((p: any) => p.name === name);
              if (existing) {
                existing.count++;
                existing.lastSeen = today;
              } else {
                pending.push({ name, count: 1, firstSeen: today, lastSeen: today, sourceQueries: [query] });
              }
            }
            fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
          } catch (e) {
            console.warn("[pending] Failed to save unknowns:", e);
          }
        }

        // 发送完成标记和元数据
        const auth = await getRequestAuth();
        sendEvent({ done: true, disclaimer: "以上方案由 AI 生成，仅供参考。实际配方请咨询专业食品研发人员并进行法规确认。" });
        sendDoneAndClose();

        safeAppendLog({ user_id: auth.user_id, api: "recommend", query, response_length: (cleanContent || fullContent).length, response_snippet: (cleanContent || fullContent).slice(0, 200), status_code: 200, duration_ms: Date.now() - startTime, error_type: auth.error_type });

      } catch (e: any) {
        sendEvent({ error: "AI 推荐服务暂时不可用: " + e.message });
        sendDoneAndClose();

        safeAppendLog({ user_id: null, api: "recommend", query, response_length: 0, response_snippet: "", status_code: 500, duration_ms: Date.now() - startTime, error_type: e.message });
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
