import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Check, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

// High-resolution SVG pin for Leaflet
const createPinIcon = () => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="position: relative; width: 36px; height: 36px; transform: translate(-50%, -100%);">
        <div style="background: #e11d48; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.35); border: 2.5px solid white;">
          <div style="transform: rotate(45deg); font-size: 16px;">📍</div>
        </div>
        <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 8px; height: 8px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1px);"></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

export default function DeliveryMapPicker({ onLocationSelect, initialCoords }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Default coordinate centered in Cochabamba, Bolivia (-17.3935, -66.1570)
  const [coords, setCoords] = useState(
    initialCoords || { lat: -17.3935, lng: -66.1570 }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [hasPinned, setHasPinned] = useState(Boolean(initialCoords));

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const marker = L.marker([coords.lat, coords.lng], {
      icon: createPinIcon(),
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Handle marker drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      const updated = { lat: pos.lat, lng: pos.lng };
      setCoords(updated);
      setHasPinned(true);
      if (onLocationSelect) {
        onLocationSelect({
          ...updated,
          googleMapsUrl: `https://www.google.com/maps?q=${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`,
        });
      }
    });

    // Handle map click to reposition pin
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      const updated = { lat: e.latlng.lat, lng: e.latlng.lng };
      setCoords(updated);
      setHasPinned(true);
      if (onLocationSelect) {
        onLocationSelect({
          ...updated,
          googleMapsUrl: `https://www.google.com/maps?q=${e.latlng.lat.toFixed(6)},${e.latlng.lng.toFixed(6)}`,
        });
      }
    });

    // Inform parent initially
    if (onLocationSelect) {
      onLocationSelect({
        ...coords,
        googleMapsUrl: `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`,
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Multi-tier resilient Geolocation (Hardware GPS -> Network Wi-Fi/Cell -> IP Fallback)
  const handleUseCurrentLocation = () => {
    if (isLocating) return;

    const applyLocation = (lat, lng, label) => {
      setIsLocating(false);
      const updated = { lat, lng };
      setCoords(updated);
      setHasPinned(true);

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16);
        markerRef.current.setLatLng([lat, lng]);
      }

      if (onLocationSelect) {
        onLocationSelect({
          ...updated,
          googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`,
        });
      }
      toast.success(label || "¡Ubicación GPS fijada en el mapa!");
    };

    if (!navigator.geolocation) {
      fallbackToIpLookup(applyLocation);
      return;
    }

    setIsLocating(true);

    // Tier 1: Hardware High-Accuracy GPS (7s timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyLocation(pos.coords.latitude, pos.coords.longitude, "¡Ubicación GPS de alta precisión detectada!");
      },
      (highErr) => {
        // If user actively blocked location permissions in browser settings
        if (highErr.code === 1) { // PERMISSION_DENIED
          setIsLocating(false);
          toast.warning("Permiso de ubicación desactivado en tu navegador. Puedes tocar directamente en el mapa para marcar tu casa.");
          return;
        }

        // Tier 2: Low-Accuracy (Wi-Fi / Cell tower / Network triangulation) - works indoors
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyLocation(pos.coords.latitude, pos.coords.longitude, "¡Ubicación por red detectada y fijada!");
          },
          (lowErr) => {
            // Tier 3: IP Location fallback
            fallbackToIpLookup(applyLocation);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  };

  const fallbackToIpLookup = (applyLocation) => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
          applyLocation(
            data.latitude, 
            data.longitude, 
            `Ubicación aproximada detectada (${data.city || "tu ciudad"}). Puedes ajustar el pin si lo necesitas.`
          );
        } else {
          setIsLocating(false);
          toast.warning("No pudimos obtener tu señal GPS. Toca en cualquier punto del mapa para fijar tu dirección.");
        }
      })
      .catch(() => {
        setIsLocating(false);
        toast.warning("No se pudo conectar con el GPS. Toca sobre el mapa para fijar tu ubicación.");
      });
  };

  const googleMapsLink = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>Marca el punto exacto de tu domicilio en el mapa:</span>
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300 transition cursor-pointer active:scale-95 shadow-xs disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
              <span>Detectando GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3 text-emerald-700" />
              <span>Mi Ubicación Actual</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-52 sm:h-60 bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Badge */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Toca o arrastra el pin hasta tu ubicación</span>
        </div>
      </div>

      {/* Selected Coordinates Status */}
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Punto fijado: <strong>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</strong></span>
        </span>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1 hover:underline"
        >
          <span>Abrir Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
