"use client";

import * as React from "react";
import Link from "next/link";
import { useSequels } from "@/contexts/SequelsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import { getUniverseById } from "@/lib/universes";
import type { Universe } from "@/lib/universes";

export default function SuitesPage() {
  const { getAllSequels } = useSequels();
  const { isAuthenticated } = useUser();
  const [sequels, setSequels] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<"signatures" | "recent">("signatures");

  React.useEffect(() => {
    loadSequels();
  }, [sortBy]);

  const loadSequels = async () => {
    setLoading(true);
    const data = await getAllSequels(sortBy);
    setSequels(data);
    setLoading(false);
  };

  const formatLabel = (format: string) => {
    switch (format) {
      case "film":
        return "Film";
      case "serie":
        return "Série";
      case "anime":
        return "Animé";
      case "miniserie":
        return "Mini-série";
      default:
        return format;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Suites en tendance</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Les suites créées par les fans, triées par popularité
              </p>
            </div>
            {isAuthenticated && (
              <Link
                href="/suites/creer"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Créer une suite
              </Link>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("signatures")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                sortBy === "signatures"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/70"
              }`}
            >
              Plus de signatures
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                sortBy === "recent"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/70"
              }`}
            >
              Plus récentes
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-zinc-400">Chargement...</div>
        ) : sequels.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-8 text-center">
            <p className="text-zinc-400">Aucune suite pour le moment.</p>
            {isAuthenticated && (
              <Link
                href="/suites/creer"
                className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Créer la première suite
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sequels.map((sequel) => {
              const universe: Universe | undefined = getUniverseById(sequel.universeId);
              return (
                <Link
                  key={sequel.id}
                  href={`/suites/${sequel.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black transition hover:border-zinc-700 hover:shadow-xl hover:shadow-black/60"
                >
                  {sequel.backdropUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 transition group-hover:opacity-30"
                      style={{ backgroundImage: `url(${sequel.backdropUrl})` }}
                    />
                  )}
                  <div className="relative p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-100">
                        {formatLabel(sequel.format)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {sequel.signatureCount} signature{sequel.signatureCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold leading-tight">{sequel.title}</h2>
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
                      {sequel.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Univers : {universe?.title || sequel.universeId}</span>
                      {sequel.creatorName && <span>Par {sequel.creatorName}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

