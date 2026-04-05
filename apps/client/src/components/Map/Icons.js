"use client";

import L from "leaflet";

// On doit vérifier si window est défini pour Leaflet
const createCustomIcon = (iconUrl, size = [40, 40]) => {
  if (typeof window === "undefined") return null;

  return new L.Icon({
    iconUrl,
    iconRetinaUrl: iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: "custom-leaflet-icon",
  });
};

export const PLAYER_ICON = "/icons/player.png";
export const CHECKPOINT_ICON = "/icons/checkpoint.png";

export { createCustomIcon };
