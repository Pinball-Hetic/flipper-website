"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapContainer from "@/components/Map/MapContainer";
import { useEffect, useState } from "react";

export default function Home() {
  const { position, loading, error, defaultPosition } = useGeolocation();
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    if (position) {
      // Création de checkpoints mockés autour de la position actuelle
      const mockCheckpoints = [
        {
          id: 1,
          name: "Point d'Observation",
          description: "Un panorama exceptionnel sur les environs, parfait pour s'orienter.",
          position: [position[0] + 0.002, position[1] + 0.002],
        },
        {
          id: 2,
          name: "Ancien Monument",
          description: "Un vestige historique conservant les traces du passé local.",
          position: [position[0] - 0.001, position[1] + 0.003],
        },
        {
          id: 3,
          name: "Espace Vert",
          description: "Un havre de paix idéal pour une pause lors de votre exploration.",
          position: [position[0] + 0.003, position[1] - 0.001],
        },
        {
          id: 4,
          name: "Point de Ralliement",
          description: "Un carrefour central souvent utilisé comme point de départ.",
          position: [position[0] - 0.002, position[1] - 0.002],
        }
      ];
      setCheckpoints(mockCheckpoints);
    }
  }, [position]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-900 text-white p-6">
        <div className="relative size-32 mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
          <div className="relative h-full w-full rounded-3xl border-2 border-white/10 flex items-center justify-center bg-slate-800 shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
             <div className="size-12 rounded-lg border-2 border-blue-400 animate-spin flex items-center justify-center">
                <div className="size-4 bg-orange-500 rounded-sm animate-ping"></div>
             </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Initialisation</h1>
        <p className="text-slate-400 font-medium text-center max-w-xs text-sm">
          Synchronisation avec les satellites en cours...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-md">
          <div className="bg-red-500 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-red-400/50 backdrop-blur-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
        </div>
      )}
      
      <MapContainer position={position || defaultPosition} checkpoints={checkpoints} />
      
      {/* Bottom Menu Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6">
        <button className="size-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all hover:bg-slate-50 text-slate-600">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
           </svg>
        </button>
        
        <button className="size-20 rounded-[2.5rem] bg-orange-500 shadow-2xl shadow-orange-500/40 flex items-center justify-center border-4 border-white active:scale-95 transition-all group hover:bg-orange-600">
           <div className="size-10 flex items-center justify-center text-white">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20"/>
              </svg>
           </div>
        </button>

        <button className="size-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all hover:bg-slate-50 text-slate-600">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
           </svg>
        </button>
      </div>
    </div>
  );
}
