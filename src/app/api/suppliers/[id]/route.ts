import { NextRequest, NextResponse } from "next/server";
import { readSuppliers, writeSuppliers } from "@/lib/filestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const suppliers = readSuppliers();
  const supplier = suppliers.find((s: any) => s.id === id);

  if (!supplier) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(supplier);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const suppliers = readSuppliers();
    const index = suppliers.findIndex((s: any) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    suppliers[index] = { ...suppliers[index], ...body, id };
    writeSuppliers(suppliers);

    return NextResponse.json({ success: true, supplier: suppliers[index] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const suppliers = readSuppliers();
  const index = suppliers.findIndex((s: any) => s.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  suppliers.splice(index, 1);
  writeSuppliers(suppliers);

  return NextResponse.json({ success: true });
}
