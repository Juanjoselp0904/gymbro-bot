import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const WorkoutCreateSchema = z.object({
  exercise_name: z.string().min(1),
  reps: z.number().int().positive(),
  sets: z.number().int().positive(),
  weight_kg: z.number().positive(),
  workout_date: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const GET = async (request: Request) => {
  const session = await getSessionFromRequest(request as any);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "50");
  const exercise = searchParams.get("exercise");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabaseAdmin
    .from("workouts")
    .select(
      "id, exercise_name, reps, sets, weight_kg, notes, workout_date, created_at"
    )
    .eq("user_id", session.userId)
    .order("workout_date", { ascending: false })
    .limit(Number.isFinite(limit) ? limit : 50);

  if (exercise) {
    query = query.eq("exercise_name", exercise);
  }

  if (from) {
    query = query.gte("workout_date", from);
  }

  if (to) {
    query = query.lte("workout_date", to);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch workouts", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data: data ?? [] });
};

export const POST = async (request: Request) => {
  const session = await getSessionFromRequest(request as any);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = WorkoutCreateSchema.parse(body);

    const { error } = await supabaseAdmin.from("workouts").insert({
      user_id: session.userId,
      ...parsed,
    });

    if (error) {
      console.error("Failed to insert workout", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invalid workout payload", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};
