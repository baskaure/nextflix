"use client";

import Link from "next/link";
import { getUniverseById, type Universe } from "@/lib/universes";

type BarometerPageProps = {
  params: { id: string };
};

function Gauge({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const label =
    clamped >= 85 ? "Attente critique" : clamped >= 65 ? "Attente forte" : "Attente modérée";

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-zinc-500">
            Niveau d&apos;attente global
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-50">{label}</p>
        </div>
        <p className="text-2xl font-semibold text-zinc-50">
          {clamped}
          <span className="text-sm text-zinc-500"> %</span>
        </p>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-900">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-lime-400"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default function BarometerPage({ params }: BarometerPageProps) {
  let universe: Universe | undefined = getUniverseById(params.id);
  const isFallback = !universe;

  if (!universe) {
    universe = {
      id: params.id,
      title: `Univers démo – ${params.id}`,
      support: 60,
      emotion: "Épique",
      description:
        "Univers de démonstration non encore configuré dans le baromètre. Ces données sont purement illustratives.",
    };
  }

  // Pour le MVP, on génère des chiffres mock cohérents avec le % de soutien
  const support = universe.support;
  const essentialShare = Math.round((support * 0.7) / 1); // pseudo-valeur
  const rejectReboot = 69;
  const validatedDirection = 74;
  const preferSeries = 61;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#050508] to-black text-zinc-100">
      {/* Navbar fixe */}
      <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-10">
          <Link
            href={`/univers/${universe.id}`}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            Retour à la fiche univers
          </Link>
          <div className="text-right">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
              Baromètre – synthèse
            </p>
            {isFallback && (
              <p className="mt-1 text-[0.6rem] text-amber-400">
                Univers démo : données non réelles.
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-5 pt-24 pb-16 sm:px-10 md:grid-cols-[3fr,2fr]">
        {/* Colonne gauche : jauge + résumé chiffré */}
        <section className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
              Pression narrative – {universe.title}
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              Vue synthétique pour comprendre en quelques secondes l&apos;intensité de
              l&apos;attente, les rejets clairs et la direction privilégiée par les fans.
            </p>
          </div>

          <Gauge value={support} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Attente essentielle
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">
                {essentialShare}
                <span className="text-base text-zinc-500"> %</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                des signatures considèrent cette suite comme{" "}
                <span className="font-medium text-zinc-100">indispensable</span> pour
                l&apos;univers.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Rejet du reboot
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">
                {rejectReboot}
                <span className="text-base text-zinc-500"> %</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                refusent un{" "}
                <span className="font-medium text-zinc-100">reboot complet</span> de
                l&apos;œuvre au profit d&apos;une vraie continuation.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Direction validée
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">
                {validatedDirection}
                <span className="text-base text-zinc-500"> %</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                valident au moins{" "}
                <span className="font-medium text-zinc-100">une direction créative</span>{" "}
                testée pour cet univers.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Format préféré
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-50">
                {preferSeries}
                <span className="text-base text-zinc-500"> %</span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                privilégient un format{" "}
                <span className="font-medium text-zinc-100">série</span> plutôt qu&apos;un
                film unique ou une mini-série.
              </p>
            </div>
          </div>
        </section>

        {/* Colonne droite : lignes rouges + sentiment */}
        <aside className="space-y-6 rounded-2xl border border-zinc-900/70 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-black p-6 shadow-xl shadow-black/60 sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Synthèse qualitative
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              Ces tendances agrègent les réponses “vrais fans” : lignes rouges,
              éléments non négociables et sentiment attendu.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Top 3 lignes rouges
            </p>
            <ul className="flex flex-wrap gap-2">
              {["Reboot inutile", "Trahison des personnages", "Suite purement commerciale"].map(
                (item) => (
                  <li
                    key={item}
                    className="rounded-full bg-red-950/50 px-3 py-1 text-[0.75rem] text-red-200 ring-1 ring-red-900/60"
                  >
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Doit absolument être respecté
            </p>
            <ul className="flex flex-wrap gap-2">
              {["Personnages", "Ton", "Continuité"].map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-zinc-900 px-3 py-1 text-[0.75rem] text-zinc-100 ring-1 ring-zinc-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Sentiment dominant attendu
            </p>
            <p className="text-sm font-medium text-zinc-50">Épique &amp; dramatique</p>
            <p className="text-[0.8rem] text-zinc-400">
              Les fans attendent une suite plus{" "}
              <span className="font-medium text-zinc-100">mature</span>, qui assume les
              conséquences passées sans renier l&apos;ADN de l&apos;œuvre.
            </p>
          </div>

          <div className="mt-2 space-y-2 rounded-xl border border-zinc-800/70 bg-black/50 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Lecture en 30 secondes
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              Forte pression en faveur d&apos;une{" "}
              <span className="font-medium text-zinc-100">suite fidèle et assumée</span>,
              rejet massif du reboot, préférence nette pour le{" "}
              <span className="font-medium text-zinc-100">format série</span>. Les lignes rouges
              concernent surtout la trahison des personnages et un traitement perçu comme
              opportuniste.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}


