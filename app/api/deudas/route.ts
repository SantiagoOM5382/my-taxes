import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// GET /api/deudas — listar todas las deudas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get("categoria");

    const deudas = await prisma.deuda.findMany({
      where: categoria ? { categoria } : undefined,
      include: {
        pagos: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: { select: { pagos: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(deudas);
  } catch {
    return Response.json({ error: "Error al obtener deudas" }, { status: 500 });
  }
}

// POST /api/deudas — crear nueva deuda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, acreedor, categoria, montoInicial, notas } = body;

    if (!nombre || !acreedor || !categoria || montoInicial == null) {
      return Response.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const deuda = await prisma.deuda.create({
      data: {
        nombre,
        acreedor,
        categoria,
        montoInicial: parseFloat(montoInicial),
        montoActual: parseFloat(montoInicial),
        notas: notas ?? null,
      },
    });

    return Response.json(deuda, { status: 201 });
  } catch {
    return Response.json({ error: "Error al crear deuda" }, { status: 500 });
  }
}
