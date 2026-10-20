import React, { useRef } from "react";
import { useStore } from "../context/StoreContext";
import { X, Printer, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ThermalReceiptModal() {
  const { isReceiptOpen, setIsReceiptOpen, receiptOrder, storeConfig, features } = useStore();
  const receiptRef = useRef(null);

  if (!isReceiptOpen || !receiptOrder || !features.thermalReceipts) return null;

  const order = receiptOrder;

  const handlePrint = () => {
    const printElement = document.getElementById("thermal-receipt-print-area");
    if (!printElement) {
      window.print();
      return;
    }

    // Create an isolated printing iframe to bypass modal CSS transforms and prevent blank prints
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda_${order.code}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 4mm 3mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.25;
              color: #000;
              background: #fff;
              width: 74mm;
            }
            * { box-sizing: border-box; }
            .border-b-2 { border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .border-b { border-bottom: 1px dashed #555; padding-bottom: 4px; margin-bottom: 4px; }
            .border-dashed { border-style: dashed; }
            .flex { display: flex; justify-content: space-between; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .text-base { font-size: 14px; }
            .text-sm { font-size: 12px; }
            .text-xs { font-size: 10px; }
            .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .pl-4 { padding-left: 12px; }
            .pt-1 { padding-top: 4px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-2 > * + * { margin-top: 8px; }
            .space-y-3 > * + * { margin-top: 12px; }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 1500);
    }, 250);
  };

  const handleCopyText = () => {
    let text = `================================\n`;
    text += `       ${storeConfig.name.toUpperCase()}\n`;
    text += `   ${storeConfig.address}\n`;
    text += `   Tel/WhatsApp: ${storeConfig.phoneWhatsApp}\n`;
    text += `================================\n`;
    text += `COMANDA / TICKET: ${order.code}\n`;
    text += `FECHA: ${new Date(order.createdAt).toLocaleString()}\n`;
    text += `CLIENTE: ${order.customerName}\n`;
    text += `TIPO: ${order.orderType}\n`;
    text += `UBICACIÓN: ${order.customerAddress}\n`;
    if (order.googleMapsUrl) {
      text += `GPS MAPS: ${order.googleMapsUrl}\n`;
    }
    text += `--------------------------------\n`;
    text += `CANT. DESCRIPCION        IMPORTE\n`;
    text += `--------------------------------\n`;
    order.items.forEach((it) => {
      const itemTotal = (it.price * it.quantity).toFixed(2);
      const name = it.name.substring(0, 18);
      text += `${it.quantity}x ${name.padEnd(18)} ${storeConfig.currency}${itemTotal}\n`;
      if (it.option) text += `   [${it.option}]\n`;
    });
    text += `--------------------------------\n`;
    text += `SUBTOTAL:          ${storeConfig.currency}${order.subtotal.toFixed(2)}\n`;
    if (order.discount > 0) {
      text += `DESCUENTO:        -${storeConfig.currency}${order.discount.toFixed(2)}\n`;
    }
    text += `ENVIO:             ${storeConfig.currency}${order.deliveryFee.toFixed(2)}\n`;
    text += `TOTAL:             ${storeConfig.currency}${order.total.toFixed(2)}\n`;
    text += `PAGO: ${order.paymentMethod}\n`;
    if (order.notes) {
      text += `NOTA: ${order.notes}\n`;
    }
    text += `================================\n`;
    text += `    ¡GRACIAS POR SU PREFERENCIA!\n`;
    text += `================================\n`;

    navigator.clipboard.writeText(text);
    toast.success("Comanda copiada al portapapeles en formato texto.");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:m-0 print:static">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsReceiptOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity print:hidden"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 border border-neutral-300 flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none"
        >
          {/* Header Bar */}
          <div className="p-4 bg-neutral-900 text-white flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider">
                Impresión de Comanda Térmica (80mm)
              </h3>
            </div>
            <button
              onClick={() => setIsReceiptOpen(false)}
              className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Ticket Canvas (80mm Styled) */}
          <div
            id="thermal-receipt-print-area"
            ref={receiptRef}
            className="p-6 bg-[#fafafa] font-mono text-[12px] leading-tight text-neutral-900 space-y-3 overflow-y-auto max-h-[70vh] print:max-h-none print:p-2 print:text-[11px]"
          >
            {/* Header store info */}
            <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-neutral-400">
              <div className="font-black text-base tracking-wider uppercase">
                {storeConfig.name}
              </div>
              <div className="text-[11px] text-neutral-600">
                {storeConfig.address}
              </div>
              <div className="text-[11px] text-neutral-600">
                WhatsApp: {storeConfig.phoneWhatsApp}
              </div>
              <div className="text-[10px] text-neutral-500 pt-1">
                {storeConfig.badge}
              </div>
            </div>

            {/* Ticket metadata */}
            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-neutral-300">
              <div className="flex justify-between font-bold text-xs">
                <span>TICKET / COMANDA:</span>
                <span>{order.code}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>FECHA:</span>
                <span>
                  {new Date(order.createdAt).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-neutral-800">
                <span>CLIENTE:</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>MODALIDAD:</span>
                <span className="font-bold uppercase">{order.orderType}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>UBICACIÓN / MESA:</span>
                <span className="text-right truncate max-w-[180px]">{order.customerAddress}</span>
              </div>
              {order.googleMapsUrl && (
                <div className="flex justify-between text-neutral-700 text-[10px]">
                  <span>PUNTO GPS:</span>
                  <span className="font-bold text-right text-emerald-700">Fijado en mapa ✓</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 pb-2 border-b-2 border-dashed border-neutral-400">
              <div className="flex justify-between font-bold text-[10px] uppercase text-neutral-500 pb-1">
                <span>Cant • Descripción</span>
                <span>Total</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-medium">
                    <span className="truncate pr-2">
                      <strong>{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="font-bold flex-shrink-0">
                      {storeConfig.currency} {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {item.option && (
                    <div className="text-[10px] text-neutral-500 pl-4">
                      ↳ {item.option}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pb-2 border-b-2 border-dashed border-neutral-400">
              <div className="flex justify-between text-neutral-600">
                <span>SUBTOTAL:</span>
                <span>{storeConfig.currency} {order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>DESCUENTO {order.couponCode ? `(${order.couponCode})` : ""}:</span>
                  <span>-{storeConfig.currency} {order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>COSTO DE ENTREGA:</span>
                <span>{storeConfig.currency} {order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-950 pt-1 border-t border-neutral-300">
                <span>TOTAL A COBRAR:</span>
                <span>{storeConfig.currency} {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment & Notes */}
            <div className="text-[11px] space-y-1 pb-3 text-neutral-700">
              <div>
                <strong>FORMA DE PAGO:</strong> {order.paymentMethod}
              </div>
              {order.notes && (
                <div className="bg-neutral-200/50 p-2 rounded border border-neutral-300 text-[10px]">
                  <strong>OBSERVACIONES:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Barcode & Footer Simulation */}
            <div className="text-center pt-2 space-y-2">
              {/* Simulated Barcode */}
              <div className="flex justify-center items-center gap-[2px] h-9 overflow-hidden opacity-80">
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1, 2, 3, 1, 2, 4].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w * 2}px` }} />
                ))}
              </div>
              <div className="text-[10px] tracking-widest text-neutral-500 font-mono">
                *{order.code.replace("#", "")}*
              </div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
                ¡Gracias por su compra!
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between gap-2 print:hidden">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold border border-neutral-300 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copiar Texto</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer active:scale-98"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir Ticket (80mm)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
