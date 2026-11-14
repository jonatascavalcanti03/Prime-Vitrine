import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_FALLBACK_PRODUCTS } from "@/lib/data/demo-products";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    let destinationUrl = "";
    let productId: string | null = null;

    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          affiliateUrl: true,
          originalUrl: true,
          mlPermalink: true,
        },
      });

      if (product) {
        productId = product.id;
        destinationUrl =
          product.mlPermalink || product.affiliateUrl || product.originalUrl;
      }
    } catch {
      // Banco indisponível na nuvem: prossegue para o fallback de demonstração
    }

    if (!destinationUrl) {
      const demo = DEMO_FALLBACK_PRODUCTS.find((item) => item.slug === slug);
      if (demo) {
        destinationUrl = demo.affiliateUrl || demo.originalUrl;
      }
    }

    if (!destinationUrl) {
      return NextResponse.redirect(new URL("/vitrine", request.url));
    }

    // Registra clique no analytics em background se veio do banco
    if (productId) {
      const userAgent =
        request.headers.get("user-agent")?.substring(0, 500) || null;
      const referrer =
        request.headers.get("referer")?.substring(0, 500) || null;
      const isBot = userAgent && /bot|crawler|spider|crawling/i.test(userAgent);

      if (!isBot) {
        prisma
          .$transaction([
            prisma.product.update({
              where: { id: productId },
              data: { clicksCount: { increment: 1 } },
            }),
            prisma.clickAnalytics.create({
              data: {
                productId,
                userAgent,
                referrer,
              },
            }),
          ])
          .catch(() => null);
      }
    }

    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error("Erro no redirecionamento de afiliado:", error);
    return NextResponse.redirect(new URL("/vitrine", request.url));
  }
}
