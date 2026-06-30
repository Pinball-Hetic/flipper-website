"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { createCheckpointIcon } from "./Icons";

interface Props {
  center: [number, number];
  value: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AdminMap({ center, value, onPick }: Props) {
  const icon = createCheckpointIcon();

  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={true}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <ClickCapture onPick={onPick} />
      {value && <Marker position={value} icon={icon ?? undefined} />}
    </MapContainer>
  );
}
