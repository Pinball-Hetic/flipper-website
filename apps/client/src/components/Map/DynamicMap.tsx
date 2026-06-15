"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createPlayerIcon, createCheckpointIcon } from "./Icons";
import type { CheckpointWithPosition } from "@pocket-maps/shared";
import ScoreboardModal from "@/components/scoreboard/ScoreboardModal";
import { toast } from "sonner";

function MapController({
  position,
  geoLoading,
}: {
  position: [number, number];
  geoLoading: boolean;
}) {
  const map = useMap();
  const mountedRef = useRef(false);
  const prevGeoLoadingRef = useRef(geoLoading);

  useEffect(() => {
    if (!mountedRef.current) {
      map.setView(position, 16);
      mountedRef.current = true;
      prevGeoLoadingRef.current = geoLoading;
      return;
    }
    if (prevGeoLoadingRef.current && !geoLoading) {
      map.flyTo(position, 16);
    }
    prevGeoLoadingRef.current = geoLoading;
  }, [position, geoLoading, map]);

  return null;
}

function RecenterButton({ position }: { position: [number, number] }) {
  const map = useMap();

  return (
    <button
      onClick={() => map.flyTo(position, 16)}
      aria-label="Recentrer sur ma position"
      className="absolute bottom-6 right-6 z-1000 flex flex-col items-center gap-1.5 px-3.5 py-2.5 min-w-[56px] bg-white/40 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-spatial active:scale-90 transition-all hover:bg-white/60 text-slate-700"
      style={{ backgroundImage: "var(--glass-reflection)" }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2"  x2="12" y2="6"  stroke="#2563EB" strokeWidth="2.5" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="#2563EB" strokeWidth="2.5" />
        <line x1="2"  y1="12" x2="6"  y2="12" stroke="#2563EB" strokeWidth="2.5" />
        <line x1="18" y1="12" x2="22" y2="12" stroke="#2563EB" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="4" fill="#2563EB" />
        <circle cx="12" cy="12" r="1.8" fill="white" />
      </svg>
      <span className="text-[10px] font-semibold leading-none tracking-tight">
        Position
      </span>
    </button>
  );
}

interface Props {
  position: [number, number];
  checkpoints: CheckpointWithPosition[];
  /** Tant que la géolocalisation n’a pas répondu, la carte utilise la position par défaut ; au passage à false, recentrage vers la vraie position. */
  geoLoading: boolean;
}

export default function DynamicMap({ position, checkpoints, geoLoading }: Props) {
  const [initialCenter] = useState<[number, number]>(position);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckpointWithPosition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const icons = useMemo(() => ({
    player: createPlayerIcon(),
    createCheckpoint: createCheckpointIcon,
  }), []);

  const openScoreboard = (cp: CheckpointWithPosition) => {
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
        <MapController position={position} geoLoading={geoLoading} />

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
          <Marker key={cp.id} position={cp.position} icon={icons.createCheckpoint(cp.type) ?? undefined}>
            <Popup className="custom-popup" maxWidth={280} closeButton={false}>
              <div className="flex flex-col p-6 w-64 gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-slate-900/5 px-2.5 py-1 rounded-full uppercase tracking-widest text-slate-600 border border-slate-900/10">
                      {cp.type}
                    </span>
                  </div>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-tight">{cp.name}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{cp.description}</p>
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

      <div className="absolute top-6 left-6 right-6 z-1000 flex justify-end items-center pointer-events-none">
        <button onClick={() => toast.info("Filtres — bientôt disponible")} className="size-12 rounded-2xl bg-white/45 backdrop-blur-2xl shadow-spatial flex items-center justify-center border border-white/50 text-slate-700 hover:bg-white transition-all pointer-events-auto active:scale-90" style={{ backgroundImage: 'var(--glass-reflection)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>
    </div>
  );
}
