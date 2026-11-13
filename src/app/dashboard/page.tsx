import { prisma } from "@/lib/prisma";
import {
  Package,
  MousePointerClick,
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Store,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { calculateMlPricing, type MlListingType } from "@/lib/services/pricing";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

interface DashboardPageProps {
  searchParams?: Promise<{
    ml?: string;
    ml_error?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};

  const [
    mlAccount,
    allProducts,
    totalClicks,
    topProducts,
    recentClicks,
  ] = await Promise.all([
    prisma.mercadoLivreAccount.findFirst({
      orderBy: { updatedAt: "desc" },
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.clickAnalytics.count(),
    prisma.product.findMany({
      take: 5,
      orderBy: { clicksCount: "desc" },
      where: { clicksCount: { gt: 0 } },
    }),
    prisma.clickAnalytics.findMany({
      take: 5,
      orderBy: { clickedAt: "desc" },
      include: {
        product: { select: { title: true, slug: true, mediaUrls: true } },
      },
    }),
  ]);

  const totalProducts = allProducts.length;
  const publishedInMlCount = allProducts.filter(
    (p) => p.syncStatus === "PUBLISHED"
  ).length;

  // Cálculo do Lucro Líquido Médio por Venda
  const profitsList: number[] = allProducts.map((p) => {
    const salePrice = Number(p.price);
    const listingType: MlListingType =
      p.listingType === "gold_pro" ? "gold_pro" : "gold_special";
    const feeRate = (p.mlFeePercent ?? (listingType === "gold_pro" ? 19 : 14)) / 100;
    const fixedFee = salePrice > 0 && salePrice < 79 ? 6 : 0;

    if (p.costPrice !== null && p.costPrice > 0) {
      return salePrice - salePrice * feeRate - fixedFee - p.costPrice;
    }

    // Caso o produto antigo não tenha costPrice preenchido, estima 25% de margem líquida
    const calc = calculateMlPricing({
      costPrice: salePrice * 0.65,
      profitMarginPercent: 25,
      listingType,
    });
    return calc.netProfit;
  });

  const averageNetProfit =
    profitsList.length > 0
      ? profitsList.reduce((acc, v) => acc + v, 0) / profitsList.length
      : 0;

  const isTokenValid =
    mlAccount !== null && mlAccount.expiresAt.getTime() > Date.now();

  const stats = [
    {
      label: "Total de Produtos no Catálogo",
      value: String(totalProducts),
      icon: Package,
      trend: "Cadastrados",
    },
    {
      label: "Anúncios Publicados no ML",
      value: String(publishedInMlCount),
      icon: Store,
      trend: `${totalProducts - publishedInMlCount} em rascunho`,
    },
    {
      label: "Lucro Líquido Médio por Venda",
      value: formatBRL(Math.max(0, averageNetProfit)),
      icon: DollarSign,
      trend: "Livre de taxas ML",
    },
    {
      label: "Total de Cliques",
      value: String(totalClicks),
      icon: MousePointerClick,
      trend: "Tráfego acumulado",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-white">
            Hub de Automação Prime Vitrine (Mercado Livre)
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Publique anúncios na sua conta oficial, calcule margens líquidas e acompanhe conversões.
          </p>
        </div>
        <Link
          href="/dashboard/inventory/new"
          className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Importar e Publicar no ML
        </Link>
      </div>

      {/* ── Feedback de Callback OAuth ── */}
      {resolvedParams.ml === "connected" && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          Sua conta do Mercado Livre foi conectada e autenticada com sucesso!
        </div>
      )}

      {resolvedParams.ml_error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          Falha na conexão com o Mercado Livre: {resolvedParams.ml_error}
        </div>
      )}

      {/* ── Banner de Status da Conta Mercado Livre ── */}
      {!mlAccount ? (
        <div className="glass-card p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.07] via-transparent to-emerald-500/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <AlertCircle className="w-3.5 h-3.5" />
              Integração Oficial Pendente
            </div>
            <h2 className="text-base font-semibold text-white">
              Conecte sua conta do Mercado Livre para publicar com 1 clique
            </h2>
            <p className="text-xs text-white/50 max-w-xl">
              Autentique via OAuth 2.0 oficial para que a plataforma crie anúncios, envie fotos e descrições otimizadas diretamente na sua loja do Mercado Livre.
            </p>
          </div>
          <a
            href="/api/ml/auth"
            className="btn-primary !py-3 !px-5 !text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <Link2 className="w-4 h-4" />
            🔗 Conectar Minha Loja do Mercado Livre
          </a>
        </div>
      ) : (
        <div className="glass-card p-6 border border-emerald-500/30 bg-gradient-to-r from-emerald-500/[0.08] via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Loja Oficial Conectada
              </span>
              <span className="text-xs text-white/70 font-medium">
                Vendedor:{" "}
                <strong className="text-white">
                  {mlAccount.nickname || `ID #${mlAccount.mlUserId}`}
                </strong>
              </span>
            </div>
            <p className="text-xs text-white/50">
              Status do Token OAuth:{" "}
              <span
                className={
                  isTokenValid
                    ? "text-emerald-400 font-medium"
                    : "text-amber-400 font-medium"
                }
              >
                {isTokenValid
                  ? "Ativo (renovação automática habilitada)"
                  : "Expirado (será renovado automaticamente no próximo envio)"}
              </span>{" "}
              · Expira em: {new Date(mlAccount.expiresAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <a
            href="/api/ml/auth"
            className="btn-ghost !py-2.5 !px-4 !text-xs border border-white/10 hover:border-emerald-500/30 flex items-center justify-center gap-2 whitespace-nowrap flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            Reconectar Loja
          </a>
        </div>
      )}

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
            <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Top Produtos Mais Clicados ── */}
        <div className="glass-card p-6 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">
              Produtos Mais Clicados
            </h2>
            <Link
              href="/dashboard/inventory"
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              Ver inventário
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {topProducts.length === 0 ? (
              <p className="text-xs text-white/40 py-6 text-center">
                Ainda não há registros de cliques.
              </p>
            ) : (
              topProducts.map((p, idx) => (
                <div
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-emerald-400 w-4">
                      #{idx + 1}
                    </span>
                    <p className="text-xs text-white font-medium truncate max-w-xs">
                      {p.title}
                    </p>
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
                <div
                  key={c.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate max-w-xs">
                      {c.product.title}
                    </p>
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
