import { ExercisesSummary } from "@/components/ExercisesSummary";

const ExercisesPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Ejercicios</h1>
      <p className="text-sm text-slate-400">
        Controla tus mejores marcas y la última vez que entrenaste cada
        ejercicio.
      </p>
    </div>
    <ExercisesSummary />
  </div>
);

export default ExercisesPage;
