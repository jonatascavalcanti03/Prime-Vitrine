import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import Image from "next/image";
import {
  Star,
  MapPin,
  Phone,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
  Scissors,
  Sparkles,
  Wrench,
  Utensils,
  Stethoscope,
  Heart,
  Clock,
  Crown,
  HelpCircle,
  ExternalLink,
  Navigation,
} from "lucide-react";
import {
  type SiteServiceItem,
  type SiteBenefitItem,
  type SiteTestimonialItem,
  type SiteFaqItem,
  type SiteThemePalette,
} from "@/lib/services/site-generator-ai";

interface SitePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface PaletteStyles {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  accentText: string;
  buttonBg: string;
  buttonHover: string;
  cardBorderHover: string;
  iconBg: string;
  glowGradient: string;
}

const PALETTE_THEME_MAP: Record<SiteThemePalette, PaletteStyles> = {
  amber: {
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-500/30",
    accentText: "text-amber-400",
    buttonBg: "bg-amber-500 text-black",
    buttonHover: "hover:bg-amber-400",
    cardBorderHover: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    glowGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
  },
  blue: {
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-300",
    badgeBorder: "border-blue-500/30",
    accentText: "text-blue-400",
    buttonBg: "bg-blue-500 text-white",
    buttonHover: "hover:bg-blue-400",
    cardBorderHover: "hover:border-blue-500/40",
    iconBg: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    glowGradient: "from-blue-500/20 via-blue-500/5 to-transparent",
  },
  rose: {
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
    badgeBorder: "border-rose-500/30",
    accentText: "text-rose-400",
    buttonBg: "bg-rose-500 text-white",
    buttonHover: "hover:bg-rose-400",
    cardBorderHover: "hover:border-rose-500/40",
    iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    glowGradient: "from-rose-500/20 via-rose-500/5 to-transparent",
  },
  emerald: {
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    badgeBorder: "border-emerald-500/30",
    accentText: "text-emerald-400",
    buttonBg: "bg-emerald-500 text-black",
    buttonHover: "hover:bg-emerald-400",
    cardBorderHover: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    glowGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
  violet: {
    badgeBg: "bg-violet-500/15",
    badgeText: "text-violet-300",
    badgeBorder: "border-violet-500/30",
    accentText: "text-violet-400",
    buttonBg: "bg-violet-500 text-white",
    buttonHover: "hover:bg-violet-400",
    cardBorderHover: "hover:border-violet-500/40",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    glowGradient: "from-violet-500/20 via-violet-500/5 to-transparent",
  },
  slate: {
    badgeBg: "bg-slate-500/20",
    badgeText: "text-slate-200",
    badgeBorder: "border-slate-400/30",
    accentText: "text-slate-300",
    buttonBg: "bg-white text-black",
    buttonHover: "hover:bg-slate-200",
    cardBorderHover: "hover:border-slate-400/40",
    iconBg: "bg-slate-500/20 text-slate-200 border-slate-400/25",
    glowGradient: "from-slate-500/20 via-slate-500/5 to-transparent",
  },
};

function safeParseJsonArray<T>(rawJson: string | null | undefined): T[] {
  if (!rawJson) return [];
  try {
    const parsed: unknown = JSON.parse(rawJson);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function renderDynamicIcon(iconName: string | undefined, className: string) {
  const key = (iconName || "").toLowerCase();
  if (key.includes("scissor")) return <Scissors className={className} />;
  if (key.includes("wrench") || key.includes("setting"))
    return <Wrench className={className} />;
  if (key.includes("utensil") || key.includes("flame") || key.includes("wine"))
    return <Utensils className={className} />;
  if (key.includes("stetho") || key.includes("smile"))
    return <Stethoscope className={className} />;
  if (key.includes("heart")) return <Heart className={className} />;
  if (key.includes("clock")) return <Clock className={className} />;
  if (key.includes("crown")) return <Crown className={className} />;
  if (key.includes("shield")) return <ShieldCheck className={className} />;
  if (key.includes("award") || key.includes("star"))
    return <Award className={className} />;
  if (key.includes("zap")) return <Zap className={className} />;
  if (key.includes("map")) return <MapPin className={className} />;
  return <Sparkles className={className} />;
}

function buildClientWhatsAppUrl(
  whatsapp: string | null,
  businessName: string,
  customSubject?: string
): string {
  const digits = (whatsapp || "").replace(/\D/g, "") || "5511999999999";
  const text = encodeURIComponent(
    customSubject
      ? `Olá, equipe da ${businessName}! Gostaria de saber mais sobre: ${customSubject}.`
      : `Olá, equipe da ${businessName}! Vi o site de vocês e gostaria de agendar um horário / solicitar atendimento.`
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export async function generateMetadata({
  params,
}: SitePageProps): Promise<Metadata> {
  const { slug } = await params;
  const site = await prisma.generatedSite.findUnique({
    where: { slug },
  });

  if (!site) {
    return {
      title: "Site não encontrado",
    };
  }

  return {
    title: `${site.businessName} | ${site.category} em ${site.city || "Sua Região"}`,
    description: site.heroSubtitle,
    openGraph: {
      title: site.heroTitle,
      description: site.heroSubtitle,
      images: site.heroImageUrl ? [{ url: site.heroImageUrl }] : undefined,
    },
  };
}

export default async function PublicGeneratedSitePage({
  params,
}: SitePageProps) {
  const { slug } = await params;

  const site = await prisma.generatedSite.findUnique({
    where: { slug },
  });

  if (!site) {
    notFound();
  }

  // Incrementa visualizações de forma assíncrona sem bloquear o carregamento
  void prisma.generatedSite
    .update({
      where: { id: site.id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => null);

  const paletteKey = (site.themePalette as SiteThemePalette) || "emerald";
  const theme = PALETTE_THEME_MAP[paletteKey] || PALETTE_THEME_MAP.emerald;

  const services = safeParseJsonArray<SiteServiceItem>(site.servicesJson);
  const benefits = safeParseJsonArray<SiteBenefitItem>(site.benefitsJson);
  const testimonials = safeParseJsonArray<SiteTestimonialItem>(
    site.testimonialsJson
  );
  const faqList = safeParseJsonArray<SiteFaqItem>(site.faqJson);
  const galleryUrls = safeParseJsonArray<string>(site.galleryJson);

  const mainWhatsAppUrl = buildClientWhatsAppUrl(
    site.whatsapp,
    site.businessName
  );
  const mapsTargetUrl =
    site.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${site.businessName} ${site.address || ""} ${site.city || ""}`
    )}`;

  const ratingValue = site.rating ?? 5.0;
  const reviewsCount = site.reviewsCount ?? 48;

  return (
    <div className="min-h-screen bg-[#060608] text-white selection:bg-white/20">
      {/* ── 1. Header Fixo Glassmorphism ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#060608]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${theme.accentText} block`}
            >
              {site.category} · {site.city}
            </span>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-white truncate">
              {site.businessName}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-white">
              {ratingValue.toFixed(1)}
            </span>
            <span className="text-white/50">
              ({reviewsCount} avaliações no Google)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={mainWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg ${theme.buttonBg} ${theme.buttonHover}`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── 2. Hero Section Impactante ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background Image + Gradient Overlay */}
        {site.heroImageUrl && (
          <div className="absolute inset-0 z-0">
            <Image
              src={site.heroImageUrl}
              alt={site.businessName}
              fill
              priority
              className="object-cover opacity-25 scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/85 to-[#060608]/60" />
          </div>
        )}

        <div
          className={`absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full blur-[130px] pointer-events-none bg-gradient-to-br ${theme.glowGradient}`}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border bg-black/50 backdrop-blur-md border-white/15 text-xs">
            <span className={`font-bold ${theme.accentText}`}>
              ★ {ratingValue.toFixed(1)} no Google
            </span>
            <span className="text-white/30">•</span>
            <span className="text-white/80">
              Atendimento Verificado em {site.city}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.12]">
            {site.heroTitle}
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {site.heroSubtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={mainWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm sm:text-base font-bold transition-all shadow-xl ${theme.buttonBg} ${theme.buttonHover}`}
            >
              <MessageCircle className="w-5 h-5" />
              Agendar / Falar no WhatsApp
            </a>

            <a
              href={mapsTargetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-all"
            >
              <Navigation className="w-4 h-4" />
              Ver Localização no Maps
            </a>
          </div>

          {site.address && (
            <p className="text-xs text-white/45 flex items-center justify-center gap-1.5 pt-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{site.address}</span>
            </p>
          )}
        </div>
      </section>

      {/* ── 3. Barra de Diferenciais (Benefits) ── */}
      {benefits.length > 0 && (
        <section className="py-12 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-4"
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${theme.iconBg}`}
                  >
                    {renderDynamicIcon(b.icon, "w-5 h-5")}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{b.title}</h3>
                    <p className="text-xs text-white/55 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Seção de Serviços (Services Grid) ── */}
      {services.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-widest ${theme.accentText}`}
            >
              Nossas Especialidades
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Serviços Pensados para Você
            </h2>
            <p className="text-sm text-white/55">
              Confira nossas soluções mais procuradas em {site.city} e solicite atendimento imediato pelo WhatsApp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white/[0.02] border border-white/10 ${theme.cardBorderHover} transition-all flex flex-col justify-between gap-6`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${theme.iconBg}`}
                    >
                      {renderDynamicIcon(service.icon, "w-6 h-6")}
                    </div>
                    {service.priceHint && (
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
                      >
                        {service.priceHint}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <a
                  href={buildClientWhatsAppUrl(
                    site.whatsapp,
                    site.businessName,
                    service.title
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
                >
                  <span>Consultar no WhatsApp</span>
                  <MessageCircle className={`w-4 h-4 ${theme.accentText}`} />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Sobre Nós & Galeria do Nicho ── */}
      <section className="py-20 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-widest ${theme.accentText}`}
            >
              Sobre {site.businessName}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
              Excelência e Tradição em {site.category} em {site.city}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-white/65 leading-relaxed whitespace-pre-line">
              {site.aboutText}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />
                <span>Atendimento Personalizado</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />
                <span>Estrutura Completa</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />
                <span>Avaliação {ratingValue.toFixed(1)} ★</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {galleryUrls.slice(0, 3).map((url, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 ${
                  idx === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"
                }`}
              >
                <Image
                  src={url}
                  alt={`${site.businessName} - Foto ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Prova Social (Testimonials / Google Reviews) ── */}
      {testimonials.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span
              className={`inline-block text-xs font-bold uppercase tracking-widest ${theme.accentText}`}
            >
              Avaliações Verificadas
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-sm text-white/55">
              Nota {ratingValue.toFixed(1)} de 5 estrelas baseada na satisfação de quem já conhece nosso trabalho.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating || 5 }).map((_, starIdx) => (
                      <Star
                        key={starIdx}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/75 italic leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {t.author}
                  </span>
                  <span className="text-[10px] text-white/40">
                    Cliente Verificado · Google
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Perguntas Frequentes (FAQ) ── */}
      {faqList.length > 0 && (
        <section className="py-20 bg-white/[0.01] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center space-y-2">
              <span
                className={`inline-block text-xs font-bold uppercase tracking-widest ${theme.accentText}`}
              >
                Tire Suas Dúvidas
              </span>
              <h2 className="text-3xl font-serif font-bold text-white">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {faqList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2"
                >
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
                    <HelpCircle
                      className={`w-4 h-4 flex-shrink-0 ${theme.accentText}`}
                    />
                    {item.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/65 leading-relaxed pl-6">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Rodapé Local + CTA Final ── */}
      <footer className="py-16 border-t border-white/10 bg-[#040406]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                Pronto para falar com a equipe do {site.businessName}?
              </h3>
              <p className="text-sm text-white/60">
                Clique no botão ao lado para iniciar uma conversa direta no nosso WhatsApp agora mesmo.
              </p>
            </div>
            <a
              href={mainWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl ${theme.buttonBg} ${theme.buttonHover}`}
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp Agora
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-white/50">
            <div className="space-y-2">
              <p className="text-sm font-bold text-white">
                {site.businessName}
              </p>
              <p>
                {site.category} · {site.city}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-white">
                Endereço e Localização
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{site.address || site.city}</span>
              </p>
              <a
                href={mapsTargetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 font-semibold ${theme.accentText} hover:underline`}
              >
                <span>Abrir rota no Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-white">Contato Direto</p>
              {site.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{site.phone}</span>
                </p>
              )}
              <p className="text-white/35">
                © {new Date().getFullYear()} {site.businessName}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Botão Flutuante de WhatsApp ── */}
      <a
        href={mainWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-green-500 hover:bg-green-400 text-black font-bold text-xs sm:text-sm shadow-2xl shadow-green-500/30 transition-all hover:scale-105"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span>Atendimento Online</span>
      </a>
    </div>
  );
}
