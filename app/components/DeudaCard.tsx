import Link from "next/link";
import type { Deuda } from "@/app/generated/prisma/client";

interface DeudaCardProps {
  deuda: Deuda & { _count: { pagos: number } };
}

const CATEGORIA_COLORES: Record<string, string> = {
  "Tarjeta de crédito": "bg-red-100 text-red-700",
  "Préstamo personal": "bg-orange-100 text-orange-700",
  Servicios: "bg-blue-100 text-blue-700",
  Hipoteca: "bg-purple-100 text-purple-700",
  Otro: "bg-gray-100 text-gray-700",
};

export default function DeudaCard({ deuda }: DeudaCardProps) {
  const porcentajePagado =
    deuda.montoInicial > 0
      ? ((deuda.montoInicial - deuda.montoActual) / deuda.montoInicial) * 100
      : 0;

  const colorCategoria =
    CATEGORIA_COLORES[deuda.categoria] ?? "bg-gray-100 text-gray-700";

  const pagada = deuda.montoActual <= 0;

  return (
    <Link href={`/deudas/${deuda.id}`}>
      <div
        className={`bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition-shadow cursor-pointer ${
          pagada ? "border-green-200" : "border-gray-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
              {deuda.nombre}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">A: {deuda.acreedor}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorCategoria}`}
            >
              {deuda.categoria}
            </span>
            {pagada && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                ✓ Pagada
              </span>
            )}
          </div>
        </div>

        {/* Montos */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">Saldo actual</p>
            <p
              className={`text-2xl font-bold ${pagada ? "text-green-600" : "text-gray-900"}`}
            >
              ${deuda.montoActual.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Monto inicial</p>
            <p className="text-sm text-gray-500">
              ${deuda.montoInicial.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${pagada ? "bg-green-500" : "bg-blue-500"}`}
            style={{ width: `${Math.min(100, porcentajePagado)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{porcentajePagado.toFixed(1)}% pagado</span>
          <span>{deuda._count.pagos} pago{deuda._count.pagos !== 1 ? "s" : ""}</span>
        </div>
      </div>
    </Link>
  );
}
