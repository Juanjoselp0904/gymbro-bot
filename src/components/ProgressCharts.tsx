"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Workout = {
  exercise_name: string;
  reps: number;
  sets: number;
  weight_kg: number;
  workout_date: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-ES", { dateStyle: "short" }).format(
    new Date(value)
  );

const formatTooltipLabel = (label: any) => {
  if (typeof label === "string") {
    return formatDate(label);
  }
  return String(label);
};

export const ProgressCharts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/workouts?limit=500");
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

  const volumeByDate = useMemo(() => {
    const map = new Map<string, number>();
    workouts.forEach((workout) => {
      const key = new Date(workout.workout_date).toISOString().slice(0, 10);
      const volume = workout.sets * workout.reps * Number(workout.weight_kg);
      map.set(key, (map.get(key) ?? 0) + volume);
    });

    return Array.from(map.entries())
      .map(([date, volume]) => ({ date, volume }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [workouts]);

  const volumeByExercise = useMemo(() => {
    const map = new Map<string, number>();
    workouts.forEach((workout) => {
      const volume = workout.sets * workout.reps * Number(workout.weight_kg);
      map.set(workout.exercise_name, (map.get(workout.exercise_name) ?? 0) + volume);
    });

    return Array.from(map.entries())
      .map(([exercise, volume]) => ({ exercise, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 6);
  }, [workouts]);

  if (loading) {
    return <p className="text-slate-400">Cargando gráficas...</p>;
  }

  if (!workouts.length) {
    return <p className="text-slate-400">Aún no hay datos para graficar.</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-sm text-slate-300">
            Volumen total por día
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeByDate}>
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${Math.round(value as number)} kg`, "Volumen"]}
                labelFormatter={formatTooltipLabel}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-sm text-slate-300">
            Volumen por ejercicio (top 6)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeByExercise}>
              <XAxis dataKey="exercise" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${Math.round(value as number)} kg`, "Volumen"]}
              />
              <Bar dataKey="volume" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
