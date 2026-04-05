# 🏗️ Répartition des Responsabilités

Ce document définit le rôle de chaque service dans l'architecture monorepo de Pocket Maps.

## 📱 Client (`apps/client`) - Le Backend-for-Frontend (BFF)
Le client n'est pas qu'une simple interface, il agit comme un **BFF** pour orchestrer l'expérience utilisateur.

- **Authentification (Better Auth)** : Gestion complète des sessions, cookies, et providers OAuth.
- **Rendu & UI** : Next.js 15 (RSC, RCC), Tailwind CSS, Framer Motion.
- **Gestion d'État** : Cache SWR/React Query et état local.
- **Actions Immédiates** : Server Actions pour les interactions simples (ex: "liker" un point).
- **Optimisation Mobile** : PWA, Service Workers, et assets statiques.

## 🛡️ Gateway (`apps/gateway`) - Le Gardien
La Gateway est l'unique point d'entrée pour les services externes ou les futures applications mobiles natives.

- **Routage Centralisé** : Redirection des requêtes vers les bons microservices.
- **Rate Limiting** : Protection contre le spam et les attaques par force brute.
- **Sécurité** : Validation des schémas de données (Zod), filtrage XSS/SQLi.
- **Monitoring** : Centralisation des logs de trafic et métriques de performance.
- **SSL/TLS** : Terminaison des certificats si non géré par un proxy inverse (Traefik/Nginx).

## ⚙️ Server (`apps/server`) - Le Cœur Métier
Le serveur contient la logique "lourde" et les calculs critiques qui ne doivent pas dépendre du cycle de vie du frontend.

- **Logique Métier Complexe** : Calculs de distance PostGIS, validation anti-triche des positions GPS.
- **Traitement de Données** : Agrégation de scores, génération de statistiques globales.
- **Tâches de Fond** : Workers, cron jobs (ex: réinitialisation hebdomadaire des leaderboards).
- **Intégrations Tierces** : Communication avec des APIs externes (météo, APIs de lieux) nécessitant des secrets côté serveur.

## 🗄️ Database Package (`packages/database`) - La Source de Vérité
Ce package partagé garantit que tous les services parlent le même langage.

- **Schéma Prisma** : Définition unique des modèles (User, Machine, Score, etc.).
- **Migrations** : Historique des changements de structure SQL.
- **Client Singleton** : Instance optimisée du PrismaClient avec Driver Adapter pour Supabase.
- **Seeding** : Données de test et de référence.

---
*Dernière mise à jour : 5 Avril 2026*
*Décision d'architecture : Better Auth positionné dans le Client (Pattern BFF).*
