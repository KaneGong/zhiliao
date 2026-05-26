import { NextResponse } from "next/server";
import { getCategories, getSuppliers, getFunctionalTags } from "@/lib/data";

export async function GET() {
  return NextResponse.json({
    categories: getCategories(),
    functions: getFunctionalTags(),
    suppliers: getSuppliers(),
  });
}
