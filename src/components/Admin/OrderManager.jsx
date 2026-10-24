import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  ShoppingBag, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Trash2, 
  Phone, 
  MapPin,
  Banknote,
  Search,
  Filter,
  Printer,
  ExternalLink,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";
import { OrderCardSkeleton } from "../Skeleton";

export default function OrderManager() {
  const { 
    orders, 
    updateOrderStatus, 
    updateOrderPaymentStatus,
    deleteOrder, 
    storeConfig,
    features,
    openReceipt,
    openTracking,
    soundAlertsEnabled,
    toggleSoundAlerts,
    playOrderBell
  } = useStore();
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [isFilteringOrders, setIsFilteringOrders] = useState(false);

  const handleFilterStatus = (status) => {
    setIsFilteringOrders(true);
    setFilterStatus(status);
    setTimeout(() => setIsFilteringOrders(false), 200);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = order.code.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerName.toLowerCase().includes(search.toLowerCase()) ||
                          order.customerPhone.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pendiente":
        return { label: "Pendiente", bg: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock };
      case "preparando":
        return { label: "En Preparación", bg: "bg-blue-100 text-blue-800 border-blue-200", icon: ShoppingBag };
      case "enviado":
        return { label: "Enviado / En Camino", bg: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck };
      case "completado":
        return { label: "Completado", bg: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle };
      case "cancelado":
        return { label: "Cancelado", bg: "bg-rose-100 text-rose-800 border-rose-200", icon: XCircle };
      default:
        return { label: status, bg: "bg-neutral-100 text-neutral-800 border-neutral-200", icon: Clock };
    }
  };

  const handleWhatsAppContact = (order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hola ${order.customerName}, te escribimos desde *${storeConfig.name}* sobre tu pedido *${order.code}*. Tu pedido se encuentra actualmente en estado: *${order.status.toUpperCase()}*. ¿Podemos ayudarte en algo más?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const handleSendToDeliveryDriver = (order) => {
    let msg = `🛵 *PEDIDO PARA ENTREGA - ${storeConfig.name.toUpperCase()}*\n`;
    msg += `📋 Código: *${order.code}*\n`;
    msg += `👤 Cliente: ${order.customerName}\n`;
    msg += `📞 Teléfono: ${order.customerPhone}\n`;
    msg += `📍 Dirección: ${order.customerAddress}\n`;
    if (order.googleMapsUrl) {
      msg += `🗺️ *Ubicación GPS (Navegación):* ${order.googleMapsUrl}\n`;
    }
    msg += `💵 Total a cobrar: *${storeConfig.currency}${order.total.toFixed(2)}* (${order.paymentMethod})\n`;
    if (order.notes) {
      msg += `📝 Nota: ${order.notes}\n`;
    }
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Gestión de Ventas & Pedidos
            </h2>
            <button
              onClick={toggleSoundAlerts}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer border ${
                soundAlertsEnabled
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-neutral-100 text-neutral-500 border-neutral-200"
              }`}
              title="Activar / Desactivar timbre de pedidos"
            >
              {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundAlertsEnabled ? "Alerta Sonora: ON" : "Silenciado"}</span>
            </button>
            <button
              onClick={() => {
                playOrderBell();
                toast.info("🔔 Timbre de comanda sonando", {
                  description: "Si no escuchas audio en tu celular, verifica que el interruptor lateral no esté en silencio."
                });
              }}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline cursor-pointer active:scale-95"
            >
              Probar timbre
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Control de cobros, despachos y estado en tiempo real ({orders.length} pedidos totales)
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["all", "pendiente", "preparando", "enviado", "completado", "cancelado"].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer border ${
                filterStatus === st
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border-neutral-200"
              }`}
            >
              {st === "all" ? "Todos" : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {isFilteringOrders ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-400">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-neutral-800">No hay pedidos con este filtro</h3>
            <p className="text-xs text-neutral-500 mt-1">
              Los nuevos pedidos que los clientes realicen en la tienda aparecerán aquí al instante.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-xs transition p-5 space-y-4"
              >
                {/* Header row: Code, Date, Status Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200">
                      {order.code}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-neutral-500 hidden sm:inline">
                      • {order.orderType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Thermal receipt print shortcut */}
                    {features.thermalReceipts && (
                      <button
                        onClick={() => openReceipt(order)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer border border-neutral-200"
                        title="Imprimir comanda térmica de 80mm para cocina o mostrador"
                      >
                        <Printer className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="hidden sm:inline">Comanda 80mm</span>
                      </button>
                    )}

                    {/* View customer tracking */}
                    {features.orderTracking && (
                      <button
                        onClick={() => openTracking(order)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition cursor-pointer border border-neutral-200"
                        title="Ver seguimiento tal como lo ve el cliente"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="hidden sm:inline">Tracking</span>
                      </button>
                    )}

                    <label className="text-xs text-neutral-400 font-medium">Estado:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs font-bold py-1.5 px-3 rounded-xl border focus:outline-none cursor-pointer ${statusInfo.bg}`}
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="preparando">👨‍🍳 En Preparación</option>
                      <option value="enviado">🚚 Enviado / En Camino</option>
                      <option value="completado">✅ Completado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar orden ${order.code}?`)) deleteOrder(order.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Archivar/Eliminar orden"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Middle row: Customer Info & Order Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Customer Column */}
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 space-y-2">
                    <div className="font-bold text-neutral-900 flex items-center justify-between">
                      <span>Datos del Comprador</span>
                      <button
                        onClick={() => handleWhatsAppContact(order)}
                        className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </button>
                    </div>
                    <div className="text-neutral-700 space-y-1">
                      <div><strong>Nombre:</strong> {order.customerName}</div>
                      <div><strong>Teléfono:</strong> {order.customerPhone}</div>
                      <div><strong>Entrega / Salón:</strong> {order.customerAddress}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong>Pago:</strong> {order.paymentMethod}
                        {order.paymentStatus === "pagado" && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            ✅ Pagado
                          </span>
                        )}
                        {(order.paymentStatus === "esperando_deposito_qr" || order.paymentStatus === "verificacion_pendiente") && (
                          <div className="flex items-center gap-1.5 my-1 flex-wrap">
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                              ⏳ Esperando depósito en banco
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                updateOrderPaymentStatus(order.id, "pagado");
                                updateOrderStatus(order.id, "preparando");
                                toast.success(`¡Depósito de orden ${order.code} confirmado en banco! Pasó a preparación.`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs cursor-pointer transition flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirmar Depósito Bancario</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {order.billing?.required && (
                        <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-950 mt-1 space-y-0.5">
                          <div className="font-bold text-[10px] uppercase text-blue-800 flex items-center gap-1">
                            <span>📄 Requiere Factura Oficial</span>
                          </div>
                          <div><strong>Razón Social:</strong> {order.billing.businessName}</div>
                          <div><strong>NIT / CI:</strong> <span className="font-mono font-bold">{order.billing.nit}</span></div>
                        </div>
                      )}
                      {order.googleMapsUrl && (
                        <div className="pt-2 flex flex-wrap items-center gap-1.5">
                          <a
                            href={order.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold hover:bg-emerald-100 transition text-[11px]"
                          >
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            <span>Ver en Google Maps</span>
                            <ExternalLink className="w-3 h-3 text-emerald-600" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleSendToDeliveryDriver(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition text-[11px] shadow-2xs cursor-pointer"
                            title="Enviar dirección y enlace de navegación GPS al repartidor por WhatsApp"
                          >
                            <span>🛵 Pasar al Delivery</span>
                          </button>
                        </div>
                      )}
                      {order.notes && (
                        <div className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60 mt-1">
                          <strong>Nota:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Column */}
                  <div className="bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/80 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-neutral-900 mb-2">
                        Artículos del Pedido ({order.items.reduce((a, b) => a + b.quantity, 0)})
                      </div>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-neutral-700">
                            <span>
                              <strong>{item.quantity}x</strong> {item.name}{" "}
                              {item.option && <span className="text-neutral-500">({item.option})</span>}
                            </span>
                            <span className="font-medium text-neutral-900">
                              {storeConfig.currency} {(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between items-baseline font-bold text-sm text-neutral-950">
                      <span>Total Abonado:</span>
                      <span className="text-base text-emerald-700">
                        {storeConfig.currency} {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
