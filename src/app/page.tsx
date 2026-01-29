import { TelegramLoginButton } from "@/components/TelegramLoginButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFEF5] via-[#F2F8FB] to-[#D4E8F2] text-[#0A2540]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="rounded-2xl bg-white/80 px-4 py-2 text-xl font-semibold shadow-lg">
          GymBro Bot
        </div>
        <span className="rounded-full bg-[#D4E8F2] px-3 py-1 text-xs text-[#2B6B8A]">
          Telegram + Dashboard
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-12 md:grid-cols-2 md:items-center">
        <section className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Registra tu entrenamiento en Telegram y analiza tu progreso.
          </h1>
          <p className="text-lg text-[#2B6B8A]">
            GymBro Bot te guía para registrar ejercicios, series, repeticiones y
            peso. Luego puedes ver tus estadísticas, gráficas y alertas en un
            panel personalizado.
          </p>
          <div className="space-y-3 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-[#6BA3BE]">
              Empieza en 1 clic
            </p>
            <TelegramLoginButton />
            <p className="text-xs text-[#2B6B8A]">
              Inicia sesión con tu cuenta de Telegram y enlaza tus registros del
              bot.
            </p>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-white/70 bg-white/70 p-8 shadow-xl">
          <h2 className="text-2xl font-semibold">¿Cómo funciona?</h2>
          <ol className="space-y-4 text-[#0A2540]">
            <li>1. Habla con el bot en Telegram y registra tu sesión.</li>
            <li>2. Guardamos tus datos en la nube automáticamente.</li>
            <li>3. Entra al dashboard y revisa tu progreso con gráficas.</li>
          </ol>
          <div className="grid gap-3 text-sm text-[#2B6B8A] sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F2F8FB] p-4 shadow-sm">
              📊 Volumen semanal y mejores marcas.
            </div>
            <div className="rounded-2xl bg-[#F2F8FB] p-4 shadow-sm">
              🔥 Alertas de racha y consistencia.
            </div>
            <div className="rounded-2xl bg-[#F2F8FB] p-4 shadow-sm">
              🎯 Progreso por ejercicio.
            </div>
            <div className="rounded-2xl bg-[#F2F8FB] p-4 shadow-sm">
              🧠 Insights sobre tu rendimiento.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
