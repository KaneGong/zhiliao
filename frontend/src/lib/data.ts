import type {
  Product,
  ProductWithPrice,
  PricingEntry,
  PricingData,
  Ingredient,
  Supplier,
  TagSystem,
  SearchFilters,
} from "@/types";

import productsJson from "@/data/products.json";
import pricingJson from "@/data/pricing.json";
import ingredientsJson from "@/data/ingredients.json";
import suppliersJson from "@/data/suppliers.json";
import tagsJson from "@/data/tags.json";

// ── Legacy Product Cache ──

const _productsCache: Product[] = (() => {
  const products: Product[] = [];
  const data = productsJson as any;
  for (const lineKey of Object.keys(data.product_lines)) {
    const line = data.product_lines[lineKey];
    if (line.products) {
      products.push(...line.products);
    }
  }
  return products;
})();

const _pricingCache = pricingJson as PricingData;

// ── New Ingredient Cache ──

const _ingredientsCache = ingredientsJson as Ingredient[];
const _suppliersCache = suppliersJson as Supplier[];
const _tagsCache = tagsJson as TagSystem;

function matchPricing(
  productName: string,
  productCode: string,
  pricing: PricingData
): Partial<PricingEntry> {
  for (const key of Object.keys(pricing)) {
    if (!Array.isArray(pricing[key])) continue;
    const entries = pricing[key] as PricingEntry[];
    for (const entry of entries) {
      if (
        entry.product.includes(productCode) ||
        productName.includes(entry.product) ||
        entry.product.includes(productName)
      ) {
        return entry;
      }
    }
  }
  return {};
}

// ── Legacy Product Functions ──

export function getAllProducts(): ProductWithPrice[] {
  return _productsCache.map((p) => {
    const priceData = matchPricing(p.product_name, p.product_code, _pricingCache);
    return {
      ...p,
      price: priceData.price ?? null,
      price_range: priceData.price_range,
      price_unit: priceData.unit,
      price_trend: priceData.trend,
    };
  });
}

export function getProductById(id: string): ProductWithPrice | undefined {
  return getAllProducts().find((p) => p.id === id);
}

export function searchProducts(filters: {
  query?: string;
  category?: string;
  function?: string;
  supplier?: string;
}): ProductWithPrice[] {
  let products = getAllProducts();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    products = products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(q) ||
        p.product_code.toLowerCase().includes(q) ||
        p.function.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.applications.some((a) => a.toLowerCase().includes(q))
    );
  }

  if (filters.category) {
    products = products.filter(
      (p) =>
        p.category.toLowerCase().includes(filters.category!.toLowerCase())
    );
  }

  if (filters.function) {
    const fn = filters.function.toLowerCase();
    products = products.filter(
      (p) =>
        p.function.toLowerCase().includes(fn) ||
        (p.mechanism && p.mechanism.toLowerCase().includes(fn))
    );
  }

  if (filters.supplier) {
    products = products.filter(
      (p) => p.supplier.toLowerCase().includes(filters.supplier!.toLowerCase())
    );
  }

  return products;
}

export function getCategories(): string[] {
  const cats = new Set(_productsCache.map((p) => p.category));
  return Array.from(cats).sort();
}

export function getFunctions(): string[] {
  const fns = new Set<string>();
  for (const p of _productsCache) {
    const parts = p.function.split(/[：:]/);
    if (parts.length > 1) {
      fns.add(parts[0].trim());
    }
  }
  return Array.from(fns).sort();
}

export function getSuppliers(): string[] {
  const sups = new Set(_productsCache.map((p) => p.supplier));
  return Array.from(sups).sort();
}

// ── New Ingredient Functions ──

export function getAllIngredients(): Ingredient[] {
  return _ingredientsCache;
}

export function getIngredientById(id: string): Ingredient | undefined {
  return _ingredientsCache.find((i) => i.id === id);
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
