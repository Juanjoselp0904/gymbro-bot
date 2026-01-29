import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawUsername = searchParams.get("username") ?? "";
  const normalized = rawUsername.replace(/^@/, "").trim();

  if (!normalized) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("id, username, first_name, photo_url")
    .ilike("username", `%${normalized}%`)
    .neq("id", session.userId)
    .limit(10);

  if (error) {
    console.error("Failed to search users", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const results = (users ?? []).map((user) => ({
    id: user.id,
    username: user.username ?? null,
    name: user.first_name ?? user.username ?? "Usuario",
    photoUrl: user.photo_url ?? null,
  }));

  return NextResponse.json({ ok: true, data: { users: results } });
};
