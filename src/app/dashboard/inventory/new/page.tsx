import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductFormClient } from "./ProductFormClient";

export default async function NewProductPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/inventory"
          className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif text-white">Cadastrar Oferta de Afiliado</h1>
          <p className="text-sm text-white/40 mt-1">
            Importe produtos do Mercado Livre com 1 clique ou cadastre manualmente.
          </p>
        </div>
      </div>

      <ProductFormClient />
    </div>
  );
}
