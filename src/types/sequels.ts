// Types pour les suites créées par les fans

export type FanSequel = {
  id: string;
  creatorId: string;
  creatorName?: string;
  universeId: string;
  title: string;
  description: string;
  format: "film" | "serie" | "anime" | "miniserie";
  posterUrl?: string;
  backdropUrl?: string;
  status: "pending" | "approved" | "rejected";
  signatureCount: number;
  hasSigned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FanSequelCreate = {
  universeId: string;
  title: string;
  description: string;
  format: "film" | "serie" | "anime" | "miniserie";
  posterUrl?: string;
  backdropUrl?: string;
};

export type SequelSignature = {
  sequelId: string;
  createdAt: string;
};

