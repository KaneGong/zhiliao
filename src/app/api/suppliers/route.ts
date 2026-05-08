import { NextRequest, NextResponse } from "next/server";
import { readSuppliers, writeSuppliers } from "@/lib/filestore";

export async function GET() {
  const suppliers = readSuppliers();
  return NextResponse.json({ suppliers, total: suppliers.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const suppliers = readSuppliers();

    // Check duplicate ID
    if (suppliers.find((s: any) => s.id === body.id)) {
      return NextResponse.json({ error: "Supplier ID already exists" }, { status: 400 });
    }

    suppliers.push(body);
    writeSuppliers(suppliers);

    return NextResponse.json({ success: true, supplier: body });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
