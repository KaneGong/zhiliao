/**
 * 知料 Trust Layer — AI 输出后校验
 * 支持两种模式：
 * 1. 客户端自检（从文本提取GB编号和原料名，与本地白名单比对）
 * 2. 服务端验证结果转换（接收 verifyAIOutput 的结果）
 */

// ── 核心国标白名单 ──
const GB_WHITELIST: string[] = [
  "GB 2760", "GB 2760-2014", "GB 2760-2024",
  "GB 14880", "GB 14880-2012",
  "GB 7718", "GB 7718-2011", "GB 7718-2025",
  "GB 28050", "GB 28050-2011",
  "GB 13432", "GB 13432-2013",
  "GB 16740", "GB 16740-2014",
  "GB 29922", "GB 29922-2013",
  "GB 24154", "GB 24154-2015", "GB 24154-2025",
  "GB 10765", "GB 10765-2021", "GB 10766", "GB 10766-2021", "GB 10767", "GB 10767-2021",
  "GB 19640", "GB 19640-2016",
  "GB 7101", "GB 7101-2022",
  "GB 22570", "GB 22570-2014",
  "GB 14881", "GB 14881-2013",
  "GB 5009", "GB 4789",
];

// ── 原料名称白名单（客户端快速匹配用）──
const INGREDIENT_NAMES: string[] = [
  "酪蛋白水解肽", "乳铁蛋白", "乳矿物盐", "牛初乳粉",
  "浓缩乳清蛋白粉", "分离乳清蛋白粉", "水解乳清蛋白粉", "水解乳清蛋白肽",
  "分离牛奶蛋白", "膜分离酪蛋白", "水解牛奶蛋白",
  "酪蛋白磷酸肽", "浓缩牛奶蛋白",
  "GABA", "维生素B6", "维生素C", "维生素A", "维生素D", "维生素E",
  "褪黑素", "L-茶氨酸", "甘氨酸镁",
  "酸樱桃提取物", "西番莲提取物",
  "益生菌", "乳双歧杆菌", "鼠李糖乳杆菌",
  "低聚果糖", "膳食纤维", "鱼油", "DHA", "EPA",
  "胶原蛋白", "透明质酸",
];

// ── 类型 ──

export interface TrustResult {
  matchedGB: string[];
  matchedIngredients: string[];
  totalGBMentions: number;
  gbMatchRate: number;
}

/** 服务端验证结果中的单条原料 */
export interface ServerIngredientVerify {
  name: string;
  inRegulationDB: boolean;
  foodScopes: string[];
  category: string;
  usageNote: string;
  status: "compliant" | "health_food_only" | "novel_food" | "dual_scope" | "not_found" | "caution";
  statusLabel: string;
  standardRefs: string[];
}

/** 服务端完整验证结果 */
export interface ServerVerification {
  ingredients: ServerIngredientVerify[];
  gbStandards: { code: string; valid: boolean }[];
  summary: {
    total: number;
    verified: number;
    healthFoodOnly: number;
    notFound: number;
    caution: number;
  };
}

// ── 客户端扫描函数 ──

function extractGB(text: string): string[] {
  const matches = new Set<string>();
  const re = /GB\s*\d{4,5}/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.add(m[0].replace(/\s+/g, " ").trim());
  }
  return [...matches];
}

function matchIngredients(text: string): string[] {
  const matched = new Set<string>();
  for (const name of INGREDIENT_NAMES) {
    if (name.length >= 2 && text.includes(name)) {
      matched.add(name);
    }
  }
  const result = [...matched];
  const deduped = result.filter((name) => {
    return !result.some((other) => other !== name && other.length < name.length && name.includes(other));
  });
  return deduped;
}

function norm(code: string): string {
  return code.replace(/\s+/g, "").replace(/-\d{4}$/, "").toUpperCase();
}

// ── 主扫描函数（客户端）──

export function validateContent(content: string): TrustResult {
  try {
    const allGB = extractGB(content);
    const matchedGB = allGB.filter((code) => {
      const n = norm(code);
      return GB_WHITELIST.some((known) => norm(known) === n);
    });

    const matchedIngredients = matchIngredients(content);

    return {
      matchedGB,
      matchedIngredients,
      totalGBMentions: allGB.length,
      gbMatchRate: allGB.length > 0 ? matchedGB.length / allGB.length : 1,
    };
  } catch {
    return { matchedGB: [], matchedIngredients: [], totalGBMentions: 0, gbMatchRate: 1 };
  }
}

// ── 服务端验证结果 → 客户端 TrustResult 转换 ──

export function fromServerVerification(sv: ServerVerification): TrustResult & { serverVerify: ServerVerification } {
  const matchedGB = sv.gbStandards.filter((s) => s.valid).map((s) => s.code);
  const matchedIngredients = sv.ingredients
    .filter((i) => i.inRegulationDB && i.status !== "not_found")
    .map((i) => i.name);

  return {
    matchedGB,
    matchedIngredients,
    totalGBMentions: sv.gbStandards.length,
    gbMatchRate: sv.gbStandards.length > 0
      ? sv.gbStandards.filter((s) => s.valid).length / sv.gbStandards.length
      : 1,
    serverVerify: sv,
  };
}

export function getKnownCount(): { regulations: number; ingredients: number } {
  return {
    regulations: GB_WHITELIST.length,
    ingredients: INGREDIENT_NAMES.length,
  };
}
