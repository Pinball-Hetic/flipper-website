"use client";

import L from "leaflet";

const createPinIcon = (html: string, size: [number, number]) => {
  if (typeof window === "undefined") return null;

  return new L.DivIcon({
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
    className: "",
  });
};

const createDotIcon = (html: string, size: [number, number]) => {
  if (typeof window === "undefined") return null;

  return new L.DivIcon({
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
    className: "",
  });
};

// Keyframes définis dans globals.css (@keyframes pm-pulse)
const PLAYER_HTML = `
  <div style="position:relative;width:18px;height:18px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;animation:pm-pulse 2s ease-out infinite;"></div>
    <div style="width:14px;height:14px;border-radius:50%;background:#2563EB;border:2.5px solid white;box-shadow:0 1px 6px rgba(37,99,235,0.45);position:relative;z-index:1;flex-shrink:0;"></div>
  </div>`;

const CHECKPOINT_SVG = `
  <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="#F97316" stroke="white" stroke-width="2"/>
    <circle cx="18" cy="18" r="7" fill="white"/>
  </svg>`;

export function createPlayerIcon() {
  return createDotIcon(PLAYER_HTML, [18, 18]);
}

export function createCheckpointIcon(_type?: string) {
  return createPinIcon(CHECKPOINT_SVG, [36, 44]);
}

export const createCustomIcon = (iconUrl: string, size: [number, number] = [40, 40]) => {
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
