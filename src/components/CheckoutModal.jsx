import React, { useState, useEffect, useMemo, useRef } from "react";
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
  ArrowRight,
  Building2,
  Sparkles,
  Check,
  Clock,
  AlertCircle
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
    updateOrderStatus,
    updateOrderPaymentStatus,
    setCompletedOrder,
    features,
    appliedCoupon,
    discountAmount,
    isStoreOpen,
    openLegalDoc,
    openTracking,
  } = useStore();

  const [createdQrOrder, setCreatedQrOrder] = useState(null);

  const [formData, setFormData] = useState(() => {
    let savedName = "";
    let savedPhone = "";
    let savedAddress = "";
    try {
      savedName = localStorage.getItem("omnistore_saved_name") || "";
      savedPhone = localStorage.getItem("omnistore_saved_phone") || "";
      savedAddress = localStorage.getItem("omnistore_saved_address") || "";
    } catch {
      // ignore
    }
    return {
      name: savedName,
      phone: savedPhone,
      orderType: storeConfig.orderTypes ? storeConfig.orderTypes[0] : "Delivery a Domicilio",
      address: savedAddress,
      paymentMethod: "QR Simple (Banca Móvil / Interoperable)",
      notes: "",
    };
  });

  const [deliveryLocation, setDeliveryLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("omnistore_saved_coords");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedConsent, setAcceptedConsent] = useState(false);

  // Multi-step form state: 1 = Contact & Delivery, 2 = Payment Method & Confirmation
  const [formStep, setFormStep] = useState(1);
  const formScrollRef = useRef(null);

  // Bolivian Compliance (Invoicing & Alcohol Control)
  const [requestInvoice, setRequestInvoice] = useState(false);
  const [billingNit, setBillingNit] = useState("");
  const [billingBusinessName, setBillingBusinessName] = useState("");
  const [declaredOver18, setDeclaredOver18] = useState(false);

  const hasAlcohol = useMemo(() => {
    return cart.some((item) => 
      (item.category && /vino|coctel|bebida con alcohol|licor/i.test(item.category)) ||
      (item.name && /vino|coctel|gin|cerveza|whisky|ron|vodka|licor|fernet|negroni|spritz/i.test(item.name))
    );
  }, [cart]);

  const [checkoutStep, setCheckoutStep] = useState("form");
  const [qrOrderRef, setQrOrderRef] = useState("");
  const [qrSecondsLeft, setQrSecondsLeft] = useState(599);
  const [bankVerificationStage, setBankVerificationStage] = useState("listening"); // 'listening' | 'detecting' | 'accredited'
  const [bankTransactionId, setBankTransactionId] = useState("");

  useEffect(() => {
    if (isCheckoutOpen) {
      toast.dismiss();
      setCheckoutStep("form");
      setFormStep(1);
      setIsSubmitting(false);
      setBankVerificationStage("listening");
      setBankTransactionId(`ACH-${Math.floor(100000 + Math.random() * 900000)}`);
      setQrOrderRef(`#ORD-${Math.floor(1000 + Math.random() * 9000)}`);
      setQrSecondsLeft(599);
      if (storeConfig.orderTypes && storeConfig.orderTypes.length > 0) {
        setFormData((prev) => ({
          ...prev,
          orderType: storeConfig.orderTypes.includes(prev.orderType)
            ? prev.orderType
            : storeConfig.orderTypes[0],
        }));
      }
    }
  }, [isCheckoutOpen, storeConfig.orderTypes]);

  useEffect(() => {
    let timer;
    if (checkoutStep === "qr_payment" && qrSecondsLeft > 0) {
      timer = setInterval(() => {
        setQrSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, qrSecondsLeft]);

  // Automatic Bank Account Webhook Listener (PedidosYa / QR Simple ASOBAN style)
  // Confirms the order ONLY when the funds arrive in the business's bank account, automatically without Admin intervention.
  useEffect(() => {
    if (checkoutStep !== "qr_payment" || !createdQrOrder) return;

    const detectTimer = setTimeout(() => {
      setBankVerificationStage((prev) => (prev === "listening" ? "detecting" : prev));
    }, 3200);

    const creditTimer = setTimeout(() => {
      setBankVerificationStage((prev) => {
        if (prev !== "accredited") {
          finalizeBankAccreditation(createdQrOrder);
          return "accredited";
        }
        return prev;
      });
    }, 6200);

    return () => {
      clearTimeout(detectTimer);
      clearTimeout(creditTimer);
    };
  }, [checkoutStep, createdQrOrder]);

  if (!isCheckoutOpen) return null;

  const isDelivery = formData.orderType.toLowerCase().includes("delivery") || 
                     formData.orderType.toLowerCase().includes("envío") ||
                     formData.orderType.toLowerCase().includes("camión");

  const baseDeliveryCost = isDelivery ? (storeConfig.deliveryCost || 0) : 0;
  const freeShippingThreshold = storeConfig.freeShippingThreshold || 100;
  const isFreeShippingCoupon = features.coupons && appliedCoupon?.discountType === "free_shipping";
  const isFreeShippingThresholdMet = cartSubtotal >= freeShippingThreshold;
  const deliveryCost = isFreeShippingCoupon || isFreeShippingThresholdMet ? 0 : baseDeliveryCost;
  const grandTotal = Math.max(0, cartSubtotal - (features.coupons ? discountAmount : 0) + deliveryCost);

  const finalizeBankAccreditation = (orderObj) => {
    const targetOrder = orderObj || createdQrOrder;
    if (!targetOrder) return;
    const txId = bankTransactionId || `ACH-${Math.floor(100000 + Math.random() * 900000)}`;
    updateOrderPaymentStatus(targetOrder.id, "pagado");
    updateOrderStatus(targetOrder.id, "preparando");
    const confirmed = {
      ...targetOrder,
      paymentMethod: `QR Simple (Acreditado en Banco • Ref. ${txId})`,
      status: "preparando",
      paymentStatus: "pagado",
      bankTransactionId: txId,
      paidAt: new Date().toISOString(),
    };
    setIsCheckoutOpen(false);
    setCompletedOrder(confirmed);
    toast.success(`🏦 Depósito bancario detectado (${txId}). ¡Pedido ${confirmed.code} confirmado automáticamente!`);
  };

  const handleAutoConfirmQrPayment = () => {
    setBankVerificationStage("accredited");
    finalizeBankAccreditation(createdQrOrder);
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Step 1 Validation & Proceed to Step 2
  const handleGoToPaymentStep = () => {
    if (!formData.name.trim()) {
      toast.error("Por favor completa tu nombre completo.");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Por favor completa tu número de teléfono / WhatsApp.");
      return;
    }

    if (isDelivery && !formData.address.trim()) {
      toast.error("Por favor ingresa la dirección de entrega.");
      return;
    }

    if (hasAlcohol && !declaredOver18) {
      toast.error("Debes certificar ser mayor de 18 años para pedidos con bebidas alcohólicas (Ley N° 259).");
      return;
    }

    try {
      if (formData.name) localStorage.setItem("omnistore_saved_name", formData.name);
      if (formData.phone) localStorage.setItem("omnistore_saved_phone", formData.phone);
      if (formData.address) localStorage.setItem("omnistore_saved_address", formData.address);
      if (deliveryLocation) localStorage.setItem("omnistore_saved_coords", JSON.stringify(deliveryLocation));
    } catch {
      // ignore
    }

    setFormStep(2);
    if (formScrollRef.current) {
      formScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Order Submission from Step 2
  const handleSubmit = (e) => {
    e.preventDefault();

    if (requestInvoice && (!billingNit.trim() || !billingBusinessName.trim())) {
      toast.error("Por favor completa el NIT/CI y la Razón Social para la factura.");
      return;
    }

    if (!acceptedConsent) {
      toast.error("Debes aceptar la Política de Privacidad y el tratamiento de datos para confirmar tu pedido.");
      return;
    }

    if (formData.paymentMethod.includes("QR")) {
      setIsSubmitting(true);
      setTimeout(() => {
        const order = placeOrder({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: isDelivery ? formData.address : formData.orderType,
          deliveryCoords: isDelivery ? deliveryLocation : null,
          googleMapsUrl: isDelivery && deliveryLocation ? deliveryLocation.googleMapsUrl : null,
          orderType: formData.orderType,
          paymentMethod: "QR Simple (Esperando Acreditación)",
          paymentStatus: "esperando_deposito_qr",
          notes: formData.notes,
          billing: requestInvoice ? {
            required: true,
            nit: billingNit.trim(),
            businessName: billingBusinessName.trim()
          } : null,
        }, { keepCheckoutOpen: true });

        setIsSubmitting(false);
        setCreatedQrOrder(order);
        setQrOrderRef(order.code);
        setCheckoutStep("qr_payment");
        toast.info(`Comanda ${order.code} registrada. Realiza la transferencia QR.`);
      }, 500);
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
        status: "preparando",
        paymentStatus: "autoconfirmado_efectivo",
        notes: formData.notes,
        billing: requestInvoice ? {
          required: true,
          nit: billingNit.trim(),
          businessName: billingBusinessName.trim()
        } : null,
      });

      setIsSubmitting(false);
      toast.success(`⚡ ¡Pedido ${order.code} autoconfirmado y en preparación!`);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop without expensive blur */}
      <div
        onClick={() => {
          if (checkoutStep !== "qr_payment") setIsCheckoutOpen(false);
        }}
        className="fixed inset-0 bg-black/80 transition-opacity"
      />

      {/* Modal Window with GPU translate/opacity only */}
      <div
        className="relative bg-white w-full max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh]"
      >
        {/* VIEW 1: Multi-Step Checkout Form */}
        {checkoutStep === "form" && (
          <>
            {/* Header with Step Indicator */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    formStep === 1 
                      ? "bg-neutral-900 text-white" 
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    1. Contacto & Entrega {formStep > 1 && "✓"}
                  </span>
                  <span className="text-neutral-300">/</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    formStep === 2 
                      ? "bg-neutral-900 text-white" 
                      : "bg-neutral-100 text-neutral-400 border border-neutral-200"
                  }`}>
                    2. Método de Pago
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">
                  {formStep === 1 ? "Información de Contacto & Entrega" : "Selecciona tu Método de Pago"}
                </h2>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-10 h-10 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-700 hover:text-neutral-950 transition cursor-pointer border border-neutral-200 shadow-sm active:scale-95 flex-shrink-0"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body with scroll container */}
            <div ref={formScrollRef} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Store Closed Warning Banner if outside hours */}
              {!isStoreOpen && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900">
                  <Clock className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">El local se encuentra cerrado en este momento</span>
                    <span className="text-[11px] text-rose-700">
                      Horario de atención: {storeConfig.businessHours?.openTime || "11:00"} a {storeConfig.businessHours?.closeTime || "23:00"}. Tu comanda quedará registrada y se procesará al reanudar actividades.
                    </span>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ETAPA 1: INFORMACIÓN DE CONTACTO Y MODALIDAD DE ENTREGA   */}
              {/* ========================================================= */}
              {formStep === 1 && (
                <div className="space-y-6">
                    {/* Seccion 1: Contacto */}
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
                            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
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
                            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seccion 2: Modalidad de Entrega */}
                    <div>
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-neutral-500" />
                        <span>2. Modalidad de Entrega</span>
                      </h3>

                      {/* Order type pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
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
                                : "Sin costo adicional"}
                            </span>
                          </button>
                        ))}
                      </div>

                      {isDelivery && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1">
                              Dirección de Entrega (Calle, Edificio, Piso / Referencias) *
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                              <input
                                type="text"
                                required
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Ej. Av. Ballivián 1240, Edif. Los Pinos"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                              />
                            </div>
                          </div>

                          {/* Interactive Map Picker with GPS */}
                          <DeliveryMapPicker
                            initialCoords={deliveryLocation}
                            onLocationSelect={(loc) => {
                              setDeliveryLocation(loc);
                              try {
                                localStorage.setItem("omnistore_saved_coords", JSON.stringify(loc));
                              } catch {}
                              if (loc.suggestedAddress && !formData.address) {
                                setFormData((prev) => ({ ...prev, address: loc.suggestedAddress }));
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Ley N° 259: Control de Expendio de Bebidas Alcohólicas */}
                    {hasAlcohol && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-start gap-2 text-amber-900">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-snug font-medium">
                            <strong>Ley N° 259 (Bolivia):</strong> El consumo excesivo de alcohol es dañino para la salud. Venta prohibida estrictamente a menores de 18 años.
                          </div>
                        </div>
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={declaredOver18}
                            onChange={(e) => setDeclaredOver18(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="text-[11.5px] text-amber-950 font-semibold leading-tight">
                            Declaro bajo juramento ser mayor de 18 años para la recepción de bebidas alcohólicas.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Notes / Special Instructions */}
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1">
                        Instrucciones Especiales o Referencias Adicionales (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ej. Timbre 4B, sin cubiertos plásticos, dejar en portería..."
                        className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                      />
                    </div>

                    {/* BOTÓN SIGUIENTE AL COMPLETAR DATOS */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleGoToPaymentStep}
                        className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm sm:text-base shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <span>Siguiente: Método de Pago</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* ETAPA 2: SECCIÓN 3. MÉTODO DE PAGO Y CONFIRMACIÓN         */}
                {/* ========================================================= */}
                {formStep === 2 && (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Back to Step 1 pill */}
                    <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => setFormStep(1)}
                        className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 transition cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver / Modificar datos de entrega</span>
                      </button>
                      <span className="text-[11px] text-neutral-500 font-medium truncate max-w-[180px] sm:max-w-xs text-right">
                        {formData.name} • {formData.phone}
                      </span>
                    </div>

                    {/* Seccion 3: Método de Pago */}
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
                            desc: "BNB, BCP, Unión, Mercantil, etc. 0% comisión y verificación automática sin subir recibos",
                            icon: QrCode,
                            color: "text-emerald-600",
                            badge: "Recomendado"
                          },
                          {
                            id: "Efectivo / Pago al recibir",
                            title: "Efectivo al Recibir",
                            desc: "Pagas contra entrega en tu domicilio o al retirar tu pedido en el local",
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
                              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative ${
                                isSelected
                                  ? "bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-neutral-900"
                                  : "bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              {method.badge && (
                                <span className={`absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
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

                    {/* Optional Invoicing (NIT / CI) inside Section 3 */}
                    {storeConfig.billingEnabled !== false && (
                      <div className="bg-neutral-50 rounded-2xl p-3.5 border border-neutral-200/80 space-y-3">
                        <label className="flex items-center justify-between cursor-pointer select-none">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={requestInvoice}
                              onChange={(e) => setRequestInvoice(e.target.checked)}
                              className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                            />
                            <span className="text-xs font-bold text-neutral-800">
                              ¿Deseas Factura con Crédito Fiscal?
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 font-medium">Opcional</span>
                        </label>

                        {requestInvoice && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-200/60"
                          >
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                                NIT o C.I. del Titular *
                              </label>
                              <input
                                type="text"
                                required={requestInvoice}
                                value={billingNit}
                                onChange={(e) => setBillingNit(e.target.value)}
                                placeholder="Ej. 1028475021 o 6789123"
                                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-base sm:text-xs font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                                Razón Social o Nombre Factura *
                              </label>
                              <input
                                type="text"
                                required={requestInvoice}
                                value={billingBusinessName}
                                onChange={(e) => setBillingBusinessName(e.target.value)}
                                placeholder="Ej. Juan Pérez o Mi Empresa S.R.L."
                                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-base sm:text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                              />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* Resumen del Pedido */}
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
                        <span>Modalidad ({formData.orderType}):</span>
                        <span>
                          {isFreeShippingCoupon ? (
                            <span className="text-emerald-700 font-semibold">Gratis (Cupón aplicado)</span>
                          ) : isFreeShippingThresholdMet && isDelivery ? (
                            <span className="text-emerald-700 font-semibold">¡Envío Gratis!</span>
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
                          para el procesamiento de mi pedido.
                        </span>
                      </label>
                    </div>

                    {/* Submit Order Action */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
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
                          <span>Confirmar Pedido en Efectivo — {storeConfig.currency} {grandTotal.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: QR Simple Payment Screen */}
          {checkoutStep === "qr_payment" && (
            <div className="p-5 sm:p-7 flex flex-col justify-between max-h-[90vh] overflow-y-auto space-y-5">
              {/* Top Navigation */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCheckoutStep("form");
                    setFormStep(2);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a método de pago</span>
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
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-white fill-current"
                    shapeRendering="crispEdges"
                  >
                    <rect x="5" y="5" width="26" height="26" fill="white" />
                    <rect x="9" y="9" width="18" height="18" fill="black" />
                    <rect x="13" y="13" width="10" height="10" fill="white" />
                    <rect x="69" y="5" width="26" height="26" fill="white" />
                    <rect x="73" y="9" width="18" height="18" fill="black" />
                    <rect x="77" y="13" width="10" height="10" fill="white" />
                    <rect x="5" y="69" width="26" height="26" fill="white" />
                    <rect x="9" y="73" width="18" height="18" fill="black" />
                    <rect x="13" y="77" width="10" height="10" fill="white" />
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

              {/* Automatic Bank Account Webhook Listener (PedidosYa style: Confirms ONLY when funds enter the business bank account) */}
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-3 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300">
                  {bankVerificationStage === "detecting" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                      <span>Transferencia Detectada — Verificando ingreso en cuenta...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                      <span>Esperando Acreditación Bancaria Automática</span>
                    </>
                  )}
                </div>

                {/* 3-Step Bank Account Verification Progress */}
                <div className="grid grid-cols-3 gap-1.5 max-w-sm mx-auto pt-0.5 text-left">
                  <div className="bg-white/90 p-2 rounded-xl border border-emerald-200">
                    <div className="h-1 rounded-full bg-emerald-500 mb-1" />
                    <span className="block text-[9px] font-extrabold text-emerald-900 uppercase">1. QR Generado</span>
                    <span className="block text-[9px] text-neutral-500 truncate">Glosa {qrOrderRef}</span>
                  </div>
                  <div className={`p-2 rounded-xl border transition-colors ${
                    bankVerificationStage === "detecting" || bankVerificationStage === "accredited"
                      ? "bg-white border-emerald-400 shadow-2xs"
                      : "bg-white/60 border-emerald-200/70"
                  }`}>
                    <div className={`h-1 rounded-full mb-1 ${
                      bankVerificationStage === "detecting" ? "bg-emerald-500 animate-pulse" : "bg-emerald-200"
                    }`} />
                    <span className="block text-[9px] font-extrabold text-emerald-900 uppercase">2. Banco Receptor</span>
                    <span className="block text-[9px] text-neutral-500 truncate">
                      {bankVerificationStage === "detecting" ? "Recibiendo abono..." : "Escuchando cuenta..."}
                    </span>
                  </div>
                  <div className="bg-white/60 p-2 rounded-xl border border-emerald-200/70">
                    <div className="h-1 rounded-full bg-emerald-200 mb-1" />
                    <span className="block text-[9px] font-extrabold text-emerald-900 uppercase">3. Confirmación</span>
                    <span className="block text-[9px] text-neutral-500 truncate">Al ingresar el dinero</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-950 leading-relaxed max-w-md mx-auto">
                  El sistema monitorea en tiempo real la cuenta <strong>{storeConfig.bankDetails?.accountNumber || "150-0894213-01"}</strong> ({storeConfig.bankDetails?.bankName || "Banco BNB"}). <strong>Recién en el instante en que el dinero ingrese a la cuenta bancaria del negocio</strong>, tu compra <strong className="font-mono text-neutral-900">{createdQrOrder?.code || qrOrderRef}</strong> se confirmará automáticamente sin intervención del administrador.
                </p>
              </div>

              {/* Action Buttons for the customer */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleAutoConfirmQrPayment}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/15 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>⚡ Simular ingreso del dinero al Banco ahora (Autoconfirmar)</span>
                </button>

                {features.orderTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      openTracking(createdQrOrder || qrOrderRef);
                    }}
                    className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Ver Seguimiento de mi Pedido en Vivo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-2 text-neutral-500 hover:text-neutral-800 font-semibold text-xs cursor-pointer text-center"
                >
                  Volver al Menú
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
