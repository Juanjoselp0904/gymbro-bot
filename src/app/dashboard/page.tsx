import { DashboardOverview } from "@/components/DashboardOverview";

const DashboardPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Resumen</h1>
      <p className="text-sm text-slate-400">
        Revisa tu actividad y métricas principales.
      </p>
    </div>
    <DashboardOverview />
  </div>
);

export default DashboardPage;
