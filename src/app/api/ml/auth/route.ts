import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getMlAuthorizationUrl } from "@/lib/services/ml-auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const authUrl = getMlAuthorizationUrl(session.user.id);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao iniciar OAuth ML";
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("ml_error", message);
    return NextResponse.redirect(dashboardUrl);
  }
}
