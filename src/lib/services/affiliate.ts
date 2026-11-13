/**
 * Service de Gestão de Links de Afiliado do Mercado Livre
 */

export function isValidMercadoLivreUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const validHosts = [
      "mercadolivre.com.br",
      "www.mercadolivre.com.br",
      "produto.mercadolivre.com.br",
      "mercadolivre.com",
      "www.mercadolivre.com",
    ];
    return validHosts.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/**
 * Remove parâmetros de rastreamento de terceiros (utm_*, gclid, etc.)
 */
export function sanitizeMercadoLivreUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
      "_gl",
    ];

    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Gera o link de afiliado final.
 * Se o usuário já colar um link de afiliado oficial encurtado (ex: mercadolivre.com/sec/...),
 * mantém o link diretamente. Caso contrário, anexa o código de afiliado configurado.
 */
export function buildAffiliateUrl(url: string, customTag?: string): string {
  const cleanUrl = sanitizeMercadoLivreUrl(url);

  // Se já for link encurtado oficial do programa de afiliados (/sec/), retorna direto
  if (cleanUrl.includes("mercadolivre.com/sec/") || cleanUrl.includes("mercadolivre.com.br/sec/")) {
    return cleanUrl;
  }

  const tag = customTag || process.env.MERCADO_LIVRE_AFFILIATE_TAG;
  if (!tag) {
    return cleanUrl;
  }

  try {
    const parsed = new URL(cleanUrl);
    // Parâmetro padrão de tracking do Mercado Livre Afiliados
    parsed.searchParams.set("matt_tool", tag);
    return parsed.toString();
  } catch {
    return cleanUrl;
  }
}
