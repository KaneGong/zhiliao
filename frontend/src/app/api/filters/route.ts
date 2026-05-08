import { NextRequest, NextResponse } from "next/server";
import { getCategories, getFunctions, getSuppliers } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    categories: getCategories(),
    functions: getFunctions(),
    suppliers: getSuppliers(),
  });
}
