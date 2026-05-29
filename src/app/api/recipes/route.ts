import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

const RECIPES_FILE = path.join(process.cwd(), "src", "data", "recipes.json");

interface Recipe {
  id: string;
  user_id: string;
  query: string;
  recommendation: string;
  created_at: string;
  formula_brief?: unknown;
  trust_score?: unknown;
}

function readRecipes(): Recipe[] {
  if (!fs.existsSync(RECIPES_FILE)) return [];
  return JSON.parse(fs.readFileSync(RECIPES_FILE, "utf-8"));
}
function writeRecipes(data: Recipe[]) {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const recipes = readRecipes().filter(r => r.user_id === user.id);
  return NextResponse.json({ recipes: recipes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  try {
    const body = await request.json();
    const { query, recommendation, formula_brief, trust_score } = body;
    if (!query || !recommendation) return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    const recipes = readRecipes();
    const formulaBriefRecord = formula_brief && typeof formula_brief === "object" ? formula_brief as Record<string, unknown> : null;
    const recipe: Recipe = {
      id: `rec-${Date.now()}`,
      user_id: user.id,
      query,
      recommendation,
      formula_brief,
      trust_score: trust_score || formulaBriefRecord?.trust_score,
      created_at: new Date().toISOString(),
    };
    recipes.push(recipe);
    writeRecipes(recipes);
    return NextResponse.json({ success: true, recipe });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { id } = await request.json();
  const recipes = readRecipes().filter(r => !(r.id === id && r.user_id === user.id));
  writeRecipes(recipes);
  return NextResponse.json({ success: true });
}
