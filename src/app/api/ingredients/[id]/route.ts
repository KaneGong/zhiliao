import { NextRequest, NextResponse } from "next/server";
import { readIngredients, writeIngredients } from "@/lib/filestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ingredients = readIngredients();
  const ingredient = ingredients.find((i: any) => i.id === id);

  if (!ingredient) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(ingredient);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const ingredients = readIngredients();
    const index = ingredients.findIndex((i: any) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    ingredients[index] = { ...ingredients[index], ...body, id };
    writeIngredients(ingredients);

    return NextResponse.json({ success: true, ingredient: ingredients[index] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ingredients = readIngredients();
  const index = ingredients.findIndex((i: any) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  ingredients.splice(index, 1);
  writeIngredients(ingredients);

  return NextResponse.json({ success: true });
}
