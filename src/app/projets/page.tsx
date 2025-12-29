"use client";

import * as React from "react";
import Link from "next/link";
import { useProjects } from "@/contexts/ProjectsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import { getUniverseById } from "@/lib/universes";
import type { Universe } from "@/lib/universes";

export default function ProjetsPage() {
  const { getAllProjects } = useProjects();
  const { isAuthenticated } = useUser();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<"signatures" | "funding" | "recent">("signatures");

  React.useEffect(() => {
    loadProjects();
  }, [sortBy]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getAllProjects(sortBy);
    setProjects(data);
    setLoading(false);
  };

  const formatType = (type: string) => {
    switch (type) {
      case "court-metrage":
        return "Court-métrage";
      case "film":
        return "Film";
      case "serie":
        return "Série";
      default:
        return type;
    }
  };

  const getFundingProgress = (project: any) => {
    if (!project.fundingGoal) return null;
    const progress = (project.totalContributions / project.fundingGoal) * 100;
    return Math.min(progress, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Projets de fans</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Courts-métrages et films proposés par la communauté
              </p>
            </div>
            {isAuthenticated && (
              <Link
                href="/projets/creer"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Créer un projet
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
              onClick={() => setSortBy("funding")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                sortBy === "funding"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/70"
              }`}
            >
              Financement
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                sortBy === "recent"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800/70"
              }`}
            >
              Plus récents
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-zinc-400">Chargement...</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-8 text-center">
            <p className="text-zinc-400">Aucun projet pour le moment.</p>
            {isAuthenticated && (
              <Link
                href="/projets/creer"
                className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Créer le premier projet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const universe: Universe | undefined = getUniverseById(project.universeId);
              const fundingProgress = getFundingProgress(project);
              return (
                <Link
                  key={project.id}
                  href={`/projets/${project.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black transition hover:border-zinc-700 hover:shadow-xl hover:shadow-black/60"
                >
                  {project.backdropUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-20 transition group-hover:opacity-30"
                      style={{ backgroundImage: `url(${project.backdropUrl})` }}
                    />
                  )}
                  <div className="relative p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-100">
                        {formatType(project.projectType)}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {project.signatureCount} signature{project.signatureCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold leading-tight">{project.title}</h2>
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-400">
                      {project.description}
                    </p>
                    {project.fundingGoal && (
                      <div className="mb-4 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Financement</span>
                          <span className="font-medium text-zinc-200">
                            {Math.round(project.totalContributions)}€ / {project.fundingGoal}€
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                          <div
                            className="h-full bg-red-600 transition-all"
                            style={{ width: `${fundingProgress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>Univers : {universe?.title || project.universeId}</span>
                      {project.creatorName && <span>Par {project.creatorName}</span>}
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

