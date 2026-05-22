"use client";

import { useActionState } from "react";
import { registrarPago } from "@/app/lib/actions";

interface PagoFormProps {
  deudaId: number;
  montoActual: number;
}

export default function PagoForm({ deudaId, montoActual }: PagoFormProps) {
  const [error, formAction, pending] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        await registrarPago(deudaId, formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Error al registrar pago";
      }
    },
    null
  );

  if (montoActual <= 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-green-700 font-semibold">¡Deuda pagada completamente!</p>
        <p className="text-green-600 text-sm mt-1">Felicitaciones, esta deuda ya está saldada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Registrar pago</h3>

      <form action={formAction} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Monto */}
        <div>
          <label
            htmlFor="monto"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monto del pago <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              $
            </span>
            <input
              id="monto"
              name="monto"
              type="number"
              required
              min="0.01"
              max={montoActual}
              step="0.01"
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Saldo disponible: ${montoActual.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Nota */}
        <div>
          <label
            htmlFor="nota"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nota{" "}
            <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            id="nota"
            name="nota"
            type="text"
            placeholder="Ej: Pago de cuota mayo..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors text-sm"
        >
          {pending ? "Registrando..." : "Registrar pago"}
        </button>
      </form>
    </div>
  );
}
