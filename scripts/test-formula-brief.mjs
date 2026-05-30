#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const Module = require("node:module");
const ts = require("typescript");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalResolveFilename = Module._resolveFilename;

Module._extensions[".ts"] = function compileTs(module, filename) {
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

Module._resolveFilename = function resolveAlias(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(this, path.join(root, "src", request.slice(2)), parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { normalizeFormulaBrief } = require(path.join(root, "src/lib/formula-brief.ts"));

const verification = {
  ingredients: [],
  gbStandards: [],
  summary: { total: 1, verified: 1, notFound: 0, healthFoodOnly: 0, caution: 0 },
};

function baseRaw(overrides = {}) {
  return {
    schema_version: "formula_brief_v1",
    id: "brief-test",
    query: "做一款运动后蛋白饮",
    created_at: "2026-05-30T00:00:00.000Z",
    product_brief: {
      product_type: "高蛋白饮料",
      target_audience: "健身人群",
      usage_scene: "运动后",
      regulatory_path: "普通食品",
      dosage_form: "饮料",
      cost_constraint: "中",
      key_constraints: [],
    },
    formula_routes: [
      {
        route_name: "清爽蛋白补充",
        route_type: "保守路线",
        suitable_for: "运动后补充",
        core_ingredients: [
          { name: "速溶浓缩乳清蛋白粉", role: "蛋白来源", suggested_dosage: "15-25g/份", regulatory_note: "普通食品原料，标签声称需复核", evidence_level: "平台数据" },
        ],
        supporting_ingredients: [],
        functional_logic: "提供蛋白补充思路。",
        process_and_flavor_notes: [],
        cost_level: "中",
        main_risks: [],
        recommendation_reason: "平台已有真实蛋白原料可询样。",
      },
    ],
    compliance_checks: [
      {
        check_item: "普通食品表达",
        risk_level: "中",
        general_food_allowed: "只能表达蛋白补充和食用场景。",
        health_food_note: "不得使用保健功能声称。",
        novel_food_note: "不涉及。",
        nutrient_fortification_note: "如强化营养素需复核 GB 14880。",
        prohibited_expressions: [],
        alternative_expressions: ["运动后蛋白补充场景"],
        references: ["GB 7718"],
        human_review_points: [],
      },
    ],
    supplier_matches: [],
    claim_suggestions: {
      positioning_sentence: "运动后蛋白补充饮品。",
      allowed_expressions: ["运动后蛋白补充场景"],
      risky_expressions: [],
      channel_notes: [],
    },
    trust_score: {
      total_score: 99,
      regulatory_coverage: 99,
      ingredient_coverage: 99,
      unknown_ingredients_count: 0,
      supplier_match_score: 100,
      risk_prompt_completeness: 99,
      evidence_summary: "模型自评高分",
    },
    next_steps: ["索取规格书"],
    markdown_summary: "摘要",
    ...overrides,
  };
}

const supplierCatalog = [
  {
    generic_name: "速溶浓缩乳清蛋白粉",
    product_name: "Avonlac 282",
    supplier_name: "Glanbia 哥兰比亚",
    supplier: "荷兰爱联康营养集团",
    manufacturer: "Glanbia 哥兰比亚（美国）",
  },
];

{
  const brief = normalizeFormulaBrief(
    baseRaw({
      supplier_matches: [
        { ingredient: "速溶浓缩乳清蛋白粉", supplier_name: "Glanbia 哥兰比亚", product_name: "Avonlac 282", platform_available: true, match_reason: "目录真实匹配", next_action: "询样" },
      ],
    }),
    "做一款运动后蛋白饮",
    "摘要",
    verification,
    { supplierCatalog },
  );
  assert.equal(brief.supplier_matches[0].platform_available, true, "真实目录供应商应保留可用状态");
}

{
  const brief = normalizeFormulaBrief(
    baseRaw({
      supplier_matches: [
        { ingredient: "速溶浓缩乳清蛋白粉", supplier_name: "虚构供应商", product_name: "不存在的乳清蛋白Plus", platform_available: true, match_reason: "模型声称匹配", next_action: "询样" },
      ],
    }),
    "做一款运动后蛋白饮",
    "摘要",
    verification,
    { supplierCatalog },
  );
  assert.equal(brief.supplier_matches[0].platform_available, false, "未在平台目录核验的供应商必须降级为不可用");
  assert.equal(brief.supplier_matches[0].supplier_name, "暂无平台匹配", "不得展示模型编造的供应商名");
  assert.equal(brief.trust_score.supplier_match_score, 0, "供应商评分必须基于服务端清洗结果重算");
}

{
  const brief = normalizeFormulaBrief(
    baseRaw({
      supplier_matches: [
        { ingredient: "速溶浓缩乳清蛋白粉", supplier_name: "Glanbia 哥兰比亚", product_name: "Avonlac 282", platform_available: "false", match_reason: "模型字符串 false", next_action: "询样" },
      ],
    }),
    "做一款运动后蛋白饮",
    "摘要",
    verification,
    { supplierCatalog },
  );
  assert.equal(brief.supplier_matches[0].platform_available, false, "字符串 false 不能被 Boolean('false') 误判为 true");
}

console.log("formula brief normalization tests passed");
