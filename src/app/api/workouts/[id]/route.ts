import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const WorkoutUpdateSchema = z
  .object({
    exercise_name: z.string().min(1).optional(),
    reps: z.number().int().positive().optional(),
    sets: z.number().int().positive().optional(),
    weight_kg: z.number().positive().optional(),
    workout_date: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No update fields provided",
  });

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getSessionFromRequest(request as any);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = WorkoutUpdateSchema.parse(body);

    const { error } = await supabaseAdmin
      .from("workouts")
      .update(parsed)
      .eq("id", id)
      .eq("user_id", session.userId);

    if (error) {
      console.error("Failed to update workout", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invalid update payload", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getSessionFromRequest(request as any);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);

  if (error) {
    console.error("Failed to delete workout", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
};
