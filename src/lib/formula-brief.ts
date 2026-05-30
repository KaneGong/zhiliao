import { resolveFormulaBriefSeedContext, type FormulaBriefSeedContext, type SeedScenarioConfig } from "@/lib/formula-brief-seeds";
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

export interface FormulaBriefSupplierCatalogEntry {
  generic_name?: string | null;
  generic_name_en?: string | null;
  product_name?: string | null;
  supplier_name?: string | null;
  supplier?: string | null;
  manufacturer?: string | null;
  source?: string | null;
  id?: string | null;
}

export interface NormalizeFormulaBriefOptions {
  /**
   * Current platform ingredient catalog shown to the model. When present,
   * any supplier_match marked platform_available=true must be verified
   * against this catalog before it can remain available.
   */
  supplierCatalog?: FormulaBriefSupplierCatalogEntry[];
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

function asPlatformAvailable(value: unknown): boolean {
  if (value === true) return true;
  if (value === false || value == null) return false;
  if (typeof value === "number") return value === 1;
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase();
  if (!normalized || ["false", "0", "no", "n", "none", "null", "暂无", "待补充", "待确认", "不可用"].includes(normalized)) {
    return false;
  }
  return ["true", "1", "yes", "y", "available", "平台已有", "平台可用", "已匹配", "可用"].includes(normalized);
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

const ROUTE_TYPE_ORDER = ["保守路线", "主流路线", "创新路线"] as const;

function normalizeRouteTypes(routes: FormulaRoute[]): FormulaRoute[] {
  if (routes.length < 2) return routes;
  return routes.map((route, index) => {
    const expectedType = ROUTE_TYPE_ORDER[index];
    if (!expectedType) return route;
    return {
      ...route,
      route_type: expectedType,
    };
  });
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
    platform_available: asPlatformAvailable(v.platform_available),
    match_reason: asString(v.match_reason || v.reason, "需补充供应商资料后确认"),
    next_action: asString(v.next_action, "建议询样并索取规格书/COA"),
  };
}

function normalizeMatchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, "")
    .replace(/[\s·•,，、/\|：:;；\-—_]+/g, "")
    .trim();
}

function catalogValues(entry: FormulaBriefSupplierCatalogEntry, keys: Array<keyof FormulaBriefSupplierCatalogEntry>): string[] {
  return keys
    .map((key) => normalizeMatchText(String(entry[key] ?? "")))
    .filter((value) => value.length >= 2);
}

function matchesCatalogValue(input: string, values: string[]): boolean {
  const normalized = normalizeMatchText(input);
  if (!normalized) return false;
  return values.some((value) => {
    if (!value) return false;
    if (normalized === value) return true;
    if (value.length >= 4 && normalized.includes(value)) return true;
    if (normalized.length >= 4 && value.includes(normalized)) return true;
    return false;
  });
}

function hasVerifiedCatalogSupplierMatch(
  supplier: SupplierMatch,
  supplierCatalog: FormulaBriefSupplierCatalogEntry[]
): boolean {
  if (!supplier.platform_available) return false;
  if (supplierCatalog.length === 0) return true;

  return supplierCatalog.some((entry) => {
    const supplierNames = catalogValues(entry, ["supplier_name", "supplier", "manufacturer"]);
    const productNames = catalogValues(entry, ["product_name", "id"]);
    const ingredientNames = catalogValues(entry, ["generic_name", "generic_name_en", "source", "product_name"]);

    return (
      matchesCatalogValue(supplier.supplier_name, supplierNames) &&
      matchesCatalogValue(supplier.product_name, productNames) &&
      (matchesCatalogValue(supplier.ingredient, ingredientNames) || matchesCatalogValue(supplier.product_name, ingredientNames))
    );
  });
}

function createUnverifiedSupplierDowngrade(supplier: SupplierMatch): SupplierMatch {
  return createUnavailableSupplierMatch(
    supplier.ingredient,
    "该供应商/产品未在当前平台原料目录核验，不能标记为平台可用。",
    "请先补充供应商规格书、COA、适用食品类别和平台目录记录后再询样。"
  );
}

const SUPPLIER_CORE_TERMS = [
  "益生菌", "菌株", "乳酸菌", "双歧杆菌", "杆菌",
  "胶原", "透明质酸", "玻尿酸",
  "乳矿物盐", "维生素d", "维生素D", "钙",
  "乳清", "酪蛋白", "蛋白", "肽",
  "膳食纤维", "菊粉", "低聚", "GOS", "FOS",
  "gaba", "茶氨酸", "酸枣仁",
  "dha", "epa", "鱼油", "藻油", "omega",
].map(normalizeMatchText);

function hasSupplierCoreOverlap(supplier: SupplierMatch, coreIngredients: FormulaIngredient[]): boolean {
  if (!supplier.platform_available) return true;
  if (coreIngredients.length === 0) return true;

  const supplierText = normalizeMatchText(`${supplier.ingredient} ${supplier.product_name}`);
  const supplierIngredient = normalizeMatchText(supplier.ingredient);
  const coreTexts = coreIngredients.map((ingredient) => normalizeMatchText(ingredient.name)).filter(Boolean);

  return coreTexts.some((core) => {
    if (!core) return false;
    if (supplierText.includes(core) || core.includes(supplierIngredient)) return true;
    return SUPPLIER_CORE_TERMS.some((term) => term.length >= 2 && core.includes(term) && supplierText.includes(term));
  });
}

function isProbioticIntent(query: string, productType: string): boolean {
  return /益生菌|菌株|乳酸菌|双歧杆菌/.test(`${query} ${productType}`);
}

function isProbioticSupplierMatch(supplier: SupplierMatch): boolean {
  return /益生菌|菌株|乳酸菌|双歧杆菌|杆菌/.test(`${supplier.ingredient} ${supplier.product_name}`);
}

function isSleepIntent(query: string, productType: string): boolean {
  return /助眠|睡眠|睡前|夜间|好眠|放松|舒缓|压力/.test(`${query} ${productType}`);
}

function isSleepOnlySupplierMatch(supplier: SupplierMatch): boolean {
  return /lactium|酪蛋白水解肽|褪黑素|gaba|γ-氨基丁酸|茶氨酸|酸枣仁|好眠|舒缓|助眠/i.test(`${supplier.ingredient} ${supplier.product_name}`);
}

function createUnavailableSupplierMatch(ingredient: string, reason: string, nextAction: string): SupplierMatch {
  return {
    ingredient,
    supplier_name: "暂无平台匹配",
    product_name: "暂无平台匹配",
    platform_available: false,
    match_reason: reason,
    next_action: nextAction,
  };
}

function supplierContainsKeyword(supplier: SupplierMatch, keywords: string[]): boolean {
  const text = `${supplier.ingredient} ${supplier.product_name} ${supplier.supplier_name}`.toLowerCase();
  return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
}

function buildSeedScenarioPlaceholder(scenario: SeedScenarioConfig, seedContext: FormulaBriefSeedContext): SupplierMatch {
  const ingredientProfile = seedContext.ingredientProfiles.find((item) => item.ingredient_id === scenario.ingredientId || item.id === scenario.ingredientId);
  const supplierSeed = seedContext.supplierSpecs.find((item) => item.supplier_id === scenario.supplierId || item.id === scenario.supplierId);
  const gapSnippet = ingredientProfile?.data_gaps?.slice(0, 3).join("、");
  const reason = gapSnippet
    ? `当前平台原料目录暂无该场景核心原料的真实匹配，需补齐 ${gapSnippet} 等资料后再建立供应商匹配。`
    : "当前平台原料目录暂无该场景核心原料的真实匹配，不能用相邻原料凑 supplier_matches。";

  return createUnavailableSupplierMatch(
    scenario.placeholderIngredient,
    reason,
    supplierSeed?.next_contact_action || "优先补充规格书、COA、适用食品类别与应用案例。"
  );
}

function applySeedSupplierGuidance(suppliers: SupplierMatch[], seedContext: FormulaBriefSeedContext): SupplierMatch[] {
  if (seedContext.scenarios.length === 0) return suppliers.slice(0, 8);

  const filtered = suppliers.filter((supplier) => {
    if (!supplier.platform_available) return true;
    return seedContext.scenarios.some((scenario) => supplierContainsKeyword(supplier, scenario.supplierKeywords));
  });

  for (const scenario of seedContext.scenarios) {
    const hasAvailableMatch = filtered.some((supplier) => supplier.platform_available && supplierContainsKeyword(supplier, scenario.supplierKeywords));
    const hasPlaceholder = filtered.some((supplier) => !supplier.platform_available && (supplierContainsKeyword(supplier, scenario.supplierKeywords) || supplier.ingredient.includes(scenario.placeholderIngredient)));
    if (!hasAvailableMatch && !hasPlaceholder) {
      filtered.unshift(buildSeedScenarioPlaceholder(scenario, seedContext));
    }
  }

  const deduped: SupplierMatch[] = [];
  const seen = new Set<string>();
  for (const supplier of filtered) {
    const key = normalizeMatchText(`${supplier.ingredient}|${supplier.supplier_name}|${supplier.product_name}`);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(supplier);
  }

  return deduped.slice(0, 8);
}

function sanitizeSupplierMatches(
  suppliers: SupplierMatch[],
  routes: FormulaRoute[],
  query: string,
  productType: string,
  seedContext: FormulaBriefSeedContext,
  supplierCatalog: FormulaBriefSupplierCatalogEntry[] = []
): SupplierMatch[] {
  const coreIngredients = routes.flatMap((route) => route.core_ingredients || []);
  const probioticIntent = isProbioticIntent(query, productType);
  const sleepIntent = isSleepIntent(query, productType);
  const requiresCatalogVerification = supplierCatalog.length > 0;
  const seen = new Set<string>();
  const sanitized: SupplierMatch[] = [];

  for (const supplier of suppliers) {
    if (probioticIntent && supplier.platform_available && !isProbioticSupplierMatch(supplier)) continue;
    if (!sleepIntent && supplier.platform_available && isSleepOnlySupplierMatch(supplier)) continue;
    if (!hasSupplierCoreOverlap(supplier, coreIngredients)) continue;

    const available = supplier.platform_available && !/暂无|待匹配/.test(`${supplier.supplier_name}${supplier.product_name}`);
    const normalizedSupplier = available
      ? supplier
      : {
          ...supplier,
          supplier_name: supplier.supplier_name || "暂无平台匹配",
          product_name: supplier.product_name || "暂无平台匹配",
          platform_available: false,
        };
    if (
      requiresCatalogVerification &&
      normalizedSupplier.platform_available &&
      !hasVerifiedCatalogSupplierMatch(normalizedSupplier, supplierCatalog)
    ) {
      const downgraded = createUnverifiedSupplierDowngrade(normalizedSupplier);
      const key = normalizeMatchText(`${downgraded.ingredient}|${downgraded.supplier_name}|${downgraded.product_name}`);
      if (seen.has(key)) continue;
      seen.add(key);
      sanitized.push(downgraded);
      continue;
    }

    const key = normalizeMatchText(`${normalizedSupplier.ingredient}|${normalizedSupplier.supplier_name}|${normalizedSupplier.product_name}`);
    if (seen.has(key)) continue;
    seen.add(key);
    sanitized.push(normalizedSupplier);
  }

  if (probioticIntent && !sanitized.some((supplier) => isProbioticSupplierMatch(supplier))) {
    sanitized.unshift(createUnavailableSupplierMatch(
      "益生菌菌株",
      "当前平台原料目录未收录可直接匹配的益生菌菌株供应商，不能用益生元、膳食纤维或矿物质原料替代菌株匹配。",
      "补充目标菌株、活菌数、适用食品类别、法规状态与供应商规格书后再询样。"
    ));
  }

  return applySeedSupplierGuidance(sanitized.slice(0, 8), seedContext);
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
  "抗炎", "抗氧", "抗氧化", "锁水", "补水", "水光", "水光感", "水光肌", "内服补水", "助眠", "促进睡眠", "深度睡眠", "睡眠质量", "好眠", "安神", "失眠", "放松身心", "舒缓压力", "舒缓",
  "免疫", "增强免疫", "提高免疫", "抗病毒", "预防感冒", "抵抗力", "防护力", "美容养颜", "美容", "逆龄", "抗衰", "皮肤状态", "改善皮肤", "皮肤喝饱水",
  "减肥", "瘦身", "燃脂", "控血糖", "降血脂", "降血糖", "辅助降血脂", "降血压", "心血管", "保护心血管", "三高", "预防三高",
  "治疗脱水", "快速恢复", "快速恢复体能", "医疗补液", "缓解疲劳",
  "解酒", "醒酒", "护肝", "保肝", "肝脏", "降低酒精伤害", "酒精代谢",
  "抵抗病毒", "快速增肌", "代谢提升", "塑形效果", "高血压治疗",
  "骨质疏松", "骨密度", "骨骼健康", "增强骨骼", "强健骨骼", "促进钙吸收", "有助于钙吸收", "有助于钙的吸收", "助力钙质利用", "钙质利用", "钙的吸收", "骨骼和牙齿", "骨骼发育", "关节健康", "肠道菌群", "肠道健康", "有益菌生长", "帮助有益菌", "改善消化",
  "消化功能", "视力", "智力", "学习成绩", "疲劳", "排毒",
];

function cleanExpressionList(expressions: string[]): string[] {
  const invalid = new Set(["无", "暂无", "无明显", "不适用", "待确认", "none", "null", "n/a"]);
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const raw of expressions) {
    const expression = raw.trim();
    if (!expression || invalid.has(expression.toLowerCase())) continue;
    if (seen.has(expression)) continue;
    seen.add(expression);
    cleaned.push(expression);
  }
  return cleaned;
}

function hasRiskyClaimTerm(expression: string): boolean {
  return CLAIM_RISK_TERMS.some((term) => expression.includes(term));
}

function inferRiskyClaimExpressions(query: string, productType: string): string[] {
  const text = `${query} ${productType}`;
  const risky = new Set<string>();

  if (/助眠|睡眠|睡|眠|放松|压力|夜/.test(text)) {
    risky.add("助眠");
    risky.add("改善睡眠");
    risky.add("放松身心");
    risky.add("舒缓压力");
  }
  if (/儿童|孩子|益生菌|肠道|消化|免疫/.test(text)) {
    risky.add("调节肠道菌群");
    risky.add("改善消化");
    risky.add("增强免疫");
    risky.add("肠道健康");
  }
  if (/骨|钙|银发|维生素D|乳矿物盐|骨骼/.test(text)) {
    risky.add("增强骨骼");
    risky.add("促进钙吸收");
    risky.add("改善骨密度");
    risky.add("预防骨质疏松");
  }
  if (/美容|胶原|皮肤|透明质酸|小红书|直播|光泽|锁水|抗氧/.test(text)) {
    risky.add("美容养颜");
    risky.add("改善皮肤");
    risky.add("锁水");
    risky.add("抗氧化");
    risky.add("逆龄");
  }
  if (/omega|Omega|鱼油|藻油|DHA|EPA|血脂|心血管|三高/.test(text)) {
    risky.add("辅助降血脂");
    risky.add("保护心血管");
    risky.add("预防三高");
  }
  if (/控糖|血糖|低GI|体重|减肥|代餐|燃脂/.test(text)) {
    risky.add("控血糖");
    risky.add("降血糖");
    risky.add("减肥");
    risky.add("燃脂");
  }

  return [...risky];
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
    suggestions.add("含钙/维生素D等营养成分，具体标签声称需满足标准条件");
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
  if (/膳食纤维|可溶性纤维|菊粉|聚葡萄糖|抗性糊精|饱腹/.test(text)) {
    suggestions.add("含膳食纤维");
    suggestions.add("低糖轻负担");
  }

  if (/饮酒|聚餐|聚会|酒前|社交|葛根|枳椇子/.test(text)) {
    suggestions.add("聚会场景小食");
    suggestions.add("清爽口味软糖");
  }
  if (/免疫|防护|抵抗|维生素C|VC|锌|后生元|益生元/.test(text)) {
    suggestions.add("日常营养补充");
    suggestions.add("添加维生素C和锌");
  }
  if (/电解质|补水|运动后|果冻|凝胶|钠|钾|镁/.test(text)) {
    suggestions.add("运动后清爽补给");
    suggestions.add("便携果冻小食");
  }
  if (/低钠|减盐|少盐|调味|氯化钾|酵母抽提物/.test(text)) {
    suggestions.add("低钠调味粉");
    suggestions.add("减盐不减鲜");
  }
  if (/植物甾醇|甾醇|血脂|胆固醇|酸奶|发酵乳/.test(text)) {
    suggestions.add("添加植物甾醇酯");
    suggestions.add("日常营养酸奶");
  }

  suggestions.add("以原料事实、食用场景和感官体验为主");
  return [...suggestions].slice(0, 5);
}

function sanitizePositiveMarketingText(text: string): string {
  return text
    .replace(/原料合规性明确|合规性明确|合规性清晰|合规清晰|法规最清晰|法规清晰|法规明确|法规路径清晰|合规路径清晰|合规无忧|完全合规|已验证/g, "法规边界需按目标食品类别复核")
    .replace(/体感明确|体感好|体感模糊|体感|功效明确|效果明显|功效感/g, "体验定位需打样验证")
    .replace(/脑力营养|益智营养|聪明成长|学习力|专注力|视力改善|成长发育/g, "日常营养")
    .replace(/水光肌|水光感|水光/g, "清爽轻负担")
    .replace(/内服补水|皮肤喝饱水|补水|锁水/g, "日常饮用")
    .replace(/美容养颜|改善皮肤|逆龄|抗衰老|抗衰|抗氧化|抗氧/g, "成分故事")
    .replace(/强健骨骼|骨骼健康|增强骨骼|促进钙吸收|有助于钙吸收|有助于钙的吸收|助力钙质利用|钙质利用/g, "钙蛋白营养")
    .replace(/预防骨质疏松|改善骨密度/g, "银发营养")
    .replace(/调节肠道菌群|帮助有益菌生长|有益菌生长|帮助有益菌|改善消化|增强免疫|提高免疫|抵抗病毒|抗病毒|预防感冒/g, "日常营养")
    .replace(/辅助降血脂|降血脂|保护心血管|预防三高|降血压|高血压治疗/g, "日常营养")
    .replace(/治疗脱水|医疗补液|快速恢复体能|快速恢复|缓解疲劳/g, "运动补给场景")
    .replace(/解酒|醒酒|护肝|保肝|保护肝脏|降低酒精伤害|酒精代谢/g, "聚会场景")
    .replace(/快速增肌|代谢提升|塑形效果|燃脂/g, "运动营养场景")
    .replace(/夜间舒缓|舒缓|好眠|助眠/g, "日常营养");
}

export function sanitizeFormulaBriefMarkdown(markdown: string): string {
  return markdown
    .replace(/原料合规性明确|合规性明确|合规性清晰|合规清晰|法规最清晰|法规清晰|法规明确|法规路径清晰|合规路径清晰|合规无忧|完全合规|已验证/g, "法规边界需按目标食品类别复核")
    .replace(/体感明确|体感好|体感模糊|体感|功效明确|效果明显|功效感/g, "体验定位需打样验证")
    .replace(/脑力营养|益智营养|聪明成长|学习力|专注力|视力改善|成长发育/g, "日常营养")
    .replace(/情绪舒缓/g, "风味体验")
    .replace(/增强放松感/g, "保持温和风味")
    .replace(/帮助放松/g, "营造夜间仪式感")
    .replace(/与“放松”的研发目标/g, "与“夜间场景”的研发目标")
    .replace(/放松感/g, "风味体验")
    .replace(/搭配维生素D(?:3)?促进钙吸收/g, "搭配维生素D作为营养强化思路")
    .replace(/维生素D(?:3)?促进钙吸收/g, "维生素D营养强化")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function sanitizeRoutes(routes: FormulaRoute[]): FormulaRoute[] {
  return routes.map((route, index) => {
    const fallbackName = `${route.route_type || ROUTE_TYPE_ORDER[index] || "方案"}方案`;
    const routeName = sanitizePositiveMarketingText(route.route_name)
      .replace(/^(保守路线|主流路线|创新路线|保守|主流|创新)[：:\s\-—]+/, "")
      .replace(/(?:保守路线|主流路线|创新路线)/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    const summary = sanitizePositiveMarketingText(route.recommendation_reason);
    return {
      ...route,
      route_name: routeName && !hasRiskyClaimTerm(routeName) ? routeName : fallbackName,
      recommendation_reason: summary,
    };
  });
}

function sanitizeClaimSuggestions(
  claims: ClaimSuggestion,
  query: string,
  productType: string,
  seedContext: FormulaBriefSeedContext
): ClaimSuggestion {
  const risky = new Set([
    ...cleanExpressionList(claims.risky_expressions),
    ...inferRiskyClaimExpressions(query, productType),
  ]);
  const sleepIntent = isSleepIntent(query, productType);
  const allowed = cleanExpressionList(claims.allowed_expressions).filter((expression) => {
    if (!sleepIntent && /睡前|夜间|好眠|助眠|放松|舒缓/.test(expression)) {
      risky.add(expression);
      return false;
    }
    if (!hasRiskyClaimTerm(expression)) return true;
    risky.add(expression);
    return false;
  });

  const safeFallbacks = inferSafeClaimExpressions(query, productType);
  for (const rule of seedContext.regulatoryRules) {
    for (const expression of rule.forbidden_expressions || []) risky.add(expression);
    for (const expression of rule.risky_expressions || []) risky.add(expression);
    for (const expression of rule.safe_expression_examples || []) {
      if (!safeFallbacks.includes(expression)) safeFallbacks.push(expression);
    }
  }

  for (const fallback of safeFallbacks) {
    if (allowed.length >= 6) break;
    if (!hasRiskyClaimTerm(fallback) && !allowed.includes(fallback)) allowed.push(fallback);
  }

  return {
    ...claims,
    allowed_expressions: cleanExpressionList(allowed).slice(0, 6),
    risky_expressions: cleanExpressionList([...risky]).slice(0, 14),
  };
}

function sanitizeComplianceChecks(checks: ComplianceCheck[], riskyExpressions: string[]): ComplianceCheck[] {
  const risky = riskyExpressions.filter(Boolean);
  return checks.map((check) => {
    const prohibited = new Set(cleanExpressionList(check.prohibited_expressions));
    const alternative = cleanExpressionList(check.alternative_expressions).filter((expression) => {
      if (!hasRiskyClaimTerm(expression)) return true;
      prohibited.add(expression);
      return false;
    });

    for (const expression of risky) {
      if (hasRiskyClaimTerm(expression)) prohibited.add(expression);
    }

    return {
      ...check,
      prohibited_expressions: cleanExpressionList([...prohibited]).slice(0, 10),
      alternative_expressions: cleanExpressionList(alternative).slice(0, 6),
    };
  });
}

function ensureClaimComplianceCheck(
  checks: ComplianceCheck[],
  riskyExpressions: string[],
  allowedExpressions: string[]
): ComplianceCheck[] {
  const hasClaimCheck = checks.some((check) => /声称|表达|标签|宣称|合规/.test(check.check_item));
  if (hasClaimCheck || riskyExpressions.length === 0) return checks;

  return [
    ...checks,
    {
      check_item: "普通食品声称与渠道表达",
      risk_level: "高",
      general_food_allowed: "普通食品不得明示或暗示保健功能，用户需求中的功能卖点只能作为内部研发目标，不能直接作为对外标签或广告表达。",
      health_food_note: "如需使用保健功能声称，应评估保健食品注册/备案路径。",
      novel_food_note: "涉及新食品原料时需核对公告适用范围、用量和标签要求。",
      nutrient_fortification_note: "涉及维生素、矿物质等营养强化剂时需核对 GB 14880 食品类别和用量。",
      prohibited_expressions: riskyExpressions.slice(0, 10),
      alternative_expressions: allowedExpressions.slice(0, 6),
      references: ["GB 7718", "GB 28050", "GB 14880（如涉及营养强化剂）"],
      human_review_points: ["上市标签、详情页、小红书/直播话术需由法规人员复核", "确认所有功能性表达是否构成保健功能暗示"],
    },
  ];
}

function applySeedComplianceGuidance(checks: ComplianceCheck[], seedContext: FormulaBriefSeedContext): ComplianceCheck[] {
  if (seedContext.scenarios.length === 0) return checks;

  const prohibited = new Set<string>();
  const alternative = new Set<string>();
  const reviewPoints = new Set<string>();

  for (const rule of seedContext.regulatoryRules) {
    for (const expression of rule.forbidden_expressions || []) prohibited.add(expression);
    for (const expression of rule.risky_expressions || []) prohibited.add(expression);
    for (const expression of rule.safe_expression_examples || []) {
      if (!hasRiskyClaimTerm(expression)) alternative.add(expression);
    }
    if (rule.manual_review_required) reviewPoints.add(`${rule.scenario} 的对外表达需人工法规复核`);
  }

  for (const ingredient of seedContext.ingredientProfiles) {
    for (const flag of ingredient.regulatory_flags || []) reviewPoints.add(flag);
  }

  for (const supplier of seedContext.supplierSpecs) {
    if (supplier.required_docs?.length) reviewPoints.add(`补齐 ${supplier.required_docs.slice(0, 3).join("、")} 后再确认对外口径`);
  }

  if (prohibited.size === 0 && alternative.size === 0 && reviewPoints.size === 0) return checks;

  const index = checks.findIndex((check) => /声称|表达|标签|宣称|合规/.test(check.check_item));
  if (index >= 0) {
    const check = checks[index];
    const merged: ComplianceCheck = {
      ...check,
      risk_level: check.risk_level === "低" ? "高" : check.risk_level,
      prohibited_expressions: cleanExpressionList([...check.prohibited_expressions, ...prohibited]).slice(0, 12),
      alternative_expressions: cleanExpressionList([...check.alternative_expressions, ...alternative]).slice(0, 8),
      human_review_points: cleanExpressionList([...check.human_review_points, ...reviewPoints]).slice(0, 8),
    };
    return checks.map((item, idx) => idx === index ? merged : item);
  }

  return [
    ...checks,
    {
      check_item: "场景化表达与数据缺口复核",
      risk_level: "高",
      general_food_allowed: "普通食品场景下只能使用原料事实、食用场景、剂型和感官体验表达，不得把内部研发目标直接外化成标签或广告卖点。",
      health_food_note: "如确需使用功能性表达，应先判断是否需要保健食品或其他特殊路径。",
      novel_food_note: "涉及新食品原料或草本提取物时，必须复核公告范围、食品属性和适用类别。",
      nutrient_fortification_note: "涉及维生素、矿物质等营养强化剂时，需复核 GB 14880 食品类别、添加量和标签条件。",
      prohibited_expressions: cleanExpressionList([...prohibited]).slice(0, 12),
      alternative_expressions: cleanExpressionList([...alternative]).slice(0, 8),
      references: ["GB 7718", "GB 28050", "GB 14880（如涉及营养强化剂）"],
      human_review_points: cleanExpressionList([...reviewPoints]).slice(0, 8),
    },
  ];
}

function buildSeedNextSteps(nextSteps: string[], seedContext: FormulaBriefSeedContext): string[] {
  if (seedContext.scenarios.length === 0) return nextSteps.slice(0, 6);

  const combined = new Set<string>(nextSteps.filter(Boolean));

  for (const supplier of seedContext.supplierSpecs) {
    if (supplier.next_contact_action) combined.add(supplier.next_contact_action);
  }

  for (const ingredient of seedContext.ingredientProfiles) {
    if (ingredient.data_gaps?.length) {
      combined.add(`补齐 ${ingredient.name_cn} 的关键资料：${ingredient.data_gaps.slice(0, 3).join("、")}`);
    }
  }

  for (const rule of seedContext.regulatoryRules) {
    if (rule.manual_review_required) {
      combined.add(`对 ${rule.scenario} 的标签、详情页和渠道话术做人工法规复核`);
    }
  }

  return cleanExpressionList([...combined]).slice(0, 6);
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
    : 0;
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
  verification?: VerificationResult | null,
  options: NormalizeFormulaBriefOptions = {}
): FormulaBrief | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  const routes = sanitizeRoutes(normalizeRouteTypes(Array.isArray(v.formula_routes) ? v.formula_routes.map(normalizeRoute).slice(0, 4) : []));
  const checks = Array.isArray(v.compliance_checks) ? v.compliance_checks.map(normalizeCompliance).slice(0, 6) : [];

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
  const seedContext = resolveFormulaBriefSeedContext(query, productBrief.product_type);
  const sanitizedClaims = sanitizeClaimSuggestions(normalizeClaims(v.claim_suggestions), query, productBrief.product_type, seedContext);
  const sanitizedSuppliers = sanitizeSupplierMatches(
    Array.isArray(v.supplier_matches) ? v.supplier_matches.map(normalizeSupplier) : [],
    routes,
    query,
    productBrief.product_type,
    seedContext,
    options.supplierCatalog || []
  );
  const sanitizedChecks = applySeedComplianceGuidance(
    ensureClaimComplianceCheck(
      sanitizeComplianceChecks(checks, sanitizedClaims.risky_expressions),
      sanitizedClaims.risky_expressions,
      sanitizedClaims.allowed_expressions
    ),
    seedContext
  );
  const fallbackTrust = createTrustScore(verification, sanitizedSuppliers, sanitizedChecks);

  return {
    schema_version: "formula_brief_v1",
    id: asString(v.id, `brief-${Date.now()}`),
    query,
    created_at: asString(v.created_at, new Date().toISOString()),
    product_brief: productBrief,
    formula_routes: routes,
    compliance_checks: sanitizedChecks,
    supplier_matches: sanitizedSuppliers,
    claim_suggestions: sanitizedClaims,
    trust_score: fallbackTrust,
    next_steps: buildSeedNextSteps(asStringArray(v.next_steps).slice(0, 6), seedContext),
    markdown_summary: sanitizePositiveMarketingText(asString(v.markdown_summary, markdownSummary.slice(0, 1200))),
  };
}
