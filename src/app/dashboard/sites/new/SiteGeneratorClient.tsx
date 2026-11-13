"use client";

import { useState } from "react";
import {
  MapPin,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Globe,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import {
  createSiteFromMapsAction,
  type CreateSiteActionResponse,
} from "@/lib/actions/sites";

export function SiteGeneratorClient() {
  const [mapsUrl, setMapsUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CreateSiteActionResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsUrl.trim() && !businessName.trim()) return;

    setGenerating(true);
    setResult(null);

    try {
      const res = await createSiteFromMapsAction({
        mapsUrl: mapsUrl.trim() || undefined,
        businessName: businessName.trim() || undefined,
        category: category.trim() || undefined,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
        whatsapp: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setResult(res);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao gerar site.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const proposalWhatsappUrl =
    result?.success && result.slug
      ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
          `Olá! Vi o perfil da ${
            result.businessName || "sua empresa"
          } no Google Maps e criei uma demonstração exclusiva de site profissional para vocês: ${
            typeof window !== "undefined" ? window.location.origin : ""
          }/s/${result.slug}`
        )}`
      : "#";

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleGenerate}
        className="glass-card p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.06] via-transparent to-emerald-500/[0.04] space-y-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Gerador Automático Google Maps → Landing Page
          </div>
          <h2 className="text-lg font-semibold text-white">
            Cole o link do Google Maps ou preencha os dados do cliente
          </h2>
          <p className="text-xs text-white/50 max-w-2xl">
            Nossa IA identifica o nome, nicho, cidade e avaliações do negócio e constrói automaticamente uma Landing Page completa com 6 serviços, diferenciais, depoimentos, FAQ e paleta personalizada.
          </p>
        </div>

        {/* Campo Principal: URL do Google Maps */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            URL do Estabelecimento no Google Maps
          </label>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://www.google.com/maps/place/Barbearia+Viking/..."
            className="w-full bg-black/50 border border-white/15 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400 transition-all"
          />
          <p className="text-[11px] text-white/35 mt-1.5">
            Dica: Você pode colar apenas o link do Maps ou complementar os campos opcionais abaixo para máxima precisão.
          </p>
        </div>

        {/* Campos Opcionais de Enriquecimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-white/5">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-white/40" />
              Nome do Negócio (Opcional)
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ex: Barbearia Viking, OdontoPrime..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Nicho / Categoria (Opcional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            >
              <option value="">Detectar Automaticamente pela IA</option>
              <option value="Barbearia">Barbearia</option>
              <option value="Clínica Odontológica">Clínica Odontológica / Médica</option>
              <option value="Oficina Mecânica">Oficina Mecânica & Auto Center</option>
              <option value="Restaurante & Gastronomia">Restaurante, Pizzaria & Hamburgueria</option>
              <option value="Estética & Beleza">Salão de Beleza & Clínica de Estética</option>
              <option value="Academia & Fitness">Academia, Crossfit & Pilates</option>
              <option value="Pet Shop & Veterinária">Pet Shop & Clínica Veterinária</option>
              <option value="Advocacia & Consultoria">Escritório de Advocacia & Consultoria</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Cidade (Opcional)
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Brasília, São Paulo, Curitiba..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-white/40" />
              WhatsApp do Cliente (Opcional)
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: (11) 99999-9999"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Endereço Completo (Opcional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
        </div>

        {/* Botão de Ação */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={generating || (!mapsUrl.trim() && !businessName.trim())}
            className="btn-primary w-full sm:w-auto !py-4 !px-8 !text-sm font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraindo dados do Maps e gerando Landing Page com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                ✨ Extrair do Maps & Gerar Landing Page com IA
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Preview / Resultado Imediato ── */}
      {result && (
        <div
          className={`glass-card p-6 sm:p-8 border ${
            result.success
              ? "border-emerald-500/40 bg-emerald-500/[0.06]"
              : "border-red-500/40 bg-red-500/[0.06]"
          } space-y-5`}
        >
          {result.success ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Landing Page Gerada e Publicada com Sucesso!
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {result.businessName} ({result.category})
                  </h3>
                  <p className="text-xs text-white/60">
                    Cidade: {result.city} · Paleta selecionada pela IA:{" "}
                    <strong className="uppercase text-emerald-300">
                      {result.themePalette}
                    </strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`/s/${result.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !py-3 !px-5 !text-xs font-bold flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    🌐 Abrir Site Público (/s/{result.slug})
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={proposalWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 text-xs font-bold transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    📲 Enviar Proposta no WhatsApp
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Preview da Headline Gerada pela IA
                </p>
                <p className="text-base font-semibold text-white">
                  {result.heroTitle}
                </p>
                <p className="text-xs text-white/60">{result.heroSubtitle}</p>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/dashboard/sites"
                  className="text-xs text-white/50 hover:text-white underline"
                >
                  Ver todos os sites gerados no catálogo →
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{result.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
