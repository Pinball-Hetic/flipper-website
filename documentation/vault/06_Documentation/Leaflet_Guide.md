# 🗺️ Guide d'Utilisation de Leaflet (Next.js 15)

Ce document explique comment manipuler la carte interactive et les marqueurs géographiques.

## ⚠️ Point d'Attention : SSR & Hydratation

Leaflet manipule directement le DOM, ce qui pose problème avec le rendu côté serveur (SSR) de Next.js.

- **Solution** : Tous les composants utilisant `react-leaflet` doivent être importés dynamiquement avec `ssr: false`.
- **Fichier Clé** : `src/components/Map/MapContainer.js`.

```javascript
const DynamicMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse" />
});
```

## 🎨 Personnalisation de la Carte

### 1. Fond de Carte (TileLayer)
Nous utilisons **CartoDB Positron** pour un rendu épuré et moderne :
- URL : `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`

### 2. Icônes SVG Personnalisées
Les icônes sont définies en Base64 dans `DynamicMap.js`. 
- **Joueur** : Un point bleu avec un effet de "pulse" défini dans `globals.css`.
- **Checkpoints** : Des formes hexagonales Teal (`#0D9488`).

## 📍 Gestion de la Position

### RecenterButton
Un composant interne à la carte qui utilise le hook `useMap()` de Leaflet pour recentrer la vue sur le joueur avec une animation fluide :
```javascript
map.flyTo(position, 16);
```

### Hook useGeolocation
Situé dans `src/hooks/useGeolocation.js`, il encapsule `navigator.geolocation` et gère :
- Le suivi en temps réel (`watchPosition`).
- Les erreurs de permission.
- La position par défaut (Paris) pour le développement.

---
*Dernière mise à jour : 4 Avril 2026*
