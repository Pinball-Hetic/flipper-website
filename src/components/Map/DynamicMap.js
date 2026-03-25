"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// SVG Icons as Base64 for simplicity
const playerSvg = `data:image/svg+xml;base64,${btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="white" stroke="#3182CE" stroke-width="2"/>
  <circle cx="20" cy="20" r="12" fill="#3182CE"/>
  <circle cx="20" cy="20" r="8" fill="white" fill-opacity="0.3"/>
</svg>
`)}`;

const checkpointSvg = `data:image/svg+xml;base64,${btoa(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M20 35L10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20L20 35Z" fill="#38A169" stroke="white" stroke-width="2"/>
  <circle cx="20" cy="20" r="4" fill="white"/>
</svg>
`)}`;

const playerIcon = new L.Icon({
  iconUrl: playerSvg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  className: 'animate-player-pulse'
});

const checkpointIcon = new L.Icon({
  iconUrl: checkpointSvg,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

// Component to handle map centering
function RecenterButton({ position }) {
  const map = useMap();
  
  return (
    <button
      onClick={() => map.flyTo(position, 16)}
      className="absolute bottom-6 right-6 z-[1000] size-14 flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-blue-100 active:scale-95 transition-transform"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  );
}

export default function DynamicMap({ position, checkpoints }) {
  if (!position) return null;

  return (
    <div className="relative h-full w-full">
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        {/* Style de carte épuré (CartoDB Positron) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Player Marker */}
        <Marker position={position} icon={playerIcon}>
          <Popup className="rounded-pokemon">
            <div className="text-center p-2 font-medium">Vous êtes ici !</div>
          </Popup>
        </Marker>

        {/* Checkpoints */}
        {checkpoints.map((cp) => (
          <Marker key={cp.id} position={cp.position} icon={checkpointIcon}>
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 p-1 min-w-[150px]">
                <h3 className="font-bold text-lg text-emerald-700">{cp.name}</h3>
                <p className="text-sm text-gray-600">{cp.description}</p>
                <button className="mt-2 w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-sm active:bg-emerald-600">
                  Récupérer l'objet
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <RecenterButton position={position} />
      </MapContainer>
      
      {/* Overlay UI - Top bar */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20 flex items-center gap-3">
          <div className="size-8 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-xs italic">
            LVL 12
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Explorateur</span>
            <div className="w-24 h-1.5 bg-blue-100 rounded-full overflow-hidden mt-1">
              <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <button className="size-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center border border-white/20">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d3748" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
