import { prisma } from "@/lib/prisma";
import { 
  Plus, 
  ExternalLink, 
  Eye, 
  Filter,
  MousePointerClick,
  Sparkles,
  Package
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white">Curadoria de Ofertas (Mercado Livre)</h1>
          <p className="text-sm text-white/40 mt-1">
            Gerencie suas ofertas cadastradas e acompanhe os cliques gerados pelos links de afiliados.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/inventory/new" className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Nova Oferta
          </Link>
        </div>
      </div>

      {/* ── Métricas Rápidas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total de Ofertas Listadas</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total de Cliques de Afiliados</p>
          <p className="text-2xl font-bold text-emerald-400">
            {products.reduce((acc, p) => acc + (p.clicksCount || 0), 0)}
          </p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Ofertas em Destaque</p>
          <p className="text-2xl font-bold text-white">
            {products.filter((p) => p.featured).length}
          </p>
        </div>
      </div>

      {/* ── Tabela de Produtos ── */}
      <div className="glass-card border border-white/5 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Produto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Preço</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Cliques Afiliado</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 text-sm">
                    Nenhuma oferta cadastrada ainda. Clique em "Adicionar Nova Oferta" para começar.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const media = product.mediaUrls as any;
                  const imageUrl = Array.isArray(media) && media.length > 0 ? media[0].url : "";

                  return (
                    <tr key={product.id} className="group hover:bg-white/[0.01] transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden relative border border-white/5 flex-shrink-0">
                            {imageUrl ? (
                              <Image src={imageUrl} alt={product.title} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-white/20">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors line-clamp-1 max-w-xs">
                              {product.title}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                              {product.brand || "Mercado Livre"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-white/60">{product.categoryName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.price))}
                          </p>
                          {product.originalPrice && (
                            <p className="text-[10px] text-white/30 line-through">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.originalPrice))}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <MousePointerClick className="w-3 h-3" />
                          {product.clicksCount || 0} cliques
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          product.status === "AVAILABLE" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        }`}>
                          {product.status === "AVAILABLE" ? "Ativa" : "Pausada"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/p/${product.slug}`}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                            title="Ver página pública"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <a
                            href={`/r/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all"
                            title="Testar link de afiliado no Mercado Livre"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
