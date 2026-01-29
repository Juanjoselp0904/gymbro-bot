"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type SearchResult = {
  id: string;
  name: string;
  username: string | null;
  photoUrl: string | null;
};

type InviteResponse = {
  data?: {
    inviteUrl?: string;
    expiresAt?: string;
  };
};

export const InviteRivalDialog = () => {
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const generateInvite = async () => {
    setInviteStatus("loading");
    setCopyState("idle");
    try {
      const response = await fetch("/api/arena/invite", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        setInviteStatus("error");
        return;
      }
      const payload: InviteResponse = await response.json();
      setInviteUrl(payload.data?.inviteUrl ?? null);
      setInviteExpiresAt(payload.data?.expiresAt ?? null);
      setInviteStatus("success");
    } catch (error) {
      console.error("Failed to generate invite", error);
      setInviteStatus("error");
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyState("copied");
    } catch (error) {
      console.error("Failed to copy invite link", error);
      setCopyState("error");
    }
  };

  const searchUsers = async () => {
    const normalized = searchTerm.replace(/^@/, "").trim();
    if (!normalized) {
      setSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    setSearchStatus("loading");
    try {
      const response = await fetch(`/api/arena/search?username=${encodeURIComponent(normalized)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        setSearchStatus("error");
        return;
      }
      const payload = await response.json();
      setSearchResults(payload.data?.users ?? []);
      setSearchStatus("success");
    } catch (error) {
      console.error("Failed to search users", error);
      setSearchStatus("error");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          Invitar rival
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invita a un rival</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3 rounded-lg border border-[#D4E8F2] bg-[#F7FBFE] p-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0A2540]">
                Comparte un link
              </h3>
              <p className="text-xs text-[#2B6B8A]">
                Genera un link unico para enviarselo a tu amigo.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={generateInvite} disabled={inviteStatus === "loading"}>
                {inviteStatus === "loading" ? "Generando..." : "Generar link"}
              </Button>
              {inviteUrl ? (
                <Button variant="secondary" onClick={copyInvite}>
                  {copyState === "copied" ? "Copiado" : "Copiar link"}
                </Button>
              ) : null}
            </div>

            {inviteUrl ? (
              <div className="rounded-md border border-dashed border-[#D4E8F2] bg-white px-3 py-2 text-xs text-[#2B6B8A]">
                <div className="break-all">{inviteUrl}</div>
                {inviteExpiresAt ? (
                  <div className="mt-1 text-[11px] text-[#6BA3BE]">
                    Expira el {new Date(inviteExpiresAt).toLocaleDateString("es-ES")}
                  </div>
                ) : null}
              </div>
            ) : null}

            {inviteStatus === "error" ? (
              <p className="text-xs text-red-500">
                No pudimos generar el link. Intenta de nuevo.
              </p>
            ) : null}
          </section>

          <section className="space-y-3 rounded-lg border border-[#D4E8F2] bg-white p-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0A2540]">
                Buscar por username
              </h3>
              <p className="text-xs text-[#2B6B8A]">
                Encuentra a tu amigo por su @username de Telegram y enviale el link.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="@username"
              />
              <Button variant="outline" onClick={searchUsers} disabled={searchStatus === "loading"}>
                {searchStatus === "loading" ? "Buscando..." : "Buscar"}
              </Button>
            </div>

            {searchStatus === "error" ? (
              <p className="text-xs text-red-500">
                No pudimos buscar usuarios. Intenta mas tarde.
              </p>
            ) : null}

            {searchStatus === "success" && searchResults.length === 0 ? (
              <p className="text-xs text-[#2B6B8A]">No encontramos resultados.</p>
            ) : null}

            {searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-[#EEF4F7] px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.photoUrl ?? "/avatars/me.jpg"}
                        alt={`Foto de ${user.name}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#0A2540]">
                          {user.name}
                        </div>
                        {user.username ? (
                          <div className="text-xs text-[#2B6B8A]">
                            @{user.username}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#6BA3BE]">
                      Envia tu link de invitacion
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};
