"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { TelegramLoginButton } from "@/components/TelegramLoginButton";

type InviteState =
  | "loading"
  | "success"
  | "auth"
  | "used"
  | "expired"
  | "self"
  | "not-found"
  | "error";

type InvitePageProps = {
  params: {
    code: string;
  };
};

export default function InvitePage({ params }: InvitePageProps) {
  const [state, setState] = useState<InviteState>("loading");

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const response = await fetch(`/api/arena/invite/${params.code}`, {
          credentials: "include",
        });

        if (response.ok) {
          setState("success");
          return;
        }

        const payload = await response.json().catch(() => null);
        if (response.status === 401) {
          setState("auth");
          return;
        }

        if (response.status === 404) {
          setState("not-found");
          return;
        }

        if (response.status === 409) {
          setState("used");
          return;
        }

        if (response.status === 410) {
          setState("expired");
          return;
        }

        if (response.status === 400 && payload?.reason === "self") {
          setState("self");
          return;
        }

        setState("error");
      } catch (error) {
        console.error("Failed to accept invite", error);
        setState("error");
      }
    };

    acceptInvite();
  }, [params.code]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#0A2540]">
          Invitacion a la Arena
        </h1>
        <p className="text-sm text-[#2B6B8A]">
          Acepta el reto y compara tus levantamientos.
        </p>
      </div>

      {state === "loading" ? (
        <p className="text-sm text-[#2B6B8A]">Validando invitacion...</p>
      ) : null}

      {state === "auth" ? (
        <div className="space-y-4">
          <p className="text-sm text-[#2B6B8A]">
            Inicia sesion con Telegram para aceptar la invitacion.
          </p>
          <div className="flex justify-center">
            <TelegramLoginButton redirectTo={`/invite/${params.code}`} />
          </div>
        </div>
      ) : null}

      {state === "success" ? (
        <div className="space-y-4">
          <p className="text-sm text-[#2B6B8A]">
            Invitacion aceptada. Ya puedes ver a tu nuevo rival en la Arena.
          </p>
          <Link
            href="/dashboard/arena"
            className="inline-flex items-center justify-center rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#123C5A]"
          >
            Ir a la Arena
          </Link>
        </div>
      ) : null}

      {state === "used" ? (
        <p className="text-sm text-[#2B6B8A]">
          Este link ya fue usado. Pidele a tu amigo un nuevo codigo.
        </p>
      ) : null}

      {state === "expired" ? (
        <p className="text-sm text-[#2B6B8A]">
          Esta invitacion expiro. Pidele a tu amigo un nuevo link.
        </p>
      ) : null}

      {state === "self" ? (
        <p className="text-sm text-[#2B6B8A]">
          No puedes invitarte a ti mismo.
        </p>
      ) : null}

      {state === "not-found" ? (
        <p className="text-sm text-[#2B6B8A]">
          Este codigo no existe. Verifica el link.
        </p>
      ) : null}

      {state === "error" ? (
        <p className="text-sm text-[#2B6B8A]">
          No pudimos procesar la invitacion. Intenta mas tarde.
        </p>
      ) : null}
    </div>
  );
}
