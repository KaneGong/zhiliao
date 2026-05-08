// ── Product Types (Legacy - kept for compatibility) ──

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

// ── Ingredient Types (New Tag System) ──

export interface Ingredient {
  id: string;
  product_name: string;
  supplier_id: string;
  supplier_name: string;
  generic_name: string;
  generic_name_en: string;
  category: string;
  source: string;
  process: string;
  functional_tags: string[];
  applications: string[];
  key_specs: Record<string, string>;
  function: string;
  mechanism: string;
  dosage_range: string;
  clinical_evidence: string;
  regulatory_status: RegulatoryStatus;
  price_range: {
    min: number | null;
    max: number | null;
    unit: string;
    note: string;
  } | null;
  origin: string;
  data_source: string;
  confidence: "high" | "medium" | "low";
}

// ── Tag System Types ──

export interface TagDimension {
  label: string;
  values: string[];
}

export interface TagSystem {
  last_updated: string;
  dimensions: {
    category: TagDimension;
    source: TagDimension;
    process: TagDimension;
    functional_tags: TagDimension;
    applications: TagDimension;
    certifications: TagDimension;
  };
}

// ── Supplier Types ──

export interface Supplier {
  id: string;
  name: string;
  name_en: string;
  description: string;
  contact: {
    email?: string;
    phone?: string;
    person?: string;
  };
  website: string;
  location: string;
  brands: string[];
  is_master: boolean;
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

export interface RecommendedIngredient {
  generic_name: string;
  generic_name_en: string;
  suggested_dosage: string;
  function: string;
  products: RecommendedProduct[];
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
  grouped_recommendations?: RecommendedIngredient[];
  reasoning: string;
  disclaimer: string;
}

// ── Search Types ──

export interface SearchFilters {
  category?: string;
  source?: string;
  process?: string;
  functional_tag?: string;
  application?: string;
  supplier?: string;
  query?: string;
}

export interface SearchResult {
  ingredients: Ingredient[];
  total: number;
  filters: SearchFilters;
}

// ── Admin Types ──

export interface AdminSession {
  authenticated: boolean;
}
