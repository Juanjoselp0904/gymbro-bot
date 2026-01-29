import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  code: string;
};

const isExpired = (expiresAt: string | null) => {
  if (!expiresAt) {
    return false;
  }
  return new Date(expiresAt).getTime() < Date.now();
};

export const GET = async (
  request: NextRequest,
  context: { params: Promise<Params> }
) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { code } = await context.params;
  if (!code) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: invite, error } = await supabaseAdmin
    .from("invite_codes")
    .select("id, user_id, expires_at, used_by")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("Failed to load invite code", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (!invite) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (invite.used_by) {
    return NextResponse.json({ ok: false, reason: "used" }, { status: 409 });
  }

  if (isExpired(invite.expires_at)) {
    return NextResponse.json({ ok: false, reason: "expired" }, { status: 410 });
  }

  if (invite.user_id === session.userId) {
    return NextResponse.json({ ok: false, reason: "self" }, { status: 400 });
  }

  const acceptedAt = new Date().toISOString();
  const { error: rivalryError } = await supabaseAdmin
    .from("rivalries")
    .upsert(
      [
        {
          user_id: invite.user_id,
          rival_id: session.userId,
          status: "accepted",
          accepted_at: acceptedAt,
        },
        {
          user_id: session.userId,
          rival_id: invite.user_id,
          status: "accepted",
          accepted_at: acceptedAt,
        },
      ],
      { onConflict: "user_id,rival_id" }
    );

  if (rivalryError) {
    console.error("Failed to create rivalry", rivalryError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("invite_codes")
    .update({ used_by: session.userId })
    .eq("id", invite.id);

  if (updateError) {
    console.error("Failed to update invite code", updateError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
