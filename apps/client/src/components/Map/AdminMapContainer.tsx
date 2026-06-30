"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./AdminMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-800/40">
      <p className="text-sm text-white/40">Chargement de la carte…</p>
    </div>
  ),
});

interface Props {
  center: [number, number];
  value: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}

export default function AdminMapContainer(props: Props) {
  return (
    <div className="h-72 w-full overflow-hidden rounded-2xl border border-white/10">
      <Map {...props} />
    </div>
  );
}
