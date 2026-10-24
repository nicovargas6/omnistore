import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Navigation, 
  Check, 
  ExternalLink, 
  Loader2, 
  Info, 
  Crosshair,
  ShieldAlert,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

// High-resolution SVG pin for Leaflet
const createPinIcon = () => {
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -100%);">
        <div style="background: #e11d48; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(0,0,0,0.35); border: 2.5px solid white;">
          <div style="transform: rotate(45deg); font-size: 18px;">📍</div>
        </div>
        <div style="position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 10px; height: 10px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(1.5px);"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });
};

export default function DeliveryMapPicker({ onLocationSelect, initialCoords }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  // Initialize coords from prop or persistent localStorage, fallback to Cochabamba, Bolivia
  const [coords, setCoords] = useState(() => {
    if (initialCoords && typeof initialCoords.lat === "number") {
      return initialCoords;
    }
    try {
      const saved = localStorage.getItem("omnistore_saved_coords");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === "number") return parsed;
      }
    } catch {}
    return { lat: -17.3935, lng: -66.1570 };
  });

  const [hasSavedMemory, setHasSavedMemory] = useState(() => {
    try {
      return Boolean(localStorage.getItem("omnistore_saved_coords"));
    } catch {
      return false;
    }
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locatingStatus, setLocatingStatus] = useState("");
  const [hasPermissionBlocked, setHasPermissionBlocked] = useState(false);
  const [accuracyMeters, setAccuracyMeters] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 16,
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

    // Fix gray tiles on mobile modal transitions
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    const notifyUpdate = (updated) => {
      setCoords(updated);
      setHasSavedMemory(true);
      try {
        localStorage.setItem("omnistore_saved_coords", JSON.stringify(updated));
      } catch {}

      if (onLocationSelect) {
        onLocationSelect({
          ...updated,
          googleMapsUrl: `https://www.google.com/maps?q=${updated.lat.toFixed(6)},${updated.lng.toFixed(6)}`,
        });
      }
    };

    // Handle marker drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      notifyUpdate({ lat: pos.lat, lng: pos.lng });
      toast.success("Punto de entrega fijado y guardado en tu dispositivo.");
    });

    // Handle map click to reposition pin
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      notifyUpdate({ lat: e.latlng.lat, lng: e.latlng.lng });
      toast.success("Punto de entrega actualizado y guardado.");
    });

    // Inform parent of current coordinates
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

  // Update center if initialCoords changes
  useEffect(() => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([initialCoords.lat, initialCoords.lng]);
        mapInstanceRef.current.setView([initialCoords.lat, initialCoords.lng], 16);
      }
    }
  }, [initialCoords]);

  // High-precision GPS using watchPosition with 15s lock window
  const handleUseCurrentLocation = () => {
    if (isLocating) return;

    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización por hardware.");
      return;
    }

    setIsLocating(true);
    setLocatingStatus("Conectando con satélites GPS...");
    setHasPermissionBlocked(false);

    let bestPos = null;
    let hasFinished = false;
    let watchId = null;

    const finalizeLocation = (pos, isExact) => {
      if (hasFinished) return;
      hasFinished = true;
      setIsLocating(false);
      setLocatingStatus("");

      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {}
      }
      clearTimeout(safetyTimeout);

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = Math.round(pos.coords.accuracy || 15);
      setAccuracyMeters(acc);

      const updated = {
        lat,
        lng,
        accuracy: acc,
        googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
      };

      setCoords(updated);
      setHasSavedMemory(true);

      // Persist permanently so user never has to re-pin
      try {
        localStorage.setItem("omnistore_saved_coords", JSON.stringify(updated));
      } catch {}

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setView([lat, lng], 17);
        markerRef.current.setLatLng([lat, lng]);

        // Draw accuracy circle
        if (accuracyCircleRef.current) {
          mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
        }
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: Math.min(acc, 50),
          color: "#059669",
          fillColor: "#10b981",
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(mapInstanceRef.current);

        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 150);
      }

      // Reverse geocoding via OpenStreetMap Nominatim for street address auto-fill
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          let suggested = "";
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || data.address.neighbourhood || "";
            const num = data.address.house_number ? ` #${data.address.house_number}` : "";
            const city = data.address.city || data.address.town || data.address.county || "";
            suggested = [road + num, city].filter(Boolean).join(", ");
          }
          if (onLocationSelect) {
            onLocationSelect({ ...updated, suggestedAddress: suggested });
          }
        })
        .catch(() => {
          if (onLocationSelect) onLocationSelect(updated);
        });

      toast.success(
        isExact
          ? `¡Ubicación GPS exacta fijada! (Precisión: ±${acc}m) y guardada en tu teléfono.`
          : `¡Ubicación fijada en el mapa! (Precisión: ±${acc}m)`
      );
    };

    // Safety timeout: after 12 seconds, take the best recorded fix so far
    const safetyTimeout = setTimeout(() => {
      if (bestPos) {
        finalizeLocation(bestPos, false);
      } else {
        // Fallback to IP lookup
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            if (data && typeof data.latitude === "number") {
              finalizeLocation({
                coords: { latitude: data.latitude, longitude: data.longitude, accuracy: 250 }
              }, false);
            } else {
              setIsLocating(false);
              setLocatingStatus("");
              toast.info("Toca en el mapa para marcar el punto exacto de tu domicilio.");
            }
          })
          .catch(() => {
            setIsLocating(false);
            setLocatingStatus("");
            toast.info("Toca en el mapa para marcar el punto de entrega.");
          });
      }
    }, 12000);

    // Watch position with high accuracy
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = pos.coords.accuracy;
          if (!bestPos || acc < bestPos.coords.accuracy) {
            bestPos = pos;
            setLocatingStatus(`Calibrando señal... (Precisión ±${Math.round(acc)}m)`);
          }
          // Meter-precise threshold: <= 20 meters is house-level precision
          if (acc <= 20) {
            finalizeLocation(pos, true);
          }
        },
        (err) => {
          // If iOS Safari or browser denied permission
          if (err.code === 1) { // PERMISSION_DENIED
            clearTimeout(safetyTimeout);
            setIsLocating(false);
            setLocatingStatus("");
            setHasPermissionBlocked(true);

            // Silently center on IP location so user has city view
            fetch("https://ipapi.co/json/")
              .then((r) => r.json())
              .then((data) => {
                if (data && typeof data.latitude === "number" && mapInstanceRef.current) {
                  mapInstanceRef.current.setView([data.latitude, data.longitude], 14);
                }
              })
              .catch(() => {});
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } catch {
      clearTimeout(safetyTimeout);
      setIsLocating(false);
      setLocatingStatus("");
    }
  };

  const googleMapsLink = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-2 mt-2">
      {/* Top Header & GPS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span>Punto exacto de entrega (GPS & Mapa):</span>
        </span>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 px-3 py-2 rounded-xl border border-emerald-300 transition cursor-pointer shadow-xs disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>{locatingStatus || "Detectando GPS..."}</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mi Ubicación Actual (GPS Exacto)</span>
            </>
          )}
        </button>
      </div>

      {/* Persistent Saved Location Pill Banner */}
      {hasSavedMemory && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-900">
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Domicilio recordado:</strong> Tu punto exacto está guardado en tu teléfono para futuros pedidos.
            </span>
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
            Permanente
          </span>
        </div>
      )}

      {/* Guide if iPhone Safari or Android blocked permission */}
      {hasPermissionBlocked && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2 shadow-xs">
          <div className="font-bold flex items-center gap-2 text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Permiso de GPS bloqueado en tu navegador</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-amber-900">
            Para que tu iPhone o Android detecte la puerta exacta de tu casa de forma automática:
          </p>
          <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-1 pl-1">
            <li>
              <strong>En iPhone Safari:</strong> Toca el botón <strong>aA</strong> en la barra de direcciones → <em>Configuración del sitio web</em> → cambia <em>Ubicación</em> a <strong>Permitir</strong>.
            </li>
            <li>
              <strong>En Android Chrome:</strong> Toca el candado 🔒 junto al link → <em>Permisos</em> → activa <strong>Ubicación</strong>.
            </li>
          </ul>
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="px-3 py-1.5 bg-amber-900 text-white font-bold rounded-lg text-[11px] hover:bg-amber-950 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reintentar con GPS</span>
            </button>
            <span className="text-[10px] text-amber-700">
              O simplemente toca en el mapa para marcar tu casa.
            </span>
          </div>
        </div>
      )}

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-52 sm:h-60 bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Badge */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Toca o arrastra el pin hasta la puerta de tu casa</span>
        </div>
      </div>

      {/* Selected Coordinates Status & Verification */}
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
        <span className="flex items-center gap-1">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Punto fijado: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
            {accuracyMeters ? ` (±${accuracyMeters}m)` : ""}
          </span>
        </span>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1 hover:underline"
          title="Verificar en Google Maps"
        >
          <span>Verificar en Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
