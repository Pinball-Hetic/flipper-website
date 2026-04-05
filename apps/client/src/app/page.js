"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapContainer from "@/components/Map/MapContainer";
import { useEffect, useState } from "react";
import { getCheckpoints } from "./actions";
import { User, QrCode, ShoppingBag, Loader2 } from "lucide-react";
import { ProfileModal } from "@/components/ProfileModal";
import { toast } from "sonner";

export default function Home() {
  const { position, loading, error, defaultPosition } = useGeolocation();
  const [checkpoints, setCheckpoints] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCheckpoints();
      setCheckpoints(data);
    };
    fetchData();
  }, []);

  const handleScanClick = () => {
    toast.info("Scanner QR Code bientôt disponible !", {
      description: "Cette fonctionnalité est en cours de développement.",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-900 text-white p-6">
        <div className="relative size-32 mb-8">
          <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
          <div className="relative h-full w-full rounded-3xl border-2 border-white/10 flex items-center justify-center bg-slate-800 shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-transparent"></div>
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
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-2000 w-[90%] max-w-md">
          <div className="bg-red-500 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-red-400/50 backdrop-blur-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
        </div>
      )}
      
      <MapContainer position={position || defaultPosition} checkpoints={checkpoints} />
      
      {/* Bottom Menu Bar - 2026 Apple Spatial Style */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-2000 flex items-center gap-5 p-2 bg-white/30 backdrop-blur-3xl border border-white/50 rounded-explorer shadow-spatial" style={{ backgroundImage: 'var(--glass-reflection)' }}>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="size-14 rounded-[1.75rem] bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/60 shadow-xs active:scale-90 transition-all hover:bg-white/60 text-slate-700"
        >
           <User size={24} strokeWidth={2.5} />
        </button>
        
        <button 
          onClick={handleScanClick}
          className="size-20 rounded-4xl bg-linear-to-tr from-orange-500 to-orange-400 shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] flex items-center justify-center border-[3px] border-white active:scale-95 transition-all group hover:rotate-12"
        >
           <div className="size-10 flex items-center justify-center text-white">
              <QrCode size={32} strokeWidth={3} />
           </div>
        </button>

        <button className="size-14 rounded-[1.75rem] bg-white/40 backdrop-blur-md flex items-center justify-center border border-white/60 shadow-xs active:scale-90 transition-all hover:bg-white/60 text-slate-700">
           <ShoppingBag size={24} strokeWidth={2.5} />
        </button>
      </div>

      <ProfileModal isOpen={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </div>
  );
}
