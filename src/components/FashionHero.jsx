import React, { useState } from "react";
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

function getBrandWord(rawName = "KULT") {
  const beforePipe = (rawName || "KULT").split("|")[0].trim();
  const cleaned = beforePipe.replace(/\s+(studio|store|shop|boutique|moda|urbana|oficial)$/i, "").trim();
  return (cleaned || beforePipe || "KULT").toUpperCase();
}

export default function FashionHero({ onExploreClick, onSelectCategory }) {
  const { storeConfig, enterAdminMode, isAdminAuthenticated } = useStore();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const brandWord = getBrandWord(storeConfig.name);
  const brandLetters = brandWord.split("");
  const heroModelImage =
    storeConfig.bannerUrl &&
    !storeConfig.bannerUrl.includes("photo-1490481651871-ab68de25d43d")
      ? storeConfig.bannerUrl
      : "/gazu-hero-model.png";

  // Dynamic font size so any brand name length fits edge-to-edge behind the model
  const letterSizeClass =
    brandWord.length <= 4
      ? "text-[26vw] sm:text-[23vw] lg:text-[275px]"
      : brandWord.length <= 6
      ? "text-[20vw] sm:text-[18vw] lg:text-[210px]"
      : "text-[14vw] sm:text-[13vw] lg:text-[150px]";

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: relX, y: relY });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

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
    <section className="w-full bg-[#ecebe6] text-[#0f0f0f] overflow-hidden select-none">
      
      {/* =====================================================================
          1. FULL-BLEED TOP HERO STAGE (GAZU EDITORIAL STYLE + 3D PARALLAX)
         ===================================================================== */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full bg-[#ecebe6] pt-6 sm:pt-10 pb-8 sm:pb-12 overflow-hidden"
      >
        {/* Subtle interactive studio spotlight gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-transform duration-500 ease-out"
          style={{
            background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.65) 0%, rgba(236,235,230,0) 62%)",
            transform: `translate3d(${parallax.x * 35}px, ${parallax.y * 25}px, 0)`
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14">
          {/* Top Row: Left Editorial Motto + Right Admin/WhatsApp Pill */}
          <div className="relative z-20 flex items-start justify-between gap-4 mb-2 sm:mb-0">
            <motion.div
              initial={{ opacity: 0, transform: "translateY(12px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.26em] text-neutral-800 leading-relaxed"
            >
              <div>MODA</div>
              <div>QUE SE MUEVE</div>
              <div>CONTIGO.</div>
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

          {/* Center Stage: Giant Solid Black Brand Name + Walking Cutout Model with Counter-Parallax */}
          <div className="relative my-2 sm:my-4 flex items-center justify-center min-h-[280px] sm:min-h-[430px] lg:min-h-[500px]">
            
            {/* Huge Architectural Solid Black Brand Name Behind Model */}
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${parallax.x * -24}px, ${parallax.y * -14}px, 0)`
              }}
            >
              <div className="flex items-center justify-center">
                {brandLetters.map((char, idx) => (
                  <motion.span
                    key={`${char}-${idx}`}
                    initial={{ opacity: 0, transform: "translateY(42px) scale(0.92)" }}
                    animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                    transition={{
                      duration: 0.65,
                      delay: idx * 0.06,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className={`inline-block font-['Outfit'] font-black text-[#0f0f0f] ${letterSizeClass} tracking-[-0.03em] leading-none uppercase`}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Walking Streetwear Model Cutout in Front of the Giant Brand Letters */}
            <motion.div
              initial={{ opacity: 0, transform: "translateY(28px) scale(0.96)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex items-center justify-center pointer-events-none transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${parallax.x * 18}px, ${parallax.y * 10}px, 0)`
              }}
            >
              <motion.img
                animate={{ transform: ["translateY(-3px)", "translateY(3px)", "translateY(-3px)"] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                src={heroModelImage}
                alt={`${storeConfig.name} Editorial Model`}
                className="h-[275px] sm:h-[440px] lg:h-[515px] w-auto object-contain filter contrast-[1.04] drop-shadow-[0_18px_28px_rgba(0,0,0,0.18)] select-none"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85";
                }}
              />
            </motion.div>
          </div>

          {/* Bottom Row of Top Stage: Left CTAs & Right Collection Year */}
          <div className="relative z-20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 pt-2">
            
            {/* Left Action Buttons */}
            <motion.div
              initial={{ opacity: 0, transform: "translateY(12px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto"
            >
              <button
                onClick={onExploreClick}
                className="group relative overflow-hidden bg-[#0f0f0f] hover:bg-neutral-800 active:scale-98 text-white text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] px-7 sm:px-8 py-3.5 sm:py-4 transition cursor-pointer shadow-sm flex items-center gap-2"
              >
                <span>COMPRAR AHORA</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => handleCategoryShortcut("Nuevos Drops")}
                className="text-[#0f0f0f] hover:text-neutral-600 text-[11px] sm:text-xs font-bold uppercase tracking-[0.16em] border-b-2 border-[#0f0f0f] pb-1 transition cursor-pointer"
              >
                EXPLORAR NUEVOS DROPS
              </button>
            </motion.div>

            {/* Right Collection Label */}
            <motion.div
              initial={{ opacity: 0, transform: "translateY(12px)" }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden sm:block text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-800 leading-relaxed"
            >
              <div>NUEVA</div>
              <div>COLECCIÓN</div>
              <div>2026</div>
              <div className="w-8 h-[1.5px] bg-neutral-900 mt-1.5" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. FULL-BLEED DARK CATEGORY STRIP (HOMBRE / MUJER / CARGO & DROPS)
         ===================================================================== */}
      <div className="w-full bg-[#111111] text-white py-8 sm:py-11">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            
            {/* Card 1: HOMBRE / OVERSIZED TEES */}
            <div
              onClick={() => handleCategoryShortcut("Oversized Tees")}
              className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3.5 sm:p-4 border border-white/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=400&q=80"
                  alt="Colección Hombre"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                  HOMBRE
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug line-clamp-2">
                  Esenciales elevados de corte boxy 280gsm para cada día.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                  <span>VER HOMBRE</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Card 2: MUJER / HOODIES & JACKETS */}
            <div
              onClick={() => handleCategoryShortcut("Hoodies & Jackets")}
              className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3.5 sm:p-4 border border-white/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-20 h-24 sm:w-24 sm:h-28 bg-neutral-800 overflow-hidden flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                  alt="Colección Mujer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                  MUJER
                </h3>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 leading-snug line-clamp-2">
                  Siluetas sin esfuerzo en tejido french terry 450gsm.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                  <span>VER MUJER</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Card 3: CARGO & DROPS */}
            <div
              onClick={() => handleCategoryShortcut("Pantalones & Denim")}
              className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-[#222222] p-3.5 sm:p-4 border border-white/10 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
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
                  Comodidad utilitaria y prendas de edición limitada.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white mt-3 border-b border-white/60 pb-0.5 group-hover:border-white">
                  <span>VER DROPS</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================================
          3. FULL-BLEED MIDDLE EDITORIAL BANNER ("NUEVA TEMPORADA / NUEVAS VIBRAS")
         ===================================================================== */}
      <div className="w-full bg-[#d6d5d0] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 pt-8 sm:pt-12 pb-8 sm:pb-0 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Left Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, transform: "translateX(-18px)" }}
            whileInView={{ opacity: 1, transform: "translateX(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="z-10 max-w-md py-2 sm:py-10 text-left w-full sm:w-auto"
          >
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-neutral-700 block mb-2">
              NUEVA TEMPORADA
            </span>
            <h2 className="font-['Outfit'] text-4xl sm:text-6xl font-black uppercase tracking-tight text-[#0f0f0f] leading-[0.95] mb-3">
              NUEVAS <br />
              VIBRAS
            </h2>
            <p className="text-xs sm:text-sm text-neutral-700 mb-6 max-w-xs leading-relaxed">
              Descubre todas las piezas de la nueva colección cápsula de {brandWord} disponibles para envío inmediato.
            </p>
            <button
              onClick={onExploreClick}
              className="bg-[#0f0f0f] hover:bg-neutral-800 active:scale-98 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] px-6 sm:px-7 py-3.5 transition cursor-pointer"
            >
              EXPLORAR COLECCIÓN
            </button>
          </motion.div>

          {/* Right Monochrome Editorial Portrait */}
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.96)" }}
            whileInView={{ opacity: 1, transform: "scale(1)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full sm:w-1/2 flex justify-center sm:justify-end self-end"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
              alt="Nueva Temporada Editorial"
              className="h-[230px] sm:h-[320px] lg:h-[360px] w-auto object-cover object-top grayscale contrast-125 mix-blend-multiply"
            />
          </motion.div>
        </div>
      </div>

      {/* =====================================================================
          4. FULL-BLEED MINIMALIST 4-ICON FEATURE BAR
         ===================================================================== */}
      <div className="w-full bg-[#ecebe6] border-y border-neutral-300">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-6 sm:py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
            <div className="flex items-center gap-3.5">
              <Truck className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
              <div>
                <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                  ENVÍO RÁPIDO
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-600">
                  Entrega ágil y segura a domicilio
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <RotateCcw className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
              <div>
                <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                  CAMBIOS FÁCILES
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-600">
                  Garantía de talle por 15 días
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Award className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
              <div>
                <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                  CALIDAD GARANTIZADA
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-600">
                  Algodón 280-450gsm de alta densidad
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <Lock className="w-5 h-5 text-neutral-900 stroke-[1.75] flex-shrink-0" />
              <div>
                <div className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                  PAGO SEGURO
                </div>
                <div className="text-[10px] sm:text-[11px] text-neutral-600">
                  Checkout 100% protegido con QR
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
