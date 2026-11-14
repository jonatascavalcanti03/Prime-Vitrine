import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product/ProductCard";
import { SlidersHorizontal, Search } from "lucide-react";
import { DEMO_FALLBACK_PRODUCTS } from "@/lib/data/demo-products";

export const revalidate = 60; // Revalida a página a cada 60s (ISR)

export default async function VitrinePage() {
  // Busca produtos no banco de dados de forma segura para o build
  let productsRaw: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    productsRaw = await prisma.product.findMany({
      where: {
        status: "AVAILABLE",
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.warn(
      "Aviso no build/SSR (Vitrine): Banco ainda não inicializado ou inacessível:",
      error
    );
  }

  const displayProducts =
    productsRaw.length > 0
      ? productsRaw.map((product) => {
          let imageUrl = "";
          const media = product.mediaUrls as unknown;
          if (
            Array.isArray(media) &&
            media.length > 0 &&
            typeof media[0] === "object" &&
            media[0] !== null &&
            "url" in media[0]
          ) {
            imageUrl = String((media[0] as { url: unknown }).url);
          }

          return {
            id: product.id,
            slug: product.slug,
            title: product.title,
            brand: product.brand || undefined,
            categoryName: product.categoryName,
            price: Number(product.price),
            originalPrice: product.originalPrice
              ? Number(product.originalPrice)
              : undefined,
            discountPercent: product.discountPercent || undefined,
            imageUrl:
              imageUrl ||
              "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format",
            status: product.status,
            views: product.views,
            clicksCount: product.clicksCount,
            featured: product.featured,
          };
        })
      : DEMO_FALLBACK_PRODUCTS;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="section-container">
        {/* ── Header da Vitrine ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="heading-luxury text-4xl sm:text-5xl mb-4">
              Prime Vitrine
            </h1>
            <p className="text-white/50 text-sm max-w-lg leading-relaxed">
              Explore nossa seleção com as melhores ofertas e produtos em alta do Mercado Livre,
              com descontos reais, análise por IA e garantia de entrega oficial.
            </p>
          </div>

          {/* Controles de Filtro e Busca */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Buscar ofertas..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald/50 focus:ring-1 focus:ring-emerald/50 transition-all"
              />
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>

        <div className="divider-gradient mb-12" />

        {/* ── Grid de Produtos ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
