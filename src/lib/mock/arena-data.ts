export type RivalProfile = {
  id: string;
  name: string;
  photoUrl: string;
  maxLifts: Record<string, number>;
};

export const mockRival: RivalProfile = {
  id: "mock-johan-blandon",
  name: "Johan Blandon",
  photoUrl: "/avatars/johan.jpg",
  maxLifts: {
    "Press banca": 102,
    Sentadilla: 142,
    "Peso muerto": 158,
  },
};
