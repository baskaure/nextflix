"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSequels } from "@/contexts/SequelsContext";
import { useUser } from "@/contexts/UserContext";
import { Navbar } from "@/components/Navbar";
import { getUniverseById } from "@/lib/universes";
import { placeholderPoster } from "@/lib/posters";

export default function SuiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getSequel, signSequel, unsignSequel } = useSequels();
  const { isAuthenticated } = useUser();
  const [sequel, setSequel] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [signing, setSigning] = React.useState(false);

  const sequelId = params.id as string;

  React.useEffect(() => {
    loadSequel();
  }, [sequelId]);

  const loadSequel = async () => {
    setLoading(true);
    const data = await getSequel(sequelId);
    setSequel(data);
    setLoading(false);
  };

  const handleSign = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/suites/${sequelId}`);
      return;
    }

    setSigning(true);
    if (sequel.hasSigned) {
      await unsignSequel(sequelId);
    } else {
      await signSequel(sequelId);
    }
    await loadSequel();
    setSigning(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
          <div className="text-center text-zinc-400">Chargement...</div>
        </main>
      </div>
    );
  }

  if (!sequel) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
        <Navbar />
        <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
          <div className="rounded-xl border border-zinc-800/70 bg-zinc-950/50 p-8 text-center">
            <p className="text-zinc-400">Suite introuvable.</p>
            <Link
              href="/suites"
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Retour aux suites
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const universe = getUniverseById(sequel.universeId);
  const backdrop = sequel.backdropUrl || placeholderPoster;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-5 pt-24 pb-16 sm:px-10">
        <div className="mb-6">
          <Link
            href="/suites"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            ← Retour aux suites
          </Link>
        </div>

        <div
          className="relative mb-6 h-96 overflow-hidden rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_40px_80px_rgba(0,0,0,0.8)] sm:h-[28rem]"
          style={
            backdrop
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), transparent 55%), radial-gradient(circle at top left, rgba(248,113,113,0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(24,24,27,0.95), transparent 55%), url(${backdrop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {!backdrop && (
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.35),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(24,24,27,0.95),_transparent_55%)]" />
          )}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur-sm">
                  {formatLabel(sequel.format)}
                </span>
                <span className="text-sm text-zinc-300">
                  {sequel.signatureCount} signature{sequel.signatureCount > 1 ? "s" : ""}
                </span>
              </div>
              <h1 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {sequel.title}
              </h1>
            </div>
            <div className="text-sm text-zinc-200">
              <p>Univers : {universe?.title || sequel.universeId}</p>
              {sequel.creatorName && <p>Créé par {sequel.creatorName}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-8 shadow-xl shadow-black/60">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Description</h2>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{sequel.description}</p>
          </div>

          <div className="border-t border-zinc-900 pt-6">
            <button
              onClick={handleSign}
              disabled={signing}
              className={`w-full rounded-md px-6 py-3 text-sm font-semibold shadow-lg shadow-black/40 transition disabled:cursor-not-allowed disabled:shadow-none ${
                sequel.hasSigned
                  ? "border border-zinc-700 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800/70"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {signing
                ? "Traitement..."
                : sequel.hasSigned
                ? "Retirer ma signature"
                : "Signer cette suite"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

