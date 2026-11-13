"use client";

import { useState, useMemo, useRef } from "react";
import {
  Sparkles,
  Loader2,
  ExternalLink,
  DollarSign,
  Image as ImageIcon,
  Info,
  ThumbsUp,
  Calculator,
  Rocket,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  analyzeMercadoLivreProduct,
  createProduct,
  saveAndPublishToMlAction,
} from "@/lib/actions/product";
import {
  calculateMlPricing,
  type MlListingType,
} from "@/lib/services/pricing";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

export function ProductFormClient() {
  const formRef = useRef<HTMLFormElement>(null);

  const [mlUrl, setMlUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estado de publicação direta no ML
  const [publishingMl, setPublishingMl] = useState(false);
  const [publishResult, setPublishResult] = useState<{
    success: boolean;
    mlItemId?: string;
    mlPermalink?: string;
    error?: string;
  } | null>(null);

  // Campos gerais do formulário
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Eletrônicos");
  const [originalPrice, setOriginalPrice] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiPros, setAiPros] = useState<string[]>([]);
  const [aiCons, setAiCons] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [plainDescription, setPlainDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // Campos da Calculadora Financeira ML
  const [costPriceInput, setCostPriceInput] = useState<string>("");
  const [profitMarginInput, setProfitMarginInput] = useState<string>("30");
  const [listingType, setListingType] = useState<MlListingType>("gold_special");
  const [manualPriceOverride, setManualPriceOverride] = useState<string>("");

  // Cálculo em tempo real usando calculateMlPricing
  const pricingCalc = useMemo(() => {
    const cost = parseFloat(costPriceInput);
    const margin = parseFloat(profitMarginInput);
    return calculateMlPricing({
      costPrice: Number.isNaN(cost) ? 0 : cost,
      profitMarginPercent: Number.isNaN(margin) ? 0 : margin,
      listingType,
    });
  }, [costPriceInput, profitMarginInput, listingType]);

  // Preço final efetivo do anúncio (calculado automaticamente ou ajustado manualmente)
  const effectiveSalePrice =
    manualPriceOverride !== ""
      ? manualPriceOverride
      : pricingCalc.finalSalePrice > 0
        ? pricingCalc.finalSalePrice.toFixed(2)
        : "";

  // Ação de Importação Automática com IA
  const handleAnalyze = async () => {
    if (!mlUrl) return;
    setAnalyzing(true);
    setImportMessage(null);
    setPublishResult(null);

    try {
      const res = await analyzeMercadoLivreProduct(mlUrl);

      if (!res.success || !res.data) {
        setImportMessage({
          type: "error",
          text: res.error || "Falha ao analisar o link.",
        });
        setAnalyzing(false);
        return;
      }

      const data = res.data;
      setTitle(data.optimizedMlTitle || data.title || "");
      setBrand(data.brand || "");
      setOriginalUrl(data.originalUrl || mlUrl);
      setAffiliateUrl(data.affiliateUrl || "");
      setMainImageUrl(data.imageUrl || "");

      if (data.price) {
        setCostPriceInput(data.price.toString());
        setManualPriceOverride("");
      }

      setAiSummary(data.aiSummary || "");
      setAiPros(data.aiPros || []);
      setAiCons(data.aiCons || []);
      setDescription(data.description || "");
      setPlainDescription(data.plainDescription || data.description || "");

      setImportMessage({
        type: "success",
        text: "Fornecedor extraído! Título SEO (60 chars), descrição em texto puro e custo preenchidos pela IA.",
      });
    } catch {
      setImportMessage({
        type: "error",
        text: "Erro ao processar o link com IA.",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Submissão direta para a API oficial do Mercado Livre
  const handleSaveAndPublishToMl = async () => {
    if (!formRef.current) return;
    if (!formRef.current.reportValidity()) return;

    setPublishingMl(true);
    setPublishResult(null);

    try {
      const formData = new FormData(formRef.current);
      const result = await saveAndPublishToMlAction(formData);
      setPublishResult(result);
    } catch (error) {
      setPublishResult({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao publicar no Mercado Livre.",
      });
    } finally {
      setPublishingMl(false);
    }
  };

  const titleLength = title.length;
  const isTitleOverLimit = titleLength > 60;

  return (
    <div className="space-y-8">
      {/* ── Box de Importação Rápida com IA ── */}
      <div className="glass-card p-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">
            Importador Inteligente do Fornecedor (Mercado Livre + Gemini IA)
          </h2>
        </div>
        <p className="text-xs text-white/50 mb-4 max-w-2xl">
          Cole a URL do produto no fornecedor. O sistema extrai o preço de custo, imagens e usa o Google Gemini para otimizar o título SEO (máx. 60 caracteres) e a descrição em texto puro para publicação imediata na sua conta do Mercado Livre.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              value={mlUrl}
              onChange={(e) => setMlUrl(e.target.value)}
              placeholder="https://www.mercadolivre.com.br/exemplo-produto..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !mlUrl}
            className="btn-primary flex items-center justify-center gap-2 !py-3 !px-6 text-sm font-semibold flex-shrink-0 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraindo e Otimizando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Importar do Mercado Livre
              </>
            )}
          </button>
        </div>

        {importMessage && (
          <p
            className={`text-xs mt-3 font-medium ${
              importMessage.type === "success"
                ? "text-emerald-400"
                : "text-amber-400"
            }`}
          >
            {importMessage.text}
          </p>
        )}
      </div>

      {/* ── Feedback de Publicação no Mercado Livre ── */}
      {publishResult && (
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            publishResult.success
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
              : "bg-red-500/10 border-red-500/30 text-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {publishResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">
                {publishResult.success
                  ? `Anúncio publicado com sucesso no Mercado Livre! (${publishResult.mlItemId})`
                  : "Não foi possível concluir a publicação no Mercado Livre"}
              </p>
              <p className="text-xs opacity-80">
                {publishResult.success
                  ? "O produto já está ativo na sua loja oficial do Mercado Livre e sincronizado no inventário."
                  : publishResult.error}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {publishResult.success && publishResult.mlPermalink && (
              <a
                href={publishResult.mlPermalink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-2.5 !px-4 !text-xs flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Anúncio no ML
              </a>
            )}
            <Link
              href="/dashboard/inventory"
              className="btn-ghost !py-2.5 !px-4 !text-xs border border-white/10"
            >
              Ir para Inventário
            </Link>
          </div>
        </div>
      )}

      {/* ── Formulário de Criação e Publicação ── */}
      <form
        ref={formRef}
        action={createProduct}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Hidden inputs sincronizados com a calculadora */}
        <input
          type="hidden"
          name="mlFeePercent"
          value={pricingCalc.mlFeePercent}
        />
        <input type="hidden" name="aiPros" value={JSON.stringify(aiPros)} />
        <input type="hidden" name="aiCons" value={JSON.stringify(aiCons)} />

        {/* Esquerda: Informações Gerais, Calculadora ML & Copy IA */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── 💰 Calculadora de Lucro e Taxas Mercado Livre ── */}
          <div className="glass-card p-6 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> 💰 Calculadora de Lucro e Taxas Mercado Livre
              </h3>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
                Precificação Reversa em Tempo Real
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Preço de Custo Fornecedor (R$)
                </label>
                <input
                  name="costPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={costPriceInput}
                  onChange={(e) => {
                    setCostPriceInput(e.target.value);
                    setManualPriceOverride("");
                  }}
                  placeholder="Ex: 150.00"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Margem de Lucro Desejada (%)
                </label>
                <input
                  name="profitMargin"
                  type="number"
                  step="0.5"
                  min="0"
                  value={profitMarginInput}
                  onChange={(e) => {
                    setProfitMarginInput(e.target.value);
                    setManualPriceOverride("");
                  }}
                  placeholder="Ex: 30"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-semibold focus:outline-none focus:border-emerald-500/60 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                  Tipo de Anúncio ML
                </label>
                <select
                  name="listingType"
                  value={listingType}
                  onChange={(e) => {
                    setListingType(
                      e.target.value === "gold_pro" ? "gold_pro" : "gold_special"
                    );
                    setManualPriceOverride("");
                  }}
                  className="w-full bg-[#111] border border-white/15 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-emerald-500/60 transition-all"
                >
                  <option value="gold_special">Clássico (14% comissão)</option>
                  <option value="gold_pro">Premium — Sem Juros (19% comissão)</option>
                </select>
              </div>
            </div>

            {/* 3 Cards de Resultado Ao Vivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Card 1: Preço Final de Venda no ML */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  1. Preço Final de Venda no ML
                </p>
                <p className="text-xl font-bold text-white">
                  {formatBRL(pricingCalc.finalSalePrice)}
                </p>
                <p className="text-[11px] text-white/40">
                  Custo base: {formatBRL(pricingCalc.costPrice)}
                </p>
              </div>

              {/* Card 2: Taxas do Mercado Livre */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
                  2. Taxas do Mercado Livre
                </p>
                <p className="text-xl font-bold text-amber-300">
                  {formatBRL(
                    pricingCalc.mlFeeAmount + pricingCalc.fixedFeeAmount
                  )}
                </p>
                <p className="text-[11px] text-white/40">
                  Comissão {pricingCalc.mlFeePercent}% (
                  {formatBRL(pricingCalc.mlFeeAmount)})
                  {pricingCalc.fixedFeeAmount > 0
                    ? ` + Fixa ${formatBRL(pricingCalc.fixedFeeAmount)} (< R$ 79)`
                    : " · Sem taxa fixa"}
                </p>
              </div>

              {/* Card 3: Seu Lucro Líquido Real */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  3. Seu Lucro Líquido Real
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-xl font-bold text-emerald-400">
                    {formatBRL(pricingCalc.netProfit)}
                  </p>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    ROI {pricingCalc.roiPercent.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/60">
                  Livre na sua conta após taxas e custo
                </p>
              </div>
            </div>
          </div>

          {/* ── Detalhes do Anúncio & Copy IA ── */}
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Dados do Anúncio & Otimização SEO
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-white/40 uppercase tracking-wider">
                    Título Otimizado para o Mercado Livre
                  </label>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isTitleOverLimit
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    {titleLength}/60 caracteres
                  </span>
                </div>
                <input
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Smartphone Apple iPhone 15 128GB 5G Tela 6.1 Preto"
                  className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all ${
                    isTitleOverLimit
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-white/10 focus:border-emerald-500/50"
                  }`}
                />
                {isTitleOverLimit && (
                  <p className="text-[11px] text-red-400 mt-1">
                    Atenção: O Mercado Livre aceita no máximo 60 caracteres. Os caracteres excedentes serão cortados no envio.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                    Marca
                  </label>
                  <input
                    name="brand"
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Apple, Samsung, Sony..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                    Categoria na Vitrine
                  </label>
                  <select
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  >
                    <option value="Eletrônicos">Eletrônicos & Smartphones</option>
                    <option value="Informática">Informática & Computadores</option>
                    <option value="Casa e Cozinha">Casa & Cozinha</option>
                    <option value="Moda">Moda & Acessórios</option>
                    <option value="Games">Games & Consoles</option>
                    <option value="Beleza">Beleza & Cuidados</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>

              {/* Descrição Texto Puro para a API do Mercado Livre */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Descrição Texto Puro para API do Mercado Livre (plain_text)
                </label>
                <textarea
                  name="plainDescription"
                  rows={8}
                  value={plainDescription}
                  onChange={(e) => setPlainDescription(e.target.value)}
                  placeholder="Copy estruturada em texto puro (sem HTML) gerada pela IA para o anúncio oficial no Mercado Livre..."
                  className="w-full bg-white/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50 transition-all"
                />
                <p className="text-[10px] text-white/30 mt-1">
                  O Mercado Livre exige descrições em texto puro (sem tags HTML). Este texto será enviado diretamente para{" "}
                  <code>POST /items/$&#123;id&#125;/description</code>.
                </p>
              </div>

              {/* Resumo e Copy de IA para a Vitrine */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Resumo Persuasivo da IA (Vitrine)
                </label>
                <textarea
                  name="aiSummary"
                  rows={3}
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  placeholder="Resumo otimizado para prender a atenção do visitante..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none"
                />
              </div>

              {/* Pontos Fortes Identificados pela IA */}
              {aiPros.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Destaques Identificados pela IA:
                  </p>
                  <ul className="space-y-1">
                    {aiPros.map((pro, i) => (
                      <li
                        key={i}
                        className="text-xs text-white/70 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* URLs de Referência / Fornecedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                    URL do Fornecedor / Origem
                  </label>
                  <input
                    name="originalUrl"
                    type="url"
                    required
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://www.mercadolivre.com.br/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                    Link de Afiliado / Redirecionamento (Opcional)
                  </label>
                  <input
                    name="affiliateUrl"
                    type="url"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="Preenchido automaticamente"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/80 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Descrição Original */}
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                  Notas / Descrição Interna
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informações técnicas adicionais..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Direita: Preço Final, Mídia & Botões de Ação */}
        <div className="space-y-6">
          {/* Preço de Venda Sincronizado */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Preço Final do Anúncio
            </h3>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                Preço Final de Venda no ML (R$)
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                value={effectiveSalePrice}
                onChange={(e) => setManualPriceOverride(e.target.value)}
                placeholder="Calculado automaticamente"
                className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-base text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 transition-all"
              />
              <p className="text-[10px] text-white/30 mt-1">
                Atualizado automaticamente pela Calculadora de Lucro acima.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                Preço &ldquo;De&rdquo; / Sem Desconto na Vitrine (R$)
              </label>
              <input
                name="originalPrice"
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex: 499.90 (Opcional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Imagem */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Imagem Principal do Anúncio
            </h3>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">
                URL da Imagem (Alta Resolução)
              </label>
              <input
                name="mainImageUrl"
                type="url"
                required
                value={mainImageUrl}
                onChange={(e) => setMainImageUrl(e.target.value)}
                placeholder="https://http2.mlstatic.com/..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {mainImageUrl && (
              <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                <Image
                  src={mainImageUrl}
                  alt="Preview do Produto"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Destaque & 2 Botões de Submissão */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-white">
                Destacar produto na página inicial
              </span>
            </label>

            <div className="pt-2 space-y-3">
              {/* Botão 1: Salvar e Publicar na Loja ML */}
              <button
                type="button"
                onClick={handleSaveAndPublishToMl}
                disabled={publishingMl}
                className="btn-primary w-full !py-4 !text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {publishingMl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publicando no Mercado Livre...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    🚀 Salvar e Publicar na Minha Loja ML
                  </>
                )}
              </button>

              {/* Botão 2: Salvar apenas como Rascunho */}
              <button
                type="submit"
                disabled={publishingMl}
                className="btn-ghost w-full !py-3.5 !text-xs font-semibold border border-white/10 hover:border-white/25 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-white/60" />
                💾 Salvar apenas como Rascunho
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
