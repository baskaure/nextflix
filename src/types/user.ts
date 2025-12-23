export type User = {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

export type SignatureData = {
  universeId: string;
  q1_exists: "oui" | "non" | "mitige";
  q2_intensity: "curiosite" | "importante" | "essentielle";
  q3_profile: "decouverte" | "regulier" | "longue-date";
  submittedAt: string;
};

export type DirectionVerdict = {
  universeId: string;
  directionId: string;
  verdict: "support" | "reject" | "wishlist" | "comment";
  q4_poster_verdict?: "oui" | "non" | "neutre";
  q5_fidelity?: "oui" | "non";
  q6_preferred_format?: "film" | "serie" | "anime" | "miniserie" | "aucun";
  submittedAt: string;
};

export type QuestionnaireData = {
  universeId: string;
  q7_redLines: string[];
  q8_nonNegotiables: string[];
  q9_feeling: string;
  q10_vision: string;
  submittedAt: string;
};

export type UserData = {
  signatures: SignatureData[];
  directions: DirectionVerdict[];
  questionnaires: QuestionnaireData[];
  favorites: string[]; // universe IDs
  alerts: string[]; // universe IDs
};

