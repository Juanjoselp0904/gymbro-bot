import type { ReactNode } from "react";

import { DashboardSidebar } from "@/components/DashboardSidebar";

const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#FFFEF5] via-[#F2F8FB] to-[#D4E8F2] text-[#0A2540]">
    <div className="flex flex-col md:flex-row">
      <DashboardSidebar />
      <main className="flex-1 px-6 py-8 md:px-10">{children}</main>
    </div>
  </div>
);

export default DashboardLayout;
