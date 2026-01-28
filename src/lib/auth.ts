import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const SESSION_COOKIE = "gymbro_session";

const jwtSecret = new TextEncoder().encode(env.AUTH_JWT_SECRET);

export type SessionPayload = {
  userId: string;
  telegramId: number;
  username?: string | null;
};

export const createSessionToken = async (payload: SessionPayload) =>
  new SignJWT({
    userId: payload.userId,
    telegramId: payload.telegramId,
    username: payload.username ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);

export const verifySessionToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, jwtSecret);
    return {
      userId: payload.userId as string,
      telegramId: payload.telegramId as number,
      username: (payload.username as string | null) ?? null,
    } satisfies SessionPayload;
  } catch {
    return null;
  }
};

export const getSessionFromRequest = async (request: NextRequest) => {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
};

export const getSessionFromCookies = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
};
