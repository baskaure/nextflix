import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type TmdbMovie = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
};

async function fetchMovie(id: string): Promise<TmdbMovie | null> {
  if (!TMDB_API_KEY) return null;
  const res = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=fr`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function TmdbMoviePage({ params }: { params: { id: string } }) {
  const movie = await fetchMovie(params.id);

  if (!movie) {
    notFound();
  }

  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMG_BASE}/w1280${movie.backdrop_path}`
    : movie.poster_path
    ? `${TMDB_IMG_BASE}/w780${movie.poster_path}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-5 pt-24 pb-16 sm:px-10">
        <section
          className="relative overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
          style={
            backdropUrl
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent 45%), url(${backdropUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!backdropUrl && (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
          )}
          <div className="relative flex flex-col gap-6 p-6 sm:p-10">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-black/70 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                Fiche film (TMDB)
              </span>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              <p className="text-xs font-medium text-amber-400/90">
                Projet communautaire – non officiel
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-[1fr,1fr] text-sm text-zinc-200">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Résumé</p>
                <p className="leading-relaxed text-zinc-100">
                  {movie.overview || "Pas de synopsis disponible."}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Infos clés</p>
                <ul className="space-y-1 text-zinc-100">
                  <li>Sortie : {movie.release_date || "N/A"}</li>
                  <li>Note TMDB : {movie.vote_average?.toFixed(1) ?? "N/A"} / 10</li>
                  <li>Popularité : {Math.round(movie.popularity)}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-3 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Donner sa voix
            </p>
            <h2 className="text-lg font-semibold sm:text-xl">
              Tu veux influencer une suite ou un spin-off lié à ce film ?
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/univers/${params.id}/signature`}
              className="flex-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-semibold text-black shadow-lg shadow-black/40 transition hover:bg-zinc-200"
            >
              Je donne mon avis sur la suite idéale
            </Link>
            <Link
              href={`/univers/${params.id}/directions`}
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-center text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/70"
            >
              Voir les directions créatives
            </Link>
            <Link
              href={`/univers/${params.id}/questionnaire`}
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-center text-sm font-medium text-zinc-100 transition hover:bg-zinc-800/70"
            >
              Répondre au questionnaire “vrais fans”
            </Link>
          </div>
          <p className="text-xs text-zinc-500">
            1 compte = 1 voix. Pas de promesse de production, aucun financement.
          </p>
        </section>
      </main>
    </div>
  );
}


