import { WorkoutsTable } from "@/components/WorkoutsTable";

const WorkoutsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-[#0A2540]">
        Entrenamientos
      </h1>
      <p className="text-sm text-[#2B6B8A]">
        Consulta y filtra tu historial de sesiones.
      </p>
    </div>
    <WorkoutsTable />
  </div>
);

export default WorkoutsPage;
