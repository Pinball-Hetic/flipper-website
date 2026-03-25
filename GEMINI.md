# Mémoire du Projet : Pocket Maps (Style Pokémon Go)

## 📋 Présentation
Application web mobile-first inspirée de l'interface et de l'expérience utilisateur de Pokémon Go.

## 🛠 Stack Technique
- **Frontend** : Next.js 15 (App Router, JavaScript)
- **Carte** : Leaflet via `react-leaflet` (Import dynamique sans SSR)
- **Style** : Tailwind CSS + Framer Motion (pour les animations)
- **Déploiement** : Docker (Build multi-étapes, mode standalone)

## 📍 État Actuel du Développement
- [x] Initialisation du projet Next.js avec Tailwind.
- [x] Hook de géolocalisation en temps réel (`src/hooks/useGeolocation.js`).
- [x] Composant de carte interactive avec style épuré (`src/components/Map/DynamicMap.js`).
- [x] Marqueur joueur animé et checkpoints mockés.
- [x] UI Pokémon Go : Écran de chargement, barre de niveau, menu Pokéball.
- [x] Dockerisation complète et fonctionnelle.

## 📂 Structure des Fichiers Clés
- `src/app/page.js` : Point d'entrée, gestion des données mockées et de l'état de chargement.
- `src/components/Map/DynamicMap.js` : Cœur de l'intégration Leaflet, gestion des icônes SVG/Base64.
- `src/hooks/useGeolocation.js` : Gestion propre du `navigator.geolocation` avec fallback sur Paris.
- `Dockerfile` : Configuration de production optimisée (3 stages : deps, builder, runner).

## 💡 Décisions Techniques & Corrections
1. **Alias de chemin** : Un fichier `jsconfig.json` a été ajouté pour supporter l'alias `@/` dans l'environnement Docker.
2. **PostCSS** : `autoprefixer` a été ajouté explicitement aux `devDependencies` pour corriger une erreur de build Webpack dans Docker.
3. **Docker Build** : Le `Dockerfile` utilise `npm install` au lieu de `npm ci` tant qu'un fichier `package-lock.json` n'est pas généré localement.
4. **Icons** : Actuellement, les icônes sont des SVGs encodés en Base64 dans `DynamicMap.js` pour garantir l'affichage sans dépendances d'assets externes pour le moment.

## 🚀 Prochaines Étapes
1. Remplacer les SVGs par de vrais assets dans `public/icons/` (`player.png`, `checkpoint.png`).
2. Implémenter la logique d'interaction avec les checkpoints (ex: distance minimum pour cliquer).
3. Connecter un backend pour persister les données utilisateur et les positions des objets.
4. Ajouter des sons et des retours haptiques pour renforcer l'immersion mobile.
