# 📜 Conventions de Développement

## 🎨 Design & UI
- **Thème** : Modern Explorer (Minimalisme, Sophistication).
- **Couleurs** : 
  - Accent : `#F97316` (Orange Aventure)
  - Secondary : `#0D9488` (Teal)
  - Primary : `#2563EB` (Bleu)
- **Composants** : Utiliser des bordures arrondies (`rounded-2xl`, `rounded-3xl`) et des effets de flou (`backdrop-blur-xl`).

## ⚙️ Prisma
- Toujours utiliser le singleton `import { prisma } from "@/lib/prisma"` au lieu d'instancier un nouveau client.
- Les migrations doivent utiliser la variable `DIRECT_URL` dans le `.env`.

## 📍 Géolocalisation
- Utiliser le hook `useGeolocation.js`.
- Toujours prévoir un fallback (Paris par défaut) pour les tests en environnement sans GPS.
