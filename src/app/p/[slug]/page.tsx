import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { BuyButton } from "@/components/product/BuyButton";
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { DEMO_FALLBACK_PRODUCTS } from "@/lib/data/demo-products";

interface ResolvedProductView {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  status: string;
  description: string | null;
  aiSummary: string | null;
  aiPros: string[];
  aiCons: string[];
  media: Array<{ url: string; type: string }>;
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let resolvedProduct: ResolvedProductView | null = null;

  // 1. Tenta buscar o produto no banco de forma segura
  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (dbProduct) {
      void prisma.product
        .update({
          where: { id: dbProduct.id },
          data: { views: { increment: 1 } },
        })
        .catch(() => null);

      const rawMedia = dbProduct.mediaUrls as unknown;
      const media: Array<{ url: string; type: string }> = Array.isArray(rawMedia)
        ? rawMedia
            .filter(
              (m): m is { url: string; type?: string } =>
                typeof m === "object" && m !== null && "url" in m
            )
            .map((m) => ({ url: String(m.url), type: m.type || "image" }))
        : [];

      resolvedProduct = {
        id: dbProduct.id,
        slug: dbProduct.slug,
        title: dbProduct.title,
        brand: dbProduct.brand,
        price: Number(dbProduct.price),
        originalPrice: dbProduct.originalPrice
          ? Number(dbProduct.originalPrice)
          : null,
        discountPercent: dbProduct.discountPercent,
        status: dbProduct.status,
        description: dbProduct.description,
        aiSummary: dbProduct.aiSummary,
        aiPros: Array.isArray(dbProduct.aiPros)
          ? (dbProduct.aiPros as string[])
          : [],
        aiCons: Array.isArray(dbProduct.aiCons)
          ? (dbProduct.aiCons as string[])
          : [],
        media,
      };
    }
  } catch (error) {
    console.warn("Aviso em /p/[slug]: usando fallback de demonstração:", error);
  }

  // 2. Fallback para DEMO_FALLBACK_PRODUCTS se o banco na nuvem estiver vazio/inacessível
  if (!resolvedProduct) {
    const demo = DEMO_FALLBACK_PRODUCTS.find((item) => item.slug === slug);
    if (demo) {
      resolvedProduct = {
        id: demo.id,
        slug: demo.slug,
        title: demo.title,
        brand: demo.brand ?? null,
        price: demo.price,
        originalPrice: demo.originalPrice ?? null,
        discountPercent: demo.discountPercent ?? null,
        status: demo.status,
        description: demo.description,
        aiSummary: demo.aiSummary,
        aiPros: demo.aiPros,
        aiCons: demo.aiCons,
        media: [{ url: demo.imageUrl, type: "image" }],
      };
    }
  }

  if (!resolvedProduct) {
    notFound();
  }

  const mainImage =
    resolvedProduct.media[0]?.url ||
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&auto=format";

  const discount = resolvedProduct.originalPrice
    ? Math.round(
        ((resolvedProduct.originalPrice - resolvedProduct.price) /
          resolvedProduct.originalPrice) *
          100
      )
    : resolvedProduct.discountPercent;

  const isAvailable = resolvedProduct.status === "AVAILABLE";

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Galeria de Imagens ── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass-card border border-white/10">
              <Image
                src={mainImage}
                alt={resolvedProduct.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-center">
                    <p className="font-serif text-3xl font-bold text-white mb-2">
                      OFERTA PAUSADA
                    </p>
                    <p className="text-sm text-white/60">
                      Este produto está temporariamente indisponível.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {resolvedProduct.media.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {resolvedProduct.media.slice(1, 5).map((m, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden glass-card opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Image
                      src={m.url}
                      alt="Galeria"
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Informações do Produto & CTA de Afiliado ── */}
          <div className="flex flex-col">
            <div className="mb-6">
              {resolvedProduct.brand && (
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gradient-gold mb-2">
                  {resolvedProduct.brand}
                </h2>
              )}
              <h1 className="heading-luxury text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
                {resolvedProduct.title}
              </h1>

              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(resolvedProduct.price)}
                  </p>
                  {resolvedProduct.originalPrice && (
                    <p className="text-sm text-white/40 line-through mt-1">
                      De:{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(resolvedProduct.originalPrice)}
                    </p>
                  )}
                </div>
                {discount && discount > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold mb-1">
                    Economize {discount}%
                  </span>
                )}
              </div>
            </div>

            <div className="divider-gradient mb-6" />

            {/* Ações de Afiliado */}
            <div className="mb-8">
              {isAvailable ? (
                <div className="flex flex-col gap-3">
                  <BuyButton
                    productId={resolvedProduct.id}
                    productSlug={resolvedProduct.slug}
                    className="w-full"
                  />
                  <p className="text-xs text-center text-white/50 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Compra 100% segura com garantia e entrega oficial do Mercado Livre
                  </p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-sm font-medium text-white/60 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Oferta indisponível no momento
                  </p>
                </div>
              )}
            </div>

            {/* Enriquecimento de IA (Google Gemini) */}
            {resolvedProduct.aiSummary && (
              <div className="glass-card p-6 border border-emerald-500/20 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                    Análise Curada por IA
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  {resolvedProduct.aiSummary}
                </p>

                {resolvedProduct.aiPros.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Pontos Fortes:
                    </p>
                    <ul className="space-y-1.5">
                      {resolvedProduct.aiPros.map((pro, i) => (
                        <li
                          key={i}
                          className="text-xs text-white/70 flex items-start gap-2"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {resolvedProduct.aiCons.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Pontos de Atenção:
                    </p>
                    <ul className="space-y-1">
                      {resolvedProduct.aiCons.map((con, i) => (
                        <li
                          key={i}
                          className="text-xs text-white/70 flex items-start gap-2"
                        >
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Descrição Original do Produto */}
            {resolvedProduct.description && (
              <div className="glass-card p-6 border border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                  Detalhes Técnicos do Produto
                </h3>
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
                  {resolvedProduct.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
