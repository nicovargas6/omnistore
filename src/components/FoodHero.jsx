import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { 
  UtensilsCrossed, 
  Bike, 
  Wine, 
  Clock, 
  Edit3
} from "lucide-react";
import { motion } from "framer-motion";

export default function FoodHero({ onExploreClick, onSelectCategory }) {
  const { storeConfig, products, setSelectedProductForDetail, enterAdminMode, isAdminAuthenticated } = useStore();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const restaurantName = (storeConfig.name || "Aura Bistró & Cantina").split("|")[0].trim();

  // Signature dish offered by the restaurant ("Ojo de Bife Angus & Papas Trufadas")
  const signatureDish = products.find((p) => p.id === "rest-1") || products[0];
  const heroDishImage =
    storeConfig.bannerUrl &&
    !storeConfig.bannerUrl.includes("photo-1517248135467-4c7edcad34c4")
      ? storeConfig.bannerUrl
      : "/luscious-food-bowl.png";

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: relX, y: relY });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  const handleCategoryShortcut = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    if (onExploreClick) {
      onExploreClick();
    }
  };

  const handleDishClick = () => {
    if (signatureDish && setSelectedProductForDetail) {
      setSelectedProductForDetail(signatureDish);
    } else if (onExploreClick) {
      onExploreClick();
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#f8f8f6] text-[#141413] overflow-hidden"
    >
      {/* Subtle plaster/marble studio texture background */}
      <div 
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-55"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 25%, rgba(255,255,255,0.95) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(231,229,224,0.65) 0%, transparent 50%)`
        }}
      />

      {/* =====================================================================
          1. TOP EDITORIAL NAVIGATION BAR INSIDE FULL-BLEED HERO
         ===================================================================== */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 pt-6 sm:pt-8 pb-2 flex items-center justify-between gap-4">
        {/* Top-Left: Restaurant Name in Bold Serif */}
        <div className="flex items-center gap-2.5">
          <span className="font-serif font-extrabold text-xl sm:text-2xl tracking-tight text-[#141413]">
            {restaurantName}
          </span>
        </div>

        {/* Right: Quick Category Links in Spanish (No Reservar/WhatsApp button) */}
        <div className="flex items-center gap-4 sm:gap-7">
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-700">
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Parrilla & Pastas")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Parrilla & Cortes
            </button>
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Platos Fuertes")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Platos Fuertes
            </button>
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Entradas & Tapas")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Entradas & Tapas
            </button>
            <button
              type="button"
              onClick={() => handleCategoryShortcut("Postres de Autor")}
              className="hover:text-[#ff5500] transition cursor-pointer"
            >
              Postres
            </button>
            <button
              type="button"
              onClick={onExploreClick}
              className="font-bold text-[#ff5500] hover:underline transition cursor-pointer"
            >
              Pedir Ahora
            </button>
          </nav>

          {isAdminAuthenticated && (
            <button
              onClick={() => enterAdminMode("customizer")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-white/80 border border-stone-300 transition cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* =====================================================================
          2. MAIN HERO STAGE: SPANISH SERIF HEADLINE & RESTAURANT SIGNATURE DISH
         ===================================================================== */}
      <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 pt-6 sm:pt-12 pb-10 sm:pb-14 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">

        {/* Left Column: Spanish Editorial Serif Typography + Vibrant Orange Pill CTA */}
        <div className="lg:col-span-6 text-left pt-2 sm:pt-6">
          {/* Culinary Spices Pill */}
          <motion.div
            initial={{ opacity: 0, transform: "translateY(10px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 mb-5"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-xs border-2 border-white flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=200&q=80"
                alt="Especias artesanales"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] font-bold text-stone-600 tracking-widest uppercase">
              Cocina de Autor & Ingredientes Orgánicos
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, transform: "translateY(18px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-bold text-[#141413] text-4xl sm:text-6xl lg:text-[62px] leading-[1.05] tracking-tight mb-3 sm:mb-4"
          >
            Prueba el sabor. <br />
            Ven a disfrutar.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, transform: "translateY(14px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif font-semibold text-lg sm:text-2xl text-[#222220] mb-3"
          >
            La vida es infinitamente deliciosa.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, transform: "translateY(14px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-xs sm:text-[13px] text-stone-600 max-w-md leading-relaxed mb-7 sm:mb-8"
          >
            Cortes selectos madurados a la parrilla de leña, pastas artesanales y platos de autor preparados al momento con ingredientes frescos de estación.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, transform: "translateY(14px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3.5"
          >
            <button
              onClick={onExploreClick}
              className="bg-[#ff5500] hover:bg-[#e64d00] active:scale-98 text-white text-xs sm:text-sm font-bold px-8 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-lg shadow-[#ff5500]/30 transition cursor-pointer"
            >
              Explorar la Carta
            </button>

            <button
              onClick={() => handleCategoryShortcut("Parrilla & Pastas")}
              className="px-6 py-3.5 sm:py-4 rounded-full bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs sm:text-sm font-semibold transition active:scale-98 cursor-pointer"
            >
              Especialidades de la Parrilla
            </button>
          </motion.div>
        </div>

        {/* Right Column: Overhead Wooden Platter with Restaurant's Signature Dish ("Ojo de Bife Angus & Papas Trufadas") */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center lg:items-end">
          <motion.div
            initial={{ opacity: 0, transform: "scale(0.92)" }}
            animate={{ opacity: 1, transform: "scale(1)" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            onClick={handleDishClick}
            title={signatureDish ? `Ver ${signatureDish.name}` : "Ver plato"}
            className="group relative w-full max-w-[330px] sm:max-w-[460px] lg:max-w-[530px] flex items-center justify-center cursor-pointer transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${parallax.x * 16}px, ${parallax.y * 12}px, 0)`
            }}
          >
            <motion.img
              animate={{ transform: ["translateY(-4px)", "translateY(4px)", "translateY(-4px)"] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }}
              src={heroDishImage}
              alt={signatureDish ? signatureDish.name : "Ojo de Bife Angus & Papas Trufadas"}
              className="w-full h-auto object-contain drop-shadow-[0_22px_32px_rgba(28,25,23,0.16)] group-hover:scale-[1.02] transition-transform duration-500 select-none"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85";
              }}
            />

            {/* Subtle interactive dish label pill at bottom-right of platter */}
            {signatureDish && (
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-stone-200/90 shadow-lg flex items-center gap-2.5 group-hover:border-[#ff5500] transition-colors">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#ff5500]">
                    Plato Insignia del Chef
                  </span>
                  <span className="block text-xs font-bold text-stone-900 leading-tight">
                    {signatureDish.name}
                  </span>
                </div>
                <span className="text-xs font-extrabold font-mono text-stone-900 bg-stone-100 px-2 py-1 rounded-lg">
                  {storeConfig.currency}{signatureDish.price.toFixed(2)}
                </span>
              </div>
            )}
          </motion.div>
        </div>

      </div>

      {/* =====================================================================
          3. FULL-BLEED GOURMET FOOTER BAR
         ===================================================================== */}
      <div className="relative z-20 w-full bg-white/90 backdrop-blur-xs border-y border-stone-200/90">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-14 py-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-stone-900">Cocina de Autor</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Elaborado al momento</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
                <Bike className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-stone-900">Delivery Térmico</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Caliente hasta tu puerta</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
                <Wine className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-stone-900">Maridaje & Cocteles</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Cava & barra artesanal</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center flex-shrink-0 text-[#ff5500]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-stone-900">Salón & Para Llevar</div>
                <div className="text-[10px] sm:text-[11px] text-stone-500">Pago con QR o Efectivo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
