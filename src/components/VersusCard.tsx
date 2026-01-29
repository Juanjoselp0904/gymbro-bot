import { Facebook, Instagram, MessageCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type VersusCardProps = {
  exerciseName: string;
  userName: string;
  userPhotoUrl: string;
  userMaxKg: number;
  rivalName: string;
  rivalPhotoUrl: string;
  rivalMaxKg: number;
};

const formatKg = (value: number) => `${value} kg`;

export const VersusCard = ({
  exerciseName,
  userName,
  userPhotoUrl,
  userMaxKg,
  rivalName,
  rivalPhotoUrl,
  rivalMaxKg,
}: VersusCardProps) => {
  const userWins = userMaxKg > rivalMaxKg;
  const rivalWins = rivalMaxKg > userMaxKg;
  const vsLabel = userWins ? "Ganas" : rivalWins ? "Pierdes" : "Empate";

  return (
    <Card className="border border-white/70 bg-white/85 shadow-xl backdrop-blur">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#2B6B8A]">
          <span>{exerciseName}</span>
          <span className="rounded-full bg-[#D4E8F2] px-3 py-1 text-[11px] text-[#0A2540]">
            {vsLabel}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={userPhotoUrl}
              alt={`Foto de ${userName}`}
              className="h-12 w-12 rounded-full border border-white/70 object-cover"
            />
            <div>
              <div className="text-sm font-semibold text-[#0A2540]">
                {userName}
              </div>
              <div className="text-xs text-[#2B6B8A]">{formatKg(userMaxKg)}</div>
            </div>
          </div>

          <div className="text-center text-xs font-semibold uppercase text-[#6BA3BE]">
            VS
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <div className="text-sm font-semibold text-[#0A2540]">
                {rivalName}
              </div>
              <div className="text-xs text-[#2B6B8A]">
                {formatKg(rivalMaxKg)}
              </div>
            </div>
            <img
              src={rivalPhotoUrl}
              alt={`Foto de ${rivalName}`}
              className="h-12 w-12 rounded-full border border-white/70 object-cover"
            />
          </div>
        </div>

        {userWins ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4E8F2] bg-[#F2F8FB] px-3 py-2">
            <span className="text-xs font-semibold text-[#0A2540]">
              Compartir en mis redes
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Compartir en Instagram"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white text-[#0A2540] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Instagram className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Compartir en Facebook"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white text-[#0A2540] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Facebook className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Compartir en WhatsApp"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white text-[#0A2540] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
