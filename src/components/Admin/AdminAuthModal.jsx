import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Lock, KeyRound, ShieldAlert, X, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAuthModal() {
  const { 
    isAdminPinModalOpen, 
    setIsAdminPinModalOpen, 
    authenticateAdmin,
    storeConfig 
  } = useStore();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!isAdminPinModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin) return;

    const ok = authenticateAdmin(pin);
    if (!ok) {
      setHasError(true);
      setPin("");
    } else {
      setHasError(false);
      setPin("");
    }
  };

  const handleClose = () => {
    setIsAdminPinModalOpen(false);
    setPin("");
    setHasError(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900"
        >
          {/* Header */}
          <div className="bg-neutral-900 text-white p-6 relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition cursor-pointer"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3 border border-amber-400/30">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold tracking-tight">
              Panel de Gestión Protegido
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Ingresa el PIN de seguridad del comercio para gestionar comandas, inventario y métricas en vivo.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Código PIN de Administrador
              </label>
              
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={8}
                  autoFocus
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (hasError) setHasError(false);
                  }}
                  placeholder="Ej. 1234"
                  className={`w-full px-4 py-3 bg-neutral-50 border rounded-xl text-center text-lg tracking-[0.3em] font-mono font-bold focus:outline-none focus:ring-2 transition ${
                    hasError
                      ? "border-rose-400 focus:ring-rose-400 text-rose-600 bg-rose-50/50"
                      : "border-neutral-200 focus:ring-neutral-900 focus:bg-white text-neutral-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1"
                  title={showPin ? "Ocultar PIN" : "Ver PIN"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {hasError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>PIN incorrecto. Inténtalo de nuevo.</span>
                </motion.div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!pin.trim()}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm transition cursor-pointer shadow-sm"
              >
                <span>Desbloquear y Acceder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Demo Hint */}
            <div className="pt-3 border-t border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
                💡 PIN por defecto para demostración: <strong className="text-neutral-900 font-mono">1234</strong>
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
