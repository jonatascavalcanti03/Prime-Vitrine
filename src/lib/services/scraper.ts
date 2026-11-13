/**
 * Service de Extração de Metadados de Produtos do Mercado Livre
 * Utiliza OpenGraph e JSON-LD sem depender de bibliotecas pesadas de headless browser.
 */

export interface ScrapedProductData {
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  originalPrice?: number;
  brand?: string;
  category?: string;
}

export async function scrapeMercadoLivreProduct(url: string): Promise<ScrapedProductData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Falha ao buscar página do Mercado Livre: status ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 1. Extração via OpenGraph
    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']twitter:title["']\s+content=["'](.*?)["']/i);
    const title = titleMatch ? titleMatch[1].replace(/ \| Mercado Livre.*$/i, "").trim() : "";

    const imageMatch =
      html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i);
    const imageUrl = imageMatch ? imageMatch[1] : "";

    const descMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    const description = descMatch ? descMatch[1].trim() : "";

    // 2. Extração de Preço via JSON-LD
    let price: number | undefined;
    let brand: string | undefined;

    const jsonLdMatches = html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const json = JSON.parse(match[1]);
        if (json["@type"] === "Product" || json.offers) {
          if (json.offers?.price) {
            price = parseFloat(json.offers.price);
          } else if (Array.isArray(json.offers) && json.offers[0]?.price) {
            price = parseFloat(json.offers[0].price);
          }
          if (json.brand?.name) {
            brand = json.brand.name;
          }
          break;
        }
      } catch {
        // Ignora JSON-LD mal formatado
      }
    }

    return {
      title,
      description,
      imageUrl,
      price,
      brand,
    };
  } catch (error) {
    console.error("Erro ao extrair metadados do Mercado Livre:", error);
    return null;
  }
}
