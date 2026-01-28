import { startOfDay, startOfMonth, subDays } from "date-fns";
import { NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const GET = async (request: Request) => {
  const session = await getSessionFromRequest(request as any);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("exercise_name, workout_date, sets, reps, weight_kg")
    .eq("user_id", session.userId)
    .order("workout_date", { ascending: false });

  if (error) {
    console.error("Failed to load stats", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const workouts = data ?? [];
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce(
    (sum, row) => sum + row.sets * row.reps * Number(row.weight_kg),
    0
  );

  const lastWorkout = workouts[0]
    ? {
        exercise_name: workouts[0].exercise_name,
        workout_date: workouts[0].workout_date,
      }
    : null;

  const monthStart = startOfMonth(new Date());
  const workoutsThisMonth = workouts.filter(
    (row) => new Date(row.workout_date) >= monthStart
  ).length;

  const workoutDays = new Set(
    workouts.map((row) =>
      startOfDay(new Date(row.workout_date)).toISOString()
    )
  );

  let streakDays = 0;
  let cursor = startOfDay(new Date());
  while (workoutDays.has(cursor.toISOString())) {
    streakDays += 1;
    cursor = startOfDay(subDays(cursor, 1));
  }

  return NextResponse.json({
    ok: true,
    data: {
      totalWorkouts,
      totalVolume,
      workoutsThisMonth,
      streakDays,
      lastWorkout,
    },
  });
};
