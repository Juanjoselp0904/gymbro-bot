import { NextResponse } from "next/server";

import { getBot } from "@/bot";

export const runtime = "nodejs";

export const POST = async (request: Request) => {
  try {
    const update = await request.json();
    const bot = getBot();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
};
