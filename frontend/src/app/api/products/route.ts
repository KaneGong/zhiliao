import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const fn = searchParams.get("function") || undefined;
  const supplier = searchParams.get("supplier") || undefined;

  const products = searchProducts({ query, category, function: fn, supplier });

  return NextResponse.json({
    products,
    total: products.length,
    filters: { query, category, function: fn, supplier },
  });
}
