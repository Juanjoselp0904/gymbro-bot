import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "@/lib/env";
import type { WorkoutDraft } from "@/bot/types";

type CoachAgentResult = {
  exerciseId?: string;
  exerciseName?: string;
  exerciseConfidence?: "high" | "medium" | "low";
  weightKg?: number;
  sets?: number;
  reps?: number;
  workoutDate?: string;
  missingFields: Array<"exerciseId" | "weightKg" | "sets" | "reps">;
  reply: string;
};

const SYSTEM_PROMPT = `Eres un asistente de gym que ayuda a trackear entrenamientos.

Tienes acceso a un catálogo de ejercicios:
{EXERCISES_CATALOG}

Tu trabajo es:
1. Identificar qué ejercicio menciona el usuario y mapearlo al catálogo
2. Extraer: peso, series, repeticiones y fecha del entrenamiento si se menciona
3. Si el usuario menciona variaciones (ej: "banco plano", "bench press"), mapéalas al nombre correcto del catálogo
4. Indica tu nivel de confianza en el match:
   - "high": Estás muy seguro del mapeo (ej: "press banca" → "Press banca")
   - "medium": Es probable pero no seguro (ej: "banco" → "Press banca")
   - "low": No estás seguro, requiere confirmación (ej: "press de pecho" → "Press banca"?)

IMPORTANTE:
- Si falta información, pregunta específicamente qué necesitas
- NO registres información incompleta
- Si el ejercicio no existe en el catálogo y no puedes mapearlo, usa confidence "low"

Cuando tengas TODA la información, extrae y registra en este formato:
- Ejercicio: [nombre del catálogo]
- Peso: [kg]
- Series: [número]
- Repeticiones: [número]
- Fecha: [YYYY-MM-DD si el usuario menciona una fecha, de lo contrario null]
La fecha de hoy es {TODAY}.

Devuelve SIEMPRE un JSON con este formato:
{
  "exerciseId": string | null,
  "exerciseName": string | null,
  "exerciseConfidence": "high" | "medium" | "low",
  "weightKg": number | null,
  "sets": number | null,
  "reps": number | null,
  "workoutDate": "YYYY-MM-DD" | null,
  "missingFields": ["exerciseId" | "weightKg" | "sets" | "reps"],
  "reply": string
}`;

const buildPrompt = (message: string, state: Partial<WorkoutDraft>) => {
  const today = new Date().toISOString().slice(0, 10);
  const stateSummary = JSON.stringify(state);
  return [
    {
      role: "user" as const,
      parts: [
        {
          text: `Estado actual: ${stateSummary}\nMensaje del usuario: ${message}`,
        },
      ],
    },
  ];
};

const parseJson = (text: string) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: audioBuffer.toString("base64"),
              mimeType: "audio/ogg",
            },
          },
          {
            text: "Transcribe el audio en texto.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "text/plain",
      temperature: 0.2,
    },
  });

  return result.response.text().trim();
};

export const runCoachAgent = async (
  message: string,
  state: Partial<WorkoutDraft>,
  exercisesCatalog: Array<{ id: string; name: string; category?: string | null }>
): Promise<CoachAgentResult> => {
  const catalog = exercisesCatalog
    .map((exercise) => `- ${exercise.name} (ID: ${exercise.id})`)
    .join("\n");
  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT.replace(
      "{EXERCISES_CATALOG}",
      catalog || "Sin ejercicios disponibles."
    ).replace("{TODAY}", new Date().toDateString()),
  });

  const result = await model.generateContent({
    contents: buildPrompt(message, state),
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const text = result.response.text();
  const json = parseJson(text);

  if (!json || typeof json !== "object") {
    return {
      missingFields: ["exerciseId", "weightKg", "sets", "reps"],
      reply:
        "No pude interpretar tu mensaje. ¿Qué ejercicio, peso, series y repeticiones hiciste?",
    } as CoachAgentResult;
  }

  return {
    exerciseId: typeof json.exerciseId === "string" ? json.exerciseId : undefined,
    exerciseName:
      typeof json.exerciseName === "string" ? json.exerciseName : undefined,
    exerciseConfidence:
      json.exerciseConfidence === "high" ||
      json.exerciseConfidence === "medium" ||
      json.exerciseConfidence === "low"
        ? json.exerciseConfidence
        : undefined,
    weightKg: typeof json.weightKg === "number" ? json.weightKg : undefined,
    sets: typeof json.sets === "number" ? json.sets : undefined,
    reps: typeof json.reps === "number" ? json.reps : undefined,
    workoutDate:
      typeof json.workoutDate === "string" ? json.workoutDate : undefined,
    missingFields: Array.isArray(json.missingFields)
      ? (json.missingFields as Array<"exerciseId" | "weightKg" | "sets" | "reps">)
      : ([] as Array<"exerciseId" | "weightKg" | "sets" | "reps">),
    reply: typeof json.reply === "string" ? json.reply : "",
  };
};
