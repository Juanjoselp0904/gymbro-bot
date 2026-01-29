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
    return <p className="text-[#2B6B8A]">Cargando entrenamientos...</p>;
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filtra por ejercicio..."
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="max-w-sm border-[#D4E8F2] bg-white/80 text-[#0A2540] shadow-sm focus-visible:ring-[#6BA3BE]"
      />

      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F2F8FB]">
              <TableHead className="text-[#2B6B8A]">Ejercicio</TableHead>
              <TableHead className="text-[#2B6B8A]">Series</TableHead>
              <TableHead className="text-[#2B6B8A]">Reps</TableHead>
              <TableHead className="text-[#2B6B8A]">Peso</TableHead>
              <TableHead className="text-[#2B6B8A]">Fecha</TableHead>
              <TableHead className="text-[#2B6B8A]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-[#2B6B8A]">
                  No hay entrenamientos registrados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((workout) => (
                <TableRow
                  key={workout.id}
                  className="transition-colors even:bg-[#F9FCFE] hover:bg-[#E8F2F7]"
                >
                  <TableCell className="font-semibold text-[#0A2540]">
                    {workout.exercises?.name ?? "Sin nombre"}
                  </TableCell>
                  <TableCell className="text-[#2B6B8A]">
                    {workout.sets}
                  </TableCell>
                  <TableCell className="text-[#2B6B8A]">
                    {workout.reps}
                  </TableCell>
                  <TableCell className="text-[#2B6B8A]">
                    {workout.weight_kg} kg
                  </TableCell>
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
                        className="rounded-xl bg-[#D4E8F2] text-[#0A2540] hover:bg-[#6BA3BE] hover:text-white"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWorkout(workout.id)}
                        className="rounded-xl bg-[#0A2540] text-white hover:bg-[#2B6B8A]"
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
        <DialogContent className="border border-white/70 bg-white/95 text-[#0A2540] shadow-2xl">
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
              <SelectTrigger className="w-full border-[#D4E8F2] bg-white text-[#0A2540]">
                <SelectValue placeholder="Selecciona un ejercicio" />
              </SelectTrigger>
              <SelectContent className="border-[#D4E8F2] bg-white text-[#0A2540]">
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
                className="border-[#D4E8F2] bg-white text-[#0A2540] focus-visible:ring-[#6BA3BE]"
              />
              <Input
                type="number"
                value={form.reps}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, reps: event.target.value }))
                }
                placeholder="Reps"
                className="border-[#D4E8F2] bg-white text-[#0A2540] focus-visible:ring-[#6BA3BE]"
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
                className="border-[#D4E8F2] bg-white text-[#0A2540] focus-visible:ring-[#6BA3BE]"
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
              className="border-[#D4E8F2] bg-white text-[#0A2540] focus-visible:ring-[#6BA3BE]"
            />
            <Input
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Notas"
              className="border-[#D4E8F2] bg-white text-[#0A2540] focus-visible:ring-[#6BA3BE]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditing(null)}
              className="rounded-xl bg-[#D4E8F2] text-[#0A2540] hover:bg-[#6BA3BE] hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveChanges}
              className="rounded-xl bg-[#2B6B8A] text-white hover:bg-[#0A2540]"
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
