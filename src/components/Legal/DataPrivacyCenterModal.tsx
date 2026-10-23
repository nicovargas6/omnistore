import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  ShieldCheck, 
  Trash2, 
  Download, 
  X, 
  AlertTriangle, 
  Database, 
  FileText, 
  Lock, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DataPrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyDoc: () => void;
}

export const DataPrivacyCenterModal: React.FC<DataPrivacyCenterModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyDoc,
}) => {
  const { storeConfig, orders, cart, setOrders, setCart } = useStore();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  // Compute what data is currently held
  const ordersCount = orders ? orders.length : 0;
  const cartItemsCount = cart ? cart.length : 0;
  let cookieStatus = "No configurado";
  try {
    const rawConsent = localStorage.getItem("omnistore_cookie_consent_v1");
    if (rawConsent) {
      const parsed = JSON.parse(rawConsent);
      cookieStatus = parsed.status === "all" ? "Todas aceptadas" : "Solo necesarias";
    }
  } catch (e) {
    // ignore
  }

  // Right to data portability (export JSON)
  const handleExportData = () => {
    try {
      const userData = {
        exportDate: new Date().toISOString(),
        store: storeConfig.name,
        orders: orders || [],
        currentCart: cart || [],
        cookiePreferences: localStorage.getItem("omnistore_cookie_consent_v1") || null,
        clientNotes: "Exportación oficial bajo derecho ARCO de portabilidad de datos.",
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mis_datos_personales_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Copia estructurada de tus datos descargada con éxito.");
    } catch (err) {
      toast.error("Error al exportar datos personales.");
    }
  };

  // Right to be forgotten (purge user data)
  const handlePurgeAllData = () => {
    setIsDeleting(true);
    setTimeout(() => {
      try {
        // Clear all localized customer keys
        localStorage.removeItem("omnistore_cookie_consent_v1");
        localStorage.removeItem("omnistore_gemini_api_key");
        localStorage.removeItem("omnistore_prototype_v3");
        localStorage.removeItem("omnistore_saved_address");
        localStorage.removeItem("omnistore_saved_phone");

        // Clear in-memory cart and orders
        if (setCart) setCart([]);
        if (setOrders) setOrders([]);

        toast.success("Tus datos personales y pedidos han sido eliminados de acuerdo a tu Derecho al Olvido.");
        setShowConfirmDelete(false);
        setIsDeleting(false);
        onClose();

        // Refresh state cleanly
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (err) {
        setIsDeleting(false);
        toast.error("Hubo un error al purgar los datos.");
      }
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-neutral-900 text-white p-5 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Centro de Privacidad y Derechos ARCO</h2>
                <p className="text-xs text-neutral-400">Control de datos personales y Derecho al Olvido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-6 text-sm text-neutral-700">
            {/* Overview Card */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200/80 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Datos Registrados en este Dispositivo
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 block text-[11px]">Historial de Comandas:</span>
                  <strong className="text-neutral-900 font-bold text-sm">{ordersCount} pedidos</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200">
                  <span className="text-neutral-500 block text-[11px]">Artículos en Carrito:</span>
                  <strong className="text-neutral-900 font-bold text-sm">{cartItemsCount} artículos</strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-neutral-200 col-span-2">
                  <span className="text-neutral-500 block text-[11px]">Consentimiento de Cookies:</span>
                  <strong className="text-neutral-900 font-semibold">{cookieStatus}</strong>
                </div>
              </div>
            </div>

            {/* Actions for User Rights */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                Tus Derechos Disponibles
              </span>

              {/* Portability */}
              <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 transition">
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs text-neutral-900 block font-semibold">Descargar mis Datos (Portabilidad)</strong>
                    <span className="text-[11px] text-neutral-500">Exporta una copia de tus pedidos en archivo JSON estructurado.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-lg transition cursor-pointer flex-shrink-0"
                >
                  Descargar
                </button>
              </div>

              {/* Right to be forgotten trigger */}
              <div className="flex items-center justify-between gap-3 p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/80">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs text-rose-950 block font-semibold">Eliminar mi Cuenta y Datos Personales</strong>
                    <span className="text-[11px] text-rose-700">Ejecutar el Derecho al Olvido y purgar todos tus registros.</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex-shrink-0 shadow-xs"
                >
                  Eliminar Datos
                </button>
              </div>
            </div>

            {/* Policy Link */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span>¿Dudas sobre cómo tratamos tu información?</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrivacyDoc();
                }}
                className="text-neutral-900 font-bold underline hover:text-neutral-700 cursor-pointer"
              >
                Ver Política Completa
              </button>
            </div>
          </div>
        </motion.div>

        {/* Nested AlertDialog: Confirm Permanent Deletion */}
        {showConfirmDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-rose-200 z-10 space-y-4"
              role="alertdialog"
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-desc"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 id="alert-dialog-title" className="text-base font-bold text-neutral-900">
                  ¿Confirmas la eliminación permanente de tus datos?
                </h3>
                <p id="alert-dialog-desc" className="text-xs text-neutral-600 leading-relaxed">
                  Esta acción es <strong>definitiva e irreversible</strong>. Se eliminarán de inmediato todas tus comandas locales, direcciones guardadas, carrito y preferencias de privacidad en este navegador.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handlePurgeAllData}
                  className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isDeleting ? "Purgando registros..." : "Sí, Purgar Mis Datos"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default DataPrivacyCenterModal;
