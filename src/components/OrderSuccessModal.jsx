import React, { useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { 
  CheckCircle2, 
  MessageCircle, 
  ArrowRight, 
  LayoutDashboard, 
  Printer, 
  Clock, 
  Tag,
  MapPin,
  ExternalLink,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function OrderSuccessModal() {
  const { 
    completedOrder, 
    setCompletedOrder, 
    storeConfig, 
    setViewMode, 
    setActiveAdminTab,
    isAdminAuthenticated,
    features,
    openTracking,
    openReceipt 
  } = useStore();

  useEffect(() => {
    if (completedOrder) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6"]
        });
      } catch (e) {
        console.log("Confetti trigger", e);
      }
    }
  }, [completedOrder]);

  if (!completedOrder) return null;

  const isAwaitingBankConfirmation = completedOrder.paymentStatus === "esperando_confirmacion_bancaria" || completedOrder.paymentStatus === "esperando_deposito_qr";

  const handleWhatsAppSend = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    
    let message = isAwaitingBankConfirmation
      ? `👋 *HOLA ${storeConfig.name.toUpperCase()}*\nAcabo de realizar el pedido *${completedOrder.code}* mediante *QR Simple*.\n💰 *Monto Transferido:* ${storeConfig.currency}${completedOrder.total.toFixed(2)}\n👤 Cliente: ${completedOrder.customerName}\n📞 Teléfono: ${completedOrder.customerPhone}\n🚚 Modalidad: ${completedOrder.orderType}\n📍 Entrega: ${completedOrder.customerAddress}\n\n_Ya realicé el pago por QR a su cuenta. Quedo atento a su confirmación para el despacho. ¡Gracias!_`
      : `⚡ *PEDIDO CONFIRMADO EN ${storeConfig.name.toUpperCase()}*\n📋 Orden: *${completedOrder.code}*\n👤 Cliente: ${completedOrder.customerName}\n📞 Teléfono: ${completedOrder.customerPhone}\n🚚 Modalidad: ${completedOrder.orderType}\n📍 Entrega: ${completedOrder.customerAddress}\n${completedOrder.googleMapsUrl ? `🗺️ *Ubicación en Mapa:* ${completedOrder.googleMapsUrl}\n` : ""}💳 Método: ${completedOrder.paymentMethod}\n\n*TOTAL: ${storeConfig.currency}${completedOrder.total.toFixed(2)}*\n⏱️ _Quedo atento al despacho de mi pedido. ¡Gracias!_`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
  };

  const handleGoToAdminOrders = () => {
    setCompletedOrder(null);
    setViewMode("admin");
    setActiveAdminTab("orders");
    toast.info("Visualizando la lista de pedidos en el Panel de Administrador.");
  };

  const handleDownloadReceiptPdf = () => {
    // Generate clean text-based receipt and trigger instant direct download as .txt / .doc / printable receipt
    const separator = "==================================================";
    const thinSeparator = "--------------------------------------------------";
    const receiptDate = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
    const receiptTime = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

    let content = `${separator}\n`;
    content += `        ${storeConfig.name.toUpperCase()}\n`;
    content += `        ${storeConfig.address}\n`;
    content += `        WhatsApp: ${storeConfig.phoneWhatsApp}\n`;
    if (storeConfig.taxId) content += `        ${storeConfig.taxId} - ${storeConfig.legalName || storeConfig.name}\n`;
    content += `${separator}\n\n`;
    content += `COMPROBANTE OFICIAL DE COMPRA\n`;
    content += `ORDEN: ${completedOrder.code}\n`;
    content += `FECHA: ${receiptDate} ${receiptTime}\n`;
    content += `ESTADO DE PAGO: ${completedOrder.paymentStatus === "pagado" ? "PAGADO & ACREDITADO (EN PREPARACION)" : "PENDIENTE"}\n`;
    if (completedOrder.bankTransactionId) content += `REF. BANCARIA: ${completedOrder.bankTransactionId}\n`;
    content += `METODO DE PAGO: ${completedOrder.paymentMethod}\n`;
    content += `${thinSeparator}\n`;
    content += `DATOS DEL CLIENTE:\n`;
    content += `Nombre: ${completedOrder.customerName}\n`;
    content += `Telefono: ${completedOrder.customerPhone}\n`;
    content += `Modalidad: ${completedOrder.orderType}\n`;
    content += `Direccion / Salon: ${completedOrder.customerAddress}\n`;
    if (completedOrder.googleMapsUrl) content += `GPS: ${completedOrder.googleMapsUrl}\n`;
    if (completedOrder.notes) content += `Notas: ${completedOrder.notes}\n`;
    content += `${thinSeparator}\n`;
    content += `DETALLE DE ARTICULOS:\n`;
    completedOrder.items.forEach((it) => {
      const opt = it.option ? ` (${it.option})` : "";
      content += ` ${it.quantity}x ${it.name}${opt}\n`;
      content += `    P. Unit: ${storeConfig.currency}${it.price.toFixed(2)}  |  Total: ${storeConfig.currency}${(it.price * it.quantity).toFixed(2)}\n`;
    });
    content += `${thinSeparator}\n`;
    content += `Subtotal: ${storeConfig.currency}${(completedOrder.subtotal || completedOrder.total).toFixed(2)}\n`;
    if (completedOrder.discount > 0) content += `Descuento: -${storeConfig.currency}${completedOrder.discount.toFixed(2)}\n`;
    if (completedOrder.deliveryFee > 0) content += `Costo Entrega: ${storeConfig.currency}${completedOrder.deliveryFee.toFixed(2)}\n`;
    content += `TOTAL ABONADO: ${storeConfig.currency}${completedOrder.total.toFixed(2)}\n`;
    content += `${separator}\n`;
    content += `Gracias por su preferencia!\n`;
    content += `${separator}\n`;

    // Direct browser file download without opening the print dialog
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recibo_${completedOrder.code.replace(/[^a-zA-Z0-9-]/g, "")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Recibo oficial ${completedOrder.code} descargado correctamente.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop without blur */}
      <div
        onClick={() => setCompletedOrder(null)}
        className="fixed inset-0 bg-black/80 transition-opacity"
      />

      {/* Modal Window */}
      <div
        className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 p-6 sm:p-8 text-center"
      >
          {/* Status Badge */}
          {isAwaitingBankConfirmation ? (
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-amber-50">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
          ) : (
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}

          {isAwaitingBankConfirmation ? (
            <span className="text-[11px] font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
              ⏳ Pedido Completado • Esperando Confirmación de Pago
            </span>
          ) : (
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              ⚡ Pedido Confirmado en Vivo
            </span>
          )}

          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-2">
            {isAwaitingBankConfirmation
              ? "¡Pedido completado con éxito!"
              : "¡Tu pedido ya está en preparación!"}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Orden <strong className="text-neutral-900 font-mono text-sm">{completedOrder.code}</strong> • {isAwaitingBankConfirmation ? "El negocio confirmará tu pago al revisar su cuenta" : "Confirmado para despacho"}
          </p>

          {/* Status Tracker */}
          {isAwaitingBankConfirmation ? (
            <div className="mt-4 bg-amber-950 text-white rounded-2xl p-4 text-left space-y-2.5 shadow-md border border-amber-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Estado: Esperando Confirmación Bancaria</span>
                </span>
                <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-amber-200">
                  Monto: {storeConfig.currency}{completedOrder.total.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Tu pedido fue registrado. El encargado del negocio verificará el ingreso del dinero en su cuenta bancaria y confirmará tu compra para pasarla a preparación.
              </p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-400" />
                  <span className="block text-[9px] font-bold text-emerald-300">1. Registrado ✓</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="block text-[9px] font-bold text-amber-300">2. En Revisión</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <span className="block text-[9px] text-white/50">3. Preparando</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <span className="block text-[9px] text-white/50">4. Entregado</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-emerald-950 text-white rounded-2xl p-3.5 text-left space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Estado: En Preparación</span>
                </span>
                <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-emerald-100">
                  ⏱️ Llegada est.: 25 - 35 min
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-400" />
                  <span className="block text-[9px] font-bold text-emerald-300">1. Confirmado ✓</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="block text-[9px] font-bold text-white">2. Preparando</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <span className="block text-[9px] text-white/60">3. En camino</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-white/20" />
                  <span className="block text-[9px] text-white/60">4. Entregado</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Details Receipt Box */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 my-5 text-left text-xs space-y-2">
            <div className="flex justify-between text-neutral-500">
              <span>Cliente:</span>
              <span className="font-semibold text-neutral-800">{completedOrder.customerName}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Modalidad:</span>
              <span className="font-semibold text-neutral-800">{completedOrder.orderType}</span>
            </div>
            {completedOrder.googleMapsUrl && (
              <div className="flex justify-between items-center text-neutral-500">
                <span>Punto GPS:</span>
                <a
                  href={completedOrder.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 hover:underline"
                >
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>Ver en Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
            <div className="flex justify-between items-center text-neutral-500">
              <span>Método de pago:</span>
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <span>{completedOrder.paymentMethod}</span>
                {completedOrder.paymentStatus === "pagado" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                    ✅ Acreditado
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-200">
              <span className="text-neutral-400 block mb-1 font-semibold uppercase text-[10px]">
                Artículos ({completedOrder.items.length}):
              </span>
              {completedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-0.5">
                  <span className="text-neutral-700">
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-medium text-neutral-900">
                    {storeConfig.currency}{(it.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-950">
              <span>Total abonado:</span>
              <span className="text-base text-emerald-700">
                {storeConfig.currency} {completedOrder.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            {/* Optional Feature: Live Tracking for this order */}
            {features.orderTracking && (
              <button
                onClick={() => {
                  const ord = completedOrder;
                  setCompletedOrder(null);
                  openTracking(ord);
                }}
                className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Seguir mi Pedido en Tiempo Real</span>
              </button>
            )}

            {/* Customer PDF Receipt Download */}
            <button
              onClick={handleDownloadReceiptPdf}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Download className="w-4 h-4 text-neutral-600" />
              <span>Descargar Recibo Oficial (PDF)</span>
            </button>

            <button
              onClick={handleWhatsAppSend}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Consultar Estado por WhatsApp (Opcional)</span>
            </button>

            {isAdminAuthenticated && (
              <button
                onClick={handleGoToAdminOrders}
                className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
                <span>Ver Pedido en el Panel de Administrador</span>
              </button>
            )}

            <button
              onClick={() => setCompletedOrder(null)}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-medium py-1 transition cursor-pointer"
            >
              Cerrar y seguir navegando
            </button>
          </div>
        </div>
      </div>
  );
}
