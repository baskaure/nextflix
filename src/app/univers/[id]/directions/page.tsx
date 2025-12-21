"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUniverseById, type Universe } from "@/lib/universes";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";

type DirectionsPageProps = {
  params: { id: string };
};

type DirectionVerdict = "support" | "reject" | "wishlist" | "comment";

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
      "On reprend l’histoire là où elle s’est arrêtée, mais en assumant pleinement les conséquences.",
    emotionalTag: "Épique • Dramatique",
  },
  {
    id: "b",
    label: "Préquelle centrée sur un personnage culte",
    format: "miniserie",
    tagline:
      "On explore le passé d’un personnage clé, en révélant ce qui l’a façonné sans réécrire l’histoire.",
    emotionalTag: "Nostalgique • Intime",
  },
  {
    id: "c",
    label: "Spin-off dans un coin encore inexploré de l’univers",
    format: "serie",
    tagline:
      "Une nouvelle histoire autonome qui respecte l’univers mais évite de toucher au canon principal.",
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

export default function DirectionsPage({ params }: DirectionsPageProps) {
  const router = useRouter();
  const { isAuthenticated, addDirectionVerdict } = useUser();
  let universe: Universe | undefined = getUniverseById(params.id);
  const isFallback = !universe;

  if (!universe) {
    universe = {
      id: params.id,
      title: `Univers démo – ${params.id}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Ces directions illustrent le module de test créatif.",
    };
  }

  const [index, setIndex] = React.useState(0);
  const [lastVerdict, setLastVerdict] = React.useState<DirectionVerdict | null>(
    null,
  );

  const current = directionsMock[index];
  const isFinished = !current;

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/univers/${universe.id}/directions`);
    }
  }, [isAuthenticated, router, universe.id]);

  const handleVerdict = async (verdict: "support" | "reject" | "wishlist" | "comment") => {
    setLastVerdict(verdict);

    // Sauvegarder le verdict
    if (current) {
      await addDirectionVerdict({
        universeId: universe.id,
        directionId: current.id,
        verdict,
        submittedAt: new Date().toISOString(),
      });
    }

    // Passer à la carte suivante
    setTimeout(() => {
      setIndex((i) => i + 1);
      setLastVerdict(null);
    }, 220);
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
        </div>

        {!isFinished ? (
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
                      Carte {index + 1} / {directionsMock.length}
                    </span>
                  </div>
                  <h1 className="text-balance text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
                    {current.label}
                  </h1>
                  <p className="text-sm leading-relaxed text-zinc-200 sm:text-base">{current.tagline}</p>
                </div>

                <div className="space-y-2 text-sm text-zinc-200">
                  <p className="font-medium">{current.emotionalTag}</p>
                  {lastVerdict && (
                    <p className="text-xs font-medium text-zinc-100">
                      {lastVerdict === "support" && "Verdict : tu soutiens cette direction."}
                      {lastVerdict === "reject" && "Verdict : tu refuses cette direction."}
                      {lastVerdict === "wishlist" &&
                        "Ajoutée à tes attentes pour cet univers."}
                      {lastVerdict === "comment" &&
                        "Avis marqué à approfondir dans le questionnaire avancé."}
                    </p>
                  )}
                </div>
              </div>
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
          </>
        ) : (
          <div className="mt-4 space-y-5 rounded-xl border border-zinc-800/70 bg-black/50 p-5 text-sm backdrop-blur-sm">
            <p className="font-semibold text-zinc-50">
              Merci, tes verdicts sur les directions ont été enregistrés.
            </p>
            <p className="text-xs leading-relaxed text-zinc-400">
              Tu peux maintenant passer au questionnaire “vrais fans” pour
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
                Passer au questionnaire “vrais fans”
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


