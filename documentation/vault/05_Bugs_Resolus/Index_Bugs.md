# 🐞 Bugs Résolus

### 01 - Erreur Build Docker (Autoprefixer)
- **Problème** : Échec du build Webpack dans le container Docker à cause d'autoprefixer manquant.
- **Solution** : Ajout explicite d' `autoprefixer` dans les `devDependencies` du `package.json`.

### 02 - Hydratation Leaflet (SSR)
- **Problème** : "Window is not defined" lors du rendu côté serveur.
- **Solution** : Utilisation de `dynamic(() => import(...), { ssr: false })` pour charger les composants de carte.

### 03 - Alias `@/` dans Docker
- **Problème** : Les imports utilisant `@/` ne fonctionnaient pas dans le builder Docker.
- **Solution** : Ajout d'un fichier `jsconfig.json` à la racine pour définir les paths.

### 04 - Erreur Prisma 7.5.0 (Invalid Domain Character / Engine Client)
- **Problème** : `npx prisma db push` échouait avec une erreur d'URL invalide, car l'environnement système conservait des placeholders prioritaires. De plus, Prisma 7 exige désormais un Driver Adapter pour les connexions directes.
- **Solution** : 
    1.  Ajout de `dotenv.config({ override: true })` dans `prisma.config.ts` et `src/lib/prisma.js`.
    2.  Installation et configuration de `@prisma/adapter-pg` et `pg`.
    3.  Migration de la configuration des URLs de `schema.prisma` vers `prisma.config.ts`.

### 05 - Erreur Initialisation Leaflet (Next.js 15)
- **Problème** : "Map container is already initialized" lors des re-rendus ou du Fast Refresh.
- **Solution** : 
    1.  Désactivation de `reactStrictMode` dans `next.config.js`.
    2.  Utilisation d'un `initialCenter` stable via `useState`.
    3.  Gestion des mises à jour de vue via un composant `MapController` séparé utilisant `map.setView()`.
    4.  Attribution d'un ID stable au `MapContainer`.

### 06 - Erreur Prisma Client (Docker build)
- **Problème** : `Cannot find module '.prisma/client/default'` dans le runner Docker.
- **Solution** : Ajout explicite de `RUN npx prisma generate` dans l'étape `builder` du `Dockerfile` avant le build Next.js.

### 07 - Erreur CORS (Better Auth + Gateway)
- **Problème** : Blocage du fetch car l'en-tête `Access-Control-Allow-Origin` ne peut pas être un joker (`*`) quand les credentials sont inclus.
- **Solution** : Mise à jour de la Gateway Express pour utiliser une liste blanche d'origines (`8888`, `8881`) et forcer `credentials: true`.

### 08 - Erreur 404 sur /api/auth (Proxy Routing)
- **Problème** : Les requêtes d'authentification étaient envoyées au Serveur au lieu du Client à cause d'une règle proxy `/api` trop large.
- **Solution** : Ajout d'une condition prioritaire dans la Gateway pour router spécifiquement `/api/auth` vers le Client Next.js.

