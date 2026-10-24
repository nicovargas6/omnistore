import React from "react";
import { useStore } from "../context/StoreContext";
import { ArrowDown, MessageCircle, ShieldCheck, Zap, Truck, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { InteractiveHoverButton } from "./ui/InteractiveHoverButton";

export default function Hero({ onExploreClick }) {
  const { storeConfig, enterAdminMode } = useStore();

  const handleWhatsAppClick = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hola ${storeConfig.name}, estuve viendo su catálogo en línea y me gustaría hacer una consulta.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <div className="relative mb-8 sm:mb-12 overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/80 shadow-md">
      {/* Background image with subtle zoom & cinematic gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src={storeConfig.bannerUrl}
          alt={storeConfig.name}
          className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05]"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 py-16 sm:py-24 text-white flex flex-col items-center sm:items-start text-center sm:text-left">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-4 text-white drop-shadow-sm font-['Outfit']"
        >
          {storeConfig.name}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-base sm:text-lg text-neutral-200 max-w-2xl font-normal mb-8 leading-relaxed drop-shadow"
        >
          {storeConfig.tagline}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col items-center sm:items-start gap-3 w-full sm:w-auto"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <InteractiveHoverButton
              onClick={onExploreClick}
              icon={ArrowDown}
              className="w-full sm:w-auto bg-white text-neutral-900 border-white/80 shadow-lg"
              dotClassName="bg-neutral-900"
              activeTextClassName="text-white"
            >
              Explorar Catálogo
            </InteractiveHoverButton>

            <InteractiveHoverButton
              onClick={handleWhatsAppClick}
              icon={MessageCircle}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40"
              dotClassName="bg-emerald-800"
              activeTextClassName="text-white"
            >
              Consultar por WhatsApp
            </InteractiveHoverButton>
          </div>

          <button
            onClick={() => enterAdminMode("customizer")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition cursor-pointer"
            title="Ir al personalizador visual en el Panel Admin"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-300" />
            <span>Personalizar portada y marca</span>
          </button>
        </motion.div>
      </div>

      {/* Feature Strip footer */}
      <div className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-white text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400 border border-white/10">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-200 font-medium leading-tight">Envío local o retiro</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-200 font-medium leading-tight">Pago con QR Simple</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400 border border-white/10">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-200 font-medium leading-tight">Stock en tiempo real</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400 border border-white/10">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <span className="text-neutral-200 font-medium leading-tight">Atención directa WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}
