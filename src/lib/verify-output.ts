/**
 * 知料 AI 输出验证引擎 v2.0
 *
 * 核心变化：
 * - 不仅检测法规库中的原料，也检测 AI 提到但不在库中的原料
 * - 不在库中的标"未收录"，诚实反映验证覆盖率
 */

import regulations from "@/data/regulations.json";
import ingredientProfilesJson from "@/data/formula_brief_seeds/ingredient_profiles.seed.json";

// ── 类型 ──
export interface IngredientVerification {
  name: string;
  inRegulationDB: boolean;
  foodScopes: string[];
  category: string;
  usageNote: string;
  status: "compliant" | "health_food_only" | "novel_food" | "dual_scope" | "not_found" | "caution";
  statusLabel: string;
  standardRefs: string[];
}

export interface VerificationResult {
  ingredients: IngredientVerification[];
  gbStandards: { code: string; valid: boolean }[];
  summary: {
    total: number;
    verified: number;       // 在库中且验证过的
    notFound: number;       // 不在库中的
    healthFoodOnly: number;
    caution: number;
  };
}

interface RegulationEntry {
  ingredient: string;
  category: string;
  standards: { code: string; name: string; clause: string; requirement: string; effective_date: string; status: string }[];
  special_notes: string[];
  food_scopes: string[];
}

interface SeedIngredientEntry {
  ingredient_id: string;
  name_cn: string;
  aliases?: string[];
  category?: string;
  regulatory_flags?: string[];
  data_gaps?: string[];
  review_status?: string;
}

const typedRegs = regulations as RegulationEntry[];
const seedIngredients = ingredientProfilesJson as SeedIngredientEntry[];

// ── 第一步：从 DB 名称匹配已收录原料 ──

function extractKnownIngredients(text: string): { name: string; entry: RegulationEntry }[] {
  const allNames = typedRegs.map((r) => r.ingredient);
  const sortedNames = [...new Set(allNames)].sort((a, b) => b.length - a.length);

  const results: { name: string; entry: RegulationEntry }[] = [];
  const occupied = new Set<number>();

  for (const name of sortedNames) {
    if (name.length < 2) continue;
    let pos = 0;
    while ((pos = text.indexOf(name, pos)) !== -1) {
      let overlapped = false;
      for (let i = pos; i < pos + name.length; i++) {
        if (occupied.has(i)) { overlapped = true; break; }
      }
      if (!overlapped) {
        const entry = typedRegs.find((r) => r.ingredient === name);
        if (entry) {
          results.push({ name, entry });
          for (let i = pos; i < pos + name.length; i++) occupied.add(i);
        }
      }
      pos += name.length;
    }
  }

  return results;
}


function getSeedIngredientNames(entry: SeedIngredientEntry): string[] {
  return [entry.name_cn, ...(entry.aliases || [])]
    .map((name) => String(name || "").trim())
    .filter((name) => name.length >= 2);
}

function extractSeedIngredients(text: string, existingNames: Set<string>): { name: string; entry: SeedIngredientEntry }[] {
  const results: { name: string; entry: SeedIngredientEntry }[] = [];
  const seenIds = new Set<string>();
  const candidates = seedIngredients
    .flatMap((entry) => getSeedIngredientNames(entry).map((name) => ({ name, entry })))
    .sort((a, b) => b.name.length - a.name.length);

  for (const candidate of candidates) {
    if (existingNames.has(candidate.name)) continue;
    if (seenIds.has(candidate.entry.ingredient_id)) continue;
    if (!text.includes(candidate.name)) continue;
    seenIds.add(candidate.entry.ingredient_id);
    results.push(candidate);
  }

  return results;
}

// ── 第二步：从文本中提取"疑似原料"但不在库中的词 ──

const INGREDIENT_SUFFIXES = [
  "提取物", "蛋白", "肽", "粉", "油", "糖", "酸", "钙", "镁", "铁", "锌", "硒",
  "维生素", "维他命", "矿物质", "纤维", "醇", "酯", "酶", "菌", "藻", "胶",
  "浓缩汁", "浓缩液", "水解物", "发酵物", "芽孢", "乳清", "酪蛋白", "胶原",
  "益生", "后生", "乳", "乳粉", "奶油", "黄油", "干酪",
];

const NON_INGREDIENT_WORDS = new Set([
  "食品", "配方", "原料", "产品", "方案", "方向", "高效型", "均衡型", "创新型",
  "经典强化型", "骨胶原型", "高端代谢型", "建议用量", "功能角色", "选择理由",
  "通用名", "差异化分析", "法规要点", "合规框架", "配方策略", "方案建议",
  "声称限制", "原料合规", "用量限制", "平台可匹配", "总结", "我的建议",
  "推荐", "使用", "注意", "确认", "验证", "建议", "规定", "标准", "公告",
  "每日", "公斤", "体重", "人群", "婴幼儿", "成人", "儿童", "孕妇",
  "保健食品", "普通食品", "新食品原料", "营养强化剂",
  "乳制品", "调制乳", "发酵乳", "固体饮料", "糖果",
  "优质蛋白",
]);

// 假原料后缀：以这些结尾的是概念/类别词，不是具体原料名
const FALSE_POSITIVE_SUFFIXES = [
  "源", "型", "类", "剂", "量", "版", "方案", "功能", "角色", "理由",
];

const DESCRIPTIVE_PREFIXES = [
  "小分子", "高纯", "高纯度", "水解", "酶解", "低聚", "速溶",
  "浓缩", "分离", "膜分离", "无乳糖", "热稳定", "微胶囊",
  "食品级", "鱼源", "海洋", "I型", "II型",
];

function normalizeIngredientName(name: string): string {
  return String(name || "").replace(/\s+/g, "").trim();
}

function splitCompositeIngredientName(name: string): string[] {
  return String(name || "")
    .split(/或|[+＋/／、,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function isCoveredIngredientName(name: string, knownNames: Set<string>): boolean {
  const normalizedName = normalizeIngredientName(name);
  if (!normalizedName) return false;
  if (knownNames.has(name) || knownNames.has(normalizedName)) return true;

  const compositeParts = splitCompositeIngredientName(name);
  if (compositeParts.length > 1 && compositeParts.every((part) => isCoveredIngredientName(part, knownNames))) {
    return true;
  }

  for (const knownName of knownNames) {
    const normalizedKnown = normalizeIngredientName(knownName);
    if (normalizedKnown.length < 3) continue;
    if (normalizedName === normalizedKnown) return true;
    if (!normalizedName.endsWith(normalizedKnown)) continue;

    const prefix = normalizedName.slice(0, -normalizedKnown.length);
    if (!prefix) return true;
    if (DESCRIPTIVE_PREFIXES.some((item) => prefix === item || prefix.endsWith(item))) {
      return true;
    }
  }

  return false;
}

function extractUnknownIngredients(text: string, knownNames: Set<string>): string[] {
  const candidates = new Set<string>();

  // ── 源1：从 Markdown 表格第2列提取（AI 配方表的原料列）──
  // 匹配表格行：| col1 | col2 | col3 | ... |
  const tableRows = text.match(/\|[^|]+\|[^|]+\|[^|]+\|/g) || [];
  for (const row of tableRows) {
    const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
    if (cells.length >= 2) {
      let ingCell = cells[1].replace(/\*\*/g, "").trim();
      ingCell = ingCell.replace(/\([^)]*\)$/g, "").trim();
      ingCell = ingCell.replace(/:$/, "").trim();

      if (ingCell.length < 2 || ingCell.length > 30) continue;
      if (ingCell.includes("---") || ingCell.includes("原料")) continue;
      if (ingCell.includes("：") || ingCell.includes(":")) continue;
      if (/^每份|^不能|^严禁|^声称|^新食品|^我的|^总结/.test(ingCell)) continue;
      if (NON_INGREDIENT_WORDS.has(ingCell) || isCoveredIngredientName(ingCell, knownNames)) continue;
      if (!/[\u4e00-\u9fa5]/.test(ingCell)) continue;

      // ── 关键收紧：表格提取也必须通过后缀校验 ──
      const hasValidSuffix = INGREDIENT_SUFFIXES.some(s => ingCell.endsWith(s));
      const hasFalseSuffix = FALSE_POSITIVE_SUFFIXES.some(s => ingCell.endsWith(s));
      if (hasFalseSuffix) continue;           // "钙源"、"方向" 等概念词 → 跳过
      if (!hasValidSuffix) continue;          // 无原料后缀 → 跳过

      // 处理复合写法 "A + B"
      if (ingCell.includes("+")) {
        for (const part of ingCell.split("+")) {
          const cleaned = part.trim();
          if (cleaned.length >= 2 && /[\u4e00-\u9fa5]/.test(cleaned) && !isCoveredIngredientName(cleaned, knownNames)) {
            candidates.add(cleaned);
          }
        }
      } else {
        candidates.add(ingCell);
      }
    }
  }

  // ── 源2：从粗体文本提取（法规段落中的 **原料名**）──
  const boldPattern = /\*\*([\u4e00-\u9fa5a-zA-Z（）\(\)]{2,20})\*\*/g;
  let bm;
  while ((bm = boldPattern.exec(text)) !== null) {
    const term = bm[1].trim();
    if (term.length < 2 || isCoveredIngredientName(term, knownNames)) continue;
    const hasSuffix = INGREDIENT_SUFFIXES.some(s => term.endsWith(s));
    const hasFalseSuffix = FALSE_POSITIVE_SUFFIXES.some(s => term.endsWith(s));
    if (hasFalseSuffix) continue;
    if (hasSuffix && !NON_INGREDIENT_WORDS.has(term) && !term.includes("：")) {
      candidates.add(term);
    }
  }

  // ── 最终过滤 ──
  return [...candidates].filter(t => {
    if (t.length < 3 || t.length > 25) return false;   // 至少3字
    if (!/[\u4e00-\u9fa5]/.test(t)) return false;
    if (/[:：]/.test(t)) return false;
    if (/^每份|^不能|^严禁|^总结/.test(t)) return false;
    if (FALSE_POSITIVE_SUFFIXES.some(s => t.endsWith(s))) return false;
    if (isCoveredIngredientName(t, knownNames)) return false;
    return true;
  });
}

function extractGBStandards(text: string): string[] {
  const matches = new Set<string>();
  const re = /GB\s*\d{4,5}(?:[.-]\d{4})?/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    matches.add(m[0].replace(/\s+/g, " ").trim());
  }
  return [...matches];
}

const KNOWN_GB_STANDARDS = new Set([
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
]);

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, "").replace(/[-.]\d{4}$/, "").toUpperCase();
}

// ── 状态判定 ──

function getIngredientStatus(entry: RegulationEntry): {
  status: IngredientVerification["status"];
  statusLabel: string;
} {
  const scopes = entry.food_scopes;
  if (scopes.length === 1 && scopes[0] === "health_food") {
    return { status: "health_food_only", statusLabel: "仅限保健食品" };
  }
  if (entry.category === "新食品原料") {
    return { status: "novel_food", statusLabel: "新食品原料" };
  }
  if (scopes.includes("health_food") && scopes.includes("general_food")) {
    return { status: "dual_scope", statusLabel: "普通食品可用" };
  }
  if (scopes.includes("general_food")) {
    return { status: "compliant", statusLabel: "普通食品可用" };
  }
  return { status: "caution", statusLabel: "需确认" };
}

// ── 主验证函数 ──

export function verifyAIOutput(content: string): VerificationResult {
  // Step 1: Extract known ingredients
  const knownMatches = extractKnownIngredients(content);
  const knownNames = new Set(knownMatches.map((m) => m.name));

  // Step 2: Extract seed ingredients and then unknown ingredients
  // Seed ingredients are not treated as formal regulatory matches. They are internal draft data,
  // so they become caution items rather than not_found items.
  const seedMatches = extractSeedIngredients(content, knownNames);
  const coveredNames = new Set(knownNames);
  for (const { name, entry } of seedMatches) {
    coveredNames.add(name);
    coveredNames.add(entry.name_cn);
    for (const alias of entry.aliases || []) coveredNames.add(alias);
  }
  const unknownNames = extractUnknownIngredients(content, coveredNames);

  // Step 3: Verify known ingredients (deduplicated by name)
  const seenKnown = new Set<string>();
  const ingredients: IngredientVerification[] = [];
  for (const { name, entry } of knownMatches) {
    if (seenKnown.has(name)) continue;
    seenKnown.add(name);
    const { status, statusLabel } = getIngredientStatus(entry);
    const std = entry.standards[0];
    const usageNote = entry.special_notes.length > 0
      ? entry.special_notes.join("；")
      : (std ? (std.requirement.length > 120 ? std.requirement.slice(0, 120) + "..." : std.requirement) : "");

    ingredients.push({
      name,
      inRegulationDB: true,
      foodScopes: entry.food_scopes,
      category: entry.category,
      usageNote,
      status,
      statusLabel,
      standardRefs: entry.standards.map((s) => s.code),
    });
  }

  // Step 4: Add seed ingredients (marked as caution) — deduped
  const seenNames = new Set(ingredients.map(i => i.name));
  const seenSeedIds = new Set<string>();
  for (const { name, entry } of seedMatches) {
    if (seenSeedIds.has(entry.ingredient_id) || seenNames.has(name) || seenNames.has(entry.name_cn)) continue;
    seenSeedIds.add(entry.ingredient_id);
    seenNames.add(name);
    const flags = [...(entry.regulatory_flags || []), ...(entry.data_gaps || []).map((gap) => `待补：${gap}`)];
    ingredients.push({
      name,
      inRegulationDB: false,
      foodScopes: [],
      category: entry.category || "内部 seed 待复核",
      usageNote: flags.length ? flags.slice(0, 4).join("；") : "内部 seed 已记录，但尚未完成法规/供应商复核",
      status: "caution",
      statusLabel: "Seed待复核",
      standardRefs: [],
    });
  }

  // Step 5: Add unknown ingredients (marked as not_found) — deduped

  for (const name of unknownNames) {
    if (seenNames.has(name)) continue;
    seenNames.add(name);
    ingredients.push({
      name,
      inRegulationDB: false,
      foodScopes: [],
      category: "未收录",
      usageNote: "法规库暂未收录此原料，已记录待自动补全",
      status: "not_found",
      statusLabel: "未收录",
      standardRefs: [],
    });
  }

  // Step 6: GB standards
  const gbCodes = extractGBStandards(content);
  const gbStandards = gbCodes.map((code) => ({
    code,
    valid: KNOWN_GB_STANDARDS.has(code) ||
      [...KNOWN_GB_STANDARDS].some((known) => normalizeCode(known) === normalizeCode(code)),
  }));

  // Step 7: Summary
  const verified = ingredients.filter((i) => i.status !== "not_found").length;
  const notFound = ingredients.filter((i) => i.status === "not_found").length;
  const healthFoodOnly = ingredients.filter((i) => i.status === "health_food_only").length;
  const caution = ingredients.filter((i) => i.status === "caution").length;

  return {
    ingredients,
    gbStandards,
    summary: { total: ingredients.length, verified, notFound, healthFoodOnly, caution },
  };
}

// ── 导出未知原料列表（用于后台自动补全）──
export function getUnknownIngredients(result: VerificationResult): string[] {
  return result.ingredients
    .filter((i) => i.status === "not_found")
    .map((i) => i.name);
}
