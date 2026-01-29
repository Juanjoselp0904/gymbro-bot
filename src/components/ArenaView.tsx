"use client";

import { useEffect, useState } from "react";

import { mockRival } from "@/lib/mock/arena-data";
import { VersusCard } from "@/components/VersusCard";

type StatsResponse = {
  userName: string;
  userPhotoUrl: string | null;
};

const userMaxLifts: Record<string, number> = {
  "Press banca": 100,
  Sentadilla: 140,
  "Peso muerto": 160,
};

const exercises = ["Press banca", "Sentadilla", "Peso muerto"] as const;

export const ArenaView = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/stats", {
          credentials: "include",
        });
        if (!response.ok) {
          setStats(null);
          return;
        }

        const text = await response.text();
        if (!text) {
          setStats(null);
          return;
        }

        const json = JSON.parse(text);
        setStats(json.data ?? null);
      } catch (error) {
        console.error("Failed to load arena stats", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const userName = stats?.userName ?? "Tú";
  const userPhotoUrl = stats?.userPhotoUrl ?? "/avatars/me.jpg";

  if (loading) {
    return <p className="text-[#2B6B8A]">Cargando arena...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#0A2540]">Arena</h1>
        <p className="text-sm text-[#2B6B8A]">
          Compite con tus amigos en los tres levantamientos principales.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {exercises.map((exercise) => (
          <VersusCard
            key={exercise}
            exerciseName={exercise}
            userName={userName}
            userPhotoUrl={userPhotoUrl}
            userMaxKg={userMaxLifts[exercise]}
            rivalName={mockRival.name}
            rivalPhotoUrl={mockRival.photoUrl}
            rivalMaxKg={mockRival.maxLifts[exercise]}
          />
        ))}
      </div>
    </div>
  );
};
