// ── Product Types ──

export interface ProductSpecifications {
  composition?: string;
  form?: string;
  protein_content?: string;
  fat?: string;
  lactose?: string;
  molecular_weight?: string;
  homology?: string;
  source?: string;
  minerals?: string;
  igg_content?: string;
  epa?: string;
  dha?: string;
  dha_content?: string;
  [key: string]: string | undefined;
}

export interface RegulatoryStatus {
  china?: string;
  us?: string;
  eu?: string;
  australia?: string;
  korea?: string;
  gb14880?: string;
  gb2760?: string;
  health_food_dir?: string;
  certifications?: string[];
  patent?: string;
  [key: string]: string | string[] | undefined;
}

export interface Product {
  id: string;
  supplier: string;
  product_name: string;
  product_code: string;
  category: string;
  origin: string;
  function: string;
  mechanism?: string;
  applications: string[];
  dosage_range?: string;
  key_specifications?: ProductSpecifications;
  clinical_evidence?: string;
  regulatory_status?: RegulatoryStatus;
  dosage_form?: string;
  flavor_options?: string;
  stability?: string;
  confidence: "high" | "medium" | "low";
  data_source: string;
}

export interface ProductWithPrice extends Product {
  price?: number | null;
  price_range?: string;
  price_unit?: string;
  price_trend?: string;
}

// ── Pricing Types ──

export interface PricingEntry {
  brand: string;
  product: string;
  price?: number | null;
  price_range?: string;
  unit: string;
  trend?: string;
  volumes?: string;
  price_tiers?: PriceTier[];
  supplier_id: string;
  note?: string;
  disclaimer?: string;
}

export interface PriceTier {
  qty: string;
  price: number;
}

export interface PricingData {
  last_updated: string;
  source: string;
  currency: string;
  incoterm: string;
  note: string;
  [category: string]: PricingEntry[] | string;
}

// ── Supplier Types ──

export interface Supplier {
  id: string;
  name: string;
  name_en: string;
  description: string;
  product_lines: string[];
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

// ── Regulation Types ──

export interface Regulation {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  applicable_ingredients: string[];
  requirements: string;
  last_updated: string;
}

// ── AI Recommendation Types ──

export interface RecommendRequest {
  query: string;
}

export interface RecommendedProduct {
  product_id: string;
  product_name: string;
  category: string;
  supplier: string;
  function: string;
  suggested_dosage?: string;
  price_range?: string;
  regulatory_status?: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface RecommendResponse {
  recommendations: RecommendedProduct[];
  reasoning: string;
  disclaimer: string;
}

// ── Search Types ──

export interface SearchFilters {
  category?: string;
  function?: string;
  supplier?: string;
  query?: string;
}

export interface SearchResult {
  products: ProductWithPrice[];
  total: number;
  filters: SearchFilters;
}
