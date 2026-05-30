import ingredientCardsJson from "@/data/public_evidence/ingredient_cards.v1.json";
import regulatoryMapJson from "@/data/public_evidence/regulatory_map.v1.json";
import sourcesJson from "@/data/public_evidence/sources.v1.json";

type PublicEvidenceConfidence = "verified" | "official_reference" | "supplier_public" | "reference_only" | string;

export interface PublicEvidenceCard {
  id: string;
  name_cn: string;
  aliases: string[];
  regulatory_identity: string;
  applicable_paths: string[];
  application_scenarios: string[];
  prohibited_or_risky_expressions: string[];
  unsuitable_groups_or_label_notes: string[];
  manual_review_points: string[];
  source_ids: string[];
  official_source_urls?: string[];
  confidence: PublicEvidenceConfidence;
  last_checked_at: string;
  manual_review_required: boolean;
}

export interface RegulatoryMapPath {
  path_id: string;
  title: string;
  scope: string;
  ai_policy: string;
  manual_review_triggers: string[];
  primary_source_ids: string[];
  confidence: PublicEvidenceConfidence;
}

export interface PublicEvidenceSource {
  id: string;
  title: string;
  type: string;
  publisher?: string;
  url?: string;
  notes?: string;
}

const ingredientCards = ingredientCardsJson as PublicEvidenceCard[];
const regulatoryMap = regulatoryMapJson as RegulatoryMapPath[];
const sources = sourcesJson as PublicEvidenceSource[];
const sourceById = new Map(sources.map((source) => [source.id, source]));

function normalizeLookupText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[（）]/g, (m) => (m === "（" ? "(" : ")"))
    .replace(/[\s·•_\-—–]+/g, "")
    .trim();
}

function splitNameText(value: string): string[] {
  return value
    .split(/[、,，/／;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCardLookupTokens(card: PublicEvidenceCard): string[] {
  const tokens = new Set<string>();
  const add = (token?: string) => {
    const cleaned = token?.trim();
    if (!cleaned) return;
    tokens.add(cleaned);
  };

  add(card.name_cn);
  splitNameText(card.name_cn).forEach(add);
  for (const alias of card.aliases || []) {
    add(alias);
    splitNameText(alias).forEach(add);
  }

  const parenMatch = card.name_cn.match(/^(.+?)[（(](.+)[）)]$/);
  if (parenMatch) {
    add(parenMatch[1]);
    splitNameText(parenMatch[2]).forEach(add);
  }

  return [...tokens].filter((token) => normalizeLookupText(token).length > 0);
}

export function resolvePublicEvidenceCards(query: string, limit = 5): PublicEvidenceCard[] {
  const normalizedQuery = normalizeLookupText(query);
  if (!normalizedQuery) return [];

  const matches: Array<{ card: PublicEvidenceCard; score: number; token: string }> = [];

  for (const card of ingredientCards) {
    for (const token of getCardLookupTokens(card)) {
      const normalizedToken = normalizeLookupText(token);
      if (!normalizedToken) continue;
      if (!normalizedQuery.includes(normalizedToken)) continue;

      let score = normalizedToken.length;
      if (normalizedQuery === normalizedToken) score += 100;
      if (normalizeLookupText(card.name_cn).includes(normalizedToken)) score += 30;
      if (card.aliases.some((alias) => normalizeLookupText(alias) === normalizedToken)) score += 20;
      matches.push({ card, score, token: normalizedToken });
    }
  }

  matches.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const resolved: PublicEvidenceCard[] = [];
  for (const match of matches) {
    if (seen.has(match.card.id)) continue;
    seen.add(match.card.id);
    resolved.push(match.card);
    if (resolved.length >= limit) break;
  }

  return resolved;
}

function sourceLabel(sourceId: string): string {
  const source = sourceById.get(sourceId);
  if (!source) return sourceId;
  return `${sourceId}（${source.type}：${source.title}）`;
}

function compactList(values: string[], max = 4): string {
  const cleaned = values.filter(Boolean);
  if (cleaned.length <= max) return cleaned.join("；");
  return `${cleaned.slice(0, max).join("；")}；等`;
}

export function buildRegulatoryPathMapPromptBlock(): string {
  const lines: string[] = [];
  lines.push("## Public Evidence v1：法规路径地图（只作路径判断，不是完整法规大全）");
  lines.push("质量原则：只有官方法规、国家标准、供应商官网/官方资料可作为 verified/official_reference；行业文章、论文、竞品页面只能作参考，不得作为法规结论。");
  lines.push("未收录或证据不足时，必须回答‘当前证据库未收录完整卡片，需人工复核/待复核’，不得给确定性合规结论。");
  lines.push("Public Evidence 不是 Supplier Verified：不得把公开证据卡说成平台已有供应商、已索资或已核验供应商。");
  lines.push("");

  for (const path of regulatoryMap) {
    lines.push(`- ${path.title}（${path.path_id}）：${path.scope} AI 处理：${path.ai_policy} 触发人工复核：${compactList(path.manual_review_triggers, 3)}。来源：${path.primary_source_ids.map(sourceLabel).join("；") || "待补充"}。`);
  }

  return lines.join("\n");
}

export function buildPublicEvidenceIngredientPromptBlock(query: string, limit = 5): string {
  const cards = resolvePublicEvidenceCards(query, limit);
  const lines: string[] = [];
  lines.push("## Public Evidence v1：命中原料证据卡");
  lines.push("使用规则：证据卡只用于公开法规/公开资料边界提示，不代表 Supplier Verified；不得据此声称平台已完成供应商索资或供应商核验。");
  lines.push("普通食品可讨论原料事实、营养事实、配方属性、食用场景和感官体验；高风险功效词必须放入 prohibited/risky 或人工复核点。官方来源未覆盖的点必须写‘待复核’。confidence 为 reference_only 或 supplier_public、或 manual_review_required=true 的卡片，不得表述为“法规清晰/法规明确/已验证”。");

  if (cards.length === 0) {
    lines.push("未命中证据卡：当前 Public Evidence v1 未收录完整原料卡。你必须保守处理，提示‘当前证据库未收录完整卡片，需人工复核/待复核’，不得给确定性合规结论，不得把未知原料说成已验证。");
    return lines.join("\n");
  }

  lines.push(`命中 ${cards.length} 张卡（最多注入 ${limit} 张）：`);
  for (const card of cards) {
    lines.push(`\n### ${card.name_cn}（${card.id}）`);
    lines.push(`- 法规身份：${card.regulatory_identity}`);
    lines.push(`- 适用路径：${card.applicable_paths.join(" / ")}`);
    lines.push(`- 可讨论应用：${compactList(card.application_scenarios, 5) || "待复核"}`);
    lines.push(`- 禁止/高风险表达：${compactList(card.prohibited_or_risky_expressions, 8) || "待复核"}`);
    lines.push(`- 不适宜人群/标签注意：${compactList(card.unsuitable_groups_or_label_notes, 4) || "待复核"}`);
    lines.push(`- 人工复核点：${compactList(card.manual_review_points, 5) || "待复核"}`);
    lines.push(`- 证据等级：${card.confidence}；last_checked_at：${card.last_checked_at}；manual_review_required：${card.manual_review_required ? "true" : "false"}`);
    lines.push(`- 来源：${card.source_ids.map(sourceLabel).join("；") || "待补充官方来源"}`);
  }

  return lines.join("\n");
}

export function buildPublicEvidencePromptBlock(query: string, limit = 5): string {
  return [
    buildRegulatoryPathMapPromptBlock(),
    buildPublicEvidenceIngredientPromptBlock(query, limit),
  ].join("\n\n");
}

export function getPublicEvidenceStats() {
  return {
    ingredient_card_count: ingredientCards.length,
    regulatory_path_count: regulatoryMap.length,
    source_count: sources.length,
  };
}
