"use client";

import { useState, useEffect } from "react";

const DEFAULT_POSITION = [48.8566, 2.3522]; // Paris

export function useGeolocation() {
  const [state, setState] = useState({ position: null, loading: true, error: null });

  useEffect(() => {
    const handleSuccess = (pos) => {
      const { latitude, longitude } = pos.coords;
      setState({ position: [latitude, longitude], loading: false, error: null });
    };

    const handleError = () => {
      setState({
        position: DEFAULT_POSITION,
        loading: false,
        error: "Accès à la position refusé. Utilisation de la position par défaut.",
      });
    };

    if (!navigator.geolocation) {
      handleError();
      return;
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { ...state, defaultPosition: DEFAULT_POSITION };
}
