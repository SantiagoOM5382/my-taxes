import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import DeudaCard from "@/app/components/DeudaCard";

export default async function Home() {
  const deudas = await prisma.deuda.findMany({
    include: {
      _count: { select: { pagos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalDeuda = deudas.reduce((acc, d) => acc + d.montoActual, 0);
  const totalInicial = deudas.reduce((acc, d) => acc + d.montoInicial, 0);
  const totalPagado = totalInicial - totalDeuda;
  const porcentajeTotal =
    totalInicial > 0 ? (totalPagado / totalInicial) * 100 : 0;

  const deudasActivas = deudas.filter((d) => d.montoActual > 0);
  const deudasPagadas = deudas.filter((d) => d.montoActual <= 0);

  const categorias = Array.from(new Set(deudas.map((d) => d.categoria)));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Deudas</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Control de deudas y pagos
            </p>
          </div>
          <Link
            href="/deudas/nueva"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            + Nueva deuda
          </Link>
        </div>

        {deudas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">💳</p>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No tienes deudas registradas
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Empieza agregando tu primera deuda para llevar el control de tus pagos.
            </p>
            <Link
              href="/deudas/nueva"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors inline-block"
            >
              Agregar primera deuda
            </Link>
          </div>
        ) : (
          <>
            {/* Resumen global */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-4">
                Resumen general
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Total pendiente</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${totalDeuda.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total pagado</p>
                  <p className="text-xl font-bold text-green-600">
                    ${totalPagado.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Deudas activas</p>
                  <p className="text-xl font-bold text-gray-900">
                    {deudasActivas.length}
                    <span className="text-sm font-normal text-gray-400">
                      /{deudas.length}
                    </span>
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, porcentajeTotal)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                {porcentajeTotal.toFixed(1)}% del total pagado
              </p>
            </div>

            {/* Categorías */}
            {categorias.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {categorias.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full whitespace-nowrap"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {/* Deudas activas */}
            {deudasActivas.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-medium text-gray-500 mb-3">
                  Deudas activas ({deudasActivas.length})
                </h2>
                <div className="space-y-3">
                  {deudasActivas.map((deuda) => (
                    <DeudaCard key={deuda.id} deuda={deuda} />
                  ))}
                </div>
              </section>
            )}

            {/* Deudas pagadas */}
            {deudasPagadas.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 mb-3">
                  Deudas pagadas ({deudasPagadas.length})
                </h2>
                <div className="space-y-3">
                  {deudasPagadas.map((deuda) => (
                    <DeudaCard key={deuda.id} deuda={deuda} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
