# État du Projet : Pocket Maps

## 🎯 Objectif Actuel
Stabilisation de l'infrastructure et de la carte interactive avant l'implémentation de la logique de jeu.

## ✅ Accomplissements (Dernière MàJ : 6 Avril 2026)
- **Stack Upgrade** : Mise à jour majeure vers **Next.js 16.2**, **React 19.2**, **Tailwind CSS v4.2** et **Prisma 7.6**.
- **Carte & Géo** : Carte Leaflet stable avec mode `reactStrictMode: false`. Marqueur joueur et checkpoints fonctionnels.
- **Infrastructure** : Migration vers une architecture de ports dédiée (8881, 8882, 8888). Gateway Express robuste gérant le routage Auth/API (Express 5.2).

## 🛠 Problèmes Connus
- Le Fast Refresh peut parfois nécessiter un rechargement manuel si la connexion GPS est instable.

## 🚀 Prochaines Étapes
1. **Logique de Visite** : Implémenter le rayon de détection pour valider la visite d'un checkpoint.
2. **Persistence** : Sauvegarder les visites en base de données.
3. **Badges** : Implémenter le système de succès (badges) en remplacement de l'XP.
