import { Telegraf, session } from "telegraf";

import { env } from "@/lib/env";
import type { BotContext, WorkoutDraft } from "@/bot/types";
import {
  createWorkout,
  ensureUser,
  getExercises,
  getRecentWorkouts,
  getWorkoutStats,
} from "@/bot/storage";
import { runCoachAgent, transcribeAudio } from "@/lib/gemini";

const formatWorkoutRow = (row: {
  exercise_name: string;
  reps: number;
  sets: number;
  weight_kg: number;
  workout_date: string;
}) => {
  const date = new Date(row.workout_date);
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(date);

  return `• ${row.exercise_name}: ${row.sets}x${row.reps} @ ${row.weight_kg}kg (${formattedDate})`;
};

const REQUIRED_FIELDS: Array<keyof WorkoutDraft> = [
  "exerciseId",
  "weightKg",
  "sets",
  "reps",
];

const getMissingFields = (draft: WorkoutDraft) =>
  REQUIRED_FIELDS.filter((field) => {
    const value = draft[field];
    if (typeof value === "number") {
      return !Number.isFinite(value) || value <= 0;
    }
    return !value;
  });

const buildMissingPrompt = (missing: Array<keyof WorkoutDraft>) => {
  const prompts: Record<keyof WorkoutDraft, string> = {
    exerciseId: "¿Qué ejercicio realizaste?",
    exerciseName: "¿Qué ejercicio realizaste?",
    exerciseConfidence: "",
    weightKg: "¿Cuánto peso levantaste (en kg)?",
    sets: "¿Cuántas series hiciste?",
    reps: "¿Cuántas repeticiones por serie?",
    workoutDate: "",
    pendingConfirmation: "",
  };

  return missing
    .map((field) => prompts[field])
    .filter((prompt) => prompt)
    .join(" ");
};

const normalizeWorkoutDate = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
};

const registerWorkout = async (ctx: BotContext, state: WorkoutDraft) => {
  const telegramUser = ctx.from;
  if (!telegramUser) {
    return ctx.reply("No pude identificar tu usuario.");
  }

  if (!state.exerciseId || !state.sets || !state.reps || !state.weightKg) {
    ctx.session.workout = {};
    return ctx.reply("Falta información. Usa /log de nuevo.");
  }

  const userId = await ensureUser(telegramUser);
  await createWorkout(userId, {
    exercise_id: state.exerciseId,
    sets: state.sets,
    reps: state.reps,
    weight_kg: state.weightKg,
    workout_date: normalizeWorkoutDate(state.workoutDate),
  });

  ctx.session.workout = {};
  return ctx.reply(
    `✅ Registrado:\n- Ejercicio: ${state.exerciseName}\n- Peso: ${state.weightKg} kg\n- Series: ${state.sets}\n- Repeticiones: ${state.reps}`
  );
};

const processWorkoutMessage = async (ctx: BotContext, rawText: string) => {
  const text = rawText.trim();
  if (!text) {
    return ctx.reply("Escríbeme tu entrenamiento para registrarlo.");
  }

  ctx.session.workout = ctx.session.workout ?? {};
  const currentState = ctx.session.workout;

  if (currentState.pendingConfirmation) {
    const affirmative = ["si", "sí", "yes", "ok", "confirmar", "correcto"];
    const normalized = text.toLowerCase();
    if (affirmative.some((word) => normalized.includes(word))) {
      currentState.pendingConfirmation = false;
      currentState.exerciseConfidence = "high";
      ctx.session.workout = currentState;

      const missingFields = getMissingFields(currentState);
      if (missingFields.length === 0) {
        return registerWorkout(ctx, currentState);
      }

      return ctx.reply(buildMissingPrompt(missingFields));
    }

    ctx.session.workout = {};
    return ctx.reply("Registro cancelado. Usa /log para empezar de nuevo.");
  }

  try {
    const exercises = await getExercises();
    const agentResult = await runCoachAgent(text, currentState, exercises);
    const updatedState: WorkoutDraft = {
      ...currentState,
      ...(agentResult.exerciseId ? { exerciseId: agentResult.exerciseId } : {}),
      ...(agentResult.exerciseName
        ? { exerciseName: agentResult.exerciseName }
        : {}),
      ...(agentResult.exerciseConfidence
        ? { exerciseConfidence: agentResult.exerciseConfidence }
        : {}),
      ...(agentResult.weightKg ? { weightKg: agentResult.weightKg } : {}),
      ...(agentResult.sets ? { sets: agentResult.sets } : {}),
      ...(agentResult.reps ? { reps: agentResult.reps } : {}),
      ...(agentResult.workoutDate
        ? { workoutDate: agentResult.workoutDate }
        : {}),
    };

    const missingFields = getMissingFields(updatedState);
    ctx.session.workout = updatedState;

    if (
      updatedState.exerciseConfidence === "low" &&
      updatedState.exerciseName &&
      updatedState.exerciseId &&
      !updatedState.pendingConfirmation
    ) {
      updatedState.pendingConfirmation = true;
      ctx.session.workout = updatedState;
      return ctx.reply(
        `¿Te refieres a "${updatedState.exerciseName}"?\n\nResponde "sí" para confirmar o /cancel para cancelar.`
      );
    }

    if (missingFields.length > 0) {
      const reply = agentResult.reply || buildMissingPrompt(missingFields);
      return ctx.reply(reply);
    }

    return registerWorkout(ctx, updatedState);
  } catch (error) {
    console.error("Gym coach error", error);
    return ctx.reply(
      "Tuve un problema entendiendo tu mensaje. ¿Puedes repetirlo?"
    );
  }
};

const buildBot = () => {
  const bot = new Telegraf<BotContext>(env.TELEGRAM_BOT_TOKEN);

  bot.use(session({ defaultSession: () => ({}) }));

  bot.start(async (ctx) => {
    if (!ctx.from) {
      return ctx.reply("No pude identificar tu usuario.");
    }

    try {
      await ensureUser(ctx.from);
      await ctx.reply(
        "¡Bienvenido a GymBro! Usa /log para registrar un entrenamiento."
      );
    } catch (error) {
      console.error("Failed to register user", error);
      await ctx.reply("No pude registrarte en este momento.");
    }
  });

  bot.command("log", async (ctx) => {
    ctx.session.workout = {};
    return ctx.reply("Cuéntame tu entrenamiento en una frase.");
  });
  bot.command("cancel", (ctx) => {
    ctx.session.workout = {};
    return ctx.reply("Registro cancelado.");
  });

  bot.command("history", async (ctx) => {
    if (!ctx.from) {
      return ctx.reply("No pude identificar tu usuario.");
    }

    try {
      const userId = await ensureUser(ctx.from);
      const workouts = await getRecentWorkouts(userId);
      if (!workouts.length) {
        return ctx.reply("Aún no tienes entrenamientos registrados.");
      }

      const lines = workouts.map(formatWorkoutRow).join("\n");
      return ctx.reply(`Tus últimos entrenamientos:\n${lines}`);
    } catch (error) {
      console.error("Failed to load history", error);
      return ctx.reply("No pude cargar tu historial.");
    }
  });

  bot.command("stats", async (ctx) => {
    if (!ctx.from) {
      return ctx.reply("No pude identificar tu usuario.");
    }

    try {
      const userId = await ensureUser(ctx.from);
      const stats = await getWorkoutStats(userId);
      return ctx.reply(
        `📊 Estadísticas:\n- Entrenamientos: ${stats.totalWorkouts}\n- Volumen total: ${Math.round(
          stats.totalVolume
        )} kg`
      );
    } catch (error) {
      console.error("Failed to load stats", error);
      return ctx.reply("No pude cargar tus estadísticas.");
    }
  });

  bot.command("dashboard", async (ctx) => {
    const dashboardUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard`;
    return ctx.reply(`Abre tu dashboard aquí: ${dashboardUrl}`);
  });

  bot.on("text", async (ctx) => {
    const text = ctx.message.text.trim();
    if (text.startsWith("/")) {
      return;
    }

    return processWorkoutMessage(ctx, text);
  });

  bot.on("voice", async (ctx) => {
    try {
      const fileLink = await ctx.telegram.getFileLink(
        ctx.message.voice.file_id
      );
      const response = await fetch(fileLink.href);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const transcript = await transcribeAudio(audioBuffer);
      if (!transcript) {
        return ctx.reply("No pude entender el audio, intenta de nuevo.");
      }

      return processWorkoutMessage(ctx, transcript);
    } catch (error) {
      console.error("Voice message error", error);
      return ctx.reply("No pude procesar tu audio. ¿Puedes intentar de nuevo?");
    }
  });

  bot.catch((error) => {
    console.error("Telegram bot error", error);
  });

  return bot;
};

let botInstance: Telegraf<BotContext> | null = null;

export const getBot = () => {
  if (!botInstance) {
    botInstance = buildBot();
  }

  return botInstance;
};
