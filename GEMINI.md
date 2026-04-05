# Mémoire du Projet : Pocket Maps (Modern Explorer)

## 📋 Présentation
Application web mobile-first d'exploration urbaine et de géolocalisation. Style visuel "Modern Explorer" (minimaliste, sophistiqué, typographie géométrique).

## 🛠 Stack Technique
- **Frontend** : Next.js 15 (App Router, JavaScript)
- **Carte** : Leaflet via `react-leaflet` (Style CartoDB Positron, épuré)
- **Style** : Tailwind CSS + Framer Motion
- **Typographie** : Jost (via Google Fonts)
- **Déploiement** : Docker (Build multi-étapes, mode standalone)

## 📍 État Actuel du Développement
- [x] Initialisation du projet Next.js avec Tailwind.
- [x] Hook de géolocalisation en temps réel (`src/hooks/useGeolocation.js`).
- [x] Composant de carte interactive avec style "Modern Explorer".
- [x] Marqueur joueur (pulsing dot) et checkpoints hexagonaux.
- [x] UI Raffinée : Menu d'action central orange et interface épurée.
- [x] Suppression Système XP : Retrait de la logique de niveau et d'XP (DB et Frontend).
- [x] Connexion Database : Prisma v7.5 + Supabase (PostgreSQL) validée et fonctionnelle.
- [x] Documentation : Vault Obsidian créé et structuré.
- [x] Sécurité : Architecture 3-Tiers documentée et client singleton sécurisé.
- [x] Intégration Supabase : MCP Server ajouté et Supabase Agent Skills installés.

## 📂 Structure des Fichiers Clés (Monorepo)
- `apps/client` : Frontend Next.js 15 (Modern Explorer UI).
- `apps/server` : Backend Express (API & Logique métier).
- `apps/gateway` : Gateway Express (Middleware, Proxy, Auth).
- `packages/database` : Source unique pour Prisma et le client DB.
- `package.json` : Orchestration globale via Workspaces NPM.

## 💡 Décisions Techniques & Corrections
1. **Identité Visuelle** : Abandon du thème Pokémon Go au profit d'un design "Modern Explorer" (Orange #F97316, Teal #0D9488, Blue #2563EB).
2. **Icons** : Utilisation d'icônes SVG intégrées pour une flexibilité maximale sans assets externes lourds.
3. **Typography** : Passage à la police "Jost" pour un look premium et lisible sur mobile.

## 🚀 Prochaines Étapes
1. **Database** : Installer Prisma et configurer une connexion vers Supabase (PostgreSQL + PostGIS).
2. **Logique Géo** : Implémenter la distance minimum pour interagir avec les checkpoints (rayon d'activation).
3. **Persistance** : Créer le schéma de base pour les utilisateurs et l'historique d'exploration.
4. **Haptique** : Ajouter des vibrations et retours sonores lors de la découverte de points.
