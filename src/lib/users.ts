import { supabaseAdmin } from "@/lib/supabase/admin";

export type TelegramProfile = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

const mapTelegramUser = (user: TelegramProfile) => ({
  telegram_id: user.id,
  username: user.username ?? null,
  first_name: user.first_name ?? null,
  last_name: user.last_name ?? null,
  photo_url: user.photo_url ?? null,
});

export const upsertTelegramUser = async (
  user: TelegramProfile
): Promise<string> => {
  const { data, error } = await supabaseAdmin
    .from("users")
    .upsert(mapTelegramUser(user), {
      onConflict: "telegram_id",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id;
};
