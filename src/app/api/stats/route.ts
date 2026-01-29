import { startOfDay, startOfMonth } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data: workouts, error } = await supabaseAdmin
    .from("workouts")
    .select("workout_date, sets, reps, weight_kg, exercises:exercise_id (name)")
    .eq("user_id", session.userId)
    .order("workout_date", { ascending: false });

  if (error) {
    console.error("Failed to load stats", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const safeWorkouts = workouts ?? [];
  const lastWorkoutDate = safeWorkouts[0]?.workout_date ?? null;
  const lastWorkoutDayKey = lastWorkoutDate
    ? startOfDay(new Date(lastWorkoutDate)).toISOString().slice(0, 10)
    : null;
  const lastWorkoutExercises = lastWorkoutDayKey
    ? safeWorkouts
        .filter(
          (row) =>
            startOfDay(new Date(row.workout_date)).toISOString().slice(0, 10) ===
            lastWorkoutDayKey
        )
        .map((row) => ({
          exerciseName: (row.exercises as { name: string } | null)?.name ?? "Sin nombre",
          sets: row.sets,
          reps: row.reps,
          weightKg: Number(row.weight_kg),
        }))
    : [];

  const monthStart = startOfMonth(new Date());
  const trainingDaysThisMonth = Array.from(
    new Set(
      safeWorkouts
        .filter((row) => new Date(row.workout_date) >= monthStart)
        .map((row) =>
          startOfDay(new Date(row.workout_date)).toISOString().slice(0, 10)
        )
    )
  ).sort();

  const { data: userProfile } = await supabaseAdmin
    .from("users")
    .select("first_name, photo_url")
    .eq("id", session.userId)
    .maybeSingle();

  const userName = userProfile?.first_name ?? session.username ?? "amigo";

  return NextResponse.json({
    ok: true,
    data: {
      userName,
      userPhotoUrl: userProfile?.photo_url ?? null,
      daysTrainedThisMonth: trainingDaysThisMonth.length,
      trainingDaysThisMonth,
      lastWorkoutExercises,
      lastWorkoutDate,
    },
  });
};
