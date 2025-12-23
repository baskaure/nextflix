import * as React from "react";

type PosterResult = {
  posterUrl: string | null;
  backdropUrl: string | null;
};

const posterCache = new Map<string, PosterResult>();

export function usePoster(title?: string, year?: string | number) {
  const [data, setData] = React.useState<PosterResult | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!title) return;
    const key = year ? `${title}-${year}` : title;
    if (posterCache.has(key)) {
      setData(posterCache.get(key) || null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ title });
    if (year) params.set("year", String(year));
    fetch(`/api/poster?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((json) => {
        const result: PosterResult = {
          posterUrl: json.posterUrl || null,
          backdropUrl: json.backdropUrl || null,
        };
        posterCache.set(key, result);
        if (!cancelled) setData(result);
      })
      .catch(() => {
        posterCache.set(key, { posterUrl: null, backdropUrl: null });
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [title, year]);

  return {
    posterUrl: data?.posterUrl ?? null,
    backdropUrl: data?.backdropUrl ?? null,
    loading,
  };
}


