"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Component to handle map centering and view updates
function MapController({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

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
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
      </svg>
    </button>
  );
}

export default function DynamicMap({ position, checkpoints }) {
  // Use state to capture the very first position as initial center
  const [initialCenter] = useState(position);

  // Memoize icons to avoid re-creation on every render
  const icons = useMemo(() => {
    if (typeof window === 'undefined') return { player: null, checkpoint: null };
    
    const playerIcon = L.divIcon({
      className: 'custom-player-icon',
      html: `<div class="relative flex items-center justify-center">
              <div class="absolute size-8 bg-blue-500/20 rounded-full animate-ping"></div>
              <div class="size-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const checkpointIcon = L.divIcon({
      className: 'custom-checkpoint-icon',
      html: `<div class="size-6 bg-teal-600 rounded-lg border-2 border-white shadow-lg transform rotate-45 flex items-center justify-center">
               <div class="size-2 bg-white rounded-full"></div>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -10]
    });

    return { player: playerIcon, checkpoint: checkpointIcon };
  }, []);

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
            <div className="text-center p-1 font-medium text-slate-800">Votre position</div>
          </Popup>
        </Marker>

        {checkpoints?.map((cp) => (
          <Marker key={cp.id} position={cp.position} icon={icons.checkpoint}>
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 p-1 min-w-[160px]">
                <h3 className="font-bold text-lg text-teal-800">{cp.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{cp.description}</p>
                <button className="mt-2 w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-md shadow-orange-200 active:scale-[0.98] transition-all">
                  Explorer le lieu
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <RecenterButton position={position} />
      </MapContainer>
      
      {/* Overlay UI - Top bar */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-end items-center">
        <button className="size-12 rounded-2xl bg-white/90 backdrop-blur-xl shadow-xl flex items-center justify-center border border-white/40 text-slate-700 hover:bg-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
