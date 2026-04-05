# ⏳ Chronologie du Projet

## 4 Avril 2026

### 🎨 Refonte Visuelle : "Modern Explorer"
- **Décision** : Abandon de l'esthétique "Pokémon Go" pour une identité propre.
- **Actions** :
    - Remplacement des icônes SVG par des formes minimalistes (pulsing dot pour le joueur, hexagones pour les checkpoints).
    - Palette de couleurs : **Orange Aventure** (#F97316), **Teal** (#0D9488), **Bleu** (#2563EB).
    - Typographie : Intégration de la police **Jost** (Google Fonts).
    - UI : Nouveaux styles pour le badge de niveau, le menu d'action central et l'écran de chargement.

### 🗄️ Mise en place de Prisma v7.5.0
- **Décision** : Utiliser Prisma pour se connecter à Supabase avec une architecture 3-tiers.
- **Actions** :
    - Installation de `prisma@7.5.0` et `@prisma/client`.
    - Création du schéma (User, Checkpoint, Visit).
    - Configuration de `prisma.config.ts` (Nouveauté Prisma 7).
    - Création du singleton `src/lib/prisma.js` avec Driver Adapter.

### 🛡️ Sécurité & Documentation
- **Décision** : Création d'une documentation pérenne pour les agents IA et les développeurs.
- **Actions** :
    - Création du **Vault Obsidian** dans `documentation/vault/`.
    - Rédaction des guides techniques : Prisma, Leaflet, Docker, Sécurité 3-Tiers.

## 5 Avril 2026

### 🧹 Simplification : Suppression du système d'XP
- **Décision** : Retrait du système de progression et de niveaux pour épurer l'expérience.
- **Actions** : 
    - Suppression de l'UI (Rank, Progress bar) dans `DynamicMap.js`.
    - Nettoyage des modèles Prisma (champs `level` et `xp` déjà retirés).
    - Mise à jour de la mémoire du projet (`GEMINI.md`).

### 🐳 Docker & Taskfile
- **Décision** : Automatiser les workflows de développement et corriger les builds.
- **Actions** :
    - Création d'un `Taskfile.yml` pour centraliser les commandes (`task docker:dev:up`, etc.).
    - Ajout de `npx prisma generate` dans le `Dockerfile` de production.
    - Correction de l'injection des variables d'environnement via `env_file` dans Docker Compose.

### 🗺️ Stabilité Leaflet (Next.js 15)
- **Décision** : Résoudre les crashs liés à l'hydratation et au "double-init" de la carte.
- **Actions** :
    - Migration des attributs SVG vers le format camelCase (JSX standard).
    - Implémentation d'un `MapController` pour gérer les mises à jour de vue sans ré-initialiser le conteneur.
    - Désactivation du `reactStrictMode` dans `next.config.js` pour éviter les conflits Leaflet en développement.
    - Ajout d'un ID stable au `MapContainer`.

