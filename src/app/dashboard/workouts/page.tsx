import { WorkoutsTable } from "@/components/WorkoutsTable";

const WorkoutsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Entrenamientos</h1>
      <p className="text-sm text-slate-400">
        Consulta y filtra tu historial de sesiones.
      </p>
    </div>
    <WorkoutsTable />
  </div>
);

export default WorkoutsPage;
