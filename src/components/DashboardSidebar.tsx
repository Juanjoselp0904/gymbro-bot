"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/workouts", label: "Entrenamientos" },
  { href: "/dashboard/exercises", label: "Ejercicios" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-white/10 bg-gradient-to-br from-[#0A2540] via-[#123A5B] to-[#0A2540] px-6 py-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:border-white/10">
      <div className="rounded-2xl bg-white/10 px-4 py-3 text-xl font-semibold text-white shadow-lg">
        GymBro
      </div>
      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-xl px-4 py-2 text-sm font-medium transition-all",
                "hover:-translate-y-0.5 hover:shadow-lg",
                isActive
                  ? "bg-white text-[#0A2540] shadow-lg"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
