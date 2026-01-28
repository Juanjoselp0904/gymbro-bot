"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Resumen" },
  { href: "/dashboard/workouts", label: "Entrenamientos" },
  { href: "/dashboard/progress", label: "Progreso" },
  { href: "/dashboard/exercises", label: "Ejercicios" },
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 px-6 py-6 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="text-xl font-semibold text-white">GymBro</div>
      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
