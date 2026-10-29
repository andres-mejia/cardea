import { NextResponse } from "next/server";

import { PANTALLAS, type Pantalla } from "@/lib/demo/datos";

// API de demostración: datos ilustrativos hasta que exista el control plane.
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ pantalla: string }> }) {
  const { pantalla } = await params;
  if (!(pantalla in PANTALLAS)) return NextResponse.json({ error: "Pantalla desconocida" }, { status: 404 });
  const datos = PANTALLAS[pantalla as Pantalla](new Date());
  return NextResponse.json({ ilustrativo: true, datos }, { headers: { "Cache-Control": "no-store" } });
}
