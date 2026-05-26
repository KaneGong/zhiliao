import type {
  Product,
  PricingEntry,
  PricingData,
  Ingredient,
  RegulatoryStatus,
  Supplier,
  TagSystem,
  SearchFilters,
} from "@/types";

import pricingJson from "@/data/pricing.json";
import ingredientsJson from "@/data/ingredients.json";
import suppliersJson from "@/data/suppliers.json";
import tagsJson from "@/data/tags.json";

// ── Unified Data Cache (single source of truth: ingredients.json) ──

const _ingredientsCache = ingredientsJson as unknown as Ingredient[];
const _pricingCache = pricingJson as PricingData;
const _suppliersCache = suppliersJson as Supplier[];
const _tagsCache = tagsJson as TagSystem;

// ── Price matching helper ──

function matchPricing(
  productName: string,
  supplierName: string,
  genericName: string,
  pricing: PricingData
): Partial<PricingEntry> {
  for (const key of Object.keys(pricing)) {
    if (!Array.isArray(pricing[key])) continue;
    const entries = pricing[key] as PricingEntry[];
    for (const entry of entries) {
      if (
        entry.product.includes(productName) ||
        productName.includes(entry.product) ||
        entry.product.includes(genericName) ||
        genericName.includes(entry.product)
      ) {
        return entry;
      }
    }
  }
  return {};
}

// ── Unified Search Result (for frontend consumption) ──

export interface SearchResultItem {
  id: string;
  product_name: string;
  generic_name: string;
  generic_name_en: string;
  supplier_name: string;         // 保留向后兼容
  supplier_id: string;
  manufacturer: string;          // 实际生产厂家
  supplier: string;              // 代理商/供应商
  category: string;
  source: string;
  process: string;
  function: string;
  mechanism: string;
  functional_tags: string[];
  applications: string[];
  certifications: string[];
  key_specs: Record<string, string | undefined>;
  dosage_range: string;
  clinical_evidence: string;
  regulatory_status: RegulatoryStatus;
  origin: string;
  confidence: "high" | "medium" | "low";
  data_source: string;
  // Price (enriched from pricing.json)
  price: number | null;
  price_range: string | null;
  price_unit: string | null;
  price_trend: string | null;
  // For backward compat with old UI components
  product_code: string;
}

function ingredientToSearchResult(i: Ingredient): SearchResultItem {
  const priceData = matchPricing(
    i.product_name,
    i.supplier_name,
    i.generic_name,
    _pricingCache
  );
  return {
    id: i.id,
    product_name: i.product_name,
    generic_name: i.generic_name,
    generic_name_en: i.generic_name_en,
    supplier_name: i.supplier_name || i.manufacturer || "",
    supplier_id: i.supplier_id,
    manufacturer: i.manufacturer || i.supplier_name || "",
    supplier: i.supplier || "",
    category: i.category,
    source: i.source,
    process: i.process,
    function: i.function,
    mechanism: i.mechanism || "",
    functional_tags: i.functional_tags || [],
    applications: i.applications || [],
    certifications: i.certifications || [],
    key_specs: i.key_specs || {},
    dosage_range: i.dosage_range || "",
    clinical_evidence: i.clinical_evidence || "",
    regulatory_status: i.regulatory_status || {},
    origin: i.origin || "",
    confidence: i.confidence || "medium",
    data_source: i.data_source || "",
    price: priceData.price ?? (i.price_range?.min ?? null),
    price_range: priceData.price_range || (i.price_range ? `${i.price_range.min}-${i.price_range.max}` : null),
    price_unit: priceData.unit || i.price_range?.unit || null,
    price_trend: priceData.trend || null,
    product_code: i.id,
  };
}

// ── Unified Search ──

export function searchUnified(filters: {
  query?: string;
  category?: string;
  functional_tag?: string;
  application?: string;
  supplier?: string;
  source?: string;
  process?: string;
}): SearchResultItem[] {
  let results = _ingredientsCache.map(ingredientToSearchResult);

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (r) =>
        r.product_name.toLowerCase().includes(q) ||
        r.generic_name.toLowerCase().includes(q) ||
        r.generic_name_en.toLowerCase().includes(q) ||
        r.function.toLowerCase().includes(q) ||
        r.mechanism.toLowerCase().includes(q) ||
        r.supplier_name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.applications.some((a) => a.toLowerCase().includes(q)) ||
        r.functional_tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    results = results.filter(
      (r) =>
        r.category.toLowerCase().includes(cat) ||
        r.functional_tags.some((t) => t.toLowerCase().includes(cat)) ||
        r.applications.some((a) => a.toLowerCase().includes(cat))
    );
  }

  if (filters.functional_tag) {
    results = results.filter((r) =>
      r.functional_tags.includes(filters.functional_tag!)
    );
  }

  if (filters.application) {
    results = results.filter((r) =>
      r.applications.includes(filters.application!)
    );
  }

  if (filters.supplier) {
    const sup = filters.supplier.toLowerCase();
    results = results.filter(
      (r) =>
        r.supplier_id === sup ||
        r.supplier_name.toLowerCase().includes(sup)
    );
  }

  if (filters.source) {
    results = results.filter((r) => r.source === filters.source);
  }

  if (filters.process) {
    results = results.filter((r) => r.process === filters.process);
  }

  return results;
}

// ── Category & Supplier metadata (derived from ingredients) ──

export function getCategories(): string[] {
  const cats = new Set(_ingredientsCache.map((i) => i.category).filter(Boolean));
  return Array.from(cats).sort();
}

export function getSuppliers(): string[] {
  const sups = new Set(_ingredientsCache.map((i) => i.supplier_name).filter(Boolean));
  return Array.from(sups).sort();
}

export function getFunctionalTags(): string[] {
  const tags = new Set(_ingredientsCache.flatMap((i) => i.functional_tags || []));
  return Array.from(tags).sort();
}

// ── Ingredient Functions (primary data system) ──

export function getAllIngredients(): Ingredient[] {
  return _ingredientsCache;
}

export function getIngredientById(id: string): Ingredient | undefined {
  return _ingredientsCache.find((i) => i.id === id);
}

export function getSearchResultById(id: string): SearchResultItem | undefined {
  const ingredient = _ingredientsCache.find((i) => i.id === id);
  return ingredient ? ingredientToSearchResult(ingredient) : undefined;
}

export function searchIngredients(filters: SearchFilters): {
  ingredients: Ingredient[];
  total: number;
} {
  let results = [..._ingredientsCache];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (i) =>
        i.generic_name.toLowerCase().includes(q) ||
        i.generic_name_en.toLowerCase().includes(q) ||
        i.product_name.toLowerCase().includes(q) ||
        i.function.toLowerCase().includes(q) ||
        i.supplier_name.toLowerCase().includes(q)
    );
  }

  if (filters.category) {
    results = results.filter((i) => i.category === filters.category);
  }

  if (filters.source) {
    results = results.filter((i) => i.source === filters.source);
  }

  if (filters.process) {
    results = results.filter((i) => i.process === filters.process);
  }

  if (filters.functional_tag) {
    results = results.filter((i) =>
      i.functional_tags.includes(filters.functional_tag!)
    );
  }

  if (filters.application) {
    results = results.filter((i) =>
      i.applications.includes(filters.application!)
    );
  }

  if (filters.supplier) {
    results = results.filter(
      (i) =>
        i.supplier_id === filters.supplier ||
        i.supplier_name.toLowerCase().includes(filters.supplier!.toLowerCase())
    );
  }

  return { ingredients: results, total: results.length };
}

export function getIngredientGroups(): {
  generic_name: string;
  generic_name_en: string;
  count: number;
  category: string;
}[] {
  const groups = new Map<
    string,
    { generic_name: string; generic_name_en: string; count: number; category: string }
  >();
  for (const i of _ingredientsCache) {
    const key = i.generic_name;
    if (groups.has(key)) {
      groups.get(key)!.count++;
    } else {
      groups.set(key, {
        generic_name: i.generic_name,
        generic_name_en: i.generic_name_en,
        count: 1,
        category: i.category,
      });
    }
  }
  return Array.from(groups.values()).sort((a, b) => b.count - a.count);
}

// ── Supplier Functions ──

export function getAllSuppliers(): Supplier[] {
  return _suppliersCache;
}

export function getSupplierById(id: string): Supplier | undefined {
  return _suppliersCache.find((s) => s.id === id);
}

// ── Tag Functions ──

export function getTagSystem(): TagSystem {
  return _tagsCache;
}

export function getTagValues(dimension: string): string[] {
  const dim = _tagsCache.dimensions[dimension as keyof typeof _tagsCache.dimensions];
  return dim ? dim.values : [];
}

// ── Backward compat: getAllProducts() for pages that still reference it ──

/** @deprecated Use searchUnified() or getAllIngredients() instead */
export function getAllProducts(): SearchResultItem[] {
  return _ingredientsCache.map(ingredientToSearchResult);
}
