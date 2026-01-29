import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const GET = async () => {
  const { data, error } = await supabaseAdmin
    .from("exercises")
    .select("id, name, category")
    .order("name");

  if (error) {
    console.error("Failed to fetch exercises", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
};
