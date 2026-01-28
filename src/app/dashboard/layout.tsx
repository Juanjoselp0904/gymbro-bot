import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/DashboardSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-950 text-white">
    <div className="flex flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  </div>
);

export default DashboardLayout;
