import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        affiliateUrl: true,
        originalUrl: true,
      },
    });

    if (!product) {
      return NextResponse.redirect(new URL("/vitrine", request.url));
    }

    const destinationUrl = product.affiliateUrl || product.originalUrl;
    if (!destinationUrl) {
      return NextResponse.redirect(new URL("/vitrine", request.url));
    }

    // Registra clique no analytics em background
    const userAgent = request.headers.get("user-agent")?.substring(0, 500) || null;
    const referrer = request.headers.get("referer")?.substring(0, 500) || null;

    // Detecta bots simples para não inflar métricas
    const isBot = userAgent && /bot|crawler|spider|crawling/i.test(userAgent);

    if (!isBot) {
      prisma.$transaction([
        prisma.product.update({
          where: { id: product.id },
          data: { clicksCount: { increment: 1 } },
        }),
        prisma.clickAnalytics.create({
          data: {
            productId: product.id,
            userAgent,
            referrer,
          },
        }),
      ]).catch((err) => {
        console.error("Erro ao registrar clique de afiliado:", err);
      });
    }

    // Redirecionamento 302 temporário para preservar integridade de SEO
    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error("Erro no redirecionamento de afiliado:", error);
    return NextResponse.redirect(new URL("/vitrine", request.url));
  }
}
