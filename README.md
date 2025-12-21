# Nextflix - Le baromètre des histoires de demain

Plateforme communautaire permettant aux fans d'exprimer, structurer et valider les directions idéales de suites, spin-offs ou extensions d'univers culturels.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

**Important** : Ce projet utilise Supabase pour l'authentification et la persistance des données.

1. Suis les instructions détaillées dans [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
2. Crée un fichier `.env.local` avec tes clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) dans ton navigateur.

## 📋 Fonctionnalités

- ✅ **Authentification** : Inscription/Connexion avec Supabase Auth
- ✅ **Signature rapide** : 3 questions en 30 secondes
- ✅ **Directions créatives** : Verdicts sur les directions proposées (style Tinder)
- ✅ **Questionnaire "vrais fans"** : Lignes rouges, non négociables, sentiment attendu
- ✅ **Baromètre visuel** : Synthèse des données collectées
- ✅ **Favoris & Alertes** : Suivre les univers qui t'intéressent
- ✅ **Persistance** : Toutes les données sont sauvegardées dans Supabase

## 🏗️ Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── auth/              # Pages d'authentification
│   └── univers/[id]/      # Pages par univers
├── components/            # Composants réutilisables
├── contexts/              # Contexts React (UserContext)
├── hooks/                 # Hooks personnalisés
├── lib/                   # Utilitaires et clients
│   ├── supabase/         # Client Supabase
│   └── universes.ts      # Données mock des univers
└── types/                 # Types TypeScript
```

## 🔐 Sécurité

- **Row Level Security (RLS)** : Chaque utilisateur ne peut voir/modifier que ses propres données
- **Authentification sécurisée** : Supabase Auth avec hash des mots de passe
- **Policies PostgreSQL** : Contrôle d'accès au niveau de la base de données

## 📝 Notes MVP

- Les données sont stockées dans Supabase (PostgreSQL)
- L'authentification utilise Supabase Auth
- Le schéma de base de données est défini dans `supabase/schema.sql`
- Pour le MVP, la confirmation email peut être désactivée dans Supabase

## 🛠️ Technologies

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + PostgreSQL)
- **React Context** (gestion d'état)

## 📚 Documentation

- [Configuration Supabase](./SUPABASE_SETUP.md) - Guide de configuration détaillé
- [Cahier des charges](./CAHIER_DES_CHARGES.md) - Spécifications complètes du projet

## 🚢 Déploiement

Le projet peut être déployé sur Vercel, Netlify ou tout autre hébergeur compatible Next.js.

N'oublie pas de configurer les variables d'environnement Supabase dans les paramètres de déploiement.
