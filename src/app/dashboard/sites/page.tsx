import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Globe,
  MapPin,
  Eye,
  Plus,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Palette,
} from "lucide-react";
import { DeleteSiteButton } from "./DeleteSiteButton";

const PALETTE_BADGES: Record<string, { label: string; className: string }> = {
  amber: {
    label: "Amber Gold",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  blue: {
    label: "Royal Blue",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  rose: {
    label: "Rose Luxe",
    className: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  emerald: {
    label: "Emerald Prime",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  violet: {
    label: "Violet Neon",
    className: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
  slate: {
    label: "Executive Slate",
    className: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  },
};

function buildProposalWhatsAppUrl(
  whatsapp: string | null,
  businessName: string,
  slug: string
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const siteLink = `${baseUrl}/s/${slug}`;
  const message = encodeURIComponent(
    `Olá! Vi o perfil da ${businessName} no Google Maps e criei uma demonstração exclusiva de site profissional para vocês: ${siteLink}`
  );
  const digits = (whatsapp || "").replace(/\D/g, "");
  return digits
    ? `https://wa.me/${digits}?text=${message}`
    : `https://wa.me/?text=${message}`;
}

export default async function GeneratedSitesPage() {
  const sites = await prisma.generatedSite.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalViews = sites.reduce((acc, s) => acc + (s.viewsCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Módulo 2 · Fábrica de Sites Express
          </div>
          <h1 className="text-2xl font-serif text-white">
            Sites Gerados por IA (Google Maps → Landing Page)
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Gerencie as Landing Pages criadas para negócios locais e envie propostas comerciais com 1 clique pelo WhatsApp.
          </p>
        </div>
        <Link
          href="/dashboard/sites/new"
          className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Criar Site pelo Maps
        </Link>
      </div>

      {/* ── Métricas Rápidas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total de Sites Gerados</p>
          <p className="text-2xl font-bold text-white">{sites.length}</p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Sites Publicados Ativos</p>
          <p className="text-2xl font-bold text-emerald-400">
            {sites.filter((s) => s.status === "PUBLISHED").length}
          </p>
        </div>
        <div className="glass-card p-5 border border-white/5">
          <p className="text-xs text-white/40 mb-1">
            Visualizações Totais nas Demos
          </p>
          <p className="text-2xl font-bold text-amber-400">{totalViews}</p>
        </div>
      </div>

      {/* ── Grid de Cards de Sites ── */}
      {sites.length === 0 ? (
        <div className="glass-card p-12 border border-white/5 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Globe className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-base font-semibold text-white">
              Nenhum site gerado ainda
            </h2>
            <p className="text-xs text-white/40">
              Cole o link do Google Maps de qualquer empresa local (barbearia, clínica, oficina, restaurante) e gere uma Landing Page pronta em segundos.
            </p>
          </div>
          <div>
            <Link
              href="/dashboard/sites/new"
              className="btn-primary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Primeiro Site com IA
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sites.map((site) => {
            const paletteInfo =
              PALETTE_BADGES[site.themePalette] || PALETTE_BADGES.emerald;
            const proposalUrl = buildProposalWhatsAppUrl(
              site.whatsapp,
              site.businessName,
              site.slug
            );

            return (
              <div
                key={site.id}
                className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {site.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${paletteInfo.className}`}
                      >
                        <Palette className="w-3 h-3" />
                        {paletteInfo.label}
                      </span>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-white/60 border border-white/10">
                        <Eye className="w-3 h-3 text-amber-400" />
                        {site.viewsCount} views
                      </span>
                    </div>
                  </div>

                  {/* Business Info */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90">
                      {site.category}
                    </p>
                    <h3 className="text-lg font-serif font-bold text-white mt-0.5 line-clamp-1">
                      {site.businessName}
                    </h3>
                    <p className="text-xs text-white/50 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span className="truncate">
                        {site.city || "Brasil"} · {site.address || "Endereço local"}
                      </span>
                    </p>
                  </div>

                  {/* Headline Preview */}
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <p className="text-xs font-medium text-white/90 line-clamp-2">
                      &ldquo;{site.heroTitle}&rdquo;
                    </p>
                    <p className="text-[11px] text-white/40 font-mono truncate">
                      /s/{site.slug}
                    </p>
                  </div>
                </div>

                {/* 3 Ações Rápidas */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`/s/${site.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary !py-2.5 !px-3 !text-xs flex items-center justify-center gap-1.5 text-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      🌐 Abrir Site Público
                    </a>

                    <a
                      href={proposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-300 text-xs font-semibold transition-all text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      📲 Enviar Proposta no WhatsApp
                    </a>
                  </div>

                  <div className="flex justify-end">
                    <DeleteSiteButton siteId={site.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
