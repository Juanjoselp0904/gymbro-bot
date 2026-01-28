import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { env } from "@/lib/env";
import { upsertTelegramUser } from "@/lib/users";

const TelegramAuthSchema = z.object({
  id: z.coerce.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.coerce.number(),
  hash: z.string(),
});

const verifyTelegramAuth = (data: z.infer<typeof TelegramAuthSchema>) => {
  const { hash, ...rest } = data;
  const secret = crypto
    .createHash("sha256")
    .update(env.TELEGRAM_AUTH_TOKEN)
    .digest();

  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${String(rest[key as keyof typeof rest])}`)
    .join("\n");

  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  return computedHash === hash;
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = TelegramAuthSchema.parse(body);

    const ageSeconds = Math.abs(Date.now() / 1000 - parsed.auth_date);
    if (ageSeconds > 60 * 60 * 24) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    if (!verifyTelegramAuth(parsed)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const userId = await upsertTelegramUser(parsed);
    const token = await createSessionToken({
      userId,
      telegramId: parsed.id,
      username: parsed.username ?? null,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Telegram auth error", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};
