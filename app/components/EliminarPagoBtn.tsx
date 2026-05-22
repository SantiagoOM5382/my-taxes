"use client";

import { useTransition } from "react";
import { eliminarPago } from "@/app/lib/actions";

interface EliminarPagoBtnProps {
  pagoId: number;
  deudaId: number;
}

export default function EliminarPagoBtn({ pagoId, deudaId }: EliminarPagoBtnProps) {
  const [pending, startTransition] = useTransition();

  function handleEliminar() {
    if (!confirm("¿Eliminar este pago? El monto será devuelto al saldo de la deuda.")) {
      return;
    }
    startTransition(async () => {
      await eliminarPago(pagoId, deudaId);
    });
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={pending}
      title="Eliminar pago"
      className="text-gray-400 hover:text-red-500 disabled:opacity-40 transition-colors text-xs"
    >
      {pending ? "..." : "✕"}
    </button>
  );
}
