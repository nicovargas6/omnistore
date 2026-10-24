import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MapPin, 
  Search, 
  Check, 
  ExternalLink, 
  X, 
  Compass,
  Plus,
  Minus
} from "lucide-react";
import { toast } from "sonner";

// Mathematically anchored vector pin: Tip is precisely at (18, 46)
// Icon size is [36, 46], iconAnchor is [18, 46].
// ZERO CSS transforms ensures it NEVER shifts or drifts when zooming in/out!
const createPinIcon = () => {
  return L.divIcon({
    className: "precision-map-pin",
    html: `
      <div style="width: 36px; height: 46px; position: relative;">
        <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));">
          <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 14.5 42.5 17.15 45.05C17.62 45.5 18.38 45.5 18.85 45.05C21.5 42.5 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="#e11d48"/>
          <circle cx="18" cy="18" r="7.5" fill="white"/>
          <circle cx="18" cy="18" r="4" fill="#e11d48"/>
        </svg>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46],
  });
};

export default function DeliveryMapPicker({ onLocationSelect, initialCoords }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize coordinates from props or persistent localStorage
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
    // Default: Cochabamba, Bolivia
    return { lat: -17.3820, lng: -66.1475 };
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

  // Initialize Leaflet Map with CartoDB Voyager modern vector-style tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // CartoDB Voyager provides a clean, premium Apple/Google Maps aesthetic
    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 16,
      minZoom: 12,
      maxZoom: 19,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const marker = L.marker([coords.lat, coords.lng], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true,
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Ensure map tiles render smoothly inside modals on mobile
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
      const updated = { lat: pos.lat, lng: pos.lng };
      notifyUpdate(updated);
      toast.success("Punto de entrega fijado y guardado.");
    });

    // Handle map click to reposition pin
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      const updated = { lat: e.latlng.lat, lng: e.latlng.lng };
      notifyUpdate(updated);
      toast.success("Punto de entrega actualizado y guardado.");
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

  // Update center if initialCoords changes from parent
  useEffect(() => {
    if (initialCoords && initialCoords.lat && initialCoords.lng) {
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([initialCoords.lat, initialCoords.lng]);
        mapInstanceRef.current.setView([initialCoords.lat, initialCoords.lng], 16);
      }
    }
  }, [initialCoords]);

  // Street / Zone Search with Real-Time Autocomplete
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

  // User selects an address result from autocomplete dropdown
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

    toast.success("¡Calle localizada! El pin se fijó en la ubicación seleccionada.");
  };

  const googleMapsLink = `https://www.google.com/maps?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

  return (
    <div className="space-y-2 mt-2">
      {/* 1. Clear label */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-neutral-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>Ubica tu dirección en el mapa:</span>
        </span>
        <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
          Escribe tu calle o toca el mapa
        </span>
      </div>

      {/* 2. Modern Street / Address Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            placeholder="Escribe tu calle o avenida... (Ej. Av. América)"
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
              <strong>Punto guardado:</strong> Tu dirección está memorizada para tus próximos pedidos.
            </span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold hidden sm:inline">
            Permanente
          </span>
        </div>
      )}

      {/* 4. Interactive Map Canvas (Clean CartoDB Voyager Style) */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-300 shadow-inner h-56 sm:h-64 bg-neutral-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Pill */}
        <div className="absolute top-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-medium text-neutral-800 shadow-sm border border-neutral-200 flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Toca o arrastra el pin hasta tu puerta</span>
        </div>
      </div>

      {/* 5. Selected Coordinates Status & Google Maps Link */}
      <div className="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-[11px] text-neutral-600">
        <span className="flex items-center gap-1 truncate pr-2">
          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>
            Punto fijado: <strong>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</strong>
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
