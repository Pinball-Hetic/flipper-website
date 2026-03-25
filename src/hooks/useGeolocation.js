"use client";

import { useState, useEffect } from "react";

const DEFAULT_POSITION = [48.8566, 2.3522]; // Paris

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setPosition(DEFAULT_POSITION);
      setLoading(false);
      return;
    }

    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
      setLoading(false);
    };

    const handleError = (err) => {
      console.error("Geolocation error:", err);
      setError("Accès à la position refusé. Utilisation de la position par défaut.");
      setPosition(DEFAULT_POSITION);
      setLoading(false);
    };

    // Obtenir la position initiale
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    // Surveiller les changements de position
    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, loading, error, defaultPosition: DEFAULT_POSITION };
}
