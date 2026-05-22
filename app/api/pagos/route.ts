import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

// POST /api/pagos — registrar un pago y descontar del monto actual
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deudaId, monto, nota } = body;

    if (!deudaId || monto == null) {
      return Response.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const montoPago = parseFloat(monto);
    if (montoPago <= 0) {
      return Response.json(
        { error: "El monto del pago debe ser mayor a 0" },
        { status: 400 }
      );
    }

    const deuda = await prisma.deuda.findUnique({
      where: { id: parseInt(deudaId) },
    });

    if (!deuda) {
      return Response.json({ error: "Deuda no encontrada" }, { status: 404 });
    }

    if (montoPago > deuda.montoActual) {
      return Response.json(
        {
          error: `El pago ($${montoPago}) supera el saldo actual ($${deuda.montoActual})`,
        },
        { status: 400 }
      );
    }

    // Crear pago y actualizar deuda en una transacción
    const [pago] = await prisma.$transaction([
      prisma.pago.create({
        data: {
          deudaId: parseInt(deudaId),
          monto: montoPago,
          nota: nota ?? null,
        },
      }),
      prisma.deuda.update({
        where: { id: parseInt(deudaId) },
        data: {
          montoActual: { decrement: montoPago },
        },
      }),
    ]);

    return Response.json(pago, { status: 201 });
  } catch {
    return Response.json(
      { error: "Error al registrar pago" },
      { status: 500 }
    );
  }
}
