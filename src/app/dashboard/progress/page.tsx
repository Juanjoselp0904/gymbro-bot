import { ProgressCharts } from "@/components/ProgressCharts";

const ProgressPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Progreso</h1>
      <p className="text-sm text-slate-400">
        Visualiza el volumen total y la distribución por ejercicio.
      </p>
    </div>
    <ProgressCharts />
  </div>
);

export default ProgressPage;
