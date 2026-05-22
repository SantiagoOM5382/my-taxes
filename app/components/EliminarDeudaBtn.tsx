"use client";

import { useTransition } from "react";
import { eliminarDeuda } from "@/app/lib/actions";

export default function EliminarDeudaBtn({ deudaId }: { deudaId: number }) {
  const [pending, startTransition] = useTransition();

  function handleEliminar() {
    if (!confirm("¿Seguro que quieres eliminar esta deuda? También se eliminarán todos sus pagos.")) {
      return;
    }
    startTransition(async () => {
      await eliminarDeuda(deudaId);
    });
  }

  return (
    <button
      onClick={handleEliminar}
      disabled={pending}
      className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Eliminando..." : "Eliminar deuda"}
    </button>
  );
}
