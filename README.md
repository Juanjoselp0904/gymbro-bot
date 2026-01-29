GymBro Bot es un proyecto de Next.js + Telegram para registrar entrenamientos y
visualizarlos en un dashboard con gráficas e indicadores.

## Requisitos


- Node.js 18+
- Cuenta de Supabase
- Bot de Telegram creado en @BotFather

## Configuración

1. Copia `.env.example` a `.env.local` y completa los valores.
2. Crea el esquema en Supabase ejecutando `supabase/migrations/001_init.sql`.
3. Instala dependencias:

```bash
npm install
```

4. Inicia el entorno local:

```bash
npm run dev
```

## Webhook de Telegram

Una vez publicado el proyecto (o con un túnel local), configura el webhook:

```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<APP_URL>/api/telegram/webhook
```

## Deploy en Vercel

1. Crea un proyecto en Vercel y conecta este repositorio.
2. Agrega las variables de entorno de `.env.example`.
3. Configura el webhook de Telegram con la URL pública de Vercel.

