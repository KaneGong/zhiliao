import ingredientProfilesJson from "@/data/formula_brief_seeds/ingredient_profiles.seed.json";
import supplierSpecsJson from "@/data/formula_brief_seeds/supplier_specs.seed.json";
import regulatoryRulesJson from "@/data/formula_brief_seeds/regulatory_rules.seed.json";

export interface IngredientProfileSeed {
  id: string;
  ingredient_id: string;
  name_cn: string;
  aliases?: string[];
  applicable_forms?: string[];
  sensory_notes?: string;
  regulatory_flags?: string[];
  forbidden_claim_domains?: string[];
  data_gaps?: string[];
  supplier_ids?: string[];
  review_status?: string;
}

export interface SupplierSpecSeed {
  id: string;
  supplier_id: string;
  supplier_name: string;
  ingredient_ids?: string[];
  spec_name: string;
  dosage_form_fit?: string[];
  required_docs?: string[];
  data_completeness?: string;
  next_contact_action?: string;
}

export interface RegulatoryRuleSeed {
  regulatory_id: string;
  source_name: string;
  scenario: string;
  forbidden_expressions?: string[];
  risky_expressions?: string[];
  safe_expression_examples?: string[];
  applies_to?: string[];
  manual_review_required?: boolean;
  linked_golden_questions?: string[];
  linked_ingredient_ids?: string[];
}

export type FormulaBriefSeedScenarioId = "child_probiotic" | "plant_protein" | "social_gummy" | "immune_nutrition" | "electrolyte_jelly" | "low_sodium_seasoning" | "plant_sterol_yogurt" | "caffeine_energy" | "oat_fiber_bakery" | "soluble_fiber_light";

export interface SeedScenarioConfig {
  id: FormulaBriefSeedScenarioId;
  title: string;
  matchGroups: string[][];
  ingredientId: string;
  supplierId: string;
  regulatoryId: string;
  supplierKeywords: string[];
  placeholderIngredient: string;
}

export interface FormulaBriefSeedContext {
  scenarios: SeedScenarioConfig[];
  ingredientProfiles: IngredientProfileSeed[];
  supplierSpecs: SupplierSpecSeed[];
  regulatoryRules: RegulatoryRuleSeed[];
}

const ingredientProfiles = ingredientProfilesJson as IngredientProfileSeed[];
const supplierSpecs = supplierSpecsJson as SupplierSpecSeed[];
const regulatoryRules = regulatoryRulesJson as RegulatoryRuleSeed[];

const SEED_SCENARIOS: SeedScenarioConfig[] = [
  {
    id: "child_probiotic",
    title: "儿童益生菌",
    matchGroups: [["儿童", "孩子", "家长"], ["益生菌", "菌株", "乳酸菌", "双歧杆菌"]],
    ingredientId: "ING-PROBIOTIC-CHILD-001",
    supplierId: "SUP-PROBIOTIC-CHILD-SEED-001",
    regulatoryId: "REG-CLAIM-CHILD-PROBIOTIC-001",
    supplierKeywords: ["益生菌", "菌株", "乳酸菌", "双歧杆菌"],
    placeholderIngredient: "儿童益生菌菌株",
  },
  {
    id: "plant_protein",
    title: "植物基蛋白",
    matchGroups: [["植物基", "素食", "乳糖友好", "plant"], ["蛋白", "奶昔", "饮料", "饮"]],
    ingredientId: "ING-PLANT-PROTEIN-BLEND-001",
    supplierId: "SUP-PLANT-PROTEIN-SEED-001",
    regulatoryId: "REG-CLAIM-PLANT-PROTEIN-001",
    supplierKeywords: ["植物", "植物基", "豌豆", "大米蛋白", "米蛋白", "大豆蛋白", "pea", "rice protein", "soy protein"],
    placeholderIngredient: "植物基蛋白核心原料",
  },
  {
    id: "social_gummy",
    title: "饮酒场景软糖",
    matchGroups: [["饮酒", "聚餐", "聚会", "酒前", "社交", "续杯"], ["软糖", "葛根", "枳椇子", "酒"]],
    ingredientId: "ING-SOCIAL-GUMMY-HERBAL-001",
    supplierId: "SUP-SOCIAL-GUMMY-SEED-001",
    regulatoryId: "REG-CLAIM-SOCIAL-DRINKING-001",
    supplierKeywords: ["葛根", "枳椇子", "草本", "维生素b", "b族", "维生素B"],
    placeholderIngredient: "聚会场景草本原料",
  },
  {
    id: "immune_nutrition",
    title: "日常防护营养饮",
    matchGroups: [["免疫", "防护", "抵抗", "维生素C", "锌", "日常营养"], ["饮品", "饮料", "固体饮料", "营养饮"]],
    ingredientId: "ING-IMMUNE-NUTRITION-001",
    supplierId: "SUP-IMMUNE-NUTRITION-SEED-001",
    regulatoryId: "REG-CLAIM-IMMUNE-NUTRITION-001",
    supplierKeywords: ["维生素C", "维生素 C", "锌", "益生元", "后生元", "营养强化", "VC", "zinc"],
    placeholderIngredient: "日常防护场景营养组合",
  },
  {
    id: "electrolyte_jelly",
    title: "运动电解质果冻",
    matchGroups: [["电解质", "钠", "钾", "镁", "补水", "运动后"], ["果冻", "凝胶", "补给", "低糖"]],
    ingredientId: "ING-ELECTROLYTE-JELLY-001",
    supplierId: "SUP-ELECTROLYTE-JELLY-SEED-001",
    regulatoryId: "REG-CLAIM-ELECTROLYTE-JELLY-001",
    supplierKeywords: ["电解质", "钠", "钾", "镁", "果冻", "凝胶", "海盐"],
    placeholderIngredient: "运动电解质果冻体系",
  },
  {
    id: "low_sodium_seasoning",
    title: "低钠鲜味调味粉",
    matchGroups: [["低钠", "减盐", "减少钠", "钠摄入"], ["调味", "调味粉", "厨房", "鲜味"]],
    ingredientId: "ING-LOW-SODIUM-SEASONING-001",
    supplierId: "SUP-LOW-SODIUM-SEASONING-SEED-001",
    regulatoryId: "REG-CLAIM-LOW-SODIUM-001",
    supplierKeywords: ["低钠", "氯化钾", "酵母抽提物", "鲜味", "调味", "减盐", "钠"],
    placeholderIngredient: "低钠鲜味调味体系",
  },
  {
    id: "plant_sterol_yogurt",
    title: "植物甾醇酸奶",
    matchGroups: [["植物甾醇", "甾醇", "血脂", "心血管"], ["酸奶", "发酵乳", "乳制品", "乳饮"]],
    ingredientId: "ING-PLANT-STEROL-YOGURT-001",
    supplierId: "SUP-PLANT-STEROL-YOGURT-SEED-001",
    regulatoryId: "REG-CLAIM-PLANT-STEROL-001",
    supplierKeywords: ["植物甾醇", "甾醇", "酸奶", "发酵乳", "乳品"],
    placeholderIngredient: "植物甾醇酯酸奶应用方向",
  },
  {
    id: "caffeine_energy",
    title: "咖啡因能量饮",
    matchGroups: [["咖啡因", "能量", "提神", "电竞", "加班", "B族", "维生素B"], ["饮", "饮料", "气泡", "低糖"]],
    ingredientId: "ING-CAFFEINE-BVITAMIN-001",
    supplierId: "SUP-CAFFEINE-BVITAMIN-SEED-001",
    regulatoryId: "REG-CLAIM-CAFFEINE-ENERGY-001",
    supplierKeywords: ["咖啡因", "维生素B", "B族", "牛磺酸", "能量", "低糖", "气泡"],
    placeholderIngredient: "咖啡因能量饮营养组合",
  },
  {
    id: "oat_fiber_bakery",
    title: "高蛋白烘焙燕麦纤维",
    matchGroups: [["烘焙", "早餐饼", "饼", "办公室", "软曲奇"], ["高蛋白", "蛋白", "低糖", "饱腹"]],
    ingredientId: "ING-OAT-FIBER-BAKERY-001",
    supplierId: "SUP-OAT-FIBER-BAKERY-SEED-001",
    regulatoryId: "REG-CLAIM-OAT-FIBER-BAKERY-001",
    supplierKeywords: ["蛋白", "乳清", "牛奶蛋白", "燕麦", "纤维", "烘焙", "低糖"],
    placeholderIngredient: "烘焙燕麦纤维 / 高蛋白饼质构体系",
  },
  {
    id: "soluble_fiber_light",
    title: "可溶性膳食纤维轻负担体系",
    matchGroups: [["膳食纤维", "可溶性纤维", "菊粉", "聚葡萄糖", "抗性糊精", "饱腹"], ["代餐", "奶昔", "气泡水", "低糖", "下午茶", "控糖"]],
    ingredientId: "ING-SOLUBLE-FIBER-LIGHT-001",
    supplierId: "SUP-SOLUBLE-FIBER-LIGHT-SEED-001",
    regulatoryId: "REG-CLAIM-SOLUBLE-FIBER-LIGHT-001",
    supplierKeywords: ["膳食纤维", "纤维", "菊粉", "聚葡萄糖", "抗性糊精", "低聚果糖", "低聚糖", "GOS", "Bimuno", "益生元", "蛋白", "酪蛋白", "乳清", "水解牛奶蛋白", "Pep2Dia", "Ingredia", "Glanbia", "代餐", "气泡水", "低糖"],
    placeholderIngredient: "可溶性膳食纤维轻负担体系",
  },
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "");
}

function matchesGroups(text: string, groups: string[][]): boolean {
  const normalized = normalizeText(text);
  return groups.every((group) => group.some((keyword) => normalized.includes(normalizeText(keyword))));
}

function uniqueById<T extends object>(items: T[], keys: Array<keyof T>): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keys.map((field) => String(item[field] ?? "")).join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolveFormulaBriefSeedContext(query: string, productType = ""): FormulaBriefSeedContext {
  const text = `${query} ${productType}`;
  const scenarios = SEED_SCENARIOS.filter((scenario) => matchesGroups(text, scenario.matchGroups));
  const ingredientProfilesForScenario = uniqueById(
    ingredientProfiles.filter((item) => scenarios.some((scenario) => scenario.ingredientId === item.ingredient_id || scenario.ingredientId === item.id)),
    ["ingredient_id", "id"],
  );
  const supplierSpecsForScenario = uniqueById(
    supplierSpecs.filter((item) => scenarios.some((scenario) => scenario.supplierId === item.supplier_id || scenario.supplierId === item.id)),
    ["supplier_id", "id"],
  );
  const regulatoryRulesForScenario = uniqueById(
    regulatoryRules.filter((item) => scenarios.some((scenario) => scenario.regulatoryId === item.regulatory_id)),
    ["regulatory_id"],
  );

  return {
    scenarios,
    ingredientProfiles: ingredientProfilesForScenario,
    supplierSpecs: supplierSpecsForScenario,
    regulatoryRules: regulatoryRulesForScenario,
  };
}

export function buildFormulaBriefSeedBlock(context: FormulaBriefSeedContext): string {
  if (context.scenarios.length === 0) return "";

  const lines: string[] = [
    "## 内部场景数据种子（只用于提高严谨性）",
    "- 以下内容是平台内部 seed 数据，用于提醒你哪些地方必须保守、哪些地方必须明确写“暂无平台匹配”或“待确认”。",
    "- 这些 seed 不是平台已上架现货，不得把“待补充供应商”写成 platform_available=true。",
    "- seed 可用于补充：高风险表达边界、数据缺口、下一步补库动作。",
    "",
  ];

  for (const scenario of context.scenarios) {
    const ingredient = context.ingredientProfiles.find((item) => item.ingredient_id === scenario.ingredientId || item.id === scenario.ingredientId);
    const supplier = context.supplierSpecs.find((item) => item.supplier_id === scenario.supplierId || item.id === scenario.supplierId);
    const rule = context.regulatoryRules.find((item) => item.regulatory_id === scenario.regulatoryId);

    lines.push(`### ${scenario.title}`);
    if (ingredient) {
      lines.push(`- 原料提示：${ingredient.name_cn}；适用剂型：${(ingredient.applicable_forms || []).slice(0, 3).join(" / ") || "待确认"}。`);
      if (ingredient.sensory_notes) lines.push(`- 工艺/风味提示：${ingredient.sensory_notes}`);
      if (ingredient.regulatory_flags?.length) lines.push(`- 必须提示的复核点：${ingredient.regulatory_flags.slice(0, 4).join("；")}`);
      if (ingredient.data_gaps?.length) lines.push(`- 当前关键数据缺口：${ingredient.data_gaps.slice(0, 5).join("、")}`);
    }
    if (rule) {
      if (rule.forbidden_expressions?.length) lines.push(`- 禁用表达：${rule.forbidden_expressions.join("、")}`);
      if (rule.risky_expressions?.length) lines.push(`- 高风险表达：${rule.risky_expressions.join("、")}`);
      if (rule.safe_expression_examples?.length) lines.push(`- 可接受弱表达示例：${rule.safe_expression_examples.join("、")}`);
    }
    if (supplier) {
      lines.push(`- 供应商状态：当前仅有补库线索，不代表平台现货可匹配；若没有真实目录命中，supplier_matches 必须写“暂无平台匹配”。`);
      if (supplier.required_docs?.length) lines.push(`- 缺失资料：${supplier.required_docs.slice(0, 5).join("、")}`);
      if (supplier.next_contact_action) lines.push(`- 下一步：${supplier.next_contact_action}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
