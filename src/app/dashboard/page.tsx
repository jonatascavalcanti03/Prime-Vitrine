import { prisma } from "@/lib/prisma";
import { 
  TrendingUp, 
  Package, 
  MousePointerClick, 
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Eye
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function DashboardPage() {
  // 1. Buscar métricas de afiliados
  const [totalProducts, totalClicks, topProducts, recentClicks] = await Promise.all([
    prisma.product.count(),
    prisma.clickAnalytics.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { clicksCount: "desc" },
      where: { clicksCount: { gt: 0 } },
    }),
    prisma.clickAnalytics.findMany({
      take: 5,
      orderBy: { clickedAt: "desc" },
      include: { product: { select: { title: true, slug: true, mediaUrls: true } } },
    }),
  ]);

  const stats = [
    { 
      label: "Cliques de Afiliados", 
      value: totalClicks, 
      icon: MousePointerClick, 
      trend: "Total acumulado", 
      isPositive: true 
    },
    { 
      label: "Ofertas Cadastradas", 
      value: totalProducts, 
      icon: Package, 
      trend: "No catálogo", 
      isPositive: true 
    },
    { 
      label: "Top 1 Produto Mais Clicado", 
      value: topProducts[0]?.clicksCount || 0, 
      icon: TrendingUp, 
      trend: topProducts[0]?.title ? topProducts[0].title.substring(0, 16) + "..." : "Sem cliques", 
      isPositive: true 
    },
    { 
      label: "Taxa de Engajamento", 
      value: totalProducts > 0 ? (totalClicks / totalProducts).toFixed(1) + " cl/prod" : "0", 
      icon: Sparkles, 
      trend: "Média por oferta", 
      isPositive: true 
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white">Painel Prime Vitrine (Mercado Livre)</h1>
          <p className="text-sm text-white/40 mt-1">
            Acompanhe o desempenho das suas ofertas curadas e conversões de cliques.
          </p>
        </div>
        <Link href="/dashboard/inventory/new" className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Importar Oferta com IA
        </Link>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                <stat.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Top Produtos Mais Clicados ── */}
        <div className="glass-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
              Ofertas Mais Clicadas
            </h2>
            <Link href="/dashboard/inventory" className="text-xs text-white/40 hover:text-white transition-colors">
              Ver todas
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-white/40 py-6 text-center">
                Ainda não há registros de cliques. Divulgue seus links para começar a rastrear!
              </p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-emerald-400 w-4">#{idx + 1}</span>
                    <p className="text-xs text-white font-medium truncate max-w-xs">{p.title}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    {p.clicksCount} cliques
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Cliques Recentes ── */}
        <div className="glass-card p-6 border border-white/5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
            Últimos Cliques Registrados
          </h2>

          <div className="divide-y divide-white/5">
            {recentClicks.length === 0 ? (
              <p className="text-xs text-white/40 py-6 text-center">
                Nenhum clique registrado recentemente.
              </p>
            ) : (
              recentClicks.map((c) => (
                <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate max-w-xs">{c.product.title}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {new Date(c.clickedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <a
                    href={`/r/${c.product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all flex-shrink-0"
                    title="Testar redirecionador"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
