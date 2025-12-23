"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUniverseById, type Universe } from "@/lib/universes";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";

type StepId = 1 | 2 | 3;

type SignatureFormState = {
  q1_exists?: "oui" | "non" | "mitige";
  q2_intensity?: "curiosite" | "importante" | "essentielle";
  q3_profile?: "decouverte" | "regulier" | "longue-date";
};

const steps: { id: StepId; label: string }[] = [
  { id: 1, label: "Existence de la suite" },
  { id: 2, label: "Intensité de l'attente" },
  { id: 3, label: "Profil fan" },
];

function ProgressBar({ current }: { current: StepId }) {
  const index = steps.findIndex((s) => s.id === current);
  const ratio = (index + 1) / steps.length;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.7rem] text-zinc-400">
        <span>Signature rapide</span>
        <span>
          {index + 1}/{steps.length}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-red-400 to-amber-300 transition-[width] duration-300"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function QuestionBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-zinc-400 leading-relaxed">{subtitle}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>
    </section>
  );
}

function PillButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[3.5rem] items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-red-500 bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-[1.02]"
          : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 hover:scale-[1.01]"
      }`}
    >
      {label}
    </button>
  );
}

type SignatureClientProps = {
  universeId: string;
};

export default function SignatureClient({ universeId }: SignatureClientProps) {
  const router = useRouter();
  const { isAuthenticated, addSignature, hasSigned } = useUser();
  let universe: Universe | undefined = getUniverseById(universeId);

  if (!universe) {
    universe = {
      id: universeId,
      title: `Univers démo – ${universeId}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Cette signature illustre le parcours type.",
    };
  }

  const [step, setStep] = React.useState<StepId>(1);
  const [state, setState] = React.useState<SignatureFormState>({});
  const [submitted, setSubmitted] = React.useState(hasSigned(universe.id));

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/univers/${universe.id}/signature`);
    }
  }, [isAuthenticated, router, universe.id]);

  const canGoNext =
    (step === 1 && state.q1_exists) ||
    (step === 2 && state.q2_intensity) ||
    (step === 3 && state.q3_profile);

  const handleNext = async () => {
    if (!canGoNext) return;
    if (step < 3) {
      setStep((s) => (s + 1) as StepId);
    } else {
      // Sauvegarder la signature
      if (state.q1_exists && state.q2_intensity && state.q3_profile) {
        await addSignature({
          universeId: universe.id,
          q1_exists: state.q1_exists,
          q2_intensity: state.q2_intensity,
          q3_profile: state.q3_profile,
          submittedAt: new Date().toISOString(),
        });
        setSubmitted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as StepId);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl space-y-6 px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-4">
          <Link
            href={`/univers/${universe.id}`}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            Retour à la fiche univers
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
          <ProgressBar current={step} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Signature – {universe.title}
            </p>
            <p className="text-sm text-zinc-400">
              3 questions. 30 secondes. Pas de texte libre, pas de spam. Juste ta
              position claire.
            </p>
            <p className="text-xs text-amber-400/90">
              Projet communautaire – non officiel
            </p>
          </div>

          {!submitted ? (
            <>
              {step === 1 && (
                <QuestionBlock
                  title="Cette suite mérite-t-elle d'exister ?"
                  subtitle="Souhaites-tu une continuation de cet univers ?"
                >
                  <PillButton
                    label="Oui, clairement"
                    selected={state.q1_exists === "oui"}
                    onClick={() => setState((s) => ({ ...s, q1_exists: "oui" }))}
                  />
                  <PillButton
                    label="Non, il faut le laisser comme ça"
                    selected={state.q1_exists === "non"}
                    onClick={() => setState((s) => ({ ...s, q1_exists: "non" }))}
                  />
                  <PillButton
                    label="Mitigé / ça dépend"
                    selected={state.q1_exists === "mitige"}
                    onClick={() => setState((s) => ({ ...s, q1_exists: "mitige" }))}
                  />
                </QuestionBlock>
              )}

              {step === 2 && (
                <QuestionBlock
                  title="À quel point cette suite compte pour toi ?"
                  subtitle="Par rapport à tout ce que tu suis / regardes."
                >
                  <PillButton
                    label="Curiosité"
                    selected={state.q2_intensity === "curiosite"}
                    onClick={() =>
                      setState((s) => ({ ...s, q2_intensity: "curiosite" }))
                    }
                  />
                  <PillButton
                    label="Importante"
                    selected={state.q2_intensity === "importante"}
                    onClick={() =>
                      setState((s) => ({ ...s, q2_intensity: "importante" }))
                    }
                  />
                  <PillButton
                    label="Essentielle"
                    selected={state.q2_intensity === "essentielle"}
                    onClick={() =>
                      setState((s) => ({ ...s, q2_intensity: "essentielle" }))
                    }
                  />
                </QuestionBlock>
              )}

              {step === 3 && (
                <QuestionBlock
                  title="Quel est ton lien avec l'œuvre ?"
                  subtitle="Ça aide à pondérer les réponses entre découverte et fans de longue date."
                >
                  <PillButton
                    label="Découverte / récent"
                    selected={state.q3_profile === "decouverte"}
                    onClick={() =>
                      setState((s) => ({ ...s, q3_profile: "decouverte" }))
                    }
                  />
                  <PillButton
                    label="Fan régulier"
                    selected={state.q3_profile === "regulier"}
                    onClick={() => setState((s) => ({ ...s, q3_profile: "regulier" }))}
                  />
                  <PillButton
                    label="Fan de longue date"
                    selected={state.q3_profile === "longue-date"}
                    onClick={() =>
                      setState((s) => ({ ...s, q3_profile: "longue-date" }))
                    }
                  />
                </QuestionBlock>
              )}

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-900 pt-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={step === 1}
                  className="text-sm font-medium text-zinc-500 transition hover:text-zinc-300 disabled:cursor-default disabled:text-zinc-700"
                >
                  {step === 1 ? " " : "Retour"}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
                >
                  {step < 3 ? "Continuer" : "Valider ma signature"}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 space-y-5 rounded-xl border border-zinc-800/70 bg-black/50 p-5 text-sm backdrop-blur-sm">
              <p className="font-semibold text-zinc-50">
                Merci, ta signature a été prise en compte.
              </p>
              <p className="text-xs leading-relaxed text-zinc-400">
                Tu peux maintenant continuer vers les directions créatives
                proposées pour cet univers et affiner ton avis (soutien / rejet /
                lignes rouges).
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/univers/${universe.id}`}
                  className="flex-1 rounded-md bg-zinc-900/70 px-4 py-2.5 text-center text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/70"
                >
                  Revenir à la fiche univers
                </Link>
                <Link
                  href={`/univers/${universe.id}/directions`}
                  className="flex-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
                >
                  Continuer vers les directions créatives
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

