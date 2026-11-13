import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exchangeCodeForMlToken } from "@/lib/services/ml-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const dashboardUrl = new URL("/dashboard", request.url);

  if (errorParam) {
    dashboardUrl.searchParams.set("ml_error", errorParam);
    return NextResponse.redirect(dashboardUrl);
  }

  if (!code) {
    dashboardUrl.searchParams.set("ml_error", "missing_code");
    return NextResponse.redirect(dashboardUrl);
  }

  try {
    const session = await auth();
    let userId = session?.user?.id || state;

    // Fallback seguro para o admin principal caso a sessão não venha no cookie de cross-site redirect
    if (!userId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
      });
      userId = adminUser?.id ?? null;
    }

    if (!userId) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    await exchangeCodeForMlToken(code, userId);

    dashboardUrl.searchParams.set("ml", "connected");
    return NextResponse.redirect(dashboardUrl);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha ao autenticar conta do Mercado Livre";
    dashboardUrl.searchParams.set("ml_error", message);
    return NextResponse.redirect(dashboardUrl);
  }
}
