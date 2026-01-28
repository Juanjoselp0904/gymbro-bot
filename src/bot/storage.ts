import { supabaseAdmin } from "@/lib/supabase/admin";
import { upsertTelegramUser, type TelegramProfile } from "@/lib/users";

export type WorkoutRow = {
  id: string;
  exercise_name: string;
  reps: number;
  sets: number;
  weight_kg: number;
  workout_date: string;
};

export const ensureUser = async (user: TelegramProfile): Promise<string> =>
  upsertTelegramUser(user);

export const createWorkout = async (
  userId: string,
  workout: {
    exercise_name: string;
    reps: number;
    sets: number;
    weight_kg: number;
  }
) => {
  const { error } = await supabaseAdmin.from("workouts").insert({
    user_id: userId,
    ...workout,
  });

  if (error) {
    throw error;
  }
};

export const getRecentWorkouts = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("id, exercise_name, reps, sets, weight_kg, workout_date")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return data ?? [];
};

export const getWorkoutStats = async (userId: string) => {
  const { count, error: countError } = await supabaseAdmin
    .from("workouts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) {
    throw countError;
  }

  const { data, error } = await supabaseAdmin
    .from("workouts")
    .select("sets, reps, weight_kg")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const totalVolume =
    data?.reduce(
      (sum, row) => sum + row.sets * row.reps * Number(row.weight_kg),
      0
    ) ?? 0;

  return {
    totalWorkouts: count ?? 0,
    totalVolume,
  };
};
