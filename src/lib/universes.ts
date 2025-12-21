export type EmotionTag =
  | "Épique"
  | "Nostalgique"
  | "Sombre"
  | "Dramatique"
  | "Inspirant";

export type Universe = {
  id: string;
  title: string;
  support: number; // 0–100 %
  emotion: EmotionTag;
  description?: string;
};

export const sections = [
  {
    id: "most-awaited",
    title: "Suites les plus attendues",
  },
  {
    id: "divisive",
    title: "Univers qui divisent",
  },
  {
    id: "dreamed-spinoffs",
    title: "Spin-offs rêvés",
  },
  {
    id: "trending",
    title: "Projets qui montent",
  },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const universesBySection: Record<SectionId, Universe[]> = {
  "most-awaited": [
    {
      id: "ngnl",
      title: "No Game No Life – Saison 2",
      support: 92,
      emotion: "Épique",
      description:
        "Univers isekai coloré, stratégique et méta. Suite réclamée depuis des années.",
    },
    {
      id: "asm",
      title: "The Amazing Spider-Man 3",
      support: 88,
      emotion: "Dramatique",
      description:
        "Une continuité alternative de Spider-Man portée par Andrew Garfield.",
    },
    {
      id: "gow",
      title: "God of War – Série live action",
      support: 81,
      emotion: "Sombre",
      description:
        "Adaptation potentielle du voyage de Kratos dans une série mature et viscérale.",
    },
  ],
  divisive: [
    {
      id: "sw",
      title: "Star Wars – Nouvelle trilogie",
      support: 54,
      emotion: "Nostalgique",
      description:
        "Univers culte mais récemment divisé, entre nostalgie et rejet de certaines directions.",
    },
    {
      id: "hp",
      title: "Harry Potter – Reboot série",
      support: 39,
      emotion: "Sombre",
      description:
        "Retour à Poudlard sous forme de série, mais la fanbase est partagée sur l’idée de reboot.",
    },
    {
      id: "got",
      title: "Game of Thrones – Suite directe",
      support: 46,
      emotion: "Dramatique",
      description:
        "Un monde encore riche mais marqué par une fin controversée.",
    },
  ],
  "dreamed-spinoffs": [
    {
      id: "hp-marauders",
      title: "Les Maraudeurs – Série préquelle",
      support: 87,
      emotion: "Nostalgique",
      description:
        "Focus sur la génération de James, Sirius et Remus, avant la chute.",
    },
    {
      id: "lotr",
      title: "Le Seigneur des Anneaux – Spin-off Númenor",
      support: 79,
      emotion: "Épique",
      description:
        "Exploration d’une période mythique de l’univers de Tolkien, centrée sur les grandes lignées.",
    },
    {
      id: "aot",
      title: "Attack on Titan – Histoires parallèles",
      support: 75,
      emotion: "Sombre",
      description:
        "Récits alternatifs et points de vue inédits dans un monde déjà chargé émotionnellement.",
    },
  ],
  trending: [
    {
      id: "arcane",
      title: "Arcane – Saison 2+",
      support: 90,
      emotion: "Épique",
      description:
        "Univers League of Legends sublimé visuellement, avec une attente énorme sur la suite.",
    },
    {
      id: "dune",
      title: "Dune – Série sur les Grandes Maisons",
      support: 77,
      emotion: "Inspirant",
      description:
        "Approfondir la géopolitique des Maisons de l’empire, avant ou autour de Paul.",
    },
    {
      id: "onepiece",
      title: "One Piece – Spin-offs ciblés",
      support: 69,
      emotion: "Épique",
      description:
        "Explorer des arcs secondaires ou des personnages cultes dans des formats dédiés.",
    },
  ],
};

export function getUniverseById(id: string): Universe | undefined {
  for (const universeList of Object.values(universesBySection)) {
    const match = universeList.find((u) => u.id === id);
    if (match) return match;
  }
  return undefined;
}


