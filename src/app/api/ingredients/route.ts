import { NextRequest, NextResponse } from "next/server";
import { readIngredients, writeIngredients } from "@/lib/filestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ingredients = readIngredients();

  let results = [...ingredients];

  const query = searchParams.get("query");
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (i: any) =>
        i.generic_name.toLowerCase().includes(q) ||
        i.generic_name_en.toLowerCase().includes(q) ||
        i.product_name.toLowerCase().includes(q) ||
        i.function.toLowerCase().includes(q) ||
        i.supplier_name.toLowerCase().includes(q)
    );
  }

  const category = searchParams.get("category");
  if (category) results = results.filter((i: any) => i.category === category);

  const source = searchParams.get("source");
  if (source) results = results.filter((i: any) => i.source === source);

  const process = searchParams.get("process");
  if (process) results = results.filter((i: any) => i.process === process);

  const functional_tag = searchParams.get("functional_tag");
  if (functional_tag)
    results = results.filter((i: any) =>
      i.functional_tags.includes(functional_tag)
    );

  const application = searchParams.get("application");
  if (application)
    results = results.filter((i: any) => i.applications.includes(application));

  const supplier = searchParams.get("supplier");
  if (supplier)
    results = results.filter(
      (i: any) =>
        i.supplier_id === supplier ||
        i.supplier_name.toLowerCase().includes(supplier.toLowerCase())
    );

  return NextResponse.json({ ingredients: results, total: results.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ingredients = readIngredients();

    // Generate new ID
    const maxId = ingredients.reduce((max: number, i: any) => {
      const num = parseInt(i.id.split("-").pop()) || 0;
      return num > max ? num : max;
    }, 0);
    body.id = body.id || `NEW-${String(maxId + 1).padStart(3, "0")}`;

    ingredients.push(body);
    writeIngredients(ingredients);

    return NextResponse.json({ success: true, ingredient: body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
