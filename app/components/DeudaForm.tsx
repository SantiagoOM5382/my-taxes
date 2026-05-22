"use client";

import { useActionState } from "react";
import type { Deuda } from "@/app/generated/prisma/client";

export const CATEGORIAS = [
  "Tarjeta de crédito",
  "Préstamo personal",
  "Servicios",
  "Hipoteca",
  "Otro",
];

interface DeudaFormProps {
  action: (formData: FormData) => Promise<void>;
  deuda?: Deuda;
  submitLabel?: string;
}

export default function DeudaForm({
  action,
  deuda,
  submitLabel = "Guardar deuda",
}: DeudaFormProps) {
  const [error, formAction, pending] = useActionState(
    async (_: string | null, formData: FormData) => {
      try {
        await action(formData);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Error inesperado";
      }
    },
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nombre de la deuda <span className="text-red-500">*</span>
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          defaultValue={deuda?.nombre}
          placeholder="Ej: Tarjeta Bancolombia"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Acreedor */}
      <div>
        <label
          htmlFor="acreedor"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          A quien se le debe <span className="text-red-500">*</span>
        </label>
        <input
          id="acreedor"
          name="acreedor"
          type="text"
          required
          defaultValue={deuda?.acreedor}
          placeholder="Ej: Bancolombia, Juan García..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Categoría */}
      <div>
        <label
          htmlFor="categoria"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Categoría <span className="text-red-500">*</span>
        </label>
        <select
          id="categoria"
          name="categoria"
          required
          defaultValue={deuda?.categoria ?? ""}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="" disabled>
            Seleccionar categoría...
          </option>
          {CATEGORIAS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Monto inicial */}
      <div>
        <label
          htmlFor="montoInicial"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Monto inicial <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            $
          </span>
          <input
            id="montoInicial"
            name="montoInicial"
            type="number"
            required
            min="0.01"
            step="0.01"
            defaultValue={deuda?.montoInicial}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {deuda && (
          <p className="text-xs text-amber-600 mt-1">
            ⚠ Cambiar el monto inicial ajustará el saldo actual proporcionalmente.
          </p>
        )}
      </div>

      {/* Notas */}
      <div>
        <label
          htmlFor="notas"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notas <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          defaultValue={deuda?.notas ?? ""}
          placeholder="Información adicional..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors text-sm"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
