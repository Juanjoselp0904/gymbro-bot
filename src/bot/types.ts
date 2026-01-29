import type { Context } from "telegraf";

export type WorkoutDraft = {
  exerciseId?: string;
  exerciseName?: string;
  exerciseConfidence?: "high" | "medium" | "low";
  sets?: number;
  reps?: number;
  weightKg?: number;
  workoutDate?: string;
  pendingConfirmation?: boolean;
};

export type SessionData = {
  workout?: WorkoutDraft;
};

export type BotContext = Context & {
  session: SessionData;
};
