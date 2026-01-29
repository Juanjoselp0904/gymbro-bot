"use client";

import { useEffect, useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LastWorkoutExercise = {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
};

type StatsResponse = {
  userName: string;
  daysTrainedThisMonth: number;
  trainingDaysThisMonth: string[];
  lastWorkoutExercises: LastWorkoutExercise[];
  lastWorkoutDate: string | null;
};

const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"];

const CalendarGrid = ({ trainingDays }: { trainingDays: string[] }) => {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const trainingSet = useMemo(() => new Set(trainingDays), [trainingDays]);
  const firstDayOffset = (getDay(monthStart) + 6) % 7;
  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(monthStart);

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold capitalize text-[#0A2540]">
        {monthLabel}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#2B6B8A]">
        {weekdayLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <span key={`pad-${index}`} className="h-6 w-6" />
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const trained = trainingSet.has(key);
          return (
            <span
              key={key}
              title={format(day, "d MMM")}
              className={[
                "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold transition ring-offset-2",
                trained ? "bg-[#2B6B8A]" : "bg-[#D4E8F2]",
                trained ? "text-white" : "text-[#2B6B8A]",
                "hover:ring-2 hover:ring-[#6BA3BE]",
              ].join(" ")}
            >
              {format(day, "d")}
            </span>
          );
        })}
      </div>
    </div>
  );
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
    return <p className="text-[#2B6B8A]">Cargando resumen...</p>;
  }

  if (!stats) {
    return <p className="text-[#2B6B8A]">No hay datos disponibles.</p>;
  }

  const lastWorkoutDateLabel = stats.lastWorkoutDate
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
        new Date(stats.lastWorkoutDate)
      )
    : "Sin registros";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white/70 px-6 py-5 shadow-xl backdrop-blur">
        <p className="text-sm font-medium text-[#2B6B8A]">
          Resumen de actividad
        </p>
        <h2 className="text-2xl font-semibold text-[#0A2540]">
          Hola, {stats.userName}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
        <Card className="border border-white/70 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-semibold text-[#2B6B8A]">
              Días entrenados este mes
            </CardTitle>
            <p className="text-xs text-[#6BA3BE]">Consistencia mensual</p>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold text-[#0A2540]">
              {stats.daysTrainedThisMonth}
            </div>
            <p className="text-sm text-[#2B6B8A]">días activos</p>
          </CardContent>
        </Card>

        <Card className="border border-white/70 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-semibold text-[#2B6B8A]">
              Calendario de actividad
            </CardTitle>
            <p className="text-xs text-[#6BA3BE]">Tus sesiones del mes</p>
          </CardHeader>
          <CardContent>
            <CalendarGrid trainingDays={stats.trainingDaysThisMonth} />
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/70 bg-white/85 shadow-xl backdrop-blur">
        <CardHeader className="space-y-1">
          <CardTitle className="text-sm font-semibold text-[#2B6B8A]">
            Último entrenamiento · {lastWorkoutDateLabel}
          </CardTitle>
          <p className="text-xs text-[#6BA3BE]">
            Detalle completo de tu última sesión
          </p>
        </CardHeader>
        <CardContent>
          {stats.lastWorkoutExercises.length === 0 ? (
            <p className="text-sm text-[#2B6B8A]">Sin registros recientes.</p>
          ) : (
            <div className="space-y-2">
              {stats.lastWorkoutExercises.map((exercise, index) => (
                <div
                  key={`${exercise.exerciseName}-${index}`}
                  className="flex flex-wrap items-center justify-between rounded-2xl border border-[#D4E8F2] bg-[#F2F8FB] px-4 py-3 text-sm text-[#0A2540] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="font-semibold text-[#0A2540]">
                    {exercise.exerciseName}
                  </span>
                  <span className="text-[#2B6B8A]">
                    {exercise.sets}x{exercise.reps} · {exercise.weightKg} kg
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
