import DirectionsClient from "./DirectionsClient";
import { getUniverseById, type Universe } from "@/lib/universes";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type DirectionsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DirectionsPage({ params }: DirectionsPageProps) {
  const { id } = await params;
  let universe: Universe | undefined = getUniverseById(id);

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
          universe = {
            id,
            title: movie?.title || `Univers démo – ${id}`,
            support: 60,
            emotion: "Épique",
            description:
              movie?.overview ||
              "Univers de démonstration non encore configuré dans le baromètre. Ces directions illustrent le module de test créatif.",
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
          "Univers de démonstration non encore configuré dans le baromètre. Ces directions illustrent le module de test créatif.",
      };
    }
  }

  return <DirectionsClient universe={universe} />;
}

