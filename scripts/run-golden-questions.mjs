#!/usr/bin/env node

const BASE_URL = (process.env.ZHILIAO_BASE_URL || "http://127.0.0.1:3010").replace(/\/$/, "");
const ENDPOINT = `${BASE_URL}/api/ai-recommend`;
const TIMEOUT_MS = Number(process.env.GOLDEN_TIMEOUT_MS || 120_000);
const MAX_RETRIES = Number(process.env.GOLDEN_RETRIES ?? 1);

const GOLDEN_QUESTIONS = [
  {
    id: "GQ-001",
    title: "助眠软糖 / 普通食品边界",
    query: "开发一款面向办公人群的低糖助眠软糖，需要普通食品可用原料，风味温和，成本可控。",
  },
  {
    id: "GQ-002",
    title: "运动蛋白饮 / 成本与口感",
    query: "做一款运动后恢复用的高蛋白饮料，目标人群是健身男性，希望口感清爽，蛋白含量有卖点，但成本不能太高。",
  },
  {
    id: "GQ-003",
    title: "儿童益生菌 / 家长可理解但不踩线",
    query: "开发一款儿童益生菌固体饮料，希望家长容易理解，主打肠道健康和日常营养支持，但不能踩保健食品声称风险。",
  },
  {
    id: "GQ-004",
    title: "银发骨骼健康乳制品",
    query: "做一款面向银发人群的骨骼健康乳制品，希望结合乳矿物盐、维生素D、蛋白质等原料，适合日常饮用。",
  },
  {
    id: "GQ-005",
    title: "女性美容胶原饮",
    query: "做一款女性美容方向的胶原蛋白饮，想突出皮肤状态、光泽感和轻负担，渠道主要是小红书和直播电商。",
  },
];

const RISK_TERMS = [
  "改善睡眠", "助眠", "增强免疫", "提高免疫", "调节肠道菌群", "改善消化", "肠道健康",
  "美容养颜", "改善皮肤", "锁水", "补水", "抗氧化", "抗衰", "逆龄", "水光肌", "水光感",
  "促进钙吸收", "有助于钙吸收", "有助于钙的吸收", "增强骨骼", "强健骨骼", "骨骼健康", "预防骨质疏松", "改善骨密度",
  "减肥", "燃脂", "控血糖", "降血脂", "治疗", "预防", "缓解疲劳", "心血管保护",
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

    return {
      id: question.id,
      title: question.title,
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
      verificationSummary: verification?.summary || null,
    };
  } catch (error) {
    return {
      id: question.id,
      title: question.title,
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
      verificationSummary: null,
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
    status,
    `brief=${result.hasBrief ? "Y" : "N"}`,
    `routes=${result.routes}`,
    `checks=${result.checks}`,
    `suppliers=${result.suppliers}/${result.availableSuppliers} available`,
    `trust=${result.trust ?? "-"}`,
    `done=${result.sawDone ? "Y" : "N"}`,
    `jsonFence=${result.markdownHasJsonFence ? "Y" : "N"}`,
    `riskyAllowed=${riskText}`,
    `errors=${errorText}`,
    `attempts=${result.attempts || result.attempt || 1}`,
    `time=${Math.round(result.duration_ms / 1000)}s`,
  ].join(" | "));
}

async function main() {
  console.log(`Golden Questions endpoint: ${ENDPOINT}`);
  console.log(`Timeout per question: ${TIMEOUT_MS}ms`);
  console.log(`Retries per question: ${MAX_RETRIES}`);
  console.log("");

  const results = [];
  for (const question of GOLDEN_QUESTIONS) {
    console.log(`Running ${question.id} — ${question.title}`);
    const result = await runQuestion(question);
    results.push(result);
    printResult(result);
    console.log("");
  }

  const passed = results.filter((result) => result.ok).length;
  const hasBrief = results.filter((result) => result.hasBrief).length;
  const jsonLeaks = results.filter((result) => result.markdownHasJsonFence).length;
  const riskyAllowedCount = results.reduce((sum, result) => sum + result.riskyAllowed.length, 0);

  const summary = {
    endpoint: ENDPOINT,
    total: results.length,
    passed,
    hasBrief,
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
