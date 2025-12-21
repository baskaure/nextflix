"use client";

import Link from "next/link";
import { getUniverseById, type Universe } from "@/lib/universes";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";

type UniversePageProps = {
  params: { id: string };
};

export default function UniversePage({ params }: UniversePageProps) {
  const { isAuthenticated, toggleFavorite, toggleAlert, hasSigned, favorites, alerts } = useUser();
  let universe: Universe | undefined = getUniverseById(params.id);

  // Fallback doux pour éviter le blocage si l'ID n'est pas encore configuré
  const isFallback = !universe;
  if (!universe) {
    universe = {
      id: params.id,
      title: `Univers démo – ${params.id}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Cet écran illustre la fiche univers type.",
    };
  }

  const isFavorite = favorites.includes(universe.id);
  const hasAlert = alerts.includes(universe.id);
  const userHasSigned = hasSigned(universe.id);

  const pressureLevel =
    universe.support >= 85
      ? "critique"
      : universe.support >= 65
      ? "fort"
      : "modéré";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-5 pt-24 pb-16 sm:px-10 md:grid-cols-[3fr,2fr]">
        {/* Affiche conceptuelle modernisée */}
        <section className="space-y-6">
          <div className="relative h-72 overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)] sm:h-96">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
              <div className="space-y-3">
                <span className="inline-flex rounded-full bg-black/70 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                  Baromètre des suites
                </span>
                <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  {universe.title}
                </h1>
              </div>
              <div className="flex items-end justify-between gap-4 text-sm text-zinc-200">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Niveau d’attente global
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {pressureLevel === "critique"
                      ? "Critique"
                      : pressureLevel === "fort"
                      ? "Fort"
                      : "Modéré"}{" "}
                    • {universe.support}% de soutien
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                    Tag émotion
                  </p>
                  <p className="mt-1 text-base font-semibold">
                    {universe.emotion}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
            {universe.description && (
              <p className="text-zinc-200">{universe.description}</p>
            )}
            <p className="text-xs text-zinc-500">
              Nextflix observe, mesure et expose la pression narrative autour
              de cet univers. Aucune promesse de production, aucun financement,
              aucune prise de position militante.
            </p>
          </div>
        </section>

        {/* Bloc actions / call-to-action modernisé */}
        <aside className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-7">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Donner sa voix
            </p>
            <h2 className="text-lg font-semibold sm:text-xl">
              Tu veux influencer la suite idéale ?
            </h2>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
            <p>
              Réponds à un court parcours en 3 blocs : signature rapide, verdict
              sur les directions proposées, puis questionnaire “vrais fans” pour
              affiner les lignes rouges.
            </p>
          </div>

          <div className="space-y-4">
            {userHasSigned ? (
              <div className="rounded-md border border-emerald-800/70 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                ✓ Tu as déjà donné ton avis sur cet univers.
              </div>
            ) : (
              <Link
                href={isAuthenticated ? `/univers/${universe.id}/signature` : `/auth/login?redirect=/univers/${universe.id}/signature`}
                className="flex w-full items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
              >
                Je donne mon avis sur la suite idéale
              </Link>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={async () => isAuthenticated && (await toggleFavorite(universe.id))}
                disabled={!isAuthenticated}
                className={`flex-1 rounded-md border px-4 py-2.5 text-center text-xs font-medium transition sm:text-sm ${
                  isFavorite
                    ? "border-emerald-700 bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800/70"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 disabled:opacity-50"
                }`}
              >
                {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
              </button>
              <button
                type="button"
                onClick={async () => isAuthenticated && (await toggleAlert(universe.id))}
                disabled={!isAuthenticated}
                className={`flex-1 rounded-md border px-4 py-2.5 text-center text-xs font-medium transition sm:text-sm ${
                  hasAlert
                    ? "border-amber-700 bg-amber-900/50 text-amber-200 hover:bg-amber-800/70"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/70 disabled:opacity-50"
                }`}
              >
                {hasAlert ? "Alerte activée" : "Activer une alerte"}
              </button>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 text-[0.7rem] text-zinc-500">
            <p>1 compte = 1 voix. Pas de commentaires publics, pas de fanfic.</p>
          </div>
        </aside>
      </main>
    </div>
  );
}


