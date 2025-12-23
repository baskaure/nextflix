"use client";

import Link from "next/link";
import * as React from "react";
import { Navbar } from "@/components/Navbar";
import { placeholderPoster, posterByUniverseId } from "@/lib/posters";
import { sections, universesBySection } from "@/lib/universes";
import { usePoster } from "@/hooks/usePoster";

export default function Home() {
  const [query, setQuery] = React.useState("");
  const [movies, setMovies] = React.useState<MovieResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (q?: string) => {
    setLoading(true);
    try {
      const params = q ? `?query=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/search${params}`);
      const json = await res.json();
      setMovies(json.items || []);
    } catch (e) {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />

      {/* Splash / Home – hero plein écran */}
      <main className="flex min-h-screen flex-col items-center justify-center px-6 pb-16 pt-24 sm:px-10 sm:pt-28">
        <section className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)] sm:max-w-7xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
          <div className="relative flex flex-col gap-8 px-6 py-10 sm:flex-row sm:items-end sm:px-10 sm:py-14">
            <div className="flex-1 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
                Le baromètre des histoires de demain
              </p>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                Les fans parlent.
                <br />
                <span className="text-zinc-200">Les chiffres tranchent.</span>
              </h1>
              <p className="max-w-xl text-sm text-zinc-300 sm:text-base">
                Nextflix capture ce que les fans{" "}
                <span className="font-medium text-zinc-50">attendent</span>,{" "}
                <span className="font-medium text-zinc-50">refusent</span> et ne
                veulent surtout pas voir trahi, pour offrir aux studios un
                baromètre clair avant toute suite, reboot ou spin-off.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
                  onClick={() => {
                    const section = document.getElementById("catalogue");
                    section?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Explorer les suites
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-zinc-900/80 px-5 py-2.5 text-xs font-medium text-zinc-100 ring-1 ring-zinc-700 transition hover:bg-zinc-800 hover:text-white"
                  onClick={() => {
                    const section = document.getElementById("catalogue");
                    section?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Comprendre le baromètre
                </button>
              </div>
            </div>

            <div className="hidden w-full max-w-xs flex-col gap-3 rounded-xl bg-black/50 p-4 text-xs text-zinc-300 sm:flex">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
                Exemple de signal
              </p>
              <p>
                <span className="font-semibold text-zinc-50">
                  287 000 signatures
                </span>{" "}
                pour une suite.
              </p>
              <p>
                <span className="font-semibold text-zinc-50">
                  69 % refusent un reboot,
                </span>{" "}
                mais{" "}
                <span className="font-semibold text-zinc-50">
                  74 % valident une direction précise.
                </span>
              </p>
              <p className="text-[0.7rem] text-zinc-500">
                En 30 secondes, un studio comprend s’il va vers un succès ou un
                rejet annoncé.
              </p>
            </div>
          </div>
        </section>

        {/* Bas de page – petite note de positionnement */}
        <footer className="mt-6 flex w-full max-w-6xl flex-col items-start justify-between gap-2 text-[0.7rem] text-zinc-500 sm:flex-row">
          <p>
            Version fans : l'endroit où l'on décide quelles histoires méritent
            une suite… et comment ne pas les rater.
          </p>
          <div className="flex flex-col items-end gap-1">
            <p>
              Nextflix ne produit pas des films. Nextflix produit de la clarté.
            </p>
            <p className="text-amber-400/90">
              Projet communautaire – non officiel
            </p>
          </div>
        </footer>
      </main>

      {/* Écran 2 — Catalogue dynamique + recherche (TMDB) */}
      <section
        id="catalogue"
        className="border-t border-zinc-900/60 bg-gradient-to-b from-black via-[#050509] to-black px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-500">
                  Baromètre des suites
                </p>
                <h2 className="text-xl font-semibold sm:text-2xl">Explorer</h2>
              </div>
              <p className="hidden text-[0.7rem] text-zinc-500 sm:block">
                Résultats TMDB (tendance ou recherche)
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    fetchMovies(query);
                  }
                }}
                placeholder="Rechercher un film..."
                className="w-full rounded-md border border-zinc-800 bg-black/50 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:max-w-md"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fetchMovies(query)}
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
                >
                  Rechercher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    fetchMovies();
                  }}
                  className="rounded-md border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800/80"
                >
                  Tendance
                </button>
              </div>
            </div>
          </header>

          {loading ? (
            <p className="text-sm text-zinc-400">Chargement...</p>
          ) : movies.length === 0 ? (
            <p className="text-sm text-zinc-400">Aucun résultat.</p>
          ) : (
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-1 sm:-mx-0 sm:px-0 lg:gap-5">
              {movies.map((movie) => (
                <CardMovie
                  key={movie.tmdbId}
                  tmdbId={movie.tmdbId}
                  title={movie.title}
                  posterUrl={movie.posterUrl || placeholderPoster}
                  overview={movie.overview}
                  releaseDate={movie.releaseDate}
                  voteAverage={movie.voteAverage}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Écran 3 — Univers Nextflix (internes, avec parcours Signature/Directions/Questionnaire) */}
      <section
        id="univers"
        className="border-t border-zinc-900/60 bg-gradient-to-b from-black via-[#040406] to-black px-4 pb-16 pt-8 sm:px-8 sm:pb-20"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-500">
                  Univers Nextflix
                </p>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  Parcours complet (Signature → Directions → Questionnaire → Baromètre)
                </h2>
              </div>
              <p className="hidden text-[0.7rem] text-zinc-500 sm:block">
                Sélection interne : toutes les pages (signature, directions, questionnaire, baromètre)
              </p>
            </div>
          </header>

          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-semibold sm:text-lg lg:text-xl">
                    {section.title}
                  </h3>
                </div>

                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-1 sm:-mx-0 sm:px-0 lg:gap-5">
                  {universesBySection[section.id].map((universe) => (
                    <CardWithPoster
                      key={universe.id}
                      universeId={universe.id}
                      title={universe.title}
                      support={universe.support}
                      emotion={universe.emotion}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

type CardProps = {
  universeId: string;
  title: string;
  support: number;
  emotion: string;
};

function CardWithPoster({ universeId, title, support, emotion }: CardProps) {
  const staticPoster = posterByUniverseId[universeId];
  const { posterUrl } = usePoster(staticPoster ? undefined : title);
  const finalPoster = staticPoster || posterUrl || placeholderPoster;
  return (
    <Link
      href={`/univers/${universeId}`}
      className="group relative w-52 shrink-0 cursor-pointer overflow-hidden rounded-md bg-zinc-900/60 shadow-[0_16px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-900 sm:w-56 lg:w-64"
    >
      <div
        className="relative aspect-[16/9] w-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black"
        style={
          finalPoster
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.75), transparent 50%), radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 55%), url(${finalPoster})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
          <h4 className="line-clamp-2 text-[0.8rem] font-semibold text-zinc-50">
            {title}
          </h4>
          <div className="flex items-center justify-between text-[0.7rem] font-medium text-zinc-200">
            <span>
              {support}
              <span className="text-[0.65rem] text-zinc-400"> soutien</span>
            </span>
            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-zinc-100">
              {emotion}
            </span>
          </div>
        </div>
      </div>
      <div className="px-3 pb-2 pt-1 text-[0.65rem] text-zinc-500">
        1 compte = 1 voix • Cliquer pour donner ton avis
      </div>
    </Link>
  );
}

type MovieResult = {
  tmdbId: number;
  title: string;
  overview?: string;
  posterUrl?: string | null;
  releaseDate?: string;
  voteAverage?: number;
};

function CardMovie({ tmdbId, title, posterUrl, overview, releaseDate, voteAverage }: MovieResult) {
  return (
    <Link
      href={`/univers/${tmdbId}`}
      className="group relative w-52 shrink-0 overflow-hidden rounded-md bg-zinc-900/60 shadow-[0_16px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-900 sm:w-56 lg:w-64"
    >
      <div
        className="relative aspect-[16/9] w-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black"
        style={
          posterUrl
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%), url(${posterUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      />
      <div className="space-y-2 px-3 pb-3 pt-2 text-[0.75rem] text-zinc-200">
        <p className="line-clamp-2 text-[0.85rem] font-semibold text-zinc-50">{title}</p>
        {releaseDate && (
          <p className="text-[0.7rem] text-zinc-500">Sortie : {releaseDate}</p>
        )}
        {typeof voteAverage === "number" && voteAverage > 0 && (
          <p className="text-[0.7rem] text-amber-300">Note TMDB : {voteAverage.toFixed(1)}/10</p>
        )}
        {overview && (
          <p className="line-clamp-3 text-[0.7rem] text-zinc-400">{overview}</p>
        )}
      </div>
    </Link>
  );
}
