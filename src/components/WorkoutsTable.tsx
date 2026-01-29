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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Workout = {
  id: string;
  exercises?: {
    id: string;
    name: string;
  } | null;
  reps: number;
  sets: number;
  weight_kg: number;
  notes?: string | null;
  workout_date: string;
};

type ExerciseOption = {
  id: string;
  name: string;
  category?: string | null;
};

export const WorkoutsTable = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [form, setForm] = useState({
    exercise_id: "",
    sets: "",
    reps: "",
    weight_kg: "",
    workout_date: "",
    notes: "",
  });

  useEffect(() => {
    const loadWorkouts = async () => {
      const response = await fetch("/api/workouts?limit=200", {
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to load workouts", response.status);
        return [];
      }

      const text = await response.text();
      if (!text) {
        return [];
      }

      const json = JSON.parse(text);
      return json.data ?? [];
    };

    const loadExercises = async () => {
      const response = await fetch("/api/exercises", {
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Failed to load exercises", response.status);
        return [];
      }

      const text = await response.text();
      if (!text) {
        return [];
      }

      const json = JSON.parse(text);
      return json.data ?? [];
    };

    const loadData = async () => {
      try {
        const [workoutsData, exercisesData] = await Promise.all([
          loadWorkouts(),
          loadExercises(),
        ]);
        setWorkouts(workoutsData);
        setExercises(exercisesData);
      } catch (error) {
        console.error("Failed to load workouts data", error);
        setWorkouts([]);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openEditor = (workout: Workout) => {
    setEditing(workout);
    setForm({
      exercise_id: workout.exercises?.id ?? "",
      sets: String(workout.sets),
      reps: String(workout.reps),
      weight_kg: String(workout.weight_kg),
      workout_date: workout.workout_date.slice(0, 10),
      notes: workout.notes ?? "",
    });
  };

  const saveChanges = async () => {
    if (!editing) {
      return;
    }

    const payload = {
      exercise_id: form.exercise_id || undefined,
      sets: Number(form.sets),
      reps: Number(form.reps),
      weight_kg: Number(form.weight_kg),
      workout_date: form.workout_date
        ? new Date(form.workout_date).toISOString()
        : undefined,
      notes: form.notes.trim() || undefined,
    };

    const response = await fetch(`/api/workouts/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Failed to update workout");
      return;
    }

    setWorkouts((prev) =>
      prev.map((item) =>
        item.id === editing.id
          ? {
              ...item,
              exercises: payload.exercise_id
                ? exercises.find((exercise) => exercise.id === payload.exercise_id) ??
                  item.exercises
                : item.exercises,
              sets: payload.sets,
              reps: payload.reps,
              weight_kg: payload.weight_kg,
              workout_date: payload.workout_date ?? item.workout_date,
              notes: payload.notes ?? null,
            }
          : item
      )
    );
    setEditing(null);
  };

  const deleteWorkout = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este entrenamiento?")) {
      return;
    }

    const response = await fetch(`/api/workouts/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      console.error("Failed to delete workout");
      return;
    }

    setWorkouts((prev) => prev.filter((item) => item.id !== id));
  };

  const filtered = useMemo(() => {
    if (!filter) {
      return workouts;
    }
    const lower = filter.toLowerCase();
    return workouts.filter((workout) =>
      (workout.exercises?.name ?? "sin nombre").toLowerCase().includes(lower)
    );
  }, [filter, workouts]);

  if (loading) {
    return <p className="text-slate-400">Cargando entrenamientos...</p>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtra por ejercicio..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm bg-slate-900 text-white"
      />

      <div className="rounded-xl border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ejercicio</TableHead>
              <TableHead>Series</TableHead>
              <TableHead>Reps</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-400">
                  No hay entrenamientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell className="font-medium">
                    {workout.exercises?.name ?? "Sin nombre"}
                  </TableCell>
                  <TableCell>{workout.sets}</TableCell>
                  <TableCell>{workout.reps}</TableCell>
                  <TableCell>{workout.weight_kg} kg</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("es-ES", {
                      dateStyle: "medium",
                    }).format(new Date(workout.workout_date))}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditor(workout)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWorkout(workout.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="bg-slate-950 text-white">
          <DialogHeader>
            <DialogTitle>Editar entrenamiento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Select
              value={form.exercise_id}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  exercise_id: value,
                }))
              }
            >
              <SelectTrigger className="w-full bg-slate-900 text-white">
                <SelectValue placeholder="Selecciona un ejercicio" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-white">
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                type="number"
                value={form.sets}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sets: event.target.value }))
                }
                placeholder="Series"
              />
              <Input
                type="number"
                value={form.reps}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reps: event.target.value }))
                }
                placeholder="Reps"
              />
              <Input
                type="number"
                value={form.weight_kg}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    weight_kg: event.target.value,
                  }))
                }
                placeholder="Peso (kg)"
              />
            </div>
            <Input
              type="date"
              value={form.workout_date}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  workout_date: event.target.value,
                }))
              }
            />
            <Input
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Notas"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={saveChanges}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
