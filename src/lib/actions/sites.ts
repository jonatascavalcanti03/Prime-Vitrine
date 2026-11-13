"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  extractBusinessFromMapsInput,
  type MapsExtractorInput,
} from "@/lib/services/maps-extractor";
import { generateLandingPageWithAI } from "@/lib/services/site-generator-ai";

export interface CreateSiteActionResponse {
  success: boolean;
  slug?: string;
  siteId?: string;
  businessName?: string;
  category?: string;
  city?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  themePalette?: string;
  error?: string;
}

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueSiteSlug(
  businessName: string,
  city: string
): Promise<string> {
  const baseSlug =
    slugifyText(`${businessName}-${city}`) ||
    `site-local-${Math.random().toString(36).substring(2, 7)}`;

  const existing = await prisma.generatedSite.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  });

  if (!existing) {
    return baseSlug;
  }

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${suffix}`;
}

/**
 * Server Action: Extrai dados do Google Maps, gera toda a copy com Gemini
 * e salva a Landing Page pronta na tabela GeneratedSite.
 */
export async function createSiteFromMapsAction(
  input: MapsExtractorInput
): Promise<CreateSiteActionResponse> {
  if (!input.mapsUrl?.trim() && !input.businessName?.trim()) {
    return {
      success: false,
      error:
        "Informe o link do Google Maps ou o nome do estabelecimento para gerar o site.",
    };
  }

  try {
    const extracted = await extractBusinessFromMapsInput(input);
    const aiContent = await generateLandingPageWithAI(extracted);
    const slug = await generateUniqueSiteSlug(
      extracted.businessName,
      extracted.city
    );

    const created = await prisma.generatedSite.create({
      data: {
        slug,
        businessName: extracted.businessName,
        category: extracted.category,
        phone: extracted.phone,
        whatsapp: extracted.whatsapp,
        address: extracted.address,
        city: extracted.city,
        mapsUrl: extracted.mapsUrl,
        rating: extracted.rating,
        reviewsCount: extracted.reviewsCount,
        heroTitle: aiContent.heroTitle,
        heroSubtitle: aiContent.heroSubtitle,
        aboutText: aiContent.aboutText,
        servicesJson: JSON.stringify(aiContent.services),
        benefitsJson: JSON.stringify(aiContent.benefits),
        testimonialsJson: JSON.stringify(aiContent.testimonials),
        faqJson: JSON.stringify(aiContent.faq),
        themePalette: aiContent.themePalette,
        heroImageUrl: aiContent.heroImageUrl,
        galleryJson: JSON.stringify(aiContent.galleryUrls),
        status: "PUBLISHED",
      },
    });

    revalidatePath("/dashboard/sites");

    return {
      success: true,
      slug: created.slug,
      siteId: created.id,
      businessName: created.businessName,
      category: created.category,
      city: created.city ?? undefined,
      heroTitle: created.heroTitle,
      heroSubtitle: created.heroSubtitle,
      themePalette: created.themePalette,
    };
  } catch (error) {
    console.error("Erro em createSiteFromMapsAction:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro inesperado ao gerar Landing Page com IA.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Excluir site gerado
 */
export async function deleteSiteAction(siteId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!siteId) {
    return { success: false, error: "ID do site inválido." };
  }

  try {
    await prisma.generatedSite.delete({
      where: { id: siteId },
    });
    revalidatePath("/dashboard/sites");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao remover site.";
    return { success: false, error: message };
  }
}
