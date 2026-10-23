import React, { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConsentChoice } from "./types";

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

const STORAGE_KEY = "omnistore_cookie_consent_v1";

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Small delay so it animates in smoothly after initial paint
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Storage unavailable fallback
    }
  }, []);

  const handleChoice = (choice: ConsentChoice) => {
    try {
      const consentRecord = {
        status: choice,
        timestamp: new Date().toISOString(),
        necessary: true,
        analytics: choice === "all",
        marketing: choice === "all",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consentRecord));
    } catch (e) {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl border border-neutral-200/90 shadow-2xl p-4 sm:p-5 text-neutral-800"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-describedby="cookie-desc"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-amber-700" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 id="cookie-title" className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <span>Tu Privacidad y Cookies</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </h3>
              <button
                onClick={() => handleChoice("necessary")}
                className="text-neutral-400 hover:text-neutral-700 p-1"
                aria-label="Cerrar con cookies necesarias"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p id="cookie-desc" className="text-xs text-neutral-600 leading-relaxed">
              Utilizamos cookies técnicas para que tu carrito y tus pedidos funcionen con total fluidez y seguridad. No vendemos tus datos personales.
            </p>

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>Leer Política de Privacidad y Cookies</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleChoice("all")}
                className="flex-1 min-w-[120px] bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer text-center"
              >
                Aceptar Todas
              </button>
              <button
                type="button"
                onClick={() => handleChoice("necessary")}
                className="flex-1 min-w-[120px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold py-2.5 px-3.5 rounded-xl transition active:scale-95 cursor-pointer text-center border border-neutral-200"
              >
                Solo Necesarias
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;
