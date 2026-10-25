import React from "react";
import { useStore } from "../context/StoreContext";
import { 
  ArrowRight, 
  Truck, 
  RotateCcw, 
  Award, 
  Lock, 
  MessageCircle, 
  Edit3
} from "lucide-react";
import { motion } from "framer-motion";

export default function FashionHero({ onExploreClick, onSelectCategory }) {
  const { storeConfig, enterAdminMode, isAdminAuthenticated } = useStore();

  const handleWhatsAppClick = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hola ${storeConfig.name}, estuve viendo la colección en la tienda y me gustaría consultar por las prendas disponibles.`);
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
    <div className="mb-10 sm:mb-14 overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-300/80 shadow-xs bg-[#ecebe6] text-[#0f0f0f]">
      
      {/* =====================================================================
          1. TOP HERO STAGE (GAZU EDITORIAL STYLE)
         ===================================================================== */}
      <div className="relative bg-[#ecebe6] px-5 sm:px-10 lg:px-14 pt-6 sm:pt-10 pb-8 sm:pb-12 overflow-hidden">
        
        {/* Top Row: Left Editorial Motto + Right Admin/WhatsApp Pill */}
        <div className="relative z-20 flex items-start justify-between gap-4 mb-2 sm:mb-0">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-neutral-800 leading-relaxed"
          >
            <div>FASHION</div>
            <div>THAT MOVES</div>
            <div>WITH YOU.</div>
            <div className="w-8 h-[1.5px] bg-neutral-900 mt-2" />
          </motion.div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => enterAdminMode("customizer")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-neutral-700 hover:text-black bg-white/70 hover:bg-white border border-neutral-300 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={handleWhatsAppClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-800 hover:text-black bg-white/75 hover:bg-white border border-neutral-300/90 transition cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Showroom WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Center Stage: Giant Solid Black 'GAZU / KULT' Letters + Walking Cutout Model */}
        <div className="relative my-2 sm:my-4 flex items-center justify-center min-h-[270px] sm:min-h-[420px] lg:min-h-[490px]">
          
          {/* Huge Architectural Solid Black Typography Behind Model */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
          >
            <span className="font-['Outfit'] font-black text-[#0f0f0f] text-[25vw] sm:text-[22vw] lg:text-[265px] tracking-[-0.03em] leading-none uppercase">
              GAZU
            </span>
          </motion.div>

          {/* Walking Streetwear Model Cutout (Multiplied cleanly over the background & giant letters) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex items-center justify-center pointer-events-none"
          >
            <img
              src="/gazu-hero-model.png"
              alt="Editorial Streetwear Model"
              className="h-[270px] sm:h-[430px] lg:h-[510px] w-auto object-contain filter contrast-[1.04] drop-shadow-[0_16px_24px_rgba(0,0,0,0.16)] select-none"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85";
              }}
            />
          </motion.div>
        </div>

        {/* Bottom Row of Top Stage: Left CTAs (SHOP NOW + EXPLORE NEW IN) & Right Collection Year */}
        <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 pt-2">
          
          {/* Left Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto"
          >
            <button
              onClick={onExploreClick}
              className="bg-[#0f0f0f] hover:bg-neutral-800 active:scale-95 text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] px-7 sm:px-8 py-3.5 sm:py-4 transition cursor-pointer shadow-sm"
            >
              SHOP NOW
            </button>

            <button
              onClick={() => handleCategoryShortcut("Nuevos Drops")}
              className="text-[#0f0f0f] hover:text-neutral-600 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] border-b-2 border-[#0f0f0f] pb-1 transition cursor-pointer"
            >
              EXPLORE NEW IN
            </button>
          </motion.div>

          {/* Right Collection Label */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="hidden sm:block text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-800 leading-relaxed"
          >
            <div>NEW</div>
            <div>COLLECTION</div>
            <div>2026</div>
            <div className="w-8 h-[1.5px] bg-neutral-900 mt-1.5" />
          </motion.div>
        </div>
      </div>

      {/* =====================================================================
          2. DARK CATEGORY STRIP (MEN / WOMEN / KIDS-DROPS)
         ===================================================================== */}
      <div className="bg-[#111111] text-white px-5 sm:px-10 lg:px-14 py-7 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          
          {/* Card 1: MEN / OVERSIZED TEES */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => handleCategoryShortcut("Oversized Tees")}
            className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3 sm:p-4 border border-white/10 transition cursor-pointer"
          >
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80"
                alt="Men Collection"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                MEN
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug line-clamp-2">
                Esenciales elevados de corte boxy 280gsm para cada día.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                <span>SHOP MEN</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </motion.div>

          {/* Card 2: WOMEN / HOODIES & JACKETS */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => handleCategoryShortcut("Hoodies & Jackets")}
            className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3 sm:p-4 border border-white/10 transition cursor-pointer"
          >
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                alt="Women Collection"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                WOMEN
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug line-clamp-2">
                Siluetas sin esfuerzo en tejido french terry 450gsm.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                <span>SHOP WOMEN</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </motion.div>

          {/* Card 3: UNISEX & CARGO / ACCESSORIES */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => handleCategoryShortcut("Pantalones & Denim")}
            className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3 sm:p-4 border border-white/10 transition cursor-pointer"
          >
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=400&q=80"
                alt="Cargo & Drops"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                CARGO & DROPS
              </h3>
              <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug line-clamp-2">
                Comodidad utilitaria y accesorios de edición limitada.
              </p>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                <span>SHOP DROPS</span>
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* =====================================================================
          3. MIDDLE EDITORIAL BANNER ("NEW SEASON / NEW VIBES")
         ===================================================================== */}
      <div className="bg-[#d6d5d0] relative overflow-hidden px-5 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-8 sm:pb-0 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left Editorial Copy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="z-10 max-w-md py-2 sm:py-10 text-left w-full sm:w-auto"
        >
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-neutral-700 block mb-2">
            NEW SEASON
          </span>
          <h2 className="font-['Outfit'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0f0f0f] leading-[0.95] mb-3">
            NEW <br />
            VIBES
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 mb-6 max-w-xs leading-relaxed">
            Descubre todas las piezas de la nueva cápsula urbana disponibles para envío inmediato.
          </p>
          <button
            onClick={onExploreClick}
            className="bg-[#0f0f0f] hover:bg-neutral-800 active:scale-95 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-6 sm:px-7 py-3.5 transition cursor-pointer"
          >
            EXPLORE COLLECTION
          </button>
        </motion.div>

        {/* Right Monochrome Editorial Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full sm:w-1/2 flex justify-center sm:justify-end self-end"
        >
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
            alt="New Season Vibes Editorial"
            className="h-[230px] sm:h-[320px] lg:h-[360px] w-auto object-cover object-top grayscale contrast-125 mix-blend-multiply"
          />
        </motion.div>
      </div>

      {/* =====================================================================
          4. MINIMALIST 4-ICON FEATURE BAR
         ===================================================================== */}
      <div className="bg-[#ecebe6] px-5 sm:px-10 lg:px-14 py-5 sm:py-6 border-t border-neutral-300">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                FAST DELIVERY
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-600">
                Envío rápido y seguro
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                EASY RETURNS
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-600">
                Cambios dentro de 15 días
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                QUALITY ASSURED
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-600">
                Algodón 280-450gsm premium
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
            <div>
              <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                SECURE PAYMENT
              </div>
              <div className="text-[10px] sm:text-[11px] text-neutral-600">
                Pago 100% seguro con QR
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
