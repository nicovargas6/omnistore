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

  const handleWhatsAppSend = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    
    // Construct formatted order message
    let message = `🛒 *NUEVO PEDIDO EN ${storeConfig.name.toUpperCase()}*\n`;
    message += `📋 Código: *${completedOrder.code}*\n`;
    message += `👤 Cliente: ${completedOrder.customerName}\n`;
    message += `📞 Teléfono: ${completedOrder.customerPhone}\n`;
    message += `🚚 Modalidad: ${completedOrder.orderType}\n`;
    message += `📍 Ubicación/Mesa: ${completedOrder.customerAddress}\n`;
    if (completedOrder.googleMapsUrl) {
      message += `🗺️ *Ubicación GPS (Google Maps):* ${completedOrder.googleMapsUrl}\n`;
    }
    message += `💳 Pago: ${completedOrder.paymentMethod}\n\n`;
    
    message += `*PRODUCTOS:*\n`;
    completedOrder.items.forEach((item) => {
      message += `• ${item.quantity}x ${item.name} ${item.option ? `(${item.option})` : ""} - ${storeConfig.currency}${(item.price * item.quantity).toFixed(2)}\n`;
    });

    if (completedOrder.notes) {
      message += `\n📝 *Nota:* ${completedOrder.notes}\n`;
    }

    message += `\n*TOTAL: ${storeConfig.currency}${completedOrder.total.toFixed(2)}*`;

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
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Compra - ${completedOrder.code}</title>
          <style>
            @page { size: auto; margin: 15mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181b; margin: 0; padding: 24px; line-height: 1.5; font-size: 13px; }
            .header { border-bottom: 2px solid #e4e4e7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 22px; font-weight: 800; color: #09090b; margin: 0; }
            .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; border: 1px solid #a7f3d0; margin-top: 6px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .box { background: #f8fafc; padding: 12px 16px; border-radius: 10px; font-size: 12px; border: 1px solid #e2e8f0; }
            .box-title { font-weight: 700; color: #64748b; text-transform: uppercase; font-size: 10px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { text-align: left; background: #f1f5f9; padding: 10px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; }
            td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
            .total-row { font-size: 16px; font-weight: 800; }
            .footer { border-top: 1px solid #e4e4e7; padding-top: 16px; text-align: center; color: #71717a; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${storeConfig.name}</h1>
              <div style="color: #64748b; font-size: 12px; margin-top: 2px;">${storeConfig.address} • Tel: ${storeConfig.phoneWhatsApp}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: 800; font-family: monospace;">${completedOrder.code}</div>
              <div style="font-size: 11px; color: #64748b;">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              ${completedOrder.paymentStatus === 'pagado' ? '<div class="badge">✅ PAGADO & ACREDITADO</div>' : '<div class="badge" style="background:#fef3c7;color:#92400e;border-color:#fde68a;">PENDIENTE DE PAGO</div>'}
            </div>
          </div>

          <div class="info-grid">
            <div class="box">
              <div class="box-title">Datos del Cliente</div>
              <div><strong>Nombre:</strong> ${completedOrder.customerName}</div>
              <div><strong>Teléfono:</strong> ${completedOrder.customerPhone}</div>
              <div><strong>Entrega / Salón:</strong> ${completedOrder.customerAddress}</div>
            </div>
            <div class="box">
              <div class="box-title">Detalle de Pago & Envío</div>
              <div><strong>Modalidad:</strong> ${completedOrder.orderType}</div>
              <div><strong>Método de Pago:</strong> ${completedOrder.paymentMethod}</div>
              ${completedOrder.notes ? `<div><strong>Notas:</strong> ${completedOrder.notes}</div>` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Descripción del Artículo</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">Precio Unit.</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${completedOrder.items.map(it => `
                <tr>
                  <td>
                    <strong>${it.name}</strong>
                    ${it.option ? `<br><small style="color:#64748b;">${it.option}</small>` : ''}
                  </td>
                  <td style="text-align:center;">${it.quantity}</td>
                  <td style="text-align:right;">${storeConfig.currency} ${it.price.toFixed(2)}</td>
                  <td style="text-align:right;">${storeConfig.currency} ${(it.price * it.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align:right; color:#64748b;">Subtotal</td>
                <td style="text-align:right; font-weight:600;">${storeConfig.currency} ${(completedOrder.subtotal || completedOrder.total).toFixed(2)}</td>
              </tr>
              ${completedOrder.discount > 0 ? `
              <tr>
                <td colspan="3" style="text-align:right; color:#059669;">Descuento cupón</td>
                <td style="text-align:right; color:#059669; font-weight:600;">-${storeConfig.currency} ${completedOrder.discount.toFixed(2)}</td>
              </tr>` : ''}
              ${completedOrder.deliveryFee > 0 ? `
              <tr>
                <td colspan="3" style="text-align:right; color:#64748b;">Envío / Delivery</td>
                <td style="text-align:right; font-weight:600;">${storeConfig.currency} ${completedOrder.deliveryFee.toFixed(2)}</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="3" style="text-align:right; padding-top:14px;">Total Abonado</td>
                <td style="text-align:right; padding-top:14px; color:#059669;">${storeConfig.currency} ${completedOrder.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p style="font-weight: 600; margin-bottom: 4px;">¡Muchas gracias por su preferencia! • ${storeConfig.name}</p>
            <p>Comprobante de compra electrónico generado automáticamente.</p>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
      }, 2000);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCompletedOrder(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 p-6 sm:p-8 text-center"
        >
          {/* Animated Success Badge */}
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ¡Pedido Registrado con Éxito!
          </span>

          <h2 className="text-2xl font-extrabold text-neutral-900 mt-2">
            Gracias por tu compra
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Código de seguimiento: <strong className="text-neutral-900 font-mono text-sm">{completedOrder.code}</strong>
          </p>

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
            <button
              onClick={handleWhatsAppSend}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Confirmación por WhatsApp al Local</span>
            </button>

            {/* Customer PDF Receipt Download */}
            <button
              onClick={handleDownloadReceiptPdf}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <Download className="w-4 h-4 text-neutral-600" />
              <span>Guardar / Imprimir Comprobante Oficial (PDF)</span>
            </button>

            {/* Optional Feature: Live Tracking for this order */}
            {features.orderTracking && (
              <button
                onClick={() => {
                  const ord = completedOrder;
                  setCompletedOrder(null);
                  openTracking(ord);
                }}
                className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Rastrear este Pedido en Tiempo Real</span>
              </button>
            )}

            <button
              onClick={handleGoToAdminOrders}
              className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Pedido en el Panel de Administrador</span>
            </button>

            <button
              onClick={() => setCompletedOrder(null)}
              className="text-xs text-neutral-400 hover:text-neutral-700 font-medium py-1 transition cursor-pointer"
            >
              Cerrar y seguir navegando
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
