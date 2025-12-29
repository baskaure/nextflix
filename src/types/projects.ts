// Types pour les projets de fans (courts-métrages/films)

export type FanProject = {
  id: string;
  creatorId: string;
  creatorName?: string;
  universeId: string;
  title: string;
  description: string;
  projectType: "court-metrage" | "film" | "serie";
  posterUrl?: string;
  backdropUrl?: string;
  fundingGoal?: number;
  totalContributions: number;
  signatureCount: number;
  hasSigned: boolean;
  hasContributed: boolean;
  status: "active" | "funded" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
};

export type FanProjectCreate = {
  universeId: string;
  title: string;
  description: string;
  projectType: "court-metrage" | "film" | "serie";
  posterUrl?: string;
  backdropUrl?: string;
  fundingGoal?: number;
};

export type ProjectSignature = {
  projectId: string;
  createdAt: string;
};

export type ProjectContribution = {
  id: string;
  projectId: string;
  amount: number;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
};

export type ProjectContributionCreate = {
  projectId: string;
  amount: number;
};

