"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildAffiliateUrl } from "@/lib/services/affiliate";
import { scrapeMercadoLivreProduct } from "@/lib/services/scraper";
import { enrichProductWithAI } from "@/lib/services/ai";

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
        error: "Não foi possível extrair dados automaticamente deste link. Você pode preencher manualmente.",
      };
    }

    // Enriquecimento com IA (Google Gemini)
    const aiResult = await enrichProductWithAI(scraped.title, scraped.description);

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
 * Server Action: Criar um novo produto de afiliado no banco de dados
 */
export async function createProduct(formData: FormData) {
  const title = formData.get("title") as string;
  const brand = (formData.get("brand") as string) || null;
  const categoryName = (formData.get("category") as string) || "Geral";
  const description = (formData.get("description") as string) || "";
  const originalUrl = formData.get("originalUrl") as string;
  const rawAffiliateUrl = formData.get("affiliateUrl") as string;
  const mainImageUrl = formData.get("mainImageUrl") as string;

  const price = parseFloat(formData.get("price") as string) || 0;
  const originalPriceRaw = formData.get("originalPrice") as string;
  const originalPrice = originalPriceRaw ? parseFloat(originalPriceRaw) : null;
  const featured = formData.get("featured") === "on";

  const aiSummary = (formData.get("aiSummary") as string) || null;
  const aiProsRaw = (formData.get("aiPros") as string) || null;
  const aiConsRaw = (formData.get("aiCons") as string) || null;

  let aiPros: string[] = [];
  let aiCons: string[] = [];

  try {
    if (aiProsRaw) aiPros = JSON.parse(aiProsRaw);
  } catch {
    if (aiProsRaw) aiPros = aiProsRaw.split("\n").filter(Boolean);
  }

  try {
    if (aiConsRaw) aiCons = JSON.parse(aiConsRaw);
  } catch {
    if (aiConsRaw) aiCons = aiConsRaw.split("\n").filter(Boolean);
  }

  // Gera o link de afiliado final caso não tenha sido preenchido
  const affiliateUrl = rawAffiliateUrl ? rawAffiliateUrl.trim() : buildAffiliateUrl(originalUrl);

  // Calcula desconto percentual se houver preço original
  let discountPercent: number | null = null;
  if (originalPrice && originalPrice > price) {
    discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  // Gera Slug URL amigável
  const cleanTitle = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const slug = `${cleanTitle}-${Math.random().toString(36).substring(2, 7)}`;

  // Salvar no Banco
  await prisma.product.create({
    data: {
      title,
      slug,
      brand,
      categoryName,
      description,
      price,
      originalPrice,
      discountPercent,
      originalUrl,
      affiliateUrl,
      featured,
      aiSummary,
      aiPros,
      aiCons,
      mediaUrls: mainImageUrl ? [{ url: mainImageUrl, type: "image" }] : [],
      status: "AVAILABLE",
    },
  });

  // Revalidar cache das páginas públicas
  revalidatePath("/");
  revalidatePath("/vitrine");
  revalidatePath("/dashboard/inventory");

  // Redirecionar para o painel de produtos
  redirect("/dashboard/inventory");
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
  revalidatePath("/dashboard/inventory");
}
