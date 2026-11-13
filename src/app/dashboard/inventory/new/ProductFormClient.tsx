"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  DollarSign, 
  Image as ImageIcon, 
  Check, 
  Info,
  ThumbsUp,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { analyzeMercadoLivreProduct, createProduct } from "@/lib/actions/product";

export function ProductFormClient() {
  const [mlUrl, setMlUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Campos do formulário
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Eletrônicos");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [aiPros, setAiPros] = useState<string[]>([]);
  const [aiCons, setAiCons] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // Ação de Importação Automática com IA
  const handleAnalyze = async () => {
    if (!mlUrl) return;
    setAnalyzing(true);
    setImportMessage(null);

    try {
      const res = await analyzeMercadoLivreProduct(mlUrl);

      if (!res.success || !res.data) {
        setImportMessage({ type: "error", text: res.error || "Falha ao analisar o link." });
        setAnalyzing(false);
        return;
      }

      const data = res.data;
      setTitle(data.title || "");
      setBrand(data.brand || "");
      setOriginalUrl(data.originalUrl || mlUrl);
      setAffiliateUrl(data.affiliateUrl || "");
      setMainImageUrl(data.imageUrl || "");
      if (data.price) setPrice(data.price.toString());
      setAiSummary(data.aiSummary || "");
      setAiPros(data.aiPros || []);
      setAiCons(data.aiCons || []);
      setDescription(data.description || "");

      setImportMessage({
        type: "success",
        text: "Dados extraídos com sucesso e resumo gerado por IA!",
      });
    } catch {
      setImportMessage({ type: "error", text: "Erro ao processar o link com IA." });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Box de Importação Rápida com IA ── */}
      <div className="glass-card p-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-white">Importador Inteligente do Mercado Livre</h2>
        </div>
        <p className="text-xs text-white/50 mb-4 max-w-xl">
          Cole a URL de qualquer produto do Mercado Livre. O sistema vai extrair o título, imagens, preço e usar a IA (Gemini) para gerar a copy persuasiva automaticamente.
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
                Extraindo com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extrair e Preencher
              </>
            )}
          </button>
        </div>

        {importMessage && (
          <p className={`text-xs mt-3 font-medium ${importMessage.type === "success" ? "text-emerald-400" : "text-amber-400"}`}>
            {importMessage.text}
          </p>
        )}
      </div>

      {/* ── Formulário de Criação ── */}
      <form action={createProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Esquerda: Informações Gerais & IA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Detalhes da Oferta
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Título da Oferta</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Smartphone Apple iPhone 15 128GB Preto"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Marca</label>
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
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Categoria</label>
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

              {/* URLs de Afiliado */}
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Link Original do Mercado Livre</label>
                  <input
                    name="originalUrl"
                    type="url"
                    required
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://www.mercadolivre.com.br/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-emerald-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Seu Link de Afiliado (com Tracking Tag)
                  </label>
                  <input
                    name="affiliateUrl"
                    type="url"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="https://mercadolivre.com/sec/... ou link gerado com sua tag"
                    className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-200 focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <p className="text-[10px] text-white/30 mt-1">
                    Se você deixar em branco, o sistema aplica automaticamente a sua tag configurada.
                  </p>
                </div>
              </div>

              {/* Resumo e Copy de IA */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Resumo Persuasivo da IA (Copy de Vendas)
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

              <input type="hidden" name="aiPros" value={JSON.stringify(aiPros)} />
              <input type="hidden" name="aiCons" value={JSON.stringify(aiCons)} />

              {/* Pontos Fortes e Atenção */}
              {aiPros.length > 0 && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" /> Destaques Identificados pela IA:
                  </p>
                  <ul className="space-y-1">
                    {aiPros.map((pro, i) => (
                      <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Descrição Original */}
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Descrição Completa</label>
                <textarea
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Informações técnicas e ficha do produto..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Direita: Preço, Mídia & Publicação */}
        <div className="space-y-6">
          {/* Preços */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Precificação
            </h3>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Preço da Oferta (R$)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 299.90"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Preço Original / Sem Desconto (R$)</label>
              <input
                name="originalPrice"
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="Ex: 499.90"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Imagem */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Imagem Principal
            </h3>

            <div>
              <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">URL da Imagem</label>
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
                <Image src={mainImageUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Destaque & Botão Publicar */}
          <div className="glass-card p-6 border border-white/5 space-y-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-white">Exibir no Carrossel de Destaques</span>
            </label>

            <button
              type="submit"
              className="btn-primary w-full !py-4 !text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-4 h-4" />
              Publicar Oferta no Site
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
