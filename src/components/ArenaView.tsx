"use client";

import { useEffect, useState } from "react";

import { InviteRivalDialog } from "@/components/InviteRivalDialog";
import { VersusCard } from "@/components/VersusCard";

type StatsResponse = {
  userName: string;
  userPhotoUrl: string | null;
};

type RivalProfile = {
  id: string;
  name: string;
  photoUrl: string | null;
  maxLifts: Record<string, number>;
};

const exercises = ["Press banca", "Sentadilla", "Peso muerto"] as const;
const buildEmptyMaxes = () =>
  exercises.reduce<Record<string, number>>((acc, name) => {
    acc[name] = 0;
    return acc;
  }, {});

export const ArenaView = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [rivals, setRivals] = useState<RivalProfile[]>([]);
  const [userMaxLifts, setUserMaxLifts] = useState<Record<string, number>>(
    buildEmptyMaxes()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArena = async () => {
      try {
        const [statsResponse, rivalsResponse] = await Promise.all([
          fetch("/api/stats", { credentials: "include" }),
          fetch("/api/arena/rivals", { credentials: "include" }),
        ]);

        if (!statsResponse.ok) {
          setStats(null);
        } else {
          const text = await statsResponse.text();
          if (!text) {
            setStats(null);
          } else {
            const json = JSON.parse(text);
            setStats(json.data ?? null);
          }
        }

        if (!rivalsResponse.ok) {
          setRivals([]);
          setUserMaxLifts(buildEmptyMaxes());
        } else {
          const json = await rivalsResponse.json();
          setRivals(json.data?.rivals ?? []);
          setUserMaxLifts(json.data?.userMaxLifts ?? buildEmptyMaxes());
        }
      } catch (error) {
        console.error("Failed to load arena data", error);
        setRivals([]);
        setUserMaxLifts(buildEmptyMaxes());
      } finally {
        setLoading(false);
      }
    };

    loadArena();
  }, []);

  const userName = stats?.userName ?? "Tú";
  const userPhotoUrl = stats?.userPhotoUrl ?? "/avatars/me.jpg";

  if (loading) {
    return <p className="text-[#2B6B8A]">Cargando arena...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#0A2540]">Arena</h1>
          <p className="text-sm text-[#2B6B8A]">
            Compite con tus amigos en los tres levantamientos principales.
          </p>
        </div>
        <InviteRivalDialog />
      </div>

      {rivals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#D4E8F2] bg-white/70 p-6 text-center text-sm text-[#2B6B8A]">
          Aun no tienes rivales. Invita a alguien para empezar a competir.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {rivals.flatMap((rival) =>
            exercises.map((exercise) => (
              <VersusCard
                key={`${rival.id}-${exercise}`}
                exerciseName={exercise}
                userName={userName}
                userPhotoUrl={userPhotoUrl}
                userMaxKg={userMaxLifts[exercise]}
                rivalName={rival.name}
                rivalPhotoUrl={rival.photoUrl ?? "/avatars/johan.jpg"}
                rivalMaxKg={rival.maxLifts[exercise] ?? 0}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
