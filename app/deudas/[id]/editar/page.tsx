import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import DeudaForm from "@/app/components/DeudaForm";
import { editarDeuda } from "@/app/lib/actions";

export default async function EditarDeudaPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const deudaId = parseInt(id);

  if (isNaN(deudaId)) notFound();

  const deuda = await prisma.deuda.findUnique({ where: { id: deudaId } });

  if (!deuda) notFound();

  const action = editarDeuda.bind(null, deudaId);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href={`/deudas/${deudaId}`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Editar deuda</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <DeudaForm
            action={action}
            deuda={deuda}
            submitLabel="Guardar cambios"
          />
        </div>
      </div>
    </main>
  );
}
