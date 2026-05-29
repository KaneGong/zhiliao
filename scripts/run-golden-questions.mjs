#!/usr/bin/env node

const BASE_URL = (process.env.ZHILIAO_BASE_URL || "http://127.0.0.1:3010").replace(/\/$/, "");
const ENDPOINT = `${BASE_URL}/api/ai-recommend`;
const TIMEOUT_MS = Number(process.env.GOLDEN_TIMEOUT_MS || 120_000);
const MAX_RETRIES = Number(process.env.GOLDEN_RETRIES ?? 1);
const RUN_SET = process.env.GOLDEN_SET === "all" || process.argv.includes("--all") ? "all" : "p0";

const ALL_GOLDEN_QUESTIONS = [
  {
    id: "GQ-001",
    tier: "P0",
    title: "助眠软糖 / 普通食品边界",
    query: "开发一款面向办公人群的低糖助眠软糖，需要普通食品可用原料，风味温和，成本可控。",
  },
  {
    id: "GQ-002",
    tier: "P0",
    title: "运动蛋白饮 / 成本与口感",
    query: "做一款运动后恢复用的高蛋白饮料，目标人群是健身男性，希望口感清爽，蛋白含量有卖点，但成本不能太高。",
  },
  {
    id: "GQ-003",
    tier: "P0",
    title: "儿童益生菌 / 家长可理解但不踩线",
    query: "开发一款儿童益生菌固体饮料，希望家长容易理解，主打肠道健康和日常营养支持，但不能踩保健食品声称风险。",
  },
  {
    id: "GQ-004",
    tier: "P0",
    title: "银发骨骼健康乳制品",
    query: "做一款面向银发人群的骨骼健康乳制品，希望结合乳矿物盐、维生素D、蛋白质等原料，适合日常饮用。",
  },
  {
    id: "GQ-005",
    tier: "P0",
    title: "女性美容胶原饮",
    query: "做一款女性美容方向的胶原蛋白饮，想突出皮肤状态、光泽感和轻负担，渠道主要是小红书和直播电商。",
  },
  {
    id: "GQ-006",
    tier: "P1",
    title: "控糖代餐奶昔",
    query: "开发一款体重管理方向的控糖代餐奶昔，希望高饱腹、低GI、适合早餐代餐，但不希望被认定为减肥功效宣传。",
  },
  {
    id: "GQ-007",
    tier: "P1",
    title: "植物基蛋白饮",
    query: "开发一款植物基蛋白饮，目标人群是轻健身和素食用户，希望口感顺滑、蛋白质量高、配方干净。",
  },
  {
    id: "GQ-008",
    tier: "P1",
    title: "高蛋白零食棒",
    query: "做一款高蛋白零食棒，适合办公室和运动后补充，希望甜度低、饱腹感强、口感不粉。",
  },
  {
    id: "GQ-009",
    tier: "P1",
    title: "银发营养粉",
    query: "做一款银发人群日常营养粉，希望支持蛋白补充、骨骼营养和肠道友好，要求冲调方便。",
  },
  {
    id: "GQ-010",
    tier: "P1",
    title: "免疫方向饮品",
    query: "开发一款日常防护场景的营养饮品，希望围绕维生素C、锌、益生菌等做卖点，但不能说增强免疫。",
  },
  {
    id: "GQ-011",
    tier: "P2",
    title: "儿童 DHA 日常营养粉",
    query: "开发一款儿童 DHA 成长营养粉，希望家长能理解 DHA 价值，剂型是果味固体饮料，但不能宣称提高智力、改善视力或提高学习成绩。",
  },
  {
    id: "GQ-012",
    tier: "P2",
    title: "Omega-3 普通食品与保健食品路径分流",
    query: "做一款成人 Omega-3 补充产品，希望使用鱼油或藻油原料，既想做日常营养补充，也想了解能否表达辅助降血脂等卖点。",
  },
  {
    id: "GQ-013",
    tier: "P2",
    title: "运动电解质果冻 / 补水场景但不医疗化",
    query: "开发一款运动后食用的电解质果冻，目标用户是跑步和户外运动人群，希望主打清爽补给、低糖、便携，但不能宣称治疗脱水或快速恢复体能。",
  },
  {
    id: "GQ-014",
    tier: "P2",
    title: "咖啡因能量饮 / 提神场景与疲劳声称边界",
    query: "做一款面向加班和电竞人群的咖啡因能量饮，希望比传统能量饮更轻负担，口感不甜腻，但不能踩缓解疲劳等保健功能风险。",
  },
  {
    id: "GQ-015",
    tier: "P2",
    title: "饮酒场景软糖 / 解酒护肝高风险表达",
    query: "开发一款聚餐饮酒场景的软糖，希望使用葛根、枳椇子、维生素等原料，想做成轻社交产品，但不能说解酒、护肝或保护肝脏。",
  },
  {
    id: "GQ-016",
    tier: "P2",
    title: "更年期女性营养粉 / 情绪睡眠骨骼多风险叠加",
    query: "做一款面向 45 岁以上女性的日常营养粉，希望关注骨骼营养、轻负担和日常状态管理，但不能宣称调节激素、改善睡眠或缓解更年期症状。",
  },
  {
    id: "GQ-017",
    tier: "P2",
    title: "低钠调味粉 / 健康厨房但不疾病化",
    query: "开发一款家庭厨房用低钠调味粉，希望减少钠摄入，同时保留鲜味，目标是中老年家庭，但不能宣称降血压或预防心血管疾病。",
  },
  {
    id: "GQ-018",
    tier: "P2",
    title: "膳食纤维气泡水 / 饱腹与体重管理边界",
    query: "做一款含膳食纤维的低糖气泡水，希望有轻饱腹感，适合下午茶和控糖人群，但不能说减肥、燃脂或降血糖。",
  },
  {
    id: "GQ-019",
    tier: "P2",
    title: "植物甾醇酸奶 / 普通食品与保健路径分流",
    query: "开发一款添加植物甾醇酯的酸奶，希望面向关注血脂和心血管健康的成年人，但想先按普通食品路径评估能怎么表达。",
  },
  {
    id: "GQ-020",
    tier: "P2",
    title: "烘焙友好蛋白早餐饼 / 高蛋白但不健身药效化",
    query: "做一款适合早餐和办公室场景的高蛋白烘焙饼，想兼顾口感、饱腹和低糖，希望不粉不硬，适合女性和轻健身人群。",
  },
];

const GOLDEN_QUESTIONS = RUN_SET === "all"
  ? ALL_GOLDEN_QUESTIONS
  : ALL_GOLDEN_QUESTIONS.filter((question) => question.tier === "P0");

const RISK_TERMS = [
  "改善睡眠", "助眠", "增强免疫", "提高免疫", "调节肠道菌群", "改善消化", "肠道健康",
  "美容养颜", "改善皮肤", "锁水", "补水", "抗氧化", "抗衰", "逆龄", "水光肌", "水光感",
  "促进钙吸收", "有助于钙吸收", "有助于钙的吸收", "增强骨骼", "强健骨骼", "骨骼健康", "预防骨质疏松", "改善骨密度",
  "减肥", "燃脂", "控血糖", "降血糖", "降血脂", "治疗", "预防", "缓解疲劳", "心血管保护",
  "提高智力", "改善视力", "促进大脑发育", "保护心血管", "解酒", "护肝", "保护肝脏", "降低酒精伤害",
  "调节激素", "缓解更年期症状", "降血压", "增强精力", "提高专注力", "代谢提升",
];

function compact(value, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function countAvailableSuppliers(matches) {
  return matches.filter((item) => item?.platform_available).length;
}

function hasUnavailablePlaceholder(matches) {
  return matches.some((item) => !item?.platform_available && /暂无平台匹配|暂无匹配|待补充/.test(`${item?.supplier_name || ""}${item?.product_name || ""}`));
}

function getUnknownIngredients(verification) {
  const ingredients = Array.isArray(verification?.ingredients) ? verification.ingredients : [];
  return ingredients
    .filter((item) => item?.status === "not_found")
    .map((item) => compact(item?.ingredient || item?.name || ""))
    .filter(Boolean);
}

async function readSseResponse(response) {
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let markdown = "";
  let brief = null;
  let verification = null;
  const errors = [];
  const statuses = [];
  let sawDone = false;

  const handlePayload = (payload) => {
    if (!payload) return;
    if (payload === "[DONE]") {
      sawDone = true;
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(payload);
    } catch {
      return;
    }
    if (parsed.content) markdown += parsed.content;
    if (parsed.replace_content !== undefined) markdown = parsed.replace_content || "";
    if (parsed.formula_brief) brief = parsed.formula_brief;
    if (parsed.verification) verification = parsed.verification;
    if (parsed.status) statuses.push(parsed.status);
    if (parsed.error || parsed.formula_brief_error) errors.push(parsed.error || parsed.formula_brief_error);
  };

  const drain = () => {
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const event of events) {
      const lines = event.split("\n").filter((line) => line.startsWith("data: "));
      if (!lines.length) continue;
      handlePayload(lines.map((line) => line.slice(6)).join("\n").trim());
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    drain();
  }

  if (buffer.trim()) {
    for (const line of buffer.split("\n")) {
      if (line.startsWith("data: ")) handlePayload(line.slice(6).trim());
    }
  }

  return { markdown, brief, verification, errors, statuses, sawDone };
}

async function runQuestionAttempt(question, attempt) {
  const started = Date.now();
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: question.query, history: [] }),
      signal: abort.signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const { markdown, brief, verification, errors, statuses, sawDone } = await readSseResponse(response);
    const routes = brief?.formula_routes || [];
    const checks = brief?.compliance_checks || [];
    const suppliers = brief?.supplier_matches || [];
    const allowed = brief?.claim_suggestions?.allowed_expressions || [];
    const riskyAllowed = allowed.filter((expression) => RISK_TERMS.some((term) => String(expression).includes(term)));
    const markdownHasJsonFence = /formula_brief_json/.test(markdown);
    const hasBrief = Boolean(brief);
    const unknownIngredients = getUnknownIngredients(verification);

    return {
      id: question.id,
      tier: question.tier,
      title: question.title,
      query: question.query,
      attempt,
      ok: hasBrief && riskyAllowed.length === 0 && !markdownHasJsonFence && errors.length === 0,
      duration_ms: Date.now() - started,
      hasBrief,
      routes: routes.length,
      checks: checks.length,
      suppliers: suppliers.length,
      availableSuppliers: countAvailableSuppliers(suppliers),
      hasUnavailablePlaceholder: hasUnavailablePlaceholder(suppliers),
      trust: brief?.trust_score?.total_score ?? null,
      riskyAllowed,
      errors,
      sawDone,
      markdownHasJsonFence,
      statuses,
      verificationPresent: Boolean(verification),
      verificationSummary: verification?.summary || null,
      unknownIngredients,
      productType: brief?.product_brief?.product_type ?? null,
      regulatoryPath: brief?.product_brief?.regulatory_path ?? null,
      nextStepsCount: Array.isArray(brief?.next_steps) ? brief.next_steps.length : 0,
      summaryExcerpt: compact(brief?.markdown_summary || brief?.trust_score?.evidence_summary || "").slice(0, 160),
    };
  } catch (error) {
    return {
      id: question.id,
      tier: question.tier,
      title: question.title,
      query: question.query,
      attempt,
      ok: false,
      duration_ms: Date.now() - started,
      hasBrief: false,
      routes: 0,
      checks: 0,
      suppliers: 0,
      availableSuppliers: 0,
      hasUnavailablePlaceholder: false,
      trust: null,
      riskyAllowed: [],
      errors: [error?.name === "AbortError" ? `Timeout after ${TIMEOUT_MS}ms` : String(error?.message || error)],
      sawDone: false,
      markdownHasJsonFence: false,
      statuses: [],
      verificationPresent: false,
      verificationSummary: null,
      unknownIngredients: [],
      productType: null,
      regulatoryPath: null,
      nextStepsCount: 0,
      summaryExcerpt: "",
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function runQuestion(question) {
  const attempts = [];
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    const result = await runQuestionAttempt(question, attempt);
    attempts.push(result);
    if (result.ok) {
      return { ...result, attempts: attempts.length, attemptResults: attempts };
    }
    if (attempt <= MAX_RETRIES) {
      const reason = result.errors.length ? result.errors.join("；") : "acceptance check failed";
      console.log(`  retrying ${question.id} after attempt ${attempt} failed: ${reason}`);
    }
  }
  const last = attempts[attempts.length - 1];
  return { ...last, attempts: attempts.length, attemptResults: attempts };
}

function printResult(result) {
  const status = result.ok ? "PASS" : "FAIL";
  const riskText = result.riskyAllowed.length ? result.riskyAllowed.join("；") : "-";
  const errorText = result.errors.length ? result.errors.join("；") : "-";
  console.log([
    result.id,
    result.tier,
    status,
    `brief=${result.hasBrief ? "Y" : "N"}`,
    `routes=${result.routes}`,
    `checks=${result.checks}`,
    `suppliers=${result.suppliers}/${result.availableSuppliers} available`,
    `trust=${result.trust ?? "-"}`,
    `done=${result.sawDone ? "Y" : "N"}`,
    `verify=${result.verificationPresent ? "Y" : "N"}`,
    `unknown=${result.unknownIngredients.length}`,
    `jsonFence=${result.markdownHasJsonFence ? "Y" : "N"}`,
    `riskyAllowed=${riskText}`,
    `errors=${errorText}`,
    `attempts=${result.attempts || result.attempt || 1}`,
    `time=${Math.round(result.duration_ms / 1000)}s`,
  ].join(" | "));
}

async function main() {
  console.log(`Golden Questions endpoint: ${ENDPOINT}`);
  console.log(`Question set: ${RUN_SET}`);
  console.log(`Questions in run: ${GOLDEN_QUESTIONS.length}`);
  console.log(`Timeout per question: ${TIMEOUT_MS}ms`);
  console.log(`Retries per question: ${MAX_RETRIES}`);
  console.log("");

  const results = [];
  for (const question of GOLDEN_QUESTIONS) {
    console.log(`Running ${question.id} [${question.tier}] — ${question.title}`);
    const result = await runQuestion(question);
    results.push(result);
    printResult(result);
    console.log("");
  }

  const passed = results.filter((result) => result.ok).length;
  const hasBrief = results.filter((result) => result.hasBrief).length;
  const jsonLeaks = results.filter((result) => result.markdownHasJsonFence).length;
  const riskyAllowedCount = results.reduce((sum, result) => sum + result.riskyAllowed.length, 0);
  const sawDoneCount = results.filter((result) => result.sawDone).length;
  const verificationCount = results.filter((result) => result.verificationPresent).length;

  const summary = {
    endpoint: ENDPOINT,
    run_set: RUN_SET,
    total: results.length,
    passed,
    hasBrief,
    sawDoneCount,
    verificationCount,
    jsonLeaks,
    riskyAllowedCount,
    results,
  };

  console.log("Summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (passed !== results.length) {
    process.exitCode = 1;
  }
}

main();
