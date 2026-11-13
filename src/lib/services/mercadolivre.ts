import { prisma } from "@/lib/prisma";
import { getValidMlToken } from "@/lib/services/ml-auth";

const ML_API_BASE = "https://api.mercadolibre.com";

export interface MlCategoryPrediction {
  categoryId: string;
  categoryName: string;
  domainId: string;
}

interface MlDomainDiscoveryItem {
  category_id?: string;
  category_name?: string;
  domain_id?: string;
}

interface MlApiErrorCause {
  code?: string;
  message?: string;
  type?: string;
}

interface MlApiErrorResponse {
  message?: string;
  error?: string;
  status?: number;
  cause?: MlApiErrorCause[] | string[];
}

interface MlCreateItemResponse {
  id: string;
  permalink: string;
  category_id?: string;
}

export interface MlPublishResult {
  success: boolean;
  mlItemId?: string;
  mlPermalink?: string;
  mlCategoryId?: string;
  error?: string;
}

function extractPictureSources(mediaUrls: unknown): Array<{ source: string }> {
  if (!Array.isArray(mediaUrls)) {
    return [];
  }

  const pictures: Array<{ source: string }> = [];

  for (const item of mediaUrls) {
    if (typeof item === "string" && item.trim().startsWith("http")) {
      pictures.push({ source: item.trim() });
    } else if (
      typeof item === "object" &&
      item !== null &&
      "url" in item &&
      typeof (item as { url: unknown }).url === "string"
    ) {
      const url = (item as { url: string }).url.trim();
      if (url.startsWith("http")) {
        pictures.push({ source: url });
      }
    }
  }

  return pictures;
}

function formatMlApiError(rawBody: string, status: number): string {
  try {
    const parsed = JSON.parse(rawBody) as MlApiErrorResponse;
    const baseMsg = parsed.message || parsed.error || `HTTP ${status}`;

    if (Array.isArray(parsed.cause) && parsed.cause.length > 0) {
      const causes = parsed.cause
        .map((c) => {
          if (typeof c === "string") return c;
          return c.message || c.code || JSON.stringify(c);
        })
        .filter(Boolean)
        .join("; ");

      if (causes) {
        return `${baseMsg} (Causas: ${causes})`;
      }
    }

    return baseMsg;
  } catch {
    return rawBody || `Erro HTTP ${status} na API do Mercado Livre`;
  }
}

/**
 * Descobre a categoria mais adequada no Mercado Livre Brasil (MLB) a partir do título.
 */
export async function predictMlCategory(
  title: string
): Promise<MlCategoryPrediction> {
  const fallback: MlCategoryPrediction = {
    categoryId: "MLB3530", // Outros
    categoryName: "Outros",
    domainId: "MLB-UNCLASSIFIED_PRODUCTS",
  };

  if (!title.trim()) {
    return fallback;
  }

  try {
    const url = `${ML_API_BASE}/sites/MLB/domain_discovery/search?limit=1&q=${encodeURIComponent(
      title.trim()
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as MlDomainDiscoveryItem[];
    if (!Array.isArray(data) || data.length === 0 || !data[0]?.category_id) {
      return fallback;
    }

    const first = data[0];
    return {
      categoryId: first.category_id || fallback.categoryId,
      categoryName: first.category_name || fallback.categoryName,
      domainId: first.domain_id || fallback.domainId,
    };
  } catch {
    return fallback;
  }
}

/**
 * Publica um produto do banco diretamente na conta conectada do Mercado Livre.
 */
export async function publishProductToMl(
  productId: string,
  userId: string
): Promise<MlPublishResult> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return {
      success: false,
      error: "Produto não encontrado no banco de dados.",
    };
  }

  try {
    const accessToken = await getValidMlToken(userId);

    // 1. Determinar a categoria do Mercado Livre
    let categoryId = product.mlCategoryId;
    if (!categoryId) {
      const predicted = await predictMlCategory(product.title);
      categoryId = predicted.categoryId;
    }

    // 2. Preparar imagens e payload do anúncio
    const pictures = extractPictureSources(product.mediaUrls);
    const payload = {
      title: product.title.slice(0, 60),
      category_id: categoryId,
      price: Number(product.price.toFixed(2)),
      currency_id: "BRL",
      available_quantity: product.stock > 0 ? product.stock : 10,
      buying_mode: "buy_it_now",
      condition: "new",
      listing_type_id: product.listingType || "gold_special",
      pictures,
    };

    // 3. Criar anúncio na API do Mercado Livre
    const createRes = await fetch(`${ML_API_BASE}/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      const detailedError = formatMlApiError(errBody, createRes.status);

      await prisma.product.update({
        where: { id: product.id },
        data: { syncStatus: "ERROR" },
      });

      return {
        success: false,
        error: `Erro ao publicar anúncio no Mercado Livre: ${detailedError}`,
      };
    }

    const createdItem = (await createRes.json()) as MlCreateItemResponse;
    const mlItemId = createdItem.id;
    const mlPermalink = createdItem.permalink;

    // 4. Enviar descrição em texto puro para o item criado
    const plainText = (
      product.plainDescription ||
      product.description ||
      product.aiSummary ||
      product.title
    ).trim();

    if (plainText) {
      const descRes = await fetch(
        `${ML_API_BASE}/items/${encodeURIComponent(mlItemId)}/description`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plain_text: plainText }),
        }
      );

      if (!descRes.ok) {
        const descErrBody = await descRes.text();
        console.warn(
          `Aviso: Item ${mlItemId} criado, mas houve falha ao anexar descrição:`,
          formatMlApiError(descErrBody, descRes.status)
        );
      }
    }

    // 5. Atualizar registro do produto no Prisma
    await prisma.product.update({
      where: { id: product.id },
      data: {
        mlItemId,
        mlPermalink,
        mlCategoryId: categoryId,
        syncStatus: "PUBLISHED",
      },
    });

    return {
      success: true,
      mlItemId,
      mlPermalink,
      mlCategoryId: categoryId,
    };
  } catch (error) {
    await prisma.product.update({
      where: { id: product.id },
      data: { syncStatus: "ERROR" },
    });

    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao publicar produto no Mercado Livre.";

    return {
      success: false,
      error: message,
    };
  }
}
