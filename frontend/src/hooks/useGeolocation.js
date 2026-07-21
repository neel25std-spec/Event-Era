import { useState, useCallback } from 'react';

/**
 * Browser Geolocation hook.
 * Returns { latitude, longitude, error, loading, getGeolocation }
 */
export default function useGeolocation() {
  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      const errMsg = 'Geolocation is not supported by your browser';
      setError(errMsg);
      return Promise.reject(new Error(errMsg));
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setPosition(coords);
          setLoading(false);
          resolve(coords);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      );
    });
  }, []);

  return { ...position, error, loading, getGeolocation };
}
