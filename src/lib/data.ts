import { readFileSync } from "fs";
import { join } from "path";
import type {
  Product,
  ProductWithPrice,
  PricingEntry,
  PricingData,
} from "@/types";

const DATA_DIR = join(
  process.env.PROJECT_ROOT || "/Volumes/Mac DiskA/Work/ANG/AI-Consultant",
  "shared"
);

let _productsCache: Product[] | null = null;
let _pricingCache: PricingData | null = null;

function loadProducts(): Product[] {
  if (_productsCache) return _productsCache;

  const raw = readFileSync(join(DATA_DIR, "products.json"), "utf-8");
  const data = JSON.parse(raw);

  const products: Product[] = [];
  for (const lineKey of Object.keys(data.product_lines)) {
    const line = data.product_lines[lineKey];
    if (line.products) {
      products.push(...line.products);
    }
  }

  _productsCache = products;
  return products;
}

function loadPricing(): PricingData {
  if (_pricingCache) return _pricingCache;

  const raw = readFileSync(join(DATA_DIR, "pricing.json"), "utf-8");
  _pricingCache = JSON.parse(raw);
  return _pricingCache!;
}

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

export function getAllProducts(): ProductWithPrice[] {
  const products = loadProducts();
  const pricing = loadPricing();

  return products.map((p) => {
    const priceData = matchPricing(p.product_name, p.product_code, pricing);
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
  const products = getAllProducts();
  return products.find((p) => p.id === id);
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
  const products = loadProducts();
  const cats = new Set(products.map((p) => p.category));
  return Array.from(cats).sort();
}

export function getFunctions(): string[] {
  const products = loadProducts();
  const fns = new Set<string>();
  for (const p of products) {
    // Extract main function keywords
    const parts = p.function.split(/[：:]/);
    if (parts.length > 1) {
      fns.add(parts[0].trim());
    }
  }
  return Array.from(fns).sort();
}

export function getSuppliers(): string[] {
  const products = loadProducts();
  const sups = new Set(products.map((p) => p.supplier));
  return Array.from(sups).sort();
}
