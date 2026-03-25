"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapContainer from "@/components/Map/MapContainer";
import { useEffect, useState } from "react";

export default function Home() {
  const { position, loading, error, defaultPosition } = useGeolocation();
  const [checkpoints, setCheckpoints] = useState([]);

  useEffect(() => {
    if (position) {
      // Créations de checkpoints mockés autour de la position actuelle
      const mockCheckpoints = [
        {
          id: 1,
          name: "Fontaine Mystique",
          description: "Une fontaine ancienne qui semble regorger d'énergie.",
          position: [position[0] + 0.002, position[1] + 0.002],
        },
        {
          id: 2,
          name: "Arène des Champions",
          description: "Lieu de rencontre des meilleurs dresseurs du quartier.",
          position: [position[0] - 0.001, position[1] + 0.003],
        },
        {
          id: 3,
          name: "Forêt de Jade",
          description: "Un petit parc urbain où se cachent des créatures rares.",
          position: [position[0] + 0.003, position[1] - 0.001],
        },
        {
          id: 4,
          name: "Statue de Bronze",
          description: "Un monument historique servant de point de ralliement.",
          position: [position[0] - 0.002, position[1] - 0.002],
        }
      ];
      setCheckpoints(mockCheckpoints);
    }
  }, [position]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600 text-white p-6">
        <div className="relative size-32 mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-white/20"></div>
          <div className="absolute inset-4 animate-pulse rounded-full bg-white/40"></div>
          <div className="relative h-full w-full rounded-full border-4 border-white flex items-center justify-center bg-white shadow-2xl">
             <div className="w-full h-1 bg-blue-600 absolute"></div>
             <div className="size-8 rounded-full border-4 border-blue-600 bg-white z-10"></div>
          </div>
        </div>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Chargement...</h1>
        <p className="text-blue-100 font-medium text-center max-w-xs">
          Nous calibrons votre position pour une aventure optimale.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-md">
          <div className="bg-orange-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-2 border-orange-400/50 backdrop-blur-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>
            </svg>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
        </div>
      )}
      
      <MapContainer position={position || defaultPosition} checkpoints={checkpoints} />
      
      {/* Bottom Menu Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-6">
        <button className="size-14 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-gray-100 active:scale-90 transition-transform">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
           </svg>
        </button>
        
        <button className="size-20 rounded-full bg-red-500 shadow-2xl flex items-center justify-center border-4 border-white active:scale-95 transition-transform group">
           <div className="size-16 rounded-full border-2 border-white/30 flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-0 w-full h-1/2 bg-red-600"></div>
              <div className="absolute bottom-0 w-full h-1/2 bg-white"></div>
              <div className="w-full h-1 bg-gray-800 absolute z-10"></div>
              <div className="size-6 rounded-full border-2 border-gray-800 bg-white z-20"></div>
           </div>
        </button>

        <button className="size-14 rounded-full bg-white shadow-xl flex items-center justify-center border-2 border-gray-100 active:scale-90 transition-transform">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4A5568" strokeWidth="2">
             <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
           </svg>
        </button>
      </div>
    </div>
  );
}
