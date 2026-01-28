import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "@/lib/env";
import type { WorkoutDraft } from "@/bot/types";

type CoachAgentResult = {
  exercise?: string;
  weightKg?: number;
  sets?: number;
  reps?: number;
  missingFields: Array<keyof WorkoutDraft>;
  reply: string;
};

const SYSTEM_PROMPT = `Eres un asistente de gym que ayuda a trackear entrenamientos.

IMPORTANTE: Los usuarios pueden darte la información en múltiples mensajes.
- Si te dan información parcial (ej: "levanté 15kg"), pregunta qué falta (ejercicio, series, reps)
- ANTES de registrar, verifica que tengas: ejercicio, peso, series y repeticiones
- Si falta información, pregunta específicamente qué necesitas
- NO registres información incompleta

Cuando tengas TODA la información, extrae y registra en este formato:
- Ejercicio: [nombre]
- Peso: [kg]
- Series: [número]
- Repeticiones: [número]
La fecha de hoy es {TODAY}.

Devuelve SIEMPRE un JSON con este formato:
{
  "exerciseName": string | null,
  "weightKg": number | null,
  "sets": number | null,
  "reps": number | null,
  "missingFields": ["exerciseName" | "weightKg" | "sets" | "reps"],
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
  state: Partial<WorkoutDraft>
): Promise<CoachAgentResult> => {
  const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT.replace("{TODAY}", new Date().toDateString()),
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
      missingFields: ["exerciseName", "weightKg", "sets", "reps"],
      reply:
        "No pude interpretar tu mensaje. ¿Qué ejercicio, peso, series y repeticiones hiciste?",
    } as CoachAgentResult;
  }

  return {
    exercise: typeof json.exerciseName === "string" ? json.exerciseName : undefined,
    weightKg: typeof json.weightKg === "number" ? json.weightKg : undefined,
    sets: typeof json.sets === "number" ? json.sets : undefined,
    reps: typeof json.reps === "number" ? json.reps : undefined,
    missingFields: Array.isArray(json.missingFields)
      ? (json.missingFields as Array<keyof WorkoutDraft>)
      : ([] as Array<keyof WorkoutDraft>),
    reply: typeof json.reply === "string" ? json.reply : "",
  };
};
