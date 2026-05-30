import { NextRequest, NextResponse } from "next/server";
import regulationsJson from "@/data/regulations.json";
import { appendLog, getRequestAuth } from "@/lib/logger";
import { verifyAIOutput, type VerificationResult } from "@/lib/verify-output";
import { buildRegulationPrompt, REGULATION_SYSTEM } from "./prompt";
import { buildPublicEvidencePromptBlock } from "@/lib/public-evidence";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

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

const SINGLE_CHAR_INGREDIENTS = new Set(["钙", "铁", "锌", "硒", "镁", "锰"]);
const GENERIC_LOOKUP_TOKENS = new Set(["普通食品", "generalfood"]);

function normalizeLookupText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）]/g, (m) => (m === "（" ? "(" : ")"))
    .replace(/\s+/g, "")
    .trim();
}

function addLookupToken(tokens: Set<string>, token: string) {
  const cleaned = token.trim();
  if (!cleaned) return;
  if (GENERIC_LOOKUP_TOKENS.has(normalizeLookupText(cleaned))) return;
  if (cleaned.length === 1 && !SINGLE_CHAR_INGREDIENTS.has(cleaned)) return;
  tokens.add(cleaned);
}

function splitAliasText(value: string): string[] {
  return value
    .split(/[、,，/／;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRegulationLookupTokens(entry: RegulationEntry): string[] {
  const tokens = new Set<string>();
  addLookupToken(tokens, entry.ingredient);

  const parenMatch = entry.ingredient.match(/^(.+?)[（(](.+)[）)]$/);
  if (parenMatch) {
    addLookupToken(tokens, parenMatch[1]);
    for (const alias of splitAliasText(parenMatch[2])) addLookupToken(tokens, alias);
  }

  const leadingLatin = entry.ingredient.match(/^[A-Za-z][A-Za-z0-9-]*/)?.[0];
  if (leadingLatin) addLookupToken(tokens, leadingLatin);

  if (entry.ingredient_en) {
    addLookupToken(tokens, entry.ingredient_en);
    const enParenMatch = entry.ingredient_en.match(/^(.+?)[(（](.+)[)）]$/);
    if (enParenMatch) {
      addLookupToken(tokens, enParenMatch[1]);
      for (const alias of splitAliasText(enParenMatch[2])) addLookupToken(tokens, alias);
    }
  }

  return [...tokens];
}

function scanKnownRegulations(segment: string): RegulationEntry[] {
  const normalizedSegment = normalizeLookupText(segment);
  const matches: Array<{ entry: RegulationEntry; token: string; score: number }> = [];

  for (const entry of regulations) {
    for (const token of getRegulationLookupTokens(entry)) {
      const normalizedToken = normalizeLookupText(token);
      if (!normalizedToken || !normalizedSegment.includes(normalizedToken)) continue;
      if (GENERIC_LOOKUP_TOKENS.has(normalizedToken)) continue;
      if (normalizedToken.length === 1 && normalizedSegment !== normalizedToken) continue;
      if (normalizedToken.length <= 2 && normalizedSegment.length > normalizedToken.length + 2) continue;

      let score = normalizedToken.length;
      if (normalizedSegment === normalizedToken) score += 100;
      if (normalizeLookupText(entry.ingredient) === normalizedToken) score += 60;
      if (entry.ingredient.startsWith(token)) score += 20;
      if (segment.includes(entry.ingredient)) score += 40;
      matches.push({ entry, token: normalizedToken, score });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  const seenEntries = new Set<string>();
  const seenTokens = new Set<string>();
  const found: RegulationEntry[] = [];

  for (const match of matches) {
    if (seenEntries.has(match.entry.ingredient)) continue;
    if (seenTokens.has(match.token) && match.token.length <= 4) continue;
    if (found.some((entry) => normalizeLookupText(entry.ingredient).includes(match.token))) continue;
    seenEntries.add(match.entry.ingredient);
    seenTokens.add(match.token);
    found.push(match.entry);
  }

  return found;
}

function cleanupUnknownIngredient(raw: string): string {
  const trimmed = raw.trim();
  const phraseMatch = trimmed.match(/^(.+?)(能不能|可不可以|能否|是否|可以|可否|适合|用于|用在|添加到|加到|怎么|如何|吗|呢|？|\?)/);
  const candidate = phraseMatch?.[1]?.trim();
  if (candidate && candidate.length >= 2) return candidate;
  return trimmed;
}

function extractRegulationIngredients(rawQuery: string): string[] {
  const segments = rawQuery
    .split(/[,，、;；\n]/)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const sourceSegments = segments.length > 0 ? segments : [rawQuery.trim()];
  const ingredients: string[] = [];

  for (const segment of sourceSegments) {
    const known = scanKnownRegulations(segment);
    if (known.length > 0) {
      ingredients.push(...known.map((entry) => entry.ingredient));
    } else {
      ingredients.push(cleanupUnknownIngredient(segment));
    }
  }

  return [...new Set(ingredients.filter(Boolean))];
}

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

function isFollowUpQuery(rawQuery: string, history: any[]): boolean {
  if (!history || history.length === 0) return false;

  // Follow-up patterns: check FIRST — they win over ingredient detection
  if (/^(那|那么|如果|那如果|还有|另外|补充|那在|那这|那这个|那具体|那怎么|那如何)/.test(rawQuery)) return true;
  if (rawQuery.length < 15) return true;
  if (/[吗呢]$/.test(rawQuery)) return true;

  // Check if query mentions a known ingredient (likely a new lookup, not a follow-up)
  const hasIngredientKeyword = regulations.some(
    (r) =>
      rawQuery.includes(r.ingredient) ||
      (r.ingredient_en && rawQuery.toLowerCase().includes(r.ingredient_en.toLowerCase()))
  );
  if (hasIngredientKeyword) return false;

  // No ingredient match + has history → treat as follow-up
  return true;
}

export async function POST(request: NextRequest) {
  const { query, history } = await request.json();
  const startTime = Date.now();
  const rawQuery = query || "";

  if (!rawQuery.trim()) {
    return NextResponse.json({ error: "请输入原料名称" }, { status: 400 });
  }

  const isFollowUp = isFollowUpQuery(rawQuery, history || []);
  const ingredients = isFollowUp
    ? []
    : extractRegulationIngredients(rawQuery);
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
        detail: `目前尚无"${ingredient}"的明确法规规范`,
        source: "知料法规数据库",
        data_confidence: "reference_only",
      });
    }
  }

  const hasDbResults = results.some((r) => r.status !== "not_found");
  const hasNoResults = results.every((r) => r.status === "not_found");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // ── 1. 发送 DB 结果（追问时跳过）──
      if (results.length > 0) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "db_results", checks: results })}\n\n`
          )
        );
      }

      let fullAiContent = "";

      // ── 2. AI 增强分析 ──
      if (hasDbResults || hasNoResults || isFollowUp) {
        try {
          const dbContext = hasDbResults
            ? results
                .map(
                  (r) =>
                    `【${r.ingredient}】合规状态：${r.status}，适用标准：${r.standard}，细则：${r.detail}。特殊说明：${(r.special_notes || []).join("；")}`
                )
                .join("\n")
            : "";

          const publicEvidenceContext = isFollowUp ? "" : buildPublicEvidencePromptBlock(rawQuery, 5);
          const userPrompt = buildRegulationPrompt(dbContext, rawQuery, hasDbResults, isFollowUp, publicEvidenceContext);

          const aiRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                { role: "system", content: REGULATION_SYSTEM },
                ...(history || []).map((m: any) => ({
                  role: m.role,
                  content: m.content,
                })),
                { role: "user", content: userPrompt },
              ],
              temperature: 0.3,
              max_tokens: 2000,
              stream: true,
            }),
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
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: "ai_chunk", content: delta })}\n\n`
                        )
                      );
                    }
                  } catch {}
                }
              }
            }
          }
        } catch {}
      }

      // ── 3. 验证 + pending 队列 ──
      if (fullAiContent) {
        const verification: VerificationResult = verifyAIOutput(fullAiContent);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "verification", data: verification })}\n\n`
          )
        );

        const unknowns = verification.ingredients.filter(
          (i) => i.status === "not_found"
        );
        if (unknowns.length > 0) {
          try {
            const fs = require("fs");
            const pendingPath = "/opt/zhiliao/data/pending-ingredients.json";
            fs.mkdirSync("/opt/zhiliao/data", { recursive: true });
            let pending: any[] = [];
            try { pending = JSON.parse(fs.readFileSync(pendingPath, "utf-8")); } catch {}
            const today = new Date().toISOString().split("T")[0];
            const pattern = /^[\u4e00-\u9fa5a-zA-Z]{2,12}(?:钙|镁|铁|锌|硒|钾|钠|蛋白|肽|提取物|油|粉|糖|酸|醇|酯|酶|菌|藻|胶|纤维|维生素|维他命|乳|蜜|汁|茶|叶|花|果|根|参|芝|精|素|剂|盐|碱)$/;
            const validNames = [...new Set(unknowns.map((u: any) => u.name))].filter((n: string) => pattern.test(n));
            for (const name of validNames) {
              const existing = pending.find((p: any) => p.name === name);
              if (existing) { existing.count++; existing.lastSeen = today; }
              else { pending.push({ name, count: 1, firstSeen: today, lastSeen: today, sourceQueries: [rawQuery] }); }
            }
            fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
          } catch (e) { console.warn("[reg pending] Failed:", e); }
        }
      }

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "ai_done", disclaimer: "法规数据库 + AI 分析，仅供参考，不构成法律建议。" })}\n\n`
        )
      );
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();

      const auth = await getRequestAuth();
      appendLog({
        user_id: auth.user_id, api: "regulation", query: rawQuery,
        response_length: fullAiContent.length, response_snippet: fullAiContent.slice(0, 200),
        status_code: 200, duration_ms: Date.now() - startTime, error_type: auth.error_type,
      });
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
  });
}
