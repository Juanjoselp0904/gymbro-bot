"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsResponse = {
  totalWorkouts: number;
  totalVolume: number;
  workoutsThisMonth: number;
  streakDays: number;
  lastWorkout:
    | { exercises: { name: string } | null; workout_date: string }
    | null;
};

export const DashboardOverview = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/stats", {
          credentials: "include",
        });
        if (!response.ok) {
          console.error("Failed to load stats", response.status);
          setStats(null);
          return;
        }

        const text = await response.text();
        if (!text) {
          setStats(null);
          return;
        }

        const json = JSON.parse(text);
        setStats(json.data ?? null);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <p className="text-slate-400">Cargando estadísticas...</p>;
  }

  if (!stats) {
    return <p className="text-slate-400">No hay datos disponibles.</p>;
  }

  const lastWorkoutDate = stats.lastWorkout
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
        new Date(stats.lastWorkout.workout_date)
      )
    : "Sin registros";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">
              Entrenamientos totales
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.totalWorkouts}
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">
              Volumen total (kg)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {Math.round(stats.totalVolume)}
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">
              Entrenamientos este mes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.workoutsThisMonth}
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">Racha</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {stats.streakDays} días
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">
              Último entrenamiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {stats.lastWorkout?.exercises?.name ?? "Sin registros"}
            </p>
            <p className="text-sm text-slate-400">{lastWorkoutDate}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-sm text-slate-300">
              Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-200">
            {stats.streakDays >= 3 ? (
              <p>🔥 Mantienes una racha de {stats.streakDays} días.</p>
            ) : (
              <p>⚠️ Aumenta tu racha entrenando hoy.</p>
            )}
            {stats.workoutsThisMonth >= 8 ? (
              <p>🎯 Excelente consistencia este mes.</p>
            ) : (
              <p>📈 Aún puedes sumar más sesiones este mes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
