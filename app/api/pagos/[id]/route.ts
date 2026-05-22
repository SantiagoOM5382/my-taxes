import { prisma } from "@/app/lib/prisma";
import type { NextRequest } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/pagos/[id] — eliminar un pago y revertir el monto
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const pago = await prisma.pago.findUnique({
      where: { id: parseInt(id) },
    });

    if (!pago) {
      return Response.json({ error: "Pago no encontrado" }, { status: 404 });
    }

    // Eliminar pago y revertir monto en una transacción
    await prisma.$transaction([
      prisma.pago.delete({ where: { id: parseInt(id) } }),
      prisma.deuda.update({
        where: { id: pago.deudaId },
        data: {
          montoActual: { increment: pago.monto },
        },
      }),
    ]);

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Error al eliminar pago" }, { status: 500 });
  }
}
