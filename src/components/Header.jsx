import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { BUSINESS_PRESETS } from "../data/presets";
import { 
  ShoppingBag, 
  Store, 
  SlidersHorizontal, 
  MapPin, 
  Phone, 
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  Clock,
  ShieldCheck,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { 
    storeConfig, 
    cartCount, 
    setIsCartOpen, 
    viewMode, 
    setViewMode, 
    activePresetKey, 
    switchBusinessPreset,
    features,
    openTracking,
    isStoreOpen,
    openPrivacyCenter,
    enterAdminMode,
    logoutAdmin,
    isAdminAuthenticated,
  } = useStore();

  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200 transition-colors">
      {/* Top micro-bar with address, WhatsApp info, and quick preset pill */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">{storeConfig.address}</span>
              <span className="sm:hidden">Local activo</span>
            </span>

            {/* Live Store Status (Open / Closed) */}
            <div className="flex items-center">
              {isStoreOpen ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Abierto ahora ({storeConfig.businessHours?.openTime || "11:00"} - {storeConfig.businessHours?.closeTime || "23:00"})</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-300 bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Cerrado por ahora (Abre a las {storeConfig.businessHours?.openTime || "11:00"})</span>
                </span>
              )}
            </div>

            <span className="hidden lg:flex items-center gap-1.5 text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>WhatsApp: {storeConfig.phoneWhatsApp}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Privacy & My Data Center */}
            <button
              onClick={openPrivacyCenter}
              className="flex items-center gap-1.5 text-neutral-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer hover:bg-neutral-800"
              title="Centro de Privacidad y gestión de datos personales"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Mis Datos</span>
            </button>

            {/* Optional Feature: Order Tracking in Top bar */}
            {features.orderTracking && viewMode === "storefront" && (
              <button
                onClick={() => openTracking(null)}
                className="flex items-center gap-1.5 text-neutral-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer hover:bg-neutral-800"
                title="Rastrear el estado de tu pedido con tu código o teléfono"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Rastrear Pedido</span>
              </button>
            )}

            {/* Quick preset changer popup */}
            <div className="relative">
              <button
                onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer border border-neutral-700"
                title="Seleccionar giro de negocio activo"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Giro: <strong className="text-white">{storeConfig.name.split("|")[0].split("&")[0].trim()}</strong></span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              <AnimatePresence>
                {isPresetDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1.5 w-72 bg-white text-neutral-800 rounded-xl shadow-xl border border-neutral-200 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-3 py-1.5 border-b border-neutral-100 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                      Selecciona un tipo de negocio:
                    </div>
                    {Object.values(BUSINESS_PRESETS).map((preset) => {
                      const isSelected = preset.id === activePresetKey;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            switchBusinessPreset(preset.id);
                            setIsPresetDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer ${
                            isSelected ? "bg-neutral-100 font-semibold text-neutral-950" : "text-neutral-700"
                          }`}
                        >
                          <div>
                            <div className="font-medium text-neutral-900">{preset.name}</div>
                            <div className="text-[11px] text-neutral-500">{preset.badge}</div>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div 
          onClick={() => setViewMode("storefront")} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img 
              src={storeConfig.logoUrl} 
              alt={storeConfig.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=180&h=180&q=80";
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight leading-tight group-hover:text-neutral-700 transition">
                {storeConfig.name}
              </h1>
              <span className="hidden md:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                {storeConfig.badge}
              </span>
            </div>
            <p className="text-xs text-neutral-500 line-clamp-1 max-w-sm hidden sm:block">
              {storeConfig.tagline}
            </p>
          </div>
        </div>

        {/* View Switcher & Cart */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher: Client View vs Admin Panel */}
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center border border-neutral-200 text-xs">
            <button
              onClick={() => setViewMode("storefront")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === "storefront"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Tienda</span>
            </button>
            <button
              onClick={() => enterAdminMode("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                viewMode === "admin"
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </button>

            {viewMode === "admin" && (
              <button
                onClick={logoutAdmin}
                className="ml-1 flex items-center gap-1 px-2 py-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition cursor-pointer"
                title="Cerrar y bloquear sesión administrativa"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Bloquear</span>
              </button>
            )}
          </div>

          {/* Cart Trigger */}
          {viewMode === "storefront" && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Pedido</span>
              <motion.span
                key={cartCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                className="bg-amber-400 text-neutral-950 font-bold px-2 py-0.5 rounded-full text-xs"
              >
                {cartCount}
              </motion.span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
