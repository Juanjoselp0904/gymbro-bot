import type { Context } from "telegraf";

export type WorkoutDraft = {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
};

export type SessionData = {
  workout?: Partial<WorkoutDraft>;
};

export type BotContext = Context & {
  session: SessionData;
};
