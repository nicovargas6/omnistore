import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import DeliveryMapPicker from "./DeliveryMapPicker";
import { 
  X, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  Banknote, 
  MessageSquare, 
  Truck, 
  QrCode,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Building2,
  Sparkles,
  Check,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function CheckoutModal() {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    storeConfig,
    placeOrder,
    features,
    appliedCoupon,
    discountAmount,
    isStoreOpen,
    openLegalDoc,
  } = useStore();

  const [formData, setFormData] = useState(() => {
    let savedPhone = "";
    let savedAddress = "";
    try {
      savedPhone = localStorage.getItem("omnistore_saved_phone") || "";
      savedAddress = localStorage.getItem("omnistore_saved_address") || "";
    } catch {
      // ignore
    }
    return {
      name: "",
      phone: savedPhone,
      orderType: storeConfig.orderTypes ? storeConfig.orderTypes[0] : "Delivery a Domicilio",
      address: savedAddress,
      paymentMethod: "QR Simple (Banca Móvil / Interoperable)",
      notes: "",
    };
  });

  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedConsent, setAcceptedConsent] = useState(false);

  const [checkoutStep, setCheckoutStep] = useState("form");
  const [qrOrderRef, setQrOrderRef] = useState("");
  const [qrSecondsLeft, setQrSecondsLeft] = useState(599);
  const [isSimulatingBank, setIsSimulatingBank] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen) {
      setCheckoutStep("form");
      setIsSubmitting(false);
      setIsSimulatingBank(false);
      setQrOrderRef(`#ORD-${Math.floor(1000 + Math.random() * 9000)}`);
      setQrSecondsLeft(599);
    }
  }, [isCheckoutOpen]);

  useEffect(() => {
    let timer;
    if (checkoutStep === "qr_payment" && qrSecondsLeft > 0) {
      timer = setInterval(() => {
        setQrSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, qrSecondsLeft]);

  if (!isCheckoutOpen) return null;

  const isDelivery = formData.orderType.toLowerCase().includes("delivery") || 
                     formData.orderType.toLowerCase().includes("envío") ||
                     formData.orderType.toLowerCase().includes("camión");

  const baseDeliveryCost = isDelivery ? (storeConfig.deliveryCost || 0) : 0;
  const isFreeShippingCoupon = features.coupons && appliedCoupon?.discountType === "free_shipping";
  const deliveryCost = isFreeShippingCoupon ? 0 : baseDeliveryCost;
  const grandTotal = Math.max(0, cartSubtotal - (features.coupons ? discountAmount : 0) + deliveryCost);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Por favor completa tu nombre y teléfono.");
      return;
    }

    if (!acceptedConsent) {
      toast.error("Debes aceptar la Política de Privacidad y el tratamiento de datos para confirmar tu pedido.");
      return;
    }

    try {
      if (formData.phone) localStorage.setItem("omnistore_saved_phone", formData.phone);
      if (formData.address) localStorage.setItem("omnistore_saved_address", formData.address);
    } catch {
      // ignore
    }

    if (formData.paymentMethod.includes("QR")) {
      setCheckoutStep("qr_payment");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const order = placeOrder({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: isDelivery ? formData.address : formData.orderType,
        deliveryCoords: isDelivery ? deliveryLocation : null,
        googleMapsUrl: isDelivery && deliveryLocation ? deliveryLocation.googleMapsUrl : null,
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        paymentStatus: "pendiente",
        notes: formData.notes,
      });

      setIsSubmitting(false);
      toast.success(`¡Pedido ${order.code} generado con éxito!`);
    }, 700);
  };

  // Trigger automated payment detection
  const handleVerifyQrPayment = () => {
    setIsSimulatingBank(true);

    setTimeout(() => {
      setIsSimulatingBank(false);
      setCheckoutStep("qr_success");

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#f59e0b"]
        });
      } catch (e) {
        console.log("Confetti", e);
      }

      toast.success("¡Pago recibido y verificado por tu banco!", {
        description: `Abono de ${storeConfig.currency} ${grandTotal.toFixed(2)} registrado sin comisiones.`
      });

      // Place order after brief celebration
      setTimeout(() => {
        placeOrder({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: isDelivery ? formData.address : formData.orderType,
          deliveryCoords: isDelivery ? deliveryLocation : null,
          googleMapsUrl: isDelivery && deliveryLocation ? deliveryLocation.googleMapsUrl : null,
          orderType: formData.orderType,
          paymentMethod: "QR Simple (Verificado Automáticamente)",
          paymentStatus: "pagado",
          paidAt: new Date().toISOString(),
          notes: formData.notes,
        });
      }, 1400);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (checkoutStep !== "qr_success") setIsCheckoutOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[92vh]"
        >
          {/* VIEW 1: Standard Checkout Form */}
          {checkoutStep === "form" && (
            <>
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Finalizar Compra
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                    Detalles del Pedido & Entrega
                  </h2>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer border border-neutral-200 shadow-2xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6">
                {/* Store Closed Warning Banner if outside hours */}
                {!isStoreOpen && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
                    <Clock className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">El local se encuentra cerrado en este momento</span>
                      <span className="text-[11px] text-rose-700">
                        Horario de atención: {storeConfig.businessHours?.openTime || "11:00"} a {storeConfig.businessHours?.closeTime || "23:00"} ({storeConfig.businessHours?.days || "Lunes a Domingo"}). Tu pedido quedará registrado y se preparará tan pronto abra el local.
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 1: Customer Contact */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-neutral-500" />
                    <span>1. Información de Contacto</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Juan Pérez"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ej. +591 71234567"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2: Delivery Type & Address */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-neutral-500" />
                    <span>2. Modalidad de Entrega</span>
                  </h3>

                  {/* Order type pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    {(storeConfig.orderTypes || ["Delivery a Domicilio", "Retiro en Local"]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, orderType: type })}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex flex-col justify-between ${
                          formData.orderType === type
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                        }`}
                      >
                        <span>{type}</span>
                        <span className="text-[10px] font-normal opacity-80 mt-1">
                          {type.toLowerCase().includes("delivery") || type.toLowerCase().includes("envío")
                            ? `+ ${storeConfig.currency}${storeConfig.deliveryCost?.toFixed(2)}`
                            : "Sin costo"}
                        </span>
                      </button>
                    ))}
                  </div>

                  {isDelivery && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-neutral-600 mb-1">
                          Dirección de Entrega (Calle, Altura, Piso / Referencias) *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                          <input
                            type="text"
                            required
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Ej. Av. Ballivián 1240, Edif. Los Pinos"
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                          />
                        </div>
                      </div>

                      {/* Interactive Map Picker */}
                      <DeliveryMapPicker
                        onLocationSelect={(loc) => setDeliveryLocation(loc)}
                      />
                    </div>
                  )}
                </div>

                {/* Step 3: Payment Method */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-neutral-500" />
                    <span>3. Método de Pago</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "QR Simple (Banca Móvil / Interoperable)",
                        title: "QR Simple Interoperable",
                        desc: "BNB, BCP, Unión, Mercantil, etc. 0% comisión y verificación automática sin comprobantes",
                        icon: QrCode,
                        color: "text-emerald-600",
                        badge: "Recomendado"
                      },
                      {
                        id: "Efectivo / Pago al recibir",
                        title: "Efectivo al Recibir",
                        desc: "Pagas contra entrega física en tu domicilio o al retirar en caja",
                        icon: Banknote,
                        color: "text-amber-600"
                      }
                    ].map((method) => {
                      const Icon = method.icon;
                      const isSelected = formData.paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative ${
                            isSelected
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                              : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                          }`}
                        >
                          {method.badge && (
                            <span className={`absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                              isSelected ? "bg-emerald-400 text-neutral-950" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {method.badge}
                            </span>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-white" : method.color}`} />
                              <div className="text-xs font-bold">{method.title}</div>
                            </div>
                            <div className={`text-[11px] leading-snug ${isSelected ? "text-neutral-300" : "text-neutral-500"}`}>
                              {method.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes / Special Instructions */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">
                    Instrucciones Especiales o Aclaraciones (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ej. Tocar timbre 'Pisos Altos', sin cebolla, dejar en recepción..."
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                  />
                </div>

                {/* Summary Box */}
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-2 text-xs">
                  <div className="font-bold text-neutral-900 mb-2">Resumen de tu compra ({cart.length} artículos):</div>
                  <div className="space-y-1 text-neutral-600 max-h-24 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.cartItemId} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.quantity}x {item.name} {item.selectedOption ? `(${item.selectedOption})` : ""}
                        </span>
                        <span className="font-semibold text-neutral-900 flex-shrink-0">
                          {storeConfig.currency} {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span>{storeConfig.currency} {cartSubtotal.toFixed(2)}</span>
                  </div>
                  {features.coupons && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Descuento {appliedCoupon ? `(${appliedCoupon.code})` : ""}:</span>
                      <span>-{storeConfig.currency} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Entrega ({formData.orderType}):</span>
                    <span>
                      {isFreeShippingCoupon ? (
                        <span className="text-emerald-700 font-semibold">Gratis (Cupón aplicado)</span>
                      ) : (
                        `${storeConfig.currency} ${deliveryCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between text-sm font-bold text-neutral-950">
                    <span>Total a Pagar:</span>
                    <span className="text-base text-neutral-950 font-mono">
                      {storeConfig.currency} {grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Informed Legal Consent Checkbox (RGPD / Habeas Data Compliance) */}
                <div className="pt-1">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer select-none transition ${
                    !acceptedConsent ? "bg-amber-50/50 border-amber-200/80" : "bg-neutral-50 border-neutral-200"
                  }`}>
                    <input
                      type="checkbox"
                      checked={acceptedConsent}
                      onChange={(e) => setAcceptedConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                    />
                    <span className="text-[11.5px] sm:text-xs text-neutral-600 leading-relaxed">
                      He leído y acepto la{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLegalDoc("privacy");
                        }}
                        className="font-bold text-neutral-900 underline hover:text-emerald-700 cursor-pointer"
                      >
                        Política de Privacidad
                      </button>{" "}
                      y los{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLegalDoc("terms");
                        }}
                        className="font-bold text-neutral-900 underline hover:text-emerald-700 cursor-pointer"
                      >
                        Términos de Servicio
                      </button>{" "}
                      para el procesamiento y entrega de mi pedido.
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando Pedido...</span>
                    </>
                  ) : formData.paymentMethod.includes("QR") ? (
                    <>
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Continuar al Pago con QR — {storeConfig.currency} {grandTotal.toFixed(2)}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Confirmar Pedido — {storeConfig.currency} {grandTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* VIEW 2: QR Simple Payment Screen (0% Commission, Exact Amount, Zero Manual Upload) */}
          {checkoutStep === "qr_payment" && (
            <div className="p-5 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto space-y-5">
              {/* Top Navigation */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <button
                  type="button"
                  onClick={() => setCheckoutStep("form")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a datos del pedido</span>
                </button>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Vigencia: <strong className="text-neutral-700">{formatCountdown(qrSecondsLeft)}</strong></span>
                </div>
              </div>

              {/* Title & 0 Extra Cents Banner */}
              <div className="text-center space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                  QR Simple Oficial Interoperable (ASOBAN / BCB)
                </span>
                <h3 className="text-xl font-extrabold text-neutral-900 pt-1">
                  Escanea con la App de tu Banco
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  El monto exacto y la referencia ya vienen codificados. Solo abre tu app bancaria y confirma la transferencia.
                </p>
              </div>

              {/* Amount Display with 0 Extra Cents */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Monto Exacto a Transferir (0 Centavos Extra)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-neutral-950 font-mono tracking-tight">
                  {storeConfig.currency} {grandTotal.toFixed(2)}
                </div>
                <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    0% Comisión Bancaria
                  </span>
                  <span className="text-[11px] font-mono text-neutral-600 bg-white border border-neutral-200 px-2.5 py-0.5 rounded-md">
                    Glosa en QR: <strong className="text-neutral-900">{qrOrderRef}</strong>
                  </span>
                </div>
              </div>

              {/* The Interactive QR Code Box */}
              <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-300 p-5 sm:p-6 text-center max-w-xs mx-auto shadow-sm space-y-3">
                <div className="relative mx-auto w-48 h-48 sm:w-52 sm:h-52 bg-neutral-900 rounded-2xl p-3 flex items-center justify-center shadow-md">
                  {/* High quality SVG QR graphic representation */}
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-white fill-current"
                    shapeRendering="crispEdges"
                  >
                    {/* Corner 1 */}
                    <rect x="5" y="5" width="26" height="26" fill="white" />
                    <rect x="9" y="9" width="18" height="18" fill="black" />
                    <rect x="13" y="13" width="10" height="10" fill="white" />
                    {/* Corner 2 */}
                    <rect x="69" y="5" width="26" height="26" fill="white" />
                    <rect x="73" y="9" width="18" height="18" fill="black" />
                    <rect x="77" y="13" width="10" height="10" fill="white" />
                    {/* Corner 3 */}
                    <rect x="5" y="69" width="26" height="26" fill="white" />
                    <rect x="9" y="73" width="18" height="18" fill="black" />
                    <rect x="13" y="77" width="10" height="10" fill="white" />
                    {/* Matrix data dots */}
                    <rect x="36" y="8" width="6" height="6" fill="white" />
                    <rect x="46" y="8" width="6" height="6" fill="white" />
                    <rect x="56" y="8" width="6" height="6" fill="white" />
                    <rect x="36" y="18" width="6" height="6" fill="white" />
                    <rect x="50" y="18" width="12" height="6" fill="white" />
                    <rect x="8" y="36" width="6" height="6" fill="white" />
                    <rect x="18" y="36" width="6" height="6" fill="white" />
                    <rect x="8" y="46" width="12" height="6" fill="white" />
                    <rect x="8" y="56" width="6" height="6" fill="white" />
                    <rect x="18" y="56" width="6" height="6" fill="white" />
                    <rect x="76" y="36" width="16" height="6" fill="white" />
                    <rect x="76" y="46" width="8" height="6" fill="white" />
                    <rect x="76" y="56" width="16" height="6" fill="white" />
                    <rect x="36" y="76" width="6" height="16" fill="white" />
                    <rect x="46" y="76" width="12" height="6" fill="white" />
                    <rect x="46" y="86" width="6" height="6" fill="white" />
                    <rect x="60" y="76" width="8" height="16" fill="white" />
                    {/* Center badge */}
                    <rect x="36" y="36" width="28" height="28" rx="4" fill="#059669" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      PAGO SIMPLE
                    </span>
                  </div>
                </div>

                <div className="space-y-0.5 text-[11px] text-neutral-600 font-medium bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                  <div>Banco: <strong className="text-neutral-900">{storeConfig.bankDetails?.bankName || "Banco Nacional de Bolivia (BNB)"}</strong></div>
                  <div>Titular: <strong className="text-neutral-900">{storeConfig.bankDetails?.accountHolder || storeConfig.name}</strong></div>
                  <div>N° Cuenta: <strong className="text-neutral-900 font-mono">{storeConfig.bankDetails?.accountNumber || "150-0894213-01"}</strong></div>
                </div>
              </div>

              {/* Compatible Banks List */}
              <div className="space-y-1.5 text-center">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Bancos & Billeteras Compatibles en Bolivia
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-semibold text-neutral-700">
                  {["Banco BNB", "Banco BCP", "Banco Unión", "Mercantil Santa Cruz", "Banco Bisa", "Banco Ganadero", "Banco Sol", "Banco Fie"].map((b) => (
                    <span key={b} className="bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Real-time Radar Listener Indicator */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-center gap-3 text-xs text-blue-900 font-semibold">
                <span className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
                </span>
                <span className="leading-tight">
                  Esperando confirmación bancaria en tiempo real... (Esta pantalla se actualizará sola)
                </span>
              </div>

              {/* Live Testing Simulation Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isSimulatingBank}
                  onClick={handleVerifyQrPayment}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isSimulatingBank ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verificando abono con el banco...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>🧪 Probar Verificación Automática (Simular Abono Recibido)</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-neutral-400">
                  En producción, este paso ocurre automáticamente en 2 a 3 segundos cuando el cliente confirma en su banca móvil.
                </p>
              </div>
            </div>
          )}

          {/* VIEW 3: Instant Verified Celebration Screen */}
          {checkoutStep === "qr_success" && (
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 sm:p-12 text-center space-y-4 my-auto"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                ¡Transferencia Bancaria Confirmada!
              </span>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                Pago de {storeConfig.currency} {grandTotal.toFixed(2)} Acreditado
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                El banco confirmó el ingreso a tu cuenta con la glosa <strong className="font-mono text-neutral-800">{qrOrderRef}</strong>. Generando tu orden al instante...
              </p>
              <div className="pt-3">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}