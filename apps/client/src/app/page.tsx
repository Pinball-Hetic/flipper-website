"use client";

import { useGeolocation } from "@/hooks/useGeolocation";
import MapContainer from "@/components/Map/MapContainer";
import { useState } from "react";
import { getCheckpoints } from "./actions/checkpoints";
import { User, QrCode, ShoppingBag, Loader2 } from "lucide-react";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { position, loading, error, defaultPosition } = useGeolocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const {
    data: checkpoints = [],
    isError: checkpointsError,
    refetch: refetchCheckpoints,
  } = useQuery({
    queryKey: ["checkpoints"],
    // Ne pas passer getCheckpoints tel quel : queryFn reçoit { queryKey, signal, … } et les
    // Server Actions ne peuvent pas sérialiser AbortSignal → échec puis [] dans l’action.
    queryFn: () => getCheckpoints(),
    retry: 2,
  });

  const handleScanClick = () => {
    toast.info("Scanner QR Code bientôt disponible !", {
      description: "Cette fonctionnalité est en cours de développement.",
    });
  };

  const mapPosition = position ?? defaultPosition;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div className="absolute top-20 left-1/2 z-2000 flex w-[90%] max-w-md -translate-x-1/2 flex-col gap-2 pointer-events-none">
        {loading && (
          <div className="flex items-center justify-center gap-2 rounded-full bg-slate-900/85 px-4 py-2 text-xs font-medium text-white shadow-lg border border-white/10 backdrop-blur-md">
            <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden />
            <span>Position en cours de détection…</span>
          </div>
        )}
        {checkpointsError && (
          <div className="pointer-events-auto rounded-2xl border border-amber-400/50 bg-amber-600 px-5 py-3.5 text-white shadow-xl backdrop-blur-md">
            <p className="text-sm font-bold leading-tight">
              Impossible de charger les lieux (API serveur). Vérifie que le
              serveur tourne et que DATABASE_URL est correcte.
            </p>
            <button
              type="button"
              onClick={() => void refetchCheckpoints()}
              className="mt-2 text-xs font-black uppercase tracking-wider underline underline-offset-2"
            >
              Réessayer
            </button>
          </div>
        )}
        {error && (
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-red-400/50 bg-red-500 px-5 py-3.5 text-white shadow-xl backdrop-blur-md">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm font-bold leading-tight">{error}</p>
          </div>
        )}
      </div>

      <MapContainer
        position={mapPosition}
        checkpoints={checkpoints}
        geoLoading={loading}
      />

      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-2000 flex items-center gap-5 p-2 bg-white/30 backdrop-blur-3xl border border-white/50 rounded-explorer shadow-spatial"
        style={{ backgroundImage: "var(--glass-reflection)" }}
      >
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
