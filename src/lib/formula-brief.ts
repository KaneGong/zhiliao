import type { VerificationResult } from "@/lib/verify-output";

export type RegulatoryPath = "普通食品" | "保健食品" | "特殊食品" | "待确认" | string;
export type RiskLevel = "低" | "中" | "高" | "需复核" | string;
export type EvidenceLevel = "法规明确" | "平台数据" | "文献/经验" | "待验证" | string;

export interface ProductBrief {
  product_type: string;
  target_audience: string;
  usage_scene: string;
  regulatory_path: RegulatoryPath;
  dosage_form: string;
  cost_constraint: string;
  key_constraints: string[];
}

export interface FormulaIngredient {
  name: string;
  role: string;
  suggested_dosage: string;
  regulatory_note: string;
  evidence_level: EvidenceLevel;
}

export interface FormulaRoute {
  route_name: string;
  route_type: "保守路线" | "主流路线" | "创新路线" | string;
  suitable_for: string;
  core_ingredients: FormulaIngredient[];
  supporting_ingredients: FormulaIngredient[];
  functional_logic: string;
  process_and_flavor_notes: string[];
  cost_level: "低" | "中" | "高" | string;
  main_risks: string[];
  recommendation_reason: string;
}

export interface ComplianceCheck {
  check_item: string;
  risk_level: RiskLevel;
  general_food_allowed: string;
  health_food_note: string;
  novel_food_note: string;
  nutrient_fortification_note: string;
  prohibited_expressions: string[];
  alternative_expressions: string[];
  references: string[];
  human_review_points: string[];
}

export interface SupplierMatch {
  ingredient: string;
  supplier_name: string;
  product_name: string;
  platform_available: boolean;
  match_reason: string;
  next_action: string;
}

export interface ClaimSuggestion {
  positioning_sentence: string;
  allowed_expressions: string[];
  risky_expressions: string[];
  channel_notes: string[];
}

export interface TrustScore {
  total_score: number;
  regulatory_coverage: number;
  ingredient_coverage: number;
  unknown_ingredients_count: number;
  supplier_match_score: number;
  risk_prompt_completeness: number;
  evidence_summary: string;
}

export interface FormulaBrief {
  schema_version: "formula_brief_v1";
  id: string;
  query: string;
  created_at: string;
  product_brief: ProductBrief;
  formula_routes: FormulaRoute[];
  compliance_checks: ComplianceCheck[];
  supplier_matches: SupplierMatch[];
  claim_suggestions: ClaimSuggestion;
  trust_score: TrustScore;
  next_steps: string[];
  markdown_summary: string;
}

function asString(value: unknown, fallback = "待确认"): string {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => asString(v, "")).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function clampScore(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeIngredient(value: unknown): FormulaIngredient {
  const v = (value || {}) as Record<string, unknown>;
  return {
    name: asString(v.name || v.ingredient, "待确认原料"),
    role: asString(v.role || v.function, "配方角色待确认"),
    suggested_dosage: asString(v.suggested_dosage || v.dosage || v.amount, "需打样确认"),
    regulatory_note: asString(v.regulatory_note || v.compliance_note, "法规路径需复核"),
    evidence_level: asString(v.evidence_level, "待验证"),
  };
}

function normalizeRoute(value: unknown, index: number): FormulaRoute {
  const v = (value || {}) as Record<string, unknown>;
  const defaults = ["保守路线", "主流路线", "创新路线"];
  return {
    route_name: asString(v.route_name || v.name, defaults[index] || `路线 ${index + 1}`),
    route_type: asString(v.route_type || v.type, defaults[index] || "方案路线"),
    suitable_for: asString(v.suitable_for || v.scene, "适用场景待确认"),
    core_ingredients: Array.isArray(v.core_ingredients) ? v.core_ingredients.map(normalizeIngredient) : [],
    supporting_ingredients: Array.isArray(v.supporting_ingredients) ? v.supporting_ingredients.map(normalizeIngredient) : [],
    functional_logic: asString(v.functional_logic || v.logic, "原料协同逻辑需进一步确认"),
    process_and_flavor_notes: asStringArray(v.process_and_flavor_notes || v.process_notes || v.flavor_notes),
    cost_level: asString(v.cost_level, "中"),
    main_risks: asStringArray(v.main_risks || v.risks),
    recommendation_reason: asString(v.recommendation_reason || v.reason, "可作为初步研发讨论方案"),
  };
}

function normalizeCompliance(value: unknown): ComplianceCheck {
  const v = (value || {}) as Record<string, unknown>;
  return {
    check_item: asString(v.check_item || v.item, "合规检查"),
    risk_level: asString(v.risk_level, "需复核"),
    general_food_allowed: asString(v.general_food_allowed, "需确认普通食品适用性"),
    health_food_note: asString(v.health_food_note, "如涉及保健功能声称需走保健食品路径"),
    novel_food_note: asString(v.novel_food_note, "如涉及新食品原料需确认公告范围"),
    nutrient_fortification_note: asString(v.nutrient_fortification_note, "营养强化剂需符合 GB 14880 食品类别限制"),
    prohibited_expressions: asStringArray(v.prohibited_expressions),
    alternative_expressions: asStringArray(v.alternative_expressions),
    references: asStringArray(v.references),
    human_review_points: asStringArray(v.human_review_points),
  };
}

function normalizeSupplier(value: unknown): SupplierMatch {
  const v = (value || {}) as Record<string, unknown>;
  return {
    ingredient: asString(v.ingredient, "待匹配原料"),
    supplier_name: asString(v.supplier_name || v.supplier, "暂无匹配供应商"),
    product_name: asString(v.product_name || v.product, "暂无匹配产品"),
    platform_available: Boolean(v.platform_available),
    match_reason: asString(v.match_reason || v.reason, "需补充供应商资料后确认"),
    next_action: asString(v.next_action, "建议询样并索取规格书/COA"),
  };
}

function normalizeClaims(value: unknown): ClaimSuggestion {
  const v = (value || {}) as Record<string, unknown>;
  return {
    positioning_sentence: asString(v.positioning_sentence, "建议采用普通食品可承载的场景化表达，避免保健功能暗示。"),
    allowed_expressions: asStringArray(v.allowed_expressions),
    risky_expressions: asStringArray(v.risky_expressions),
    channel_notes: asStringArray(v.channel_notes),
  };
}

const CLAIM_RISK_TERMS = [
  "改善", "调节", "增强", "提高", "促进", "保护", "缓解", "预防", "治疗", "修复",
  "抗炎", "抗氧", "抗氧化", "锁水", "助眠", "睡眠质量", "免疫", "美容养颜", "逆龄",
  "减肥", "瘦身", "降血脂", "降血糖", "降血压", "心血管", "骨质疏松", "骨密度",
  "肠道菌群", "消化功能", "视力", "智力", "学习成绩", "疲劳", "排毒",
];

function hasRiskyClaimTerm(expression: string): boolean {
  return CLAIM_RISK_TERMS.some((term) => expression.includes(term));
}

function inferSafeClaimExpressions(query: string, productType: string): string[] {
  const text = `${query} ${productType}`;
  const suggestions = new Set<string>();

  if (/睡|眠|夜|放松/.test(text)) {
    suggestions.add("睡前场景适用");
    suggestions.add("夜间轻负担风味体验");
  }
  if (/儿童|孩子|学生|益生菌|DHA/.test(text)) {
    suggestions.add("适合日常营养补充场景");
    suggestions.add("清晰标注适用人群、食用方法和菌株/原料信息");
  }
  if (/骨|钙|银发|维生素D|乳制品/.test(text)) {
    suggestions.add("含钙/维生素D等营养成分，具体声称需满足标签标准条件");
    suggestions.add("适合作为日常营养补充乳制品");
  }
  if (/美容|胶原|皮肤|透明质酸|小红书|直播/.test(text)) {
    suggestions.add("添加胶原蛋白肽等原料");
    suggestions.add("轻负担口感与日常饮用场景");
  }
  if (/蛋白|运动|健身|恢复/.test(text)) {
    suggestions.add("运动后蛋白补充场景");
    suggestions.add("口感清爽、补给方便");
  }
  if (/omega|Omega|鱼油|藻油|DHA|EPA/.test(text)) {
    suggestions.add("DHA/EPA 脂肪酸来源");
    suggestions.add("日常营养补充场景");
  }
  if (/低糖|控糖/.test(text)) suggestions.add("低糖配方，具体声称需满足 GB 28050 条件");

  suggestions.add("以原料事实、食用场景和感官体验为主");
  return [...suggestions].slice(0, 5);
}

function sanitizeClaimSuggestions(claims: ClaimSuggestion, query: string, productType: string): ClaimSuggestion {
  const risky = new Set(claims.risky_expressions.filter(Boolean));
  const allowed = claims.allowed_expressions.filter((expression) => {
    if (!hasRiskyClaimTerm(expression)) return true;
    risky.add(expression);
    return false;
  });

  const safeFallbacks = inferSafeClaimExpressions(query, productType);
  for (const fallback of safeFallbacks) {
    if (allowed.length >= 5) break;
    if (!hasRiskyClaimTerm(fallback) && !allowed.includes(fallback)) allowed.push(fallback);
  }

  return {
    ...claims,
    allowed_expressions: allowed.slice(0, 6),
    risky_expressions: [...risky].slice(0, 10),
  };
}

function sanitizeComplianceChecks(checks: ComplianceCheck[], riskyExpressions: string[]): ComplianceCheck[] {
  const risky = riskyExpressions.filter(Boolean);
  return checks.map((check) => {
    const prohibited = new Set(check.prohibited_expressions.filter(Boolean));
    const alternative = check.alternative_expressions.filter((expression) => {
      if (!hasRiskyClaimTerm(expression)) return true;
      prohibited.add(expression);
      return false;
    });

    for (const expression of risky) {
      if (hasRiskyClaimTerm(expression)) prohibited.add(expression);
    }

    return {
      ...check,
      prohibited_expressions: [...prohibited].slice(0, 10),
      alternative_expressions: alternative.slice(0, 6),
    };
  });
}

export function createTrustScore(
  verification: VerificationResult | null | undefined,
  supplierMatches: SupplierMatch[] = [],
  complianceChecks: ComplianceCheck[] = []
): TrustScore {
  const total = verification?.summary.total ?? 0;
  const verified = verification?.summary.verified ?? 0;
  const unknown = verification?.summary.notFound ?? 0;
  const caution = verification?.summary.caution ?? 0;
  const healthOnly = verification?.summary.healthFoodOnly ?? 0;
  const regulatoryCoverage = total > 0 ? Math.round((verified / total) * 100) : 60;
  const ingredientCoverage = regulatoryCoverage;
  const supplierMatchScore = supplierMatches.length > 0
    ? Math.min(100, Math.round((supplierMatches.filter((s) => s.platform_available).length / supplierMatches.length) * 100))
    : 30;
  const riskPromptCompleteness = Math.min(100, 45 + complianceChecks.length * 15);
  const riskPenalty = unknown * 6 + caution * 4 + healthOnly * 8;
  const totalScore = clampScore(
    Math.round(regulatoryCoverage * 0.35 + ingredientCoverage * 0.2 + supplierMatchScore * 0.2 + riskPromptCompleteness * 0.25 - riskPenalty),
    65
  );

  return {
    total_score: totalScore,
    regulatory_coverage: regulatoryCoverage,
    ingredient_coverage: ingredientCoverage,
    unknown_ingredients_count: unknown,
    supplier_match_score: supplierMatchScore,
    risk_prompt_completeness: riskPromptCompleteness,
    evidence_summary: total > 0
      ? `已验证 ${verified}/${total} 个原料；未收录 ${unknown} 个；仅限保健食品或需谨慎 ${healthOnly + caution} 个。`
      : "当前方案未提取到足够原料验证信息，建议人工复核关键原料与法规路径。",
  };
}

function normalizeTrustScore(value: unknown, fallback: TrustScore): TrustScore {
  const v = (value || {}) as Record<string, unknown>;
  return {
    total_score: clampScore(v.total_score, fallback.total_score),
    regulatory_coverage: clampScore(v.regulatory_coverage, fallback.regulatory_coverage),
    ingredient_coverage: clampScore(v.ingredient_coverage, fallback.ingredient_coverage),
    unknown_ingredients_count: Math.max(0, Number(v.unknown_ingredients_count ?? fallback.unknown_ingredients_count) || 0),
    supplier_match_score: clampScore(v.supplier_match_score, fallback.supplier_match_score),
    risk_prompt_completeness: clampScore(v.risk_prompt_completeness, fallback.risk_prompt_completeness),
    evidence_summary: asString(v.evidence_summary, fallback.evidence_summary),
  };
}

export function extractFormulaBriefJson(content: string): unknown | null {
  const fencePatterns = [
    /(?:```|~~~)formula_brief_json\s*([\s\S]*?)(?:```|~~~)/i,
    /(?:```|~~~)json\s*([\s\S]*?"schema_version"\s*:\s*"formula_brief_v1"[\s\S]*?)(?:```|~~~)/i,
    /(?:```|~~~)json\s*([\s\S]*?"product_brief"[\s\S]*?"formula_routes"[\s\S]*?)(?:```|~~~)/i,
  ];

  for (const pattern of fencePatterns) {
    const match = content.match(pattern);
    if (!match?.[1]) continue;
    try {
      return JSON.parse(match[1].trim());
    } catch {}
  }

  const marker = content.match(/\{\s*"schema_version"\s*:\s*"formula_brief_v1"[\s\S]*\}\s*$/i);
  if (marker?.[0]) {
    try { return JSON.parse(marker[0]); } catch {}
  }

  return null;
}

export function stripFormulaBriefJson(content: string): string {
  return content
    .replace(/(?:```|~~~)formula_brief_json\s*[\s\S]*?(?:```|~~~|$)/gi, "")
    .replace(/(?:```|~~~)json\s*[\s\S]*?"schema_version"\s*:\s*"formula_brief_v1"[\s\S]*?(?:```|~~~|$)/gi, "")
    .replace(/(?:```|~~~)json\s*[\s\S]*?"product_brief"[\s\S]*?"formula_routes"[\s\S]*?(?:```|~~~|$)/gi, "")
    .trim();
}

export function normalizeFormulaBrief(
  raw: unknown,
  query: string,
  markdownSummary: string,
  verification?: VerificationResult | null
): FormulaBrief | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const routes = Array.isArray(v.formula_routes) ? v.formula_routes.map(normalizeRoute).slice(0, 4) : [];
  const checks = Array.isArray(v.compliance_checks) ? v.compliance_checks.map(normalizeCompliance).slice(0, 6) : [];
  const suppliers = Array.isArray(v.supplier_matches) ? v.supplier_matches.map(normalizeSupplier).slice(0, 8) : [];

  if (!v.product_brief && routes.length === 0 && checks.length === 0) return null;

  const productBrief = {
    product_type: asString((v.product_brief as Record<string, unknown> | undefined)?.product_type),
    target_audience: asString((v.product_brief as Record<string, unknown> | undefined)?.target_audience),
    usage_scene: asString((v.product_brief as Record<string, unknown> | undefined)?.usage_scene),
    regulatory_path: asString((v.product_brief as Record<string, unknown> | undefined)?.regulatory_path),
    dosage_form: asString((v.product_brief as Record<string, unknown> | undefined)?.dosage_form),
    cost_constraint: asString((v.product_brief as Record<string, unknown> | undefined)?.cost_constraint),
    key_constraints: asStringArray((v.product_brief as Record<string, unknown> | undefined)?.key_constraints),
  };
  const sanitizedClaims = sanitizeClaimSuggestions(normalizeClaims(v.claim_suggestions), query, productBrief.product_type);
  const sanitizedChecks = sanitizeComplianceChecks(checks, sanitizedClaims.risky_expressions);
  const fallbackTrust = createTrustScore(verification, suppliers, sanitizedChecks);

  return {
    schema_version: "formula_brief_v1",
    id: asString(v.id, `brief-${Date.now()}`),
    query,
    created_at: asString(v.created_at, new Date().toISOString()),
    product_brief: productBrief,
    formula_routes: routes,
    compliance_checks: sanitizedChecks,
    supplier_matches: suppliers,
    claim_suggestions: sanitizedClaims,
    trust_score: normalizeTrustScore(v.trust_score, fallbackTrust),
    next_steps: asStringArray(v.next_steps).slice(0, 6),
    markdown_summary: asString(v.markdown_summary, markdownSummary.slice(0, 1200)),
  };
}
