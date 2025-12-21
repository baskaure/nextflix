"use client";

import Link from "next/link";
import { sections, universesBySection } from "@/lib/universes";
import { Navbar } from "@/components/Navbar";

export default function Home() {
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
            Version fans : l’endroit où l’on décide quelles histoires méritent
            une suite… et comment ne pas les rater.
          </p>
          <p>
            Nextflix ne produit pas des films. Nextflix produit de la clarté.
          </p>
        </footer>
      </main>

      {/* Écran 2 — Home Catalogue (faux Netflix) */}
      <section
        id="catalogue"
        className="border-t border-zinc-900/60 bg-gradient-to-b from-black via-[#050509] to-black px-4 pb-16 pt-6 sm:px-8 sm:pb-20 sm:pt-10"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-500">
                  Baromètre des suites
                </p>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  Explorer les univers sous pression
                </h2>
              </div>
              <p className="hidden text-[0.7rem] text-zinc-500 sm:block">
                Scroll horizontal sur chaque rangée, comme sur Netflix.
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
                  <button
                    type="button"
                    className="text-[0.75rem] font-medium uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-3 pt-1 sm:-mx-0 sm:px-0 lg:gap-5">
                  {universesBySection[section.id].map((universe) => (
                    <Link
                      key={universe.id}
                      href={`/univers/${universe.id}`}
                      className="group relative w-52 shrink-0 cursor-pointer overflow-hidden rounded-md bg-zinc-900/60 shadow-[0_16px_30px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:bg-zinc-900 sm:w-56 lg:w-64"
                    >
                      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-zinc-700 via-zinc-900 to-black">
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,_rgba(0,0,0,0.75),_transparent_50%),radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
                        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3">
                          <h4 className="line-clamp-2 text-[0.8rem] font-semibold text-zinc-50">
                            {universe.title}
                          </h4>
                          <div className="flex items-center justify-between text-[0.7rem] font-medium text-zinc-200">
                            <span>
                              {universe.support}
                              <span className="text-[0.65rem] text-zinc-400">
                                {" "}
                                soutien
                              </span>
                            </span>
                            <span className="rounded-full bg-black/70 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-zinc-100">
                              {universe.emotion}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-3 pb-2 pt-1 text-[0.65rem] text-zinc-500">
                        1 compte = 1 voix • Cliquer pour donner ton avis
                      </div>
                    </Link>
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
