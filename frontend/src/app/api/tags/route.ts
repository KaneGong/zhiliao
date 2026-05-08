import { NextRequest, NextResponse } from "next/server";
import { readTags, writeTags } from "@/lib/filestore";

export async function GET() {
  const tags = readTags();
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dimension, value } = body;

    if (!dimension || !value) {
      return NextResponse.json(
        { error: "dimension and value are required" },
        { status: 400 }
      );
    }

    const tags = readTags();
    const dim = tags.dimensions[dimension];

    if (!dim) {
      return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
    }

    if (dim.values.includes(value)) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 400 });
    }

    dim.values.push(value);
    writeTags(tags);

    return NextResponse.json({ success: true, tags });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
