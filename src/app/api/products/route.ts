import { NextRequest, NextResponse } from "next/server";
import { searchUnified } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || undefined;
  const category = searchParams.get("category") || undefined;
  const functional_tag = searchParams.get("function") || undefined; // keep old param name for backward compat
  const supplier = searchParams.get("supplier") || undefined;

  const products = searchUnified({
    query,
    category,
    functional_tag,
    supplier,
  });

  return NextResponse.json({
    products,
    total: products.length,
    filters: { query, category, function: functional_tag, supplier },
  });
}
