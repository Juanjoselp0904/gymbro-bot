import { ExercisesSummary } from "@/components/ExercisesSummary";

const ExercisesPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-[#0A2540]">Progreso</h1>
      <p className="text-sm text-[#2B6B8A]">
        Controla tus mejores marcas y la última vez que entrenaste cada
        ejercicio.
      </p>
    </div>
    <ExercisesSummary />
  </div>
);

export default ExercisesPage;
