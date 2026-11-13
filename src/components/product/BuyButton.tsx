"use client";

import { ExternalLink, ShoppingBag } from "lucide-react";

interface BuyButtonProps {
  productId: string;
  productSlug: string;
  className?: string;
  disabled?: boolean;
}

/**
 * BuyButton — Botão de Redirecionamento de Afiliado (Mercado Livre)
 * Direciona o visitante para a rota /r/[slug], registrando a métrica e
 * enviando-o com o tracking tag de afiliado para o Mercado Livre.
 */
export function BuyButton({
  productId,
  productSlug,
  className = "",
  disabled = false,
}: BuyButtonProps) {
  if (disabled) {
    return (
      <button
        disabled
        className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm text-white/30 bg-white/5 border border-white/5 cursor-not-allowed ${className}`}
      >
        Oferta Indisponível
      </button>
    );
  }

  return (
    <a
      id={`buy-button-${productId}`}
      href={`/r/${productSlug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary flex items-center justify-center gap-2 !py-4 !text-base font-semibold shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all group ${className}`}
      aria-label="Ver oferta no Mercado Livre"
    >
      <ShoppingBag className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
      <span>Ver Oferta no Mercado Livre</span>
      <ExternalLink className="w-4 h-4 text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </a>
  );
}
