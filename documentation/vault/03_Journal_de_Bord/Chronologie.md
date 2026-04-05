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

### 🛡️ Architecture : Better Auth & Répartition des services
- **Décision** : Maintenir **Better Auth dans `apps/client`** en utilisant le pattern **BFF (Backend-for-Frontend)**.
- **Raison** : Meilleure intégration avec Next.js 15 (Middleware, Server Actions), gestion native des cookies et sécurité simplifiée pour le web.
- **Actions** : 
    - Création du document `02_Architecture/Repartition_Responsabilites.md`.
    - Définition des rôles : Client (BFF/Auth), Gateway (Sécurité/Routing), Server (Métier/Calculs).
    - Validation du partage du `packages/database` entre tous les services.

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

## 6 Avril 2026

### 💎 Design : Glassmorphism Apple Spatial 2026
- **Décision** : Adopter la tendance "Spatial UI" pour une immersion maximale.
- **Actions** :
    - Implémentation de `backdrop-blur-3xl` et de reflets lumineux dynamiques.
    - Création de la classe utilitaire `.glass-panel` et tokens CSS pour le verre poli.
    - Refonte de la barre de navigation et des popups en mode "flottant".
    - Correction des erreurs de build Tailwind via l'intégration des tokens dans `tailwind.config.js`.
    - Remplacement des icônes par `lucide-react` (QR Code central, User pour le profil).

### 🔑 Authentification : Better Auth & Google
- **Décision** : Implémenter un système complet d'authentification tout en permettant l'exploration en tant qu'invité.
- **Actions** :
    - Configuration de **Better Auth** dans `apps/client`.
    - Intégration du provider **Google Social** (via client ID/secret).
    - Création de la `ProfileModal` : un composant hybride gérant connexion email, inscription et login social.
    - Gestion dynamique des sessions : affichage de l'avatar et des statistiques (fictives pour l'instant) une fois connecté.

### 🌐 Infrastructure : Nouvelle Architecture de Ports
- **Décision** : Changer les ports par défaut pour éviter les conflits et clarifier les flux.
- **Nouvelle Config** : 
    - **Gateway** : 8881 (Point d'entrée unique).
    - **Client (Next.js)** : 8888.
    - **Server (Express)** : 8882.
- **Actions** :
    - Mise à jour des `Dockerfiles` (EXPOSE, ENV PORT).
    - Refonte de la logique de proxy de la Gateway pour séparer `/api/auth` (vers Client) du reste de l' `/api` (vers Server).
    - Résolution des problèmes CORS via une politique de "White-list" stricte et l'activation des `credentials`.


