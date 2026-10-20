import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Check, AlertCircle, ExternalLink } from "lucide-react";
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

  // Default coordinate (e.g., Buenos Aires / Central, or user coordinates)
  const [coords, setCoords] = useState(
    initialCoords || { lat: -34.5912, lng: -58.4123 }
  );
  const [isLocating, setIsLocating] = useState(false);
  const [hasPinned, setHasPinned] = useState(Boolean(initialCoords));

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent multiple initializations

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: false,
    });

    // Add Free OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom controls at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add draggable marker
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

  // Use Browser Geolocation (GPS)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const updated = { lat: userLat, lng: userLng };

        setCoords(updated);
        setHasPinned(true);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([userLat, userLng], 16);
          markerRef.current.setLatLng([userLat, userLng]);
        }

        if (onLocationSelect) {
          onLocationSelect({
            ...updated,
            googleMapsUrl: `https://www.google.com/maps?q=${userLat.toFixed(6)},${userLng.toFixed(6)}`,
          });
        }
        toast.success("¡Ubicación GPS detectada y fijada en el mapa!");
      },
      (err) => {
        setIsLocating(false);
        toast.warning(
          "No pudimos acceder a tu GPS. Por favor toca en el mapa para marcar tu casa."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const googleMapsLink = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600" />
          <span>Marca el punto exacto de tu domicilio (Pintea en el mapa):</span>
        </span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
        >
          <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Localizando..." : "Mi Ubicación Actual"}</span>
        </button>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-52 sm:h-60 bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Badge */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Toca o arrastra el pin hasta la puerta de tu casa</span>
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
