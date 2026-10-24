import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Search, 
  Check, 
  ExternalLink, 
  Loader2, 
  Crosshair,
  HelpCircle,
  X,
  Compass
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

  // Initialize coords from prop or persistent localStorage, fallback to Cochabamba (-17.3935, -66.1570)
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

  // Street search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);
  const searchDebounceRef = useRef(null);

  // GPS locating states
  const [isLocating, setIsLocating] = useState(false);
  const [locatingStatus, setLocatingStatus] = useState("");
  const [showIosGuide, setShowIosGuide] = useState(false);
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

    const notifyUpdate = (updated, suggestedAddr = "") => {
      setCoords(updated);
      setHasSavedMemory(true);
      try {
        localStorage.setItem("omnistore_saved_coords", JSON.stringify(updated));
      } catch {}

      if (onLocationSelect) {
        onLocationSelect({
          ...updated,
          suggestedAddress: suggestedAddr,
          googleMapsUrl: `https://www.google.com/maps?q=${updated.lat.toFixed(6)},${updated.lng.toFixed(6)}`,
        });
      }
    };

    // Handle marker drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      notifyUpdate({ lat: pos.lat, lng: pos.lng });
      toast.success("Punto de entrega fijado y guardado.");
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

  // Street / Zone Search with Autocomplete
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!val || val.trim().length < 3) {
      setSearchResults([]);
      setShowResultsDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(() => {
      // Query Nominatim OpenStreetMap
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5`)
        .then((res) => res.json())
        .then((data) => {
          setIsSearching(false);
          if (Array.isArray(data) && data.length > 0) {
            setSearchResults(data);
            setShowResultsDropdown(true);
          } else {
            setSearchResults([]);
            setShowResultsDropdown(false);
          }
        })
        .catch(() => {
          setIsSearching(false);
          setSearchResults([]);
        });
    }, 350);
  };

  // User selects an address result from dropdown
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    if (isNaN(lat) || isNaN(lng)) return;

    const shortName = result.display_name.split(",").slice(0, 3).join(", ");
    setSearchQuery(shortName);
    setShowResultsDropdown(false);
    setHasSavedMemory(true);

    const updated = {
      lat,
      lng,
      googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
    };

    setCoords(updated);
    try {
      localStorage.setItem("omnistore_saved_coords", JSON.stringify(updated));
    } catch {}

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
      markerRef.current.setLatLng([lat, lng]);
      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 300);
    }

    if (onLocationSelect) {
      onLocationSelect({
        ...updated,
        suggestedAddress: shortName,
      });
    }

    toast.success("¡Punto fijado en tu calle! Puedes tocar o arrastrar el pin a tu puerta exacta.");
  };

  // High-precision GPS handler with gentle fallbacks
  const handleUseCurrentLocation = () => {
    if (isLocating) return;

    if (!navigator.geolocation) {
      fallbackToIpLookup("Tu navegador no soporta GPS. Ubicando por red...");
      return;
    }

    setIsLocating(true);
    setLocatingStatus("Buscando satélites GPS...");

    const applyLocationSuccess = (lat, lng, acc, label) => {
      setIsLocating(false);
      setLocatingStatus("");
      setAccuracyMeters(acc);
      setShowIosGuide(false);

      const updated = {
        lat,
        lng,
        accuracy: acc,
        googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
      };

      setCoords(updated);
      setHasSavedMemory(true);
      try {
        localStorage.setItem("omnistore_saved_coords", JSON.stringify(updated));
      } catch {}

      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1 });
        markerRef.current.setLatLng([lat, lng]);

        if (accuracyCircleRef.current) {
          mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
        }
        accuracyCircleRef.current = L.circle([lat, lng], {
          radius: Math.min(acc || 15, 40),
          color: "#059669",
          fillColor: "#10b981",
          fillOpacity: 0.15,
          weight: 1.5,
        }).addTo(mapInstanceRef.current);

        setTimeout(() => {
          if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
        }, 200);
      }

      // Reverse geocode to auto-fill street address in checkout
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then((res) => res.json())
        .then((data) => {
          let street = "";
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || data.address.neighbourhood || "";
            const num = data.address.house_number ? ` #${data.address.house_number}` : "";
            const city = data.address.city || data.address.town || "";
            street = [road + num, city].filter(Boolean).join(", ");
          }
          if (onLocationSelect) {
            onLocationSelect({ ...updated, suggestedAddress: street });
          }
        })
        .catch(() => {
          if (onLocationSelect) onLocationSelect(updated);
        });

      toast.success(label || `¡Ubicación fijada con exactitud (±${acc}m)!`);
    };

    // Try High-Accuracy GPS first (10s timeout)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const acc = Math.round(pos.coords.accuracy || 10);
        applyLocationSuccess(pos.coords.latitude, pos.coords.longitude, acc, `¡GPS exacto detectado! (±${acc}m)`);
      },
      (highErr) => {
        // If high accuracy fails or times out, try standard network location
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const acc = Math.round(pos.coords.accuracy || 40);
            applyLocationSuccess(pos.coords.latitude, pos.coords.longitude, acc, `Ubicación detectada por red (±${acc}m)`);
          },
          (lowErr) => {
            // If completely blocked by iOS or browser settings
            if (highErr.code === 1 || lowErr.code === 1) {
              setShowIosGuide(true);
            }
            fallbackToIpLookup("Centrando en tu ciudad. Escribe tu calle en el buscador.");
          },
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
    );
  };

  const fallbackToIpLookup = (userMessage) => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        setIsLocating(false);
        setLocatingStatus("");
        if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
          const lat = data.latitude;
          const lng = data.longitude;
          const updated = {
            lat,
            lng,
            googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`
          };
          setCoords(updated);
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 15);
            markerRef.current.setLatLng([lat, lng]);
          }
          if (onLocationSelect) onLocationSelect(updated);
          toast.info(userMessage || `Ubicación aproximada fijada (${data.city || "tu ciudad"}).`);
        } else {
          toast.info("Escribe tu calle o toca en el mapa para marcar tu casa.");
        }
      })
      .catch(() => {
        setIsLocating(false);
        setLocatingStatus("");
        toast.info("Escribe tu calle o toca en el mapa para marcar tu entrega.");
      });
  };

  const googleMapsLink = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-2 mt-2">
      {/* 1. Header with GPS button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
        <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
          <span>Punto exacto de entrega (GPS & Mapa):</span>
        </span>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 px-3 py-2 rounded-xl border border-emerald-300 transition cursor-pointer shadow-xs disabled:opacity-60 active:scale-95"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>{locatingStatus || "Detectando GPS..."}</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mi Ubicación Actual (GPS)</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Street / Address Search Bar (Works 100% on any iPhone/Android without browser permission issues) */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Escribe tu calle, plaza o barrio... (Ej. Av. América)"
            className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 focus:border-neutral-900 rounded-xl text-base sm:text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 transition shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowResultsDropdown(false);
              }}
              className="absolute right-2.5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete Results Dropdown */}
        {showResultsDropdown && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-[500] max-h-56 overflow-y-auto divide-y divide-neutral-100">
            {searchResults.map((item, idx) => (
              <button
                key={item.place_id || idx}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-50 transition cursor-pointer flex items-start gap-2.5"
              >
                <Compass className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-neutral-900 truncate">
                    {item.display_name.split(",")[0]}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate">
                    {item.display_name.split(",").slice(1, 4).join(", ")}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Persistent Saved Location Pill Banner */}
      {hasSavedMemory && (
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] text-emerald-900">
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Domicilio recordado:</strong> Tu punto exacto está guardado en tu teléfono para futuros pedidos.
            </span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
            Guardado
          </span>
        </div>
      )}

      {/* 4. Collapsible mini guide for users who want to unlock hardware GPS on iPhone */}
      {showIosGuide && (
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-neutral-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>¿Cómo activar el GPS en tu iPhone o Android?</span>
            </span>
            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="text-neutral-400 hover:text-neutral-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-neutral-600 leading-relaxed">
            Ve a <strong>Ajustes de tu celular → Privacidad y Seguridad → Localización</strong> y asegúrate de que esté en <em>"Al usar la app"</em>.
          </p>
          <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
            Tip: También puedes escribir el nombre de tu calle en el buscador de arriba o arrastrar el pin directamente a tu casa.
          </div>
        </div>
      )}

      {/* 5. Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-52 sm:h-60 bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Badge */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Toca o arrastra el pin hasta la puerta de tu casa</span>
        </div>
      </div>

      {/* 6. Selected Coordinates Status & Google Maps Link */}
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
        <span className="flex items-center gap-1 truncate pr-2">
          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>
            Punto fijado: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
            {accuracyMeters ? ` (±${accuracyMeters}m)` : ""}
          </span>
        </span>
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1 hover:underline flex-shrink-0"
          title="Verificar en Google Maps"
        >
          <span>Abrir Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
