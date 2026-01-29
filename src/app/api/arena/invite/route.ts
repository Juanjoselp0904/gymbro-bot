import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { env } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/admin";

const INVITE_EXPIRATION_DAYS = 7;
const INVITE_CODE_BYTES = 6;
const INVITE_CODE_ATTEMPTS = 5;

const createInviteCode = () =>
  randomBytes(INVITE_CODE_BYTES).toString("base64url");

const buildInviteUrl = (code: string) =>
  `${env.APP_URL}/invite/${code}`;

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRATION_DAYS);

  for (let attempt = 0; attempt < INVITE_CODE_ATTEMPTS; attempt += 1) {
    const code = createInviteCode();
    const { data, error } = await supabaseAdmin
      .from("invite_codes")
      .insert({
        user_id: session.userId,
        code,
        expires_at: expiresAt.toISOString(),
      })
      .select("code")
      .single();

    if (!error && data) {
      return NextResponse.json({
        ok: true,
        data: {
          code: data.code,
          inviteUrl: buildInviteUrl(data.code),
          expiresAt: expiresAt.toISOString(),
        },
      });
    }

    if (error && error.code !== "23505") {
      console.error("Failed to create invite code", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false }, { status: 500 });
};
