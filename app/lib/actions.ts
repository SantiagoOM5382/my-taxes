"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── DEUDAS ──────────────────────────────────────────────────────────────────

export async function crearDeuda(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const acreedor = formData.get("acreedor") as string;
  const categoria = formData.get("categoria") as string;
  const montoInicial = parseFloat(formData.get("montoInicial") as string);
  const notas = (formData.get("notas") as string) || null;

  if (!nombre || !acreedor || !categoria || isNaN(montoInicial)) {
    throw new Error("Faltan campos obligatorios");
  }

  await prisma.deuda.create({
    data: {
      nombre,
      acreedor,
      categoria,
      montoInicial,
      montoActual: montoInicial,
      notas,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function editarDeuda(id: number, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const acreedor = formData.get("acreedor") as string;
  const categoria = formData.get("categoria") as string;
  const montoInicial = parseFloat(formData.get("montoInicial") as string);
  const notas = (formData.get("notas") as string) || null;

  const deudaExistente = await prisma.deuda.findUniqueOrThrow({
    where: { id },
  });

  // Ajustar monto actual proporcionalmente al cambio en el monto inicial
  const diferencia = montoInicial - deudaExistente.montoInicial;
  const nuevoMontoActual = Math.max(0, deudaExistente.montoActual + diferencia);

  await prisma.deuda.update({
    where: { id },
    data: {
      nombre,
      acreedor,
      categoria,
      montoInicial,
      montoActual: nuevoMontoActual,
      notas,
    },
  });

  revalidatePath("/");
  revalidatePath(`/deudas/${id}`);
  redirect(`/deudas/${id}`);
}

export async function eliminarDeuda(id: number) {
  await prisma.deuda.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

// ─── PAGOS ────────────────────────────────────────────────────────────────────

export async function registrarPago(deudaId: number, formData: FormData) {
  const monto = parseFloat(formData.get("monto") as string);
  const nota = (formData.get("nota") as string) || null;

  if (isNaN(monto) || monto <= 0) {
    throw new Error("El monto debe ser mayor a 0");
  }

  const deuda = await prisma.deuda.findUniqueOrThrow({ where: { id: deudaId } });

  if (monto > deuda.montoActual) {
    throw new Error(
      `El pago ($${monto.toFixed(2)}) supera el saldo actual ($${deuda.montoActual.toFixed(2)})`
    );
  }

  await prisma.$transaction([
    prisma.pago.create({
      data: { deudaId, monto, nota },
    }),
    prisma.deuda.update({
      where: { id: deudaId },
      data: { montoActual: { decrement: monto } },
    }),
  ]);

  revalidatePath(`/deudas/${deudaId}`);
  revalidatePath("/");
}

export async function eliminarPago(pagoId: number, deudaId: number) {
  const pago = await prisma.pago.findUniqueOrThrow({ where: { id: pagoId } });

  await prisma.$transaction([
    prisma.pago.delete({ where: { id: pagoId } }),
    prisma.deuda.update({
      where: { id: pago.deudaId },
      data: { montoActual: { increment: pago.monto } },
    }),
  ]);

  revalidatePath(`/deudas/${deudaId}`);
  revalidatePath("/");
}
