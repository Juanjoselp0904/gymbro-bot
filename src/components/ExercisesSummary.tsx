"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Workout = {
  id: string;
  exercises?: {
    id: string;
    name: string;
  } | null;
  weight_kg: number;
  workout_date: string;
};

type ExerciseRow = {
  exercise: string;
  bestWeight: number;
  lastDate: string;
  data: Array<{ date: string; weight: number }>;
};

const formatShortDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));

const formatLongDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
    new Date(value)
  );

const formatTooltipLabel = (label: unknown) => {
  if (typeof label === "string") {
    return formatLongDate(label);
  }
  return String(label);
};

const formatWeight = (value: number) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value);

export const ExercisesSummary = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/workouts?limit=500", {
          credentials: "include",
        });
        if (!response.ok) {
          console.error("Failed to load workouts", response.status);
          setWorkouts([]);
          return;
        }

        const text = await response.text();
        if (!text) {
          setWorkouts([]);
          return;
        }

        const json = JSON.parse(text);
        setWorkouts(json.data ?? []);
      } catch (error) {
        console.error("Failed to load workouts", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const exercises = useMemo<ExerciseRow[]>(() => {
    const map = new Map<
      string,
      {
        exercise: string;
        bestWeight: number;
        lastDate: string;
        pointsByDate: Map<string, number>;
      }
    >();
    workouts.forEach((workout) => {
      const dateKey = new Date(workout.workout_date)
        .toISOString()
        .slice(0, 10);
      const weightValue = Number(workout.weight_kg);
      const exerciseName = workout.exercises?.name ?? "Sin nombre";
      const existing =
        map.get(exerciseName) ??
        ({
          exercise: exerciseName,
          bestWeight: weightValue,
          lastDate: workout.workout_date,
          pointsByDate: new Map<string, number>(),
        } as const);

      existing.bestWeight = Math.max(existing.bestWeight, weightValue);
      existing.lastDate =
        new Date(existing.lastDate) > new Date(workout.workout_date)
          ? existing.lastDate
          : workout.workout_date;

      const dayWeight = existing.pointsByDate.get(dateKey);
      if (dayWeight === undefined || weightValue > dayWeight) {
        existing.pointsByDate.set(dateKey, weightValue);
      }

      map.set(exerciseName, existing);
    });

    return Array.from(map.values())
      .map((exercise) => ({
        exercise: exercise.exercise,
        bestWeight: exercise.bestWeight,
        lastDate: exercise.lastDate,
        data: Array.from(exercise.pointsByDate.entries())
          .map(([date, weight]) => ({ date, weight }))
          .sort((a, b) => (a.date > b.date ? 1 : -1)),
      }))
      .sort((a, b) => a.exercise.localeCompare(b.exercise));
  }, [workouts]);

  if (loading) {
    return <p className="text-slate-400">Cargando ejercicios...</p>;
  }

  if (exercises.length === 0) {
    return <p className="text-slate-400">No hay ejercicios registrados.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {exercises.map((exercise) => (
        <Card
          key={exercise.exercise}
          className="border-slate-800 bg-slate-900 text-white"
        >
          <CardHeader className="gap-1">
            <CardTitle className="text-base">{exercise.exercise}</CardTitle>
            <CardDescription className="text-slate-400">
              Mejor: {formatWeight(exercise.bestWeight)} kg · Última:{" "}
              {formatShortDate(exercise.lastDate)}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exercise.data}>
                <XAxis dataKey="date" tickFormatter={formatShortDate} />
                <YAxis tickFormatter={(value) => `${formatWeight(value)} kg`} />
                <Tooltip
                  formatter={(value) => [
                    `${formatWeight(Number(value))} kg`,
                    "Peso",
                  ]}
                  labelFormatter={formatTooltipLabel}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
