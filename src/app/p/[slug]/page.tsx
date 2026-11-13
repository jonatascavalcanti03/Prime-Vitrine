import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { BuyButton } from "@/components/product/BuyButton";
import { CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ExternalLink, ThumbsUp, AlertTriangle } from "lucide-react";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Busca o produto no banco
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  // 2. Incrementar visualizações em background
  prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  // 3. Parse das mídias
  let media: { url: string; type: string }[] = [];
  try {
    const parsed = product.mediaUrls as any;
    if (Array.isArray(parsed)) media = parsed;
  } catch {}

  const mainImage = media[0]?.url || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&auto=format";

  // Desconto calculado
  const discount = product.originalPrice
    ? Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100)
    : product.discountPercent || null;

  const isAvailable = product.status === "AVAILABLE";

  // Parse dos prós e contras da IA
  const aiPros = Array.isArray(product.aiPros) ? (product.aiPros as string[]) : [];
  const aiCons = Array.isArray(product.aiCons) ? (product.aiCons as string[]) : [];

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ── Galeria de Imagens ── */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass-card border border-white/10">
              <Image
                src={mainImage}
                alt={product.title}
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
            
            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {media.slice(1, 5).map((m, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden glass-card opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                    <Image src={m.url} alt="Galeria" fill className="object-cover" sizes="25vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Informações do Produto & CTA de Afiliado ── */}
          <div className="flex flex-col">
            <div className="mb-6">
              {product.brand && (
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-gradient-gold mb-2">
                  {product.brand}
                </h2>
              )}
              <h1 className="heading-luxury text-2xl sm:text-3xl lg:text-4xl leading-tight mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-white">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.price))}
                  </p>
                  {product.originalPrice && (
                    <p className="text-sm text-white/40 line-through mt-1">
                      De: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.originalPrice))}
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
                  <BuyButton productId={product.id} productSlug={product.slug} className="w-full" />
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
            {product.aiSummary && (
              <div className="glass-card p-6 border border-emerald-500/20 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                    Análise Curada por IA
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mb-4">
                  {product.aiSummary}
                </p>

                {aiPros.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Pontos Fortes:
                    </p>
                    <ul className="space-y-1.5">
                      {aiPros.map((pro, i) => (
                        <li key={i} className="text-xs text-white/70 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiCons.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <p className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Pontos de Atenção:
                    </p>
                    <ul className="space-y-1">
                      {aiCons.map((con, i) => (
                        <li key={i} className="text-xs text-white/70 flex items-start gap-2">
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
            {product.description && (
              <div className="glass-card p-6 border border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">
                  Detalhes Técnicos do Produto
                </h3>
                <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
