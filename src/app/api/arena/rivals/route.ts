import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

const CORE_EXERCISES = ["Press banca", "Sentadilla", "Peso muerto"];

type MaxLiftRow = {
  weight_kg: number;
  exercises?: { name?: string | null } | null;
};

const buildEmptyMaxes = () =>
  CORE_EXERCISES.reduce<Record<string, number>>((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {});

const getUserMaxLifts = async (userId: string, exerciseIds: string[]) => {
  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("weight_kg, exercises:exercise_id (name)")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds);

  if (error) {
    throw error;
  }

  const maxes = buildEmptyMaxes();
  (data ?? []).forEach((row: MaxLiftRow) => {
    const name = row.exercises?.name ?? null;
    if (!name || !(name in maxes)) {
      return;
    }
    const weight = Number(row.weight_kg);
    if (Number.isFinite(weight) && weight > maxes[name]) {
      maxes[name] = weight;
    }
  });

  return maxes;
};

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data: rivalries, error: rivalriesError } = await supabaseAdmin
    .from("rivalries")
    .select("rival_id")
    .eq("user_id", session.userId)
    .eq("status", "accepted");

  if (rivalriesError) {
    console.error("Failed to load rivalries", rivalriesError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const { data: exercises, error: exercisesError } = await supabaseAdmin
    .from("exercises")
    .select("id, name")
    .in("name", CORE_EXERCISES);

  if (exercisesError) {
    console.error("Failed to load exercises", exercisesError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const exerciseIds = (exercises ?? []).map((row) => row.id);
  if (exerciseIds.length === 0) {
    return NextResponse.json({
      ok: true,
      data: { rivals: [], userMaxLifts: buildEmptyMaxes() },
    });
  }

  const userMaxLifts = await getUserMaxLifts(session.userId, exerciseIds);
  const rivalIds = (rivalries ?? []).map((row) => row.rival_id);
  if (rivalIds.length === 0) {
    return NextResponse.json({ ok: true, data: { rivals: [], userMaxLifts } });
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select("id, first_name, username, photo_url")
    .in("id", rivalIds);

  if (usersError) {
    console.error("Failed to load rival profiles", usersError);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const rivals = await Promise.all(
    (users ?? []).map(async (user) => {
      const maxLifts = await getUserMaxLifts(user.id, exerciseIds);
      const displayName =
        user.first_name ?? user.username ?? "Rival sin nombre";
      return {
        id: user.id,
        name: displayName,
        photoUrl: user.photo_url ?? null,
        maxLifts,
      };
    })
  );

  return NextResponse.json({ ok: true, data: { rivals, userMaxLifts } });
};
