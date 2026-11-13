import { prisma } from "@/lib/prisma";

const ML_AUTH_BASE_URL = "https://auth.mercadolivre.com.br/authorization";
const ML_TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
const ML_USER_ME_URL = "https://api.mercadolibre.com/users/me";

export interface MlTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MlUserProfile {
  id: number;
  nickname: string;
}

function getMlCredentials() {
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri =
    process.env.ML_REDIRECT_URI || "http://localhost:3000/api/ml/callback";

  if (!clientId || !clientSecret) {
    throw new Error(
      "Credenciais do Mercado Livre (ML_CLIENT_ID / ML_CLIENT_SECRET) não configuradas no ambiente."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

/**
 * Gera a URL de autorização OAuth 2.0 do Mercado Livre Brasil.
 */
export function getMlAuthorizationUrl(state?: string): string {
  const { clientId, redirectUri } = getMlCredentials();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  if (state) {
    params.set("state", state);
  }

  return `${ML_AUTH_BASE_URL}?${params.toString()}`;
}

/**
 * Troca o `code` retornado pelo callback por `access_token` e `refresh_token`,
 * consulta o `nickname` do vendedor e salva/atualiza em `MercadoLivreAccount`.
 */
export async function exchangeCodeForMlToken(code: string, userId: string) {
  const { clientId, clientSecret, redirectUri } = getMlCredentials();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const tokenRes = await fetch(ML_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(
      `Falha ao trocar code por token no Mercado Livre (${tokenRes.status}): ${errText}`
    );
  }

  const tokenData = (await tokenRes.json()) as MlTokenResponse;
  const mlUserId = String(tokenData.user_id);
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  // Busca opcional do nickname da conta no Mercado Livre
  let nickname: string | null = null;
  try {
    const meRes = await fetch(ML_USER_ME_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    if (meRes.ok) {
      const meData = (await meRes.json()) as MlUserProfile;
      nickname = meData.nickname || null;
    }
  } catch {
    // Ignora falha não-crítica ao buscar nickname
  }

  const account = await prisma.mercadoLivreAccount.upsert({
    where: { mlUserId },
    update: {
      userId,
      nickname: nickname ?? undefined,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    },
    create: {
      userId,
      mlUserId,
      nickname,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
    },
  });

  return account;
}

/**
 * Retorna um `access_token` válido para o `userId` informado.
 * Se o token expirar em menos de 10 minutos, realiza o refresh automático.
 */
export async function getValidMlToken(userId: string): Promise<string> {
  const account = await prisma.mercadoLivreAccount.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!account) {
    throw new Error(
      "Nenhuma conta do Mercado Livre conectada para este usuário."
    );
  }

  const TEN_MINUTES_MS = 10 * 60 * 1000;
  const expiresSoon =
    account.expiresAt.getTime() - Date.now() < TEN_MINUTES_MS;

  if (!expiresSoon) {
    return account.accessToken;
  }

  // Realiza o refresh do token
  const { clientId, clientSecret } = getMlCredentials();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: account.refreshToken,
  });

  const refreshRes = await fetch(ML_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!refreshRes.ok) {
    const errText = await refreshRes.text();
    throw new Error(
      `Falha ao renovar token do Mercado Livre (${refreshRes.status}): ${errText}`
    );
  }

  const refreshData = (await refreshRes.json()) as MlTokenResponse;
  const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000);

  const updated = await prisma.mercadoLivreAccount.update({
    where: { id: account.id },
    data: {
      accessToken: refreshData.access_token,
      refreshToken: refreshData.refresh_token,
      expiresAt: newExpiresAt,
    },
  });

  return updated.accessToken;
}
