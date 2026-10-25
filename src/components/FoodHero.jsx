import React from "react";
import { useStore } from "../context/StoreContext";
import { 
  UtensilsCrossed, 
  Bike, 
  Wine, 
  Clock, 
  MessageCircle, 
  Edit3
} from "lucide-react";
import { motion } from "framer-motion";

export default function FoodHero({ onExploreClick, onSelectCategory }) {
  const { storeConfig, enterAdminMode, isAdminAuthenticated } = useStore();

  const handleWhatsAppClick = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hola ${storeConfig.name}, quisiera realizar un pedido o reservar una mesa.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  const handleCategoryShortcut = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <div className="relative mb-10 sm:mb-14 overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f8f8f6] border border-stone-200/90 shadow-xs text-[#141413]">
      
      {/* Subtle plaster/marble studio texture background */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-45"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 25%, rgba(255,255,255,0.9) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(231,229,224,0.6) 0%, transparent 50%)`
        }}
      />

      {/* =====================================================================
          1. TOP LUSCIOUS EDITORIAL NAVIGATION BAR INSIDE HERO
         ===================================================================== */}
      <div className="relative z-20 px-5 sm:px-10 lg:px-14 pt-5 sm:pt-7 pb-2 flex items-center justify-between gap-4">
        {/* Brand Script/Serif Signature ("luscious" / Aura Bistró) */}
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-[#141413]">
            luscious
          </span>
          <span className="text-[10px] sm:text-xs text-stone-400 font-medium hidden sm:inline">
            • {storeConfig.name}
          </span>
        </div>

        {/* Center / Right Quick Category Links + Orange Outlined Pill Button */}
        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-700">
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Entradas & Tapas")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Entradas & Dumplings
            </button>
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Platos Fuertes")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Recetas de Autor
            </button>
            <button
              type="button"
              onClick={onExploreClick}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Menú Completo
            </button>
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Postres de Autor")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Postres
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => enterAdminMode("customizer")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-white/80 border border-stone-300 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
            )}

            <button
              onClick={handleWhatsAppClick}
              className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border-2 border-[#ff5500] text-[#ff5500] hover:bg-[#ff5500] hover:text-white text-[11px] sm:text-xs font-bold transition cursor-pointer"
            >
              Reservar / WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. DECORATIVE CORNER CULINARY ELEMENTS (SPICE SPOONS & TOMATOES)
         ===================================================================== */}
      {/* Top-Left Culinary Spice Accent */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        aria-hidden="true"
        className="hidden sm:flex items-center gap-3 absolute top-20 left-5 sm:left-10 lg:left-14 z-10 pointer-events-none select-none"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden shadow-md border-2 border-white">
          <img
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80"
            alt="Especias artesanales"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-[11px] font-medium text-stone-500 tracking-wide uppercase">
          Especias & Masas Frescas del Día
        </div>
      </motion.div>

      {/* Top-Right Fresh Cherry Tomatoes & Herbs Accent */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        aria-hidden="true"
        className="hidden sm:block absolute top-20 right-6 lg:right-12 z-10 pointer-events-none select-none"
      >
        <img
          src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80"
          alt="Tomates cherry frescos"
          className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-full shadow-md border-2 border-white"
        />
      </motion.div>

      {/* =====================================================================
          3. MAIN HERO STAGE: LEFT SERIF HEADLINE & RIGHT ARTISANAL BOWL
         ===================================================================== */}
      <div className="relative z-20 px-5 sm:px-10 lg:px-14 pt-4 sm:pt-16 pb-8 sm:pb-12 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">
        
        {/* Left Column: Editorial Serif Typography + Vibrant Orange Pill CTA */}
        <div className="lg:col-span-6 text-left pt-2 sm:pt-12 lg:pt-16">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="font-serif font-bold text-[#141413] text-4xl sm:text-6xl lg:text-[64px] leading-[1.05] tracking-tight mb-3 sm:mb-4"
          >
            Take a taste <br />
            Come join us.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="font-serif font-semibold text-lg sm:text-2xl text-[#222220] mb-3"
          >
            Life is so endlessly delicious.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-xs sm:text-[13px] text-stone-500 max-w-md leading-relaxed mb-6 sm:mb-8"
          >
            Cada plato es una creación artesanal elaborada al momento con ingredientes orgánicos frescos, masas hechas a mano y cocción lenta para un sabor inolvidable en salón o en la puerta de tu casa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
            className="flex flex-wrap items-center gap-3.5"
          >
            <button
              onClick={onExploreClick}
              className="bg-[#ff5500] hover:bg-[#e64d00] active:scale-95 text-white text-xs sm:text-sm font-bold px-8 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-lg shadow-[#ff5500]/30 transition cursor-pointer"
            >
              Explore Now — Ver Carta
            </button>

            <button
              onClick={() => handleCategoryShortcut("Platos Fuertes")}
              className="px-6 py-3.5 sm:py-4 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              Especialidades del Chef
            </button>
          </motion.div>
        </div>

        {/* Right Column: Overhead Wooden Bowl with Dumplings, Chopsticks & Red Sauce with Basil */}
        <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[330px] sm:max-w-[460px] lg:max-w-[540px] flex items-center justify-center"
          >
            <motion.img
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              src="/luscious-food-bowl.png"
              alt="Cuenco artesanal con dumplings al vapor, palillos y salsa roja con albahaca"
              className="w-full h-auto object-contain drop-shadow-[0_22px_32px_rgba(28,25,23,0.16)] select-none"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=1000&q=85";
              }}
            />
          </motion.div>
        </div>

      </div>

      {/* =====================================================================
          4. SUBTLE GOURMET FOOTER BAR
         ===================================================================== */}
      <div className="relative z-20 bg-white/85 backdrop-blur-xs px-5 sm:px-10 lg:px-14 py-4 border-t border-stone-200/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-serif text-stone-900">Cocina de Autor</div>
              <div className="text-[10px] text-stone-500">Elaborado al momento</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-serif text-stone-900">Delivery Térmico</div>
              <div className="text-[10px] text-stone-500">Caliente hasta tu puerta</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
              <Wine className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-serif text-stone-900">Maridaje & Cocteles</div>
              <div className="text-[10px] text-stone-500">Cava & barra artesanal</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold font-serif text-stone-900">Salón & Take Away</div>
              <div className="text-[10px] text-stone-500">Pago con QR o Efectivo</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
