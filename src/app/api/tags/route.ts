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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { dimension, oldValue, newValue } = body;

    if (!dimension || !oldValue || !newValue) {
      return NextResponse.json(
        { error: "dimension, oldValue, and newValue are required" },
        { status: 400 }
      );
    }

    const tags = readTags();
    const dim = tags.dimensions[dimension];

    if (!dim) {
      return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
    }

    const index = dim.values.indexOf(oldValue);
    if (index === -1) {
      return NextResponse.json({ error: "Old value not found" }, { status: 404 });
    }

    if (dim.values.includes(newValue) && oldValue !== newValue) {
      return NextResponse.json({ error: "New value already exists" }, { status: 400 });
    }

    dim.values[index] = newValue;
    writeTags(tags);

    return NextResponse.json({ success: true, tags });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get("dimension");
    const value = searchParams.get("value");

    if (!dimension || !value) {
      return NextResponse.json(
        { error: "dimension and value query params are required" },
        { status: 400 }
      );
    }

    const tags = readTags();
    const dim = tags.dimensions[dimension];

    if (!dim) {
      return NextResponse.json({ error: "Invalid dimension" }, { status: 400 });
    }

    const index = dim.values.indexOf(value);
    if (index === -1) {
      return NextResponse.json({ error: "Value not found" }, { status: 404 });
    }

    dim.values.splice(index, 1);
    writeTags(tags);

    return NextResponse.json({ success: true, tags });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
