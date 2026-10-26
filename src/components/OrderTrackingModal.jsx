import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { 
  X, 
  Search, 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  MessageCircle, 
  MapPin, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderTrackingModal() {
  const { 
    isTrackingOpen, 
    setIsTrackingOpen, 
    trackingOrderCode, 
    orders, 
    storeConfig,
    features 
  } = useStore();

  const [searchInput, setSearchInput] = useState("");
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    if (isTrackingOpen) {
      if (trackingOrderCode) {
        setSearchInput(trackingOrderCode);
        const match = orders.find(
          (o) => o.code.toUpperCase() === trackingOrderCode.toUpperCase()
        );
        setCurrentOrder(match || null);
      } else if (orders.length > 0) {
        // Default to latest order if opened without a specific code
        setSearchInput(orders[0].code);
        setCurrentOrder(orders[0]);
      }
    }
  }, [isTrackingOpen, trackingOrderCode, orders]);

  if (!isTrackingOpen || !features.orderTracking) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const clean = searchInput.trim().toUpperCase();
    const match = orders.find(
      (o) =>
        o.code.toUpperCase() === clean ||
        o.customerPhone.replace(/[^0-9]/g, "").includes(clean)
    );
    setCurrentOrder(match || null);
  };

  // Map order status to progress step (1 to 4)
  const getStepIndex = (status) => {
    switch (status) {
      case "pendiente":
        return 1;
      case "preparando":
        return 2;
      case "enviado":
        return 3;
      case "completado":
        return 4;
      case "cancelado":
        return -1;
      default:
        return 1;
    }
  };

  const currentStep = currentOrder ? getStepIndex(currentOrder.status) : 1;

  const steps = [
    {
      step: 1,
      title: "Pedido Recibido",
      desc: "Confirmado y registrado en el sistema",
      icon: Clock,
    },
    {
      step: 2,
      title: "En Preparación",
      desc: "Cocina / Almacén empacando tus artículos",
      icon: Package,
    },
    {
      step: 3,
      title: "En Camino / Listo",
      desc: "Repartidor asignado o listo para entrega",
      icon: Truck,
    },
    {
      step: 4,
      title: "Completado",
      desc: "Pedido entregado con satisfacción",
      icon: CheckCircle2,
    },
  ];

  const handleWhatsAppInquiry = () => {
    if (!currentOrder) return;
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hola ${storeConfig.name}, quisiera consultar el estado de mi pedido ${currentOrder.code} a nombre de ${currentOrder.customerName}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsTrackingOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/60">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Seguimiento en Vivo
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                Rastrear Estado de mi Pedido
              </h3>
            </div>
            <button
              onClick={() => setIsTrackingOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer border border-neutral-200 shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-5 border-b border-neutral-100 bg-white">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Ingresa tu código (ej. #ORD-9104) o teléfono..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Tracking Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            {!currentOrder ? (
              <div className="py-12 text-center text-neutral-400">
                <AlertCircle className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                <h4 className="text-sm font-bold text-neutral-800">
                  No se encontró ningún pedido
                </h4>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                  Verifica que el código de compra coincida con el recibo de compra (ej. #ORD-9104).
                </p>
              </div>
            ) : currentOrder.status === "cancelado" ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl text-center text-rose-800 space-y-2">
                <div className="text-sm font-bold">Este pedido fue cancelado</div>
                <p className="text-xs text-rose-600">
                  Si crees que se trata de un error, por favor comunícate directamente con la tienda.
                </p>
              </div>
            ) : (
              <>
                {/* Active Order Summary Card */}
                <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900">
                        {currentOrder.code}
                      </span>
                      <span className="text-neutral-500">• {currentOrder.customerName}</span>
                    </div>
                    <div className="text-neutral-400 text-[11px] mt-0.5">
                      Modalidad: {currentOrder.orderType} • {currentOrder.customerAddress}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      {(currentOrder.paymentStatus === "esperando_confirmacion_bancaria" || currentOrder.paymentStatus === "esperando_deposito_qr") && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300 inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                          <span>Esperando confirmación de pago en cuenta de banco</span>
                        </span>
                      )}
                      {currentOrder.paymentStatus === "pagado" && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Pago por QR confirmado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-neutral-950 block">
                      {storeConfig.currency} {currentOrder.total.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      {currentOrder.items.length} artículos
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[19px] sm:before:left-[27px] before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                  {steps.map((st) => {
                    const isDone = currentStep > st.step;
                    const isCurrent = currentStep === st.step;
                    const Icon = st.icon;

                    return (
                      <div key={st.step} className="relative flex items-start gap-3.5">
                        {/* Circle Indicator */}
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors shadow-2xs ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : isCurrent
                              ? "bg-neutral-900 text-white ring-4 ring-neutral-200"
                              : "bg-white border-2 border-neutral-300 text-neutral-400"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>

                        {/* Step Description */}
                        <div className="pt-0.5">
                          <div className="flex items-center gap-2">
                            <h5
                              className={`text-xs sm:text-sm font-bold ${
                                isCurrent
                                  ? "text-neutral-950"
                                  : isDone
                                  ? "text-emerald-800"
                                  : "text-neutral-400"
                              }`}
                            >
                              {st.title}
                            </h5>
                            {isCurrent && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.2 rounded-full animate-pulse">
                                En curso
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                ✓ Listo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items Accordion */}
                <div className="pt-2 border-t border-neutral-100 text-xs">
                  <div className="font-bold text-neutral-800 mb-2">
                    Resumen de lo que pediste:
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 space-y-1.5 max-h-36 overflow-y-auto">
                    {currentOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-700">
                        <span>
                          {it.quantity}x {it.name} {it.option ? `(${it.option})` : ""}
                        </span>
                        <span className="font-semibold text-neutral-900">
                          {storeConfig.currency} {(it.price * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct WhatsApp button */}
                <button
                  onClick={handleWhatsAppInquiry}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>¿Tienes dudas sobre tu entrega? Hablar por WhatsApp</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
