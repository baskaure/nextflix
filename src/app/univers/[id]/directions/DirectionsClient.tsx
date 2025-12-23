"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Universe } from "@/lib/universes";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";

type DirectionsClientProps = {
  universe: Universe;
};

type DirectionVerdict = "support" | "reject" | "wishlist" | "comment";
type Step = "poster" | "q4" | "q5" | "q6" | "verdict";

type DirectionCard = {
  id: string;
  label: string;
  format: "film" | "serie" | "anime" | "miniserie";
  tagline: string;
  emotionalTag: string;
};

const directionsMock: DirectionCard[] = [
  {
    id: "a",
    label: "Suite directe, plus mature",
    format: "serie",
    tagline:
      "On reprend l'histoire là où elle s'est arrêtée, mais en assumant pleinement les conséquences.",
    emotionalTag: "Épique • Dramatique",
  },
  {
    id: "b",
    label: "Préquelle centrée sur un personnage culte",
    format: "miniserie",
    tagline:
      "On explore le passé d'un personnage clé, en révélant ce qui l'a façonné sans réécrire l'histoire.",
    emotionalTag: "Nostalgique • Intime",
  },
  {
    id: "c",
    label: "Spin-off dans un coin encore inexploré de l'univers",
    format: "serie",
    tagline:
      "Une nouvelle histoire autonome qui respecte l'univers mais évite de toucher au canon principal.",
    emotionalTag: "Inspirant • Découverte",
  },
];

function formatLabel(format: DirectionCard["format"]) {
  switch (format) {
    case "film":
      return "Film";
    case "serie":
      return "Série";
    case "anime":
      return "Animé";
    case "miniserie":
      return "Mini-série";
  }
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
      className={`flex min-h-[3rem] items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
        selected
          ? "border-red-500 bg-red-600 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-[1.02]"
          : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 hover:scale-[1.01]"
      }`}
    >
      {label}
    </button>
  );
}

export default function DirectionsClient({ universe }: DirectionsClientProps) {
  const router = useRouter();
  const { isAuthenticated, addDirectionVerdict } = useUser();

  const [directionIndex, setDirectionIndex] = React.useState(0);
  const [step, setStep] = React.useState<Step>("poster");
  const [q4, setQ4] = React.useState<"oui" | "non" | "neutre" | null>(null);
  const [q5, setQ5] = React.useState<"oui" | "non" | null>(null);
  const [q6, setQ6] = React.useState<"film" | "serie" | "anime" | "miniserie" | "aucun" | null>(null);
  const [verdict, setVerdict] = React.useState<DirectionVerdict | null>(null);

  const current = directionsMock[directionIndex];
  const isFinished = !current;

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/univers/${universe.id}/directions`);
    }
  }, [isAuthenticated, router, universe.id]);

  const handleNext = () => {
    if (step === "poster") {
      setStep("q4");
    } else if (step === "q4" && q4) {
      setStep("q5");
    } else if (step === "q5" && q5) {
      setStep("q6");
    } else if (step === "q6" && q6) {
      setStep("verdict");
    }
  };

  const handleVerdict = async (v: DirectionVerdict) => {
    setVerdict(v);

    // Sauvegarder toutes les données
    if (current && q4 && q5 && q6) {
      await addDirectionVerdict({
        universeId: universe.id,
        directionId: current.id,
        verdict: v,
        q4_poster_verdict: q4,
        q5_fidelity: q5,
        q6_preferred_format: q6,
        submittedAt: new Date().toISOString(),
      });
    }

    // Passer à la direction suivante
    setTimeout(() => {
      setDirectionIndex((i) => i + 1);
      setStep("poster");
      setQ4(null);
      setQ5(null);
      setQ6(null);
      setVerdict(null);
    }, 500);
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
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
            Test créatif – {universe.title}
          </p>
          <p className="text-sm text-zinc-400">
            Tu donnes un verdict rapide sur quelques directions proposées. Pas
            de scénario détaillé, juste un ressenti sur la direction générale.
          </p>
          <p className="text-xs text-amber-400/90">
            Projet communautaire – non officiel
          </p>
        </div>

        {!isFinished ? (
          <>
            {/* Affiche de la direction */}
            {step === "poster" && (
              <>
                <div className="relative h-96 overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)] sm:h-[28rem]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
                  <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                          {formatLabel(current.format)}
                        </span>
                        <span className="text-sm text-zinc-300">
                          Direction {directionIndex + 1} / {directionsMock.length}
                        </span>
                      </div>
                      <h1 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                        {current.label}
                      </h1>
                      <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">{current.tagline}</p>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-200">
                      <p className="font-medium">{current.emotionalTag}</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full rounded-md bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
                >
                  Continuer vers les questions
                </button>
              </>
            )}

            {/* Q4 : Verdict affiche */}
            {step === "q4" && (
              <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Cette affiche te donne-t-elle envie de découvrir la suite ?</h2>
                    <p className="text-xs text-zinc-400 mt-1">Q4 – Verdict sur l'affiche</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <PillButton
                      label="Oui, clairement"
                      selected={q4 === "oui"}
                      onClick={() => setQ4("oui")}
                    />
                    <PillButton
                      label="Non, pas vraiment"
                      selected={q4 === "non"}
                      onClick={() => setQ4("non")}
                    />
                    <PillButton
                      label="Neutre"
                      selected={q4 === "neutre"}
                      onClick={() => setQ4("neutre")}
                    />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => setStep("poster")}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!q4}
                      className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Q5 : Fidélité à l'âme */}
            {step === "q5" && (
              <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Cette direction respecte-t-elle l'âme de l'univers ?</h2>
                    <p className="text-xs text-zinc-400 mt-1">Q5 – Fidélité à l'œuvre originale</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <PillButton
                      label="Oui, elle respecte l'âme"
                      selected={q5 === "oui"}
                      onClick={() => setQ5("oui")}
                    />
                    <PillButton
                      label="Non, elle trahit l'essence"
                      selected={q5 === "non"}
                      onClick={() => setQ5("non")}
                    />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => setStep("q4")}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!q5}
                      className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Q6 : Format idéal */}
            {step === "q6" && (
              <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Quel format serait le plus pertinent pour cette direction ?</h2>
                    <p className="text-xs text-zinc-400 mt-1">Q6 – Format idéal</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <PillButton
                      label="Film"
                      selected={q6 === "film"}
                      onClick={() => setQ6("film")}
                    />
                    <PillButton
                      label="Série"
                      selected={q6 === "serie"}
                      onClick={() => setQ6("serie")}
                    />
                    <PillButton
                      label="Animé"
                      selected={q6 === "anime"}
                      onClick={() => setQ6("anime")}
                    />
                    <PillButton
                      label="Mini-série"
                      selected={q6 === "miniserie"}
                      onClick={() => setQ6("miniserie")}
                    />
                    <PillButton
                      label="Aucun"
                      selected={q6 === "aucun"}
                      onClick={() => setQ6("aucun")}
                    />
                  </div>
                  <div className="flex justify-between pt-4 border-t border-zinc-900">
                    <button
                      type="button"
                      onClick={() => setStep("q5")}
                      className="text-sm font-medium text-zinc-500 hover:text-zinc-300"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!q6}
                      className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
                    >
                      Continuer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verdict final */}
            {step === "verdict" && (
              <div className="rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Ton verdict final sur cette direction</h2>
                    <p className="text-xs text-zinc-400 mt-1">Résume ta position globale</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => handleVerdict("support")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-900/50 transition hover:bg-emerald-500 hover:scale-[1.02]"
                    >
                      Je soutiens
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerdict("reject")}
                      className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white shadow-lg shadow-red-900/50 transition hover:bg-red-500 hover:scale-[1.02]"
                    >
                      Je refuse
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerdict("wishlist")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/70 bg-zinc-900/50 px-4 py-3 font-medium text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/10 hover:scale-[1.01]"
                    >
                      Ajouter à mes attentes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerdict("comment")}
                      className="flex items-center justify-center gap-2 rounded-xl border border-indigo-500/70 bg-zinc-900/50 px-4 py-3 font-medium text-indigo-200 transition hover:border-indigo-400 hover:bg-indigo-500/10 hover:scale-[1.01]"
                    >
                      Donner mon avis
                    </button>
                  </div>
                  {verdict && (
                    <p className="text-xs font-medium text-zinc-100 text-center pt-2">
                      {verdict === "support" && "Verdict enregistré : tu soutiens cette direction."}
                      {verdict === "reject" && "Verdict enregistré : tu refuses cette direction."}
                      {verdict === "wishlist" && "Ajoutée à tes attentes pour cet univers."}
                      {verdict === "comment" && "Avis marqué à approfondir dans le questionnaire avancé."}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 space-y-5 rounded-xl border border-zinc-800/70 bg-black/50 p-5 text-sm backdrop-blur-sm">
            <p className="font-semibold text-zinc-50">
              Merci, tes verdicts sur les directions ont été enregistrés.
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Tu peux maintenant passer au questionnaire "vrais fans" pour
              préciser tes lignes rouges, tes éléments non négociables et le
              sentiment attendu.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/univers/${universe.id}`}
                className="flex-1 rounded-md bg-zinc-900/70 px-4 py-2.5 text-center text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/70"
              >
                Revenir à la fiche univers
              </Link>
              <Link
                href={`/univers/${universe.id}/questionnaire`}
                className="flex-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
              >
                Passer au questionnaire "vrais fans"
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
