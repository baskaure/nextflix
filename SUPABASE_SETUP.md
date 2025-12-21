# Configuration Supabase pour Nextflix

## 1. Créer un projet Supabase

1. Va sur [https://app.supabase.com](https://app.supabase.com)
2. Crée un nouveau projet (ou utilise un projet existant)
3. Note ton **Project URL** et ta **anon/public key** (Settings > API)

## 2. Configurer les variables d'environnement

Crée un fichier `.env.local` à la racine du projet avec :

```env
NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=ton_anon_key_ici
```

## 3. Exécuter le schéma SQL

1. Dans ton dashboard Supabase, va dans **SQL Editor**
2. Copie-colle le contenu du fichier `supabase/schema.sql`
3. Exécute la requête

Ce schéma va créer :
- Les tables nécessaires (user_profiles, signatures, direction_verdicts, questionnaires, favorites, alerts)
- Les index pour les performances
- Les policies RLS (Row Level Security) pour la sécurité
- Un trigger pour créer automatiquement le profil utilisateur lors de l'inscription

## 4. Vérifier la configuration

1. Redémarre ton serveur de développement (`npm run dev`)
2. Va sur `/auth/register` et crée un compte de test
3. Vérifie dans Supabase (Table Editor) que :
   - Un utilisateur apparaît dans `auth.users`
   - Un profil apparaît dans `user_profiles`

## 5. Désactiver la confirmation email (optionnel pour le MVP)

Par défaut, Supabase envoie un email de confirmation. Pour le MVP, tu peux désactiver ça :

1. Va dans **Authentication > Settings**
2. Désactive **"Enable email confirmations"**

## Notes importantes

- **Sécurité** : Les policies RLS garantissent que chaque utilisateur ne peut voir/modifier que ses propres données
- **Performance** : Les index sont créés pour optimiser les requêtes
- **Trigger automatique** : Le profil utilisateur est créé automatiquement lors de l'inscription via un trigger PostgreSQL

## Dépannage

Si tu rencontres des erreurs :
1. Vérifie que les variables d'environnement sont bien définies
2. Vérifie que le schéma SQL a bien été exécuté
3. Vérifie les logs dans la console du navigateur et dans Supabase (Logs > Postgres Logs)

