"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type TelegramAuthData = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramAuthData) => void;
  }
}

type TelegramLoginButtonProps = {
  redirectTo?: string;
};

export const TelegramLoginButton = ({ redirectTo }: TelegramLoginButtonProps) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername) {
      return;
    }

    window.onTelegramAuth = async (user) => {
      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
          credentials: "include",
        });

        if (!response.ok) {
          setError("No se pudo iniciar sesión.");
          return;
        }

        router.push(redirectTo ?? "/dashboard");
      } catch (err) {
        console.error("Telegram login error", err);
        setError("No se pudo iniciar sesión.");
      }
    };

    if (!containerRef.current) {
      return;
    }

    containerRef.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    containerRef.current.appendChild(script);

    return () => {
      window.onTelegramAuth = undefined;
      script.remove();
    };
  }, [router, redirectTo, botUsername]);

  if (!botUsername) {
    return <p className="text-sm text-red-600">Falta configurar el bot de Telegram.</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return <div ref={containerRef} />;
};
