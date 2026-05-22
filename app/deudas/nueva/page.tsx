import Link from "next/link";
import DeudaForm from "@/app/components/DeudaForm";
import { crearDeuda } from "@/app/lib/actions";

export default function NuevaDeudaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Volver
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Nueva deuda</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <DeudaForm action={crearDeuda} submitLabel="Crear deuda" />
        </div>
      </div>
    </main>
  );
}
