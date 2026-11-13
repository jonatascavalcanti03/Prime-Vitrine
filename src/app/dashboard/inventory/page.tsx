import { prisma } from "@/lib/prisma";
import {
  Plus,
  ExternalLink,
  Eye,
  MousePointerClick,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PublishMlButton } from "./PublishMlButton";
import { type MlListingType } from "@/lib/services/pricing";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function extractFirstImageUrl(mediaUrls: unknown): string {
  if (!Array.isArray(mediaUrls) || mediaUrls.length === 0) return "";
  const first: unknown = mediaUrls[0];
  if (typeof first === "string") return first;
  if (
    typeof first === "object" &&
    first !== null &&
    "url" in first &&
    typeof (first as { url: unknown }).url === "string"
  ) {
    return (first as { url: string }).url;
  }
  return "";
}

function estimateNetProfit(product: {
  price: unknown;
  costPrice: number | null;
  mlFeePercent: number | null;
  listingType: string;
}): number {
  const salePrice = Number(product.price);
  const listingType: MlListingType =
    product.listingType === "gold_pro" ? "gold_pro" : "gold_special";
  const feePercent =
    product.mlFeePercent ?? (listingType === "gold_pro" ? 19 : 14);
  const feeAmount = salePrice * (feePercent / 100);
  const fixedFee = salePrice > 0 && salePrice < 79 ? 6 : 0;

  if (product.costPrice !== null && product.costPrice > 0) {
    return salePrice - feeAmount - fixedFee - product.costPrice;
  }

  return salePrice - feeAmount - fixedFee - salePrice * 0.65;
}

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const publishedCount = products.filter(
    (p) => p.syncStatus === "PUBLISHED"
  ).length;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white">
            Inventário & Publicação Mercado Livre
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Gerencie seus produtos, acompanhe margens de lucro líquidas e publique na sua loja oficial com 1 clique.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/inventory/new"
            className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Importar / Novo Produto
          </Link>
        </div>
      </div>

      {/* ── Métricas Rápidas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total no Inventário</p>
          <p className="text-2xl font-bold text-white">{products.length}</p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">
            Publicados na Loja ML (PUBLISHED)
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {publishedCount}
          </p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total de Cliques</p>
          <p className="text-2xl font-bold text-white">
            {products.reduce((acc, p) => acc + (p.clicksCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* ── Tabela de Produtos ── */}
      <div className="glass-card border border-white/5 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Produto
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Status ML
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Finanças (Custo / Venda / Lucro)
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Cliques
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-white/40 text-sm"
                  >
                    Nenhum produto cadastrado ainda. Clique em &ldquo;Importar / Novo Produto&rdquo; para começar.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const imageUrl = extractFirstImageUrl(product.mediaUrls);
                  const salePrice = Number(product.price);
                  const netProfit = estimateNetProfit(product);

                  return (
                    <tr
                      key={product.id}
                      className="group hover:bg-white/[0.01] transition-all"
                    >
                      {/* Coluna 1: Produto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden relative border border-white/5 flex-shrink-0">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.title}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized
                              />
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
                            <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                              {product.brand || "Mercado Livre"} ·{" "}
                              {product.categoryName}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Coluna 2: Badge de Status ML */}
                      <td className="px-6 py-4">
                        {product.syncStatus === "PUBLISHED" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              PUBLISHED
                            </span>
                            {product.mlItemId && (
                              <p className="text-[10px] font-mono text-emerald-300/80 pl-1">
                                {product.mlItemId}
                              </p>
                            )}
                          </div>
                        ) : product.syncStatus === "ERROR" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            ERROR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            DRAFT (Rascunho)
                          </span>
                        )}
                      </td>

                      {/* Coluna 3: Finanças */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs">
                          <p className="text-white/50">
                            Custo:{" "}
                            <span className="text-white/80 font-medium">
                              {product.costPrice !== null
                                ? formatBRL(product.costPrice)
                                : "—"}
                            </span>
                          </p>
                          <p className="text-white/50">
                            Venda:{" "}
                            <span className="text-white font-bold">
                              {formatBRL(salePrice)}
                            </span>
                          </p>
                          <p className="text-emerald-400 font-semibold">
                            Lucro Líq.: {formatBRL(netProfit)}
                          </p>
                        </div>
                      </td>

                      {/* Coluna 4: Cliques */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/70 border border-white/10">
                          <MousePointerClick className="w-3 h-3 text-emerald-400" />
                          {product.clicksCount || 0}
                        </span>
                      </td>

                      {/* Coluna 5: Ações */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <PublishMlButton
                            productId={product.id}
                            syncStatus={product.syncStatus}
                            mlPermalink={product.mlPermalink}
                          />

                          <Link
                            href={`/p/${product.slug}`}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                            title="Ver página na vitrine"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <a
                            href={`/r/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-all"
                            title="Abrir link de origem/afiliado"
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
