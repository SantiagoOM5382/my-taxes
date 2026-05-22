import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import PagoForm from "@/app/components/PagoForm";
import EliminarDeudaBtn from "@/app/components/EliminarDeudaBtn";
import EliminarPagoBtn from "@/app/components/EliminarPagoBtn";

export default async function DeudaDetallePage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const deudaId = parseInt(id);

  if (isNaN(deudaId)) notFound();

  const deuda = await prisma.deuda.findUnique({
    where: { id: deudaId },
    include: {
      pagos: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!deuda) notFound();

  const porcentajePagado =
    deuda.montoInicial > 0
      ? ((deuda.montoInicial - deuda.montoActual) / deuda.montoInicial) * 100
      : 0;
  const pagada = deuda.montoActual <= 0;
  const totalPagado = deuda.montoInicial - deuda.montoActual;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ←
          </Link>
          <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">
            {deuda.nombre}
          </h1>
          <Link
            href={`/deudas/${deudaId}/editar`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Editar
          </Link>
        </div>

        {/* Tarjeta principal */}
        <div
          className={`bg-white rounded-2xl border shadow-sm p-5 mb-4 ${
            pagada ? "border-green-200" : "border-gray-100"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">A: {deuda.acreedor}</p>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                {deuda.categoria}
              </span>
            </div>
            {pagada && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                ✓ Pagada
              </span>
            )}
          </div>

          {/* Montos */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-400">Saldo actual</p>
              <p
                className={`text-2xl font-bold ${pagada ? "text-green-600" : "text-gray-900"}`}
              >
                ${deuda.montoActual.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Monto inicial</p>
              <p className="text-base font-semibold text-gray-600">
                ${deuda.montoInicial.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total pagado</p>
              <p className="text-base font-semibold text-green-600">
                ${totalPagado.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
            <div
              className={`h-2.5 rounded-full transition-all ${pagada ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${Math.min(100, porcentajePagado)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {porcentajePagado.toFixed(1)}% pagado · {deuda.pagos.length} pago
            {deuda.pagos.length !== 1 ? "s" : ""}
          </p>

          {/* Notas */}
          {deuda.notas && (
            <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Notas</p>
              <p className="text-sm text-gray-600">{deuda.notas}</p>
            </div>
          )}

          {/* Fecha */}
          <p className="text-xs text-gray-400 mt-3">
            Registrada el{" "}
            {new Date(deuda.createdAt).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Formulario de pago */}
        <div className="mb-4">
          <PagoForm deudaId={deudaId} montoActual={deuda.montoActual} />
        </div>

        {/* Historial de pagos */}
        {deuda.pagos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Historial de pagos
            </h3>
            <div className="space-y-3">
              {deuda.pagos.map((pago) => (
                <div
                  key={pago.id}
                  className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      -${pago.monto.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </p>
                    {pago.nota && (
                      <p className="text-xs text-gray-500 mt-0.5">{pago.nota}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(pago.createdAt).toLocaleDateString("es-CO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <EliminarPagoBtn pagoId={pago.id} deudaId={deudaId} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Zona peligrosa */}
        <div className="bg-white rounded-2xl border border-red-100 p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Zona peligrosa
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Eliminar la deuda borrará también todos sus pagos. Esta acción no se puede deshacer.
          </p>
          <EliminarDeudaBtn deudaId={deudaId} />
        </div>
      </div>
    </main>
  );
}
