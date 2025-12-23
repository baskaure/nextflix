"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUniverseById, type Universe } from "@/lib/universes";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";

type QuestionnaireClientProps = {
  universeId: string;
};

type RedLine =
  | "reboot"
  | "tone-change"
  | "characters-betrayal"
  | "fanservice-empty"
  | "purely-commercial"
  | "rewrite-history";

type NonNegotiable =
  | "characters"
  | "tone"
  | "continuity"
  | "universe"
  | "original-vision";

type ExpectedFeeling =
  | "nostalgie"
  | "emerveillement"
  | "epique"
  | "dramatique"
  | "inspirant"
  | "sombre";

type QuestionnaireState = {
  q7_redLines: RedLine[];
  q8_nonNegotiables: NonNegotiable[];
  q9_feeling?: ExpectedFeeling;
  q10_vision: string;
};

const RED_LINE_LABELS: Record<RedLine, string> = {
  reboot: "Reboot inutile",
  "tone-change": "Changement de ton",
  "characters-betrayal": "Trahison des personnages",
  "fanservice-empty": "Fan-service vide",
  "purely-commercial": "Suite purement commerciale",
  "rewrite-history": "Réécriture de l’histoire",
};

const NON_NEGOTIABLE_LABELS: Record<NonNegotiable, string> = {
  characters: "Personnages",
  tone: "Ton",
  continuity: "Continuité",
  universe: "Univers",
  "original-vision": "Vision originale",
};

const FEELING_LABELS: Record<ExpectedFeeling, string> = {
  nostalgie: "Nostalgie",
  emerveillement: "Émerveillement",
  epique: "Épique",
  dramatique: "Dramatique",
  inspirant: "Inspirant",
  sombre: "Sombre",
};

function TogglePill({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
        selected
          ? "border-red-500 bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-[1.02]"
          : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 hover:scale-[1.01]"
      }`}
    >
      {label}
    </button>
  );
}

function SingleChoicePill({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-xl border px-4 py-2.5 text-xs font-medium transition-all duration-200 sm:text-sm ${
        selected
          ? "border-red-500 bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-[1.02]"
          : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 hover:scale-[1.01]"
      }`}
    >
      {label}
    </button>
  );
}

function QuestionSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
        {subtitle && (
          <p className="text-[0.7rem] text-zinc-400 sm:text-xs">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export default function QuestionnaireClient({ universeId }: QuestionnaireClientProps) {
  const router = useRouter();
  const { isAuthenticated, addQuestionnaire, hasAnsweredQuestionnaire } = useUser();
  let universe: Universe | undefined = getUniverseById(universeId);

  if (!universe) {
    universe = {
      id: universeId,
      title: `Univers démo – ${universeId}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Ce questionnaire illustre le module avancé.",
    };
  }

  const [state, setState] = React.useState<QuestionnaireState>({
    q7_redLines: [],
    q8_nonNegotiables: [],
    q9_feeling: undefined,
    q10_vision: "",
  });

  const [submitted, setSubmitted] = React.useState(hasAnsweredQuestionnaire(universe.id));

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/univers/${universe.id}/questionnaire`);
    }
  }, [isAuthenticated, router, universe.id]);

  const toggleRedLine = (item: RedLine) => {
    setState((s) => {
      const exists = s.q7_redLines.includes(item);
      return {
        ...s,
        q7_redLines: exists
          ? s.q7_redLines.filter((v) => v !== item)
          : [...s.q7_redLines, item],
      };
    });
  };

  const toggleNonNegotiable = (item: NonNegotiable) => {
    setState((s) => {
      const exists = s.q8_nonNegotiables.includes(item);
      if (exists) {
        return {
          ...s,
          q8_nonNegotiables: s.q8_nonNegotiables.filter((v) => v !== item),
        };
      }

      if (s.q8_nonNegotiables.length >= 3) {
        return s; // max 3
      }

      return {
        ...s,
        q8_nonNegotiables: [...s.q8_nonNegotiables, item],
      };
    });
  };

  const setFeeling = (feeling: ExpectedFeeling) => {
    setState((s) => ({ ...s, q9_feeling: feeling }));
  };

  const remainingChars = 180 - state.q10_vision.length;

  const isValid =
    state.q7_redLines.length > 0 &&
    state.q8_nonNegotiables.length > 0 &&
    !!state.q9_feeling &&
    state.q10_vision.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    // Sauvegarder le questionnaire
    await addQuestionnaire({
      universeId: universe.id,
      q7_redLines: state.q7_redLines,
      q8_nonNegotiables: state.q8_nonNegotiables,
      q9_feeling: state.q9_feeling || "",
      q10_vision: state.q10_vision,
      submittedAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-4">
          <Link
            href={`/univers/${universe.id}`}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            Retour à la fiche univers
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Niveau avancé – {universe.title}
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Réservé aux fans engagés. Tu définis clairement ce qui ferait
              rejeter la suite, ce qui doit être respecté et le sentiment que tu
              attends.
            </p>
            <p className="text-xs text-amber-400/90">
              Projet communautaire – non officiel
            </p>
          </div>

        {!submitted ? (
          <>
            <QuestionSection
              title="Lignes rouges (rejet immédiat)"
              subtitle="Qu’est-ce qui provoquerait pour toi un rejet instantané ?"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(Object.keys(RED_LINE_LABELS) as RedLine[]).map((key) => (
                  <TogglePill
                    key={key}
                    selected={state.q7_redLines.includes(key)}
                    label={RED_LINE_LABELS[key]}
                    onClick={() => toggleRedLine(key)}
                  />
                ))}
              </div>
              <p className="text-[0.7rem] text-zinc-500">
                Tu peux en choisir plusieurs.
              </p>
            </QuestionSection>

            <QuestionSection
              title="Ce qui doit absolument être respecté"
              subtitle="Quels éléments sont non négociables pour toi ? (max 3)"
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(Object.keys(NON_NEGOTIABLE_LABELS) as NonNegotiable[]).map(
                  (key) => (
                    <TogglePill
                      key={key}
                      selected={state.q8_nonNegotiables.includes(key)}
                      label={NON_NEGOTIABLE_LABELS[key]}
                      onClick={() => toggleNonNegotiable(key)}
                    />
                  ),
                )}
              </div>
              <p className="text-[0.7rem] text-zinc-500">
                {state.q8_nonNegotiables.length}/3 sélectionnés.
              </p>
            </QuestionSection>

            <QuestionSection
              title="Sentiment attendu"
              subtitle="Cette suite devrait surtout provoquer quel type de ressenti chez toi ?"
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.keys(FEELING_LABELS) as ExpectedFeeling[]).map(
                  (key) => (
                    <SingleChoicePill
                      key={key}
                      selected={state.q9_feeling === key}
                      label={FEELING_LABELS[key]}
                      onClick={() => setFeeling(key)}
                    />
                  ),
                )}
              </div>
            </QuestionSection>

            <QuestionSection
              title="Vision en une phrase"
              subtitle="Si tu devais résumer la suite idéale en une seule phrase (pas un scénario, juste une direction)."
            >
              <div className="space-y-2">
                <textarea
                  value={state.q10_vision}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 180);
                    setState((s) => ({ ...s, q10_vision: value }));
                  }}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-800 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm"
                  placeholder='Exemple : "Une suite plus mature qui assume les conséquences du passé."'
                />
                <div className="flex items-center justify-between text-[0.7rem] text-zinc-500">
                  <span>180 caractères max. Pas de pitch détaillé.</span>
                  <span>{remainingChars}</span>
                </div>
              </div>
            </QuestionSection>

            <div className="flex justify-end border-t border-zinc-900 pt-4">
              <button
                type="button"
                disabled={!isValid}
                onClick={handleSubmit}
                className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
              >
                Valider mon questionnaire
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-5 rounded-xl border border-zinc-800/70 bg-black/50 p-5 text-sm backdrop-blur-sm">
            <p className="font-semibold text-zinc-50">
              Merci pour ta vision de “vrai fan”.
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Tes réponses contribuent à affiner le baromètre : lignes rouges,
              éléments non négociables, sentiment attendu et direction idéale.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/univers/${universe.id}`}
                className="flex-1 rounded-md bg-zinc-900/70 px-4 py-2.5 text-center text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/70"
              >
                Revenir à la fiche univers
              </Link>
              <Link
                href={`/univers/${universe.id}/barometre`}
                className="flex-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
              >
                Consulter le baromètre
              </Link>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}


