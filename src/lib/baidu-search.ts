/**
 * 百度搜索封装 — 调用 baidu-search skill 的 Python 脚本
 */

import { execSync } from "child_process";
import path from "path";
import os from "os";

const SKILL_DIR = path.join(os.homedir(), ".codex/skills/baidu-search");

interface BaiduResult {
  title: string;
  url: string;
  snippet: string;
  website?: string;
}

export interface BaiduResponse {
  results: BaiduResult[];
  count: number;
  query: string;
}

function runSearch(query: string, limit: number = 5): BaiduResponse {
  try {
    const script = path.join(SKILL_DIR, "scripts", "search.py");
    const cmd = `cd "${SKILL_DIR}" && python3 "${script}" "${query.replace(/"/g, '\\"')}" --json --limit ${limit}`;
    const raw = execSync(cmd, { timeout: 15000, encoding: "utf-8", maxBuffer: 1024 * 1024 });

    // 去掉 stderr 警告（urllib3 等），只取 JSON 部分
    const jsonStart = raw.indexOf("{");
    if (jsonStart === -1) return { results: [], count: 0, query };

    const data = JSON.parse(raw.slice(jsonStart));
    const results: BaiduResult[] = (data.results || []).map((r: any) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: r.snippet || r.abstract || "",
      website: r.website || r.site || "",
    }));

    return { results, count: results.length, query };
  } catch {
    return { results: [], count: 0, query };
  }
}

/** 搜索原料的法规状态 */
export async function searchRegulationStatus(ingredient: string): Promise<{
  summary: string;
  urls: string[];
  hasGovResults: boolean;
}> {
  const queries = [
    `${ingredient} 新食品原料 卫健委 公告`,
    `${ingredient} 普通食品 可用 合规`,
    `${ingredient} 保健食品 原料目录`,
    `${ingredient} 药食同源 目录`,
  ];

  const allSnippets: string[] = [];
  const allUrls: string[] = [];
  let hasGov = false;

  for (const q of queries.slice(0, 2)) {
    // 每次只查两个方向，节省额度
    const resp = runSearch(q, 3);
    for (const r of resp.results) {
      allSnippets.push(r.snippet);
      allUrls.push(r.url);
      if (r.url.includes("gov.cn") || r.url.includes("nhc.gov.cn")) {
        hasGov = true;
      }
    }
  }

  return {
    summary: allSnippets.join(" | ").slice(0, 3000),
    urls: [...new Set(allUrls)],
    hasGovResults: hasGov,
  };
}

/** 基于搜索摘要判定原料法规状态 */
export function classifyFromSummary(
  ingredient: string,
  summary: string,
  hasGovResults: boolean
): {
  category: string;
  foodScopes: string[];
  confidence: "high" | "medium" | "low";
  note: string;
} {
  const text = summary.toLowerCase();

  // 保健食品专属
  if (
    text.includes("保健食品原料目录") &&
    (text.includes("仅限于保健食品") ||
      text.includes("不得用于其他食品") ||
      text.includes("不得用于普通食品"))
  ) {
    return {
      category: "保健食品原料目录",
      foodScopes: ["health_food"],
      confidence: "high",
      note: `百度确认：${ingredient}列入保健食品原料目录，仅限保健食品。`,
    };
  }

  // 新食品原料
  if (text.includes("新食品原料") || text.includes("新资源食品")) {
    if (!text.includes("未被批准") && !text.includes("未获批") && !text.includes("受理")) {
      return {
        category: "新食品原料",
        foodScopes: ["general_food"],
        confidence: "medium",
        note: `百度搜索提示${ingredient}可能为新食品原料，建议核实公告原文。`,
      };
    }
  }

  // 药食同源
  if (text.includes("药食同源") && (text.includes("目录") || text.includes("名单") || text.includes("物质"))) {
    return {
      category: "药食同源",
      foodScopes: ["general_food"],
      confidence: "medium",
      note: `百度搜索提示${ingredient}可能属于药食同源物质。`,
    };
  }

  // 普通食品原料（名称推断）
  if (/蛋白$|粉$|油$/.test(ingredient)) {
    return {
      category: "普通食品原料（推断）",
      foodScopes: ["general_food"],
      confidence: "medium",
      note: `从名称推断为普通食品原料，建议进一步确认。`,
    };
  }

  if (hasGovResults) {
    return {
      category: "需人工确认",
      foodScopes: [],
      confidence: "low",
      note: "有政府来源信息但无法自动判定。",
    };
  }

  return {
    category: "未收录",
    foodScopes: [],
    confidence: "low",
    note: "未找到法规信息，可能未在中国获批。",
  };
}
