import { TelegramLoginButton } from "@/components/TelegramLoginButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="text-xl font-semibold">GymBro Bot</div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
          Telegram + Dashboard
        </span>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-12 md:grid-cols-2 md:items-center">
        <section className="space-y-6">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Registra tu entrenamiento en Telegram y analiza tu progreso.
          </h1>
          <p className="text-lg text-slate-300">
            GymBro Bot te guía para registrar ejercicios, series, repeticiones y
            peso. Luego puedes ver tus estadísticas, gráficas y alertas en un
            panel personalizado.
          </p>
          <div className="space-y-3 rounded-2xl bg-slate-900/60 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Empieza en 1 clic
            </p>
            <TelegramLoginButton />
            <p className="text-xs text-slate-400">
              Inicia sesión con tu cuenta de Telegram y enlaza tus registros del
              bot.
            </p>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/30 p-8">
          <h2 className="text-2xl font-semibold">¿Cómo funciona?</h2>
          <ol className="space-y-4 text-slate-200">
            <li>1. Habla con el bot en Telegram y registra tu sesión.</li>
            <li>2. Guardamos tus datos en la nube automáticamente.</li>
            <li>3. Entra al dashboard y revisa tu progreso con gráficas.</li>
          </ol>
          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-800/60 p-4">
              📊 Volumen semanal y mejores marcas.
            </div>
            <div className="rounded-xl bg-slate-800/60 p-4">
              🔥 Alertas de racha y consistencia.
            </div>
            <div className="rounded-xl bg-slate-800/60 p-4">
              🎯 Progreso por ejercicio.
            </div>
            <div className="rounded-xl bg-slate-800/60 p-4">
              🧠 Insights sobre tu rendimiento.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
