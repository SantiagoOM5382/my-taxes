import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/deudas/[id] — obtener una deuda con todos sus pagos
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const deuda = await prisma.deuda.findUnique({
      where: { id: parseInt(id) },
      include: {
        pagos: { orderBy: { createdAt: "desc" } },
        _count: { select: { pagos: true } },
      },
    });

    if (!deuda) {
      return Response.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    return Response.json(deuda);
  } catch {
    return Response.json({ error: "Error al obtener deuda" }, { status: 500 });
  }
}

// PUT /api/deudas/[id] — editar una deuda
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const { nombre, acreedor, categoria, montoInicial, notas } = body;

    const deudaExistente = await prisma.deuda.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deudaExistente) {
      return Response.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    const nuevoMontoInicial =
      montoInicial != null
        ? parseFloat(montoInicial)
        : deudaExistente.montoInicial;
    const diferencia = nuevoMontoInicial - deudaExistente.montoInicial;
    const nuevoMontoActual = Math.max(
      0,
      deudaExistente.montoActual + diferencia
    );

    const deuda = await prisma.deuda.update({
      where: { id: parseInt(id) },
      data: {
        nombre: nombre ?? deudaExistente.nombre,
        acreedor: acreedor ?? deudaExistente.acreedor,
        categoria: categoria ?? deudaExistente.categoria,
        montoInicial: nuevoMontoInicial,
        montoActual: nuevoMontoActual,
        notas: notas !== undefined ? notas : deudaExistente.notas,
      },
    });

    return Response.json(deuda);
  } catch {
    return Response.json(
      { error: "Error al actualizar deuda" },
      { status: 500 }
    );
  }
}

// DELETE /api/deudas/[id] — eliminar deuda (y sus pagos en cascada)
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const deuda = await prisma.deuda.findUnique({
      where: { id: parseInt(id) },
    });

    if (!deuda) {
      return Response.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    await prisma.deuda.delete({ where: { id: parseInt(id) } });

    return new Response(null, { status: 204 });
  } catch {
    return Response.json(
      { error: "Error al eliminar deuda" },
      { status: 500 }
    );
  }
}
