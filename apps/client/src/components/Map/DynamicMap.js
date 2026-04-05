"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ScoreboardModal from "../ScoreboardModal";

// Component to handle map centering and view updates
function MapController({ position }) {
  const map = useMap();
  const [hasInitialCentered, setHasInitialCentered] = useState(false);

  useEffect(() => {
    if (position && !hasInitialCentered) {
      map.setView(position, 16);
      setHasInitialCentered(true);
    }
  }, [position, map, hasInitialCentered]);

  return null;
}

// Component for the recenter button
function RecenterButton({ position }) {
  const map = useMap();

  return (
    <button
      onClick={() => map.flyTo(position, 16)}
      className="absolute bottom-6 right-6 z-[1000] size-14 flex items-center justify-center bg-white rounded-2xl shadow-xl border border-gray-100 active:scale-95 transition-all hover:bg-gray-50"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}

export default function DynamicMap({ position, checkpoints }) {
  const [initialCenter] = useState(position);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize icons to avoid re-creation on every render
  const icons = useMemo(() => {
    if (typeof window === "undefined")
      return { player: null };

    const playerIcon = L.divIcon({
      className: "custom-player-icon",
      html: `<div class="relative flex items-center justify-center">
              <div class="absolute size-8 bg-blue-500/20 rounded-full animate-ping"></div>
              <div class="size-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const getIconHtml = (type) => {
      let color = "bg-teal-600";
      let icon = '<div class="size-2 bg-white rounded-full"></div>';

      if (type === "RESTAURANT") {
        color = "bg-orange-500";
        icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>';
      } else if (type === "STATION") {
        color = "bg-blue-600";
        icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="9" y1="19" x2="9" y2="19"/><line x1="15" y1="19" x2="15" y2="19"/><path d="M12 3v2"/></svg>';
      } else if (type === "CULTURE") {
        color = "bg-purple-600";
        icon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>';
      }

      return `<div class="size-9 ${color} rounded-2xl border-2 border-white shadow-xl flex items-center justify-center active:scale-90 transition-transform">
               ${icon}
             </div>`;
    };

    return { 
      player: playerIcon,
      createCheckpoint: (type) => L.divIcon({
        className: "custom-checkpoint-icon",
        html: getIconHtml(type),
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      })
    };
  }, []);

  const openScoreboard = (cp) => {
    setSelectedCheckpoint(cp);
    setIsModalOpen(true);
  };

  if (!position || !icons.player) return null;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapContainer
        id="flipper-map-main"
        center={initialCenter}
        zoom={16}
        scrollWheelZoom={true}
        zoomControl={false}
        className="h-full w-full"
      >
        <MapController position={position} />

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={position} icon={icons.player}>
          <Popup>
            <div className="text-center p-1 font-medium text-slate-800">
              Votre position
            </div>
          </Popup>
        </Marker>

        {checkpoints?.map((cp) => (
          <Marker 
            key={cp.id} 
            position={cp.position} 
            icon={icons.createCheckpoint(cp.type)}
          >
            <Popup className="custom-popup" maxWidth={280} closeButton={false}>
              <div className="flex flex-col p-6 w-64 gap-4">
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black bg-slate-900/5 px-2.5 py-1 rounded-full uppercase tracking-widest text-slate-600 border border-slate-900/10">
                        {cp.type}
                      </span>
                   </div>
                   <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-tight">
                     {cp.name}
                   </h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed">
                     {cp.description}
                   </p>
                </div>

                <div className="h-px w-full bg-slate-900/5"></div>
                
                <button 
                  onClick={() => openScoreboard(cp)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-[1.25rem] text-sm font-black shadow-lg shadow-orange-500/25 active:scale-[0.96] transition-all flex items-center justify-center gap-2.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34M12 2v10.67M7 2h10l-1 12.67c-.05.65-.6 1.15-1.25 1.15H9.25c-.65 0-1.2-.5-1.25-1.15L7 2Z"/>
                  </svg>
                  VOIR LES SCORES
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <RecenterButton position={position} />
      </MapContainer>

      <ScoreboardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        checkpoint={selectedCheckpoint} 
      />

      {/* Overlay UI - Top bar Spatial */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-end items-center pointer-events-none">
        <button className="size-12 rounded-2xl bg-white/45 backdrop-blur-2xl shadow-spatial flex items-center justify-center border border-white/50 text-slate-700 hover:bg-white transition-all pointer-events-auto active:scale-90" style={{ backgroundImage: 'var(--glass-reflection)' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>
    </div>
  );
}
