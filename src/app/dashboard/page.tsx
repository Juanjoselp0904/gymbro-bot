import { DashboardOverview } from "@/components/DashboardOverview";

const DashboardPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-[#0A2540]">Resumen</h1>
      <p className="text-sm text-[#2B6B8A]">
        Revisa tu actividad y métricas principales.
      </p>
    </div>
    <DashboardOverview />
  </div>
);

export default DashboardPage;
