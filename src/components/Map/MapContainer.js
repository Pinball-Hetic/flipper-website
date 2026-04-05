"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("./DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 animate-bounce rounded-full bg-blue-500 shadow-lg"></div>
        <p className="font-medium text-blue-600 animate-pulse">Initialisation de la carte...</p>
      </div>
    </div>
  ),
});

export default function MapContainer(props) {
  return (
    <div className="h-full w-full relative">
      <Map {...props} />
    </div>
  );
}
