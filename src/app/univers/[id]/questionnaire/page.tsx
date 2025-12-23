import QuestionnaireClient from "./QuestionnaireClient";
import { getUniverseById, type Universe } from "@/lib/universes";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p";

type QuestionnairePageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { id } = await params;
  let universe: Universe | undefined = getUniverseById(id);
  let titleOverride: string | undefined;
  let posterOverride: string | undefined;
  let backdropOverride: string | undefined;

  if (!universe) {
    const tmdbId = Number(id);
    if (Number.isFinite(tmdbId) && TMDB_API_KEY) {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const movie = await res.json();
          titleOverride = movie?.title || undefined;
          posterOverride = movie?.poster_path
            ? `${TMDB_IMG_BASE}/w500${movie.poster_path}`
            : undefined;
          backdropOverride = movie?.backdrop_path
            ? `${TMDB_IMG_BASE}/w1280${movie.backdrop_path}`
            : posterOverride;
          universe = {
            id,
            title: movie?.title || `Univers démo – ${id}`,
            support: 60,
            emotion: "Épique",
            description:
              movie?.overview ||
              "Univers de démonstration non encore configuré dans le baromètre. Cet écran illustre la fiche univers type.",
          };
        }
      } catch {
        // ignore
      }
    }
    if (!universe) {
      universe = {
        id,
        title: `Univers démo – ${id}`,
        support: 60,
        emotion: "Épique",
        description:
          "Univers de démonstration non encore configuré dans le baromètre. Cet écran illustre la fiche univers type.",
      };
    }
  }

  return (
    <QuestionnaireClient
      universe={universe}
      titleOverride={titleOverride}
      posterOverride={posterOverride}
      backdropOverride={backdropOverride}
    />
  );
}

