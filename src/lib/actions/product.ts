"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAffiliateUrl } from "@/lib/services/affiliate";
import { scrapeMercadoLivreProduct } from "@/lib/services/scraper";
import { enrichProductWithAI } from "@/lib/services/ai";
import { calculateMlPricing, type MlListingType } from "@/lib/services/pricing";
import { publishProductToMl } from "@/lib/services/mercadolivre";

export interface ActionPublishResponse {
  success: boolean;
  productId?: string;
  mlItemId?: string;
  mlPermalink?: string;
  error?: string;
}

/**
 * Resolve o ID do usuário autenticado ou faz fallback para o admin/conta ML conectada.
 */
async function resolveActiveUserId(): Promise<string | null> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  const mlAccount = await prisma.mercadoLivreAccount.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (mlAccount?.userId) {
    return mlAccount.userId;
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  return adminUser?.id ?? null;
}

function parseStringArrayField(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function generateSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${cleanTitle || "produto"}-${Math.random().toString(36).substring(2, 7)}`;
}

function extractProductFieldsFromFormData(formData: FormData) {
  const title = ((formData.get("title") as string) || "Produto Mercado Livre").trim();
  const brand = ((formData.get("brand") as string) || "").trim() || null;
  const categoryName = ((formData.get("category") as string) || "Geral").trim();
  const description = ((formData.get("description") as string) || "").trim();
  const plainDescription =
    ((formData.get("plainDescription") as string) || "").trim() || null;
  const originalUrl = ((formData.get("originalUrl") as string) || "").trim();
  const rawAffiliateUrl = ((formData.get("affiliateUrl") as string) || "").trim();
  const mainImageUrl = ((formData.get("mainImageUrl") as string) || "").trim();

  const listingTypeRaw = (formData.get("listingType") as string) || "gold_special";
  const listingType: MlListingType =
    listingTypeRaw === "gold_pro" ? "gold_pro" : "gold_special";

  const costPriceRaw = formData.get("costPrice") as string;
  const costPrice =
    costPriceRaw && !Number.isNaN(parseFloat(costPriceRaw))
      ? parseFloat(costPriceRaw)
      : null;

  const profitMarginRaw = formData.get("profitMargin") as string;
  const profitMargin =
    profitMarginRaw && !Number.isNaN(parseFloat(profitMarginRaw))
      ? parseFloat(profitMarginRaw)
      : null;

  const mlFeePercentRaw = formData.get("mlFeePercent") as string;
  let mlFeePercent =
    mlFeePercentRaw && !Number.isNaN(parseFloat(mlFeePercentRaw))
      ? parseFloat(mlFeePercentRaw)
      : listingType === "gold_pro"
        ? 19
        : 14;

  const priceInputRaw = formData.get("price") as string;
  let price =
    priceInputRaw && !Number.isNaN(parseFloat(priceInputRaw))
      ? parseFloat(priceInputRaw)
      : 0;

  if (costPrice !== null && costPrice > 0) {
    const calc = calculateMlPricing({
      costPrice,
      profitMarginPercent: profitMargin ?? 30,
      listingType,
    });
    mlFeePercent = calc.mlFeePercent;
    if (price <= 0) {
      price = calc.finalSalePrice;
    }
  }

  const originalPriceRaw = formData.get("originalPrice") as string;
  const originalPrice =
    originalPriceRaw && !Number.isNaN(parseFloat(originalPriceRaw))
      ? parseFloat(originalPriceRaw)
      : null;

  const featured =
    formData.get("featured") === "on" || formData.get("featured") === "true";

  const aiSummary = ((formData.get("aiSummary") as string) || "").trim() || null;
  const aiPros = parseStringArrayField(formData.get("aiPros") as string | null);
  const aiCons = parseStringArrayField(formData.get("aiCons") as string | null);

  const mlCategoryId =
    ((formData.get("mlCategoryId") as string) || "").trim() || null;

  const affiliateUrl = rawAffiliateUrl
    ? rawAffiliateUrl
    : originalUrl
      ? buildAffiliateUrl(originalUrl)
      : "https://www.mercadolivre.com.br";

  let discountPercent: number | null = null;
  if (originalPrice && originalPrice > price && price > 0) {
    discountPercent = Math.round(
      ((originalPrice - price) / originalPrice) * 100
    );
  }

  const slug = generateSlug(title);

  return {
    title,
    slug,
    brand,
    categoryName,
    description,
    plainDescription,
    price,
    originalPrice,
    discountPercent,
    costPrice,
    profitMargin,
    mlFeePercent,
    listingType,
    mlCategoryId,
    originalUrl: originalUrl || "https://www.mercadolivre.com.br",
    affiliateUrl,
    featured,
    aiSummary,
    aiPros,
    aiCons,
    mediaUrls: mainImageUrl ? [{ url: mainImageUrl, type: "image" }] : [],
  };
}

/**
 * Server Action: Analisar e extrair dados de produto do Mercado Livre com IA
 */
export async function analyzeMercadoLivreProduct(url: string) {
  if (!url) {
    return { success: false, error: "URL inválida" };
  }

  try {
    const scraped = await scrapeMercadoLivreProduct(url);
    if (!scraped || !scraped.title) {
      return {
        success: false,
        error:
          "Não foi possível extrair dados automaticamente deste link. Você pode preencher manualmente.",
      };
    }

    // Enriquecimento com IA (Google Gemini)
    const aiResult = await enrichProductWithAI(
      scraped.title,
      scraped.description
    );

    // Constrói o link de afiliado pré-configurado
    const affiliateUrl = buildAffiliateUrl(url);

    return {
      success: true,
      data: {
        title: scraped.title,
        description: scraped.description,
        imageUrl: scraped.imageUrl,
        price: scraped.price || null,
        brand: scraped.brand || "",
        originalUrl: url,
        affiliateUrl,
        aiSummary: aiResult.summary,
        aiPros: aiResult.pros,
        aiCons: aiResult.cons,
        optimizedMlTitle: aiResult.optimizedMlTitle,
        plainDescription: aiResult.plainDescription,
      },
    };
  } catch (error) {
    console.error("Erro na ação analyzeMercadoLivreProduct:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao processar o link com IA.",
    };
  }
}

/**
 * Server Action: Criar um novo produto no banco de dados como rascunho (DRAFT)
 */
export async function createProduct(formData: FormData) {
  const fields = extractProductFieldsFromFormData(formData);

  await prisma.product.create({
    data: {
      ...fields,
      syncStatus: "DRAFT",
      status: "AVAILABLE",
    },
  });

  revalidatePath("/");
  revalidatePath("/vitrine");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventory");

  redirect("/dashboard/inventory");
}

/**
 * Server Action: Salvar produto no banco e publicar imediatamente no Mercado Livre
 */
export async function saveAndPublishToMlAction(
  formData: FormData
): Promise<ActionPublishResponse> {
  try {
    const fields = extractProductFieldsFromFormData(formData);

    const product = await prisma.product.create({
      data: {
        ...fields,
        syncStatus: "DRAFT",
        status: "AVAILABLE",
      },
    });

    const userId = await resolveActiveUserId();
    if (!userId) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/inventory");
      return {
        success: false,
        productId: product.id,
        error:
          "Produto salvo como rascunho, mas nenhum usuário autenticado foi encontrado para publicar no Mercado Livre.",
      };
    }

    const publishRes = await publishProductToMl(product.id, userId);

    revalidatePath("/");
    revalidatePath("/vitrine");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");

    if (!publishRes.success) {
      return {
        success: false,
        productId: product.id,
        error: publishRes.error || "Falha ao publicar no Mercado Livre.",
      };
    }

    return {
      success: true,
      productId: product.id,
      mlItemId: publishRes.mlItemId,
      mlPermalink: publishRes.mlPermalink,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao salvar e publicar produto.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Publicar com 1 clique um produto já existente (DRAFT ou ERROR)
 */
export async function publishExistingProductAction(
  productId: string
): Promise<ActionPublishResponse> {
  if (!productId) {
    return { success: false, error: "ID do produto não informado." };
  }

  try {
    const userId = await resolveActiveUserId();
    if (!userId) {
      return {
        success: false,
        error: "Sessão expirada ou nenhuma conta conectada encontrada.",
      };
    }

    const publishRes = await publishProductToMl(productId, userId);

    revalidatePath("/");
    revalidatePath("/vitrine");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inventory");

    if (!publishRes.success) {
      return {
        success: false,
        productId,
        error: publishRes.error || "Falha ao publicar no Mercado Livre.",
      };
    }

    return {
      success: true,
      productId,
      mlItemId: publishRes.mlItemId,
      mlPermalink: publishRes.mlPermalink,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao publicar produto no Mercado Livre.";
    return {
      success: false,
      productId,
      error: message,
    };
  }
}

/**
 * Server Action: Deletar produto
 */
export async function deleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId },
  });

  revalidatePath("/");
  revalidatePath("/vitrine");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/inventory");
}
