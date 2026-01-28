"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Workout = {
  id: string;
  exercise_name: string;
  weight_kg: number;
  workout_date: string;
};

type ExerciseRow = {
  exercise: string;
  bestWeight: number;
  lastDate: string;
};

export const ExercisesSummary = () => {
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

  const exercises = useMemo<ExerciseRow[]>(() => {
    const map = new Map<string, ExerciseRow>();
    workouts.forEach((workout) => {
      const existing = map.get(workout.exercise_name);
      const lastDate = existing
        ? new Date(existing.lastDate) > new Date(workout.workout_date)
          ? existing.lastDate
          : workout.workout_date
        : workout.workout_date;
      const bestWeight = Math.max(existing?.bestWeight ?? 0, workout.weight_kg);

      map.set(workout.exercise_name, {
        exercise: workout.exercise_name,
        bestWeight,
        lastDate,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.exercise.localeCompare(b.exercise)
    );
  }, [workouts]);

  if (loading) {
    return <p className="text-slate-400">Cargando ejercicios...</p>;
  }

  return (
    <div className="rounded-xl border border-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ejercicio</TableHead>
            <TableHead>Mejor peso</TableHead>
            <TableHead>Última vez</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-slate-400">
                No hay ejercicios registrados.
              </TableCell>
            </TableRow>
          ) : (
            exercises.map((exercise) => (
              <TableRow key={exercise.exercise}>
                <TableCell className="font-medium">
                  {exercise.exercise}
                </TableCell>
                <TableCell>{exercise.bestWeight} kg</TableCell>
                <TableCell>
                  {new Intl.DateTimeFormat("es-ES", {
                    dateStyle: "medium",
                  }).format(new Date(exercise.lastDate))}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
