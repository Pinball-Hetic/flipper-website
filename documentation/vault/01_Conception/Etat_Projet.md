# État du Projet : Pocket Maps

## 🎯 Objectif Actuel
Stabilisation de l'infrastructure et de la carte interactive avant l'implémentation de la logique de jeu.

## ✅ Accomplissements (Dernière MàJ : 5 Avril 2026)
- **Carte & Géo** : Carte Leaflet stable avec mode `reactStrictMode: false`. Marqueur joueur et checkpoints fonctionnels.
- **Infrastructure** : Dockerisation complète (Dev/Prod) avec automatisation via `Taskfile`.
- **Base de Données** : Connexion Supabase via Prisma 7.5 fonctionnelle (Architecture 3-Tiers).
- **Simplification** : Retrait du système d'XP et de niveaux pour une UI plus minimaliste.

## 🛠 Problèmes Connus
- Le Fast Refresh peut parfois nécessiter un rechargement manuel si la connexion GPS est instable.

## 🚀 Prochaines Étapes
1. **Logique de Visite** : Implémenter le rayon de détection pour valider la visite d'un checkpoint.
2. **Persistence** : Sauvegarder les visites en base de données.
3. **Badges** : Implémenter le système de succès (badges) en remplacement de l'XP.
