import React, { useState, useMemo } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ExternalLink, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  Volume2,
  VolumeX,
  Wallet,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  X,
  ChevronRight,
  Check,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { 
    orders, 
    products, 
    categories, 
    storeConfig, 
    setActiveAdminTab, 
    setViewMode,
    soundAlertsEnabled,
    toggleSoundAlerts,
    playOrderBell
  } = useStore();

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesSearch, setSalesSearch] = useState("");
  const [salesSort, setSalesSort] = useState("time-desc");

  // Metrics calculations
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelado")
    .reduce((sum, o) => sum + o.total, 0);

  const qrTotal = orders
    .filter((o) => o.status !== "cancelado" && o.paymentMethod.toLowerCase().includes("qr"))
    .reduce((sum, o) => sum + o.total, 0);

  const cashTotal = orders
    .filter((o) => o.status !== "cancelado" && o.paymentMethod.toLowerCase().includes("efectivo"))
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter(
    (o) => o.status === "pendiente" || o.status === "preparando"
  );

  const lowStockProducts = products.filter((p) => p.stock <= 5);
  const outOfStockProducts = products.filter((p) => p.stock === 0);

  const recentOrders = orders.slice(0, 5);

  const maxOrderAmount = orders.length > 0 ? Math.max(...orders.map((o) => o.total)) : 0;
  const avgOrderTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  const formatOrderTime = (isoString) => {
    if (!isoString) return "Hoy";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Hoy";
    }
  };

  const handleWhatsAppContact = (order) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hola ${order.customerName}, te escribimos desde *${storeConfig.name}* sobre tu pedido *${order.code}*. ¿Cómo podemos ayudarte?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const sortedSales = useMemo(() => {
    let list = orders.filter((o) => {
      const matchSearch =
        o.code.toLowerCase().includes(salesSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(salesSearch.toLowerCase()) ||
        o.customerPhone.includes(salesSearch);
      
      if (salesSort === "delivery-only") {
        return matchSearch && (o.orderType.toLowerCase().includes("delivery") || o.orderType.toLowerCase().includes("envío"));
      }
      if (salesSort === "dinein-only") {
        return matchSearch && !o.orderType.toLowerCase().includes("delivery") && !o.orderType.toLowerCase().includes("envío");
      }
      if (salesSort === "paid-only") {
        return matchSearch && (o.paymentStatus === "pagado" || o.paymentMethod.toLowerCase().includes("qr"));
      }
      return matchSearch;
    });

    switch (salesSort) {
      case "time-asc":
        return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      case "amount-desc":
        return list.sort((a, b) => b.total - a.total);
      case "amount-asc":
        return list.sort((a, b) => a.total - b.total);
      case "qr-first":
        return list.sort((a, b) => (b.paymentMethod.toLowerCase().includes("qr") ? 1 : 0) - (a.paymentMethod.toLowerCase().includes("qr") ? 1 : 0));
      case "cash-first":
        return list.sort((a, b) => (b.paymentMethod.toLowerCase().includes("efectivo") ? 1 : 0) - (a.paymentMethod.toLowerCase().includes("efectivo") ? 1 : 0));
      case "time-desc":
      default:
        return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
  }, [orders, salesSearch, salesSort]);

  const handleExportCashReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Codigo,Cliente,Telefono,Modalidad,Pago,Total,Estado,Fecha\n";
    orders.forEach((o) => {
      csvContent += `${o.code},"${o.customerName}",${o.customerPhone},"${o.orderType}","${o.paymentMethod}",${o.total},${o.status},${o.createdAt || ""}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cierre_Caja_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte de caja exportado en CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-neutral-950 font-bold text-[9.5px] uppercase tracking-wider">
              {storeConfig.badge}
            </span>
            <span className="text-neutral-400 text-[11px] sm:text-xs">• Control Central</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Panel de Control: {storeConfig.name}
          </h2>
          <p className="text-neutral-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            Gestiona tu inventario, procesa pedidos en tiempo real y personaliza cada detalle visual para tu negocio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={toggleSoundAlerts}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition cursor-pointer border flex-1 sm:flex-none ${
              soundAlertsEnabled
                ? "bg-amber-400 text-neutral-950 border-amber-300 shadow-sm"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            }`}
            title="Activar o silenciar timbre de nuevos pedidos"
          >
            {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundAlertsEnabled ? "Timbre: ON" : "Silenciado"}</span>
          </button>
          <button
            onClick={() => setViewMode("storefront")}
            className="flex items-center justify-center gap-1.5 bg-white text-neutral-900 hover:bg-neutral-100 px-3.5 py-2 rounded-xl font-bold text-xs shadow-md transition cursor-pointer flex-1 sm:flex-none whitespace-nowrap"
          >
            <span>Ver Tienda</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveAdminTab("products")}
            className="flex items-center justify-center gap-1.5 bg-neutral-700/80 hover:bg-neutral-700 text-white px-3.5 py-2 rounded-xl font-semibold text-xs transition cursor-pointer border border-neutral-600 w-full sm:w-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Sales (Clickable - Opens Detailed Daily Sales Breakdown) */}
        <div
          onClick={() => setShowSalesModal(true)}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border-2 border-neutral-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 shadow-2xs cursor-pointer group relative overflow-hidden"
          title="Haz clic para ver el desglose detallado de ventas del día por cliente y hora"
        >
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-bl-lg">
            Detalle ➔
          </div>
          <div className="flex items-center justify-between text-neutral-500 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-700 transition truncate">
              Ventas Totales
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition flex-shrink-0">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950 font-mono truncate">
            {storeConfig.currency} {totalRevenue.toFixed(2)}
          </div>
          <div className="text-[10.5px] text-emerald-700 font-semibold mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
            <span className="flex items-center gap-1 truncate">
              <TrendingUp className="w-3 h-3 flex-shrink-0" />
              <span>{orders.length} pedidos</span>
            </span>
            <span className="text-[9.5px] text-neutral-400 group-hover:text-emerald-600 font-bold underline">
              Ver reporte
            </span>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Pedidos en Curso</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {activeOrders.length}
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">
            Requieren atención o preparación
          </div>
        </div>

        {/* Catalog items */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Catálogo Activo</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center flex-shrink-0">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-950">
            {products.length}
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">
            En {categories.length} categorías
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider truncate">Alertas de Stock</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            {lowStockProducts.length}
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 mt-1 truncate">
            {outOfStockProducts.length} agotados, {lowStockProducts.length - outOfStockProducts.length} por agotarse
          </div>
        </div>
      </div>

      {/* Daily Cash Register Closing Summary (Cierre de Caja del Día) */}
      <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-base leading-tight">
                Cierre de Caja Diario (Cuadre de Turno)
              </h3>
              <p className="text-xs text-neutral-500">
                Desglose automático por método de cobro para arqueo de caja
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCashReport}
              className="flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Exportar Reporte (CSV)</span>
            </button>
            <button
              onClick={playOrderBell}
              className="flex items-center gap-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border border-neutral-200 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer"
              title="Probar timbre sonoro"
            >
              <span>🔔 Probar Timbre</span>
            </button>
          </div>
        </div>

        {/* Breakdown by Payment Channel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Recaudado Hoy
            </span>
            <div className="text-xl font-black text-neutral-950 font-mono mt-1">
              {storeConfig.currency} {totalRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-neutral-500 mt-0.5 block">
              {orders.length} pedidos finalizados
            </span>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Cobrado por QR Simple (Banco)
            </span>
            <div className="text-xl font-black text-emerald-900 font-mono mt-1">
              {storeConfig.currency} {qrTotal.toFixed(2)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
              Directo a cuenta bancaria
            </span>
          </div>

          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Efectivo en Mano / Caja
            </span>
            <div className="text-xl font-black text-amber-900 font-mono mt-1">
              {storeConfig.currency} {cashTotal.toFixed(2)}
            </div>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">
              Físico recibido en mostrador/delivery
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                Últimos Pedidos Recibidos
              </h3>
              <p className="text-xs text-neutral-400">
                Historial de compras y pedidos por WhatsApp
              </p>
            </div>
            <button
              onClick={() => setActiveAdminTab("orders")}
              className="text-xs font-bold text-neutral-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                Aún no hay pedidos registrados.
              </div>
            ) : (
              recentOrders.map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neutral-900">{ord.code}</span>
                      <span className="text-neutral-600 font-medium truncate max-w-[120px] sm:max-w-[200px]">
                        {ord.customerName}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 block mt-0.5">
                      {ord.items.length} artículos • {ord.paymentMethod}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-neutral-900 block">
                      {storeConfig.currency} {ord.total.toFixed(2)}
                    </span>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize mt-0.5 ${
                      ord.status === "completado"
                        ? "bg-emerald-100 text-emerald-800"
                        : ord.status === "pendiente"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Low Stock Alerts (1 col) */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                Stock Crítico
              </h3>
              <p className="text-xs text-neutral-400">
                Artículos que necesitan reposición
              </p>
            </div>
            <button
              onClick={() => setActiveAdminTab("products")}
              className="text-xs font-bold text-neutral-900 hover:underline cursor-pointer"
            >
              Inventario
            </button>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span>Todos los artículos cuentan con stock óptimo.</span>
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((prod) => (
                <div key={prod.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-neutral-900 block truncate">{prod.name}</span>
                      <span className="text-[10px] text-neutral-400 block">{prod.category}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex-shrink-0 ${
                    prod.stock === 0
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {prod.stock === 0 ? "Agotado" : `${prod.stock} restantes`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Detailed Daily Sales Breakdown (Desglose Detallado de Ventas del Día) */}
      <AnimatePresence>
        {showSalesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSalesModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            />

            {/* Modal Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col h-[90vh] max-h-[92vh]"
            >
              {/* Header */}
              <div className="p-3 sm:p-5 border-b border-neutral-200 bg-neutral-50/90 flex items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-tight truncate">
                        Desglose de Ventas
                      </h3>
                      <span className="text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex-shrink-0">
                        {sortedSales.length} ventas
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 hidden sm:block truncate mt-0.5">
                      Reporte completo con clientes, horas, métodos de cobro y montos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <button
                    onClick={handleExportCashReport}
                    className="flex items-center gap-1 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                    title="Exportar a CSV / Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                  </button>

                  <button
                    onClick={() => setShowSalesModal(false)}
                    className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-600 transition cursor-pointer"
                    title="Cerrar modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Metrics Bar (Compact on mobile) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 sm:p-4 bg-white border-b border-neutral-100 text-xs flex-shrink-0">
                {/* 1. Facturación Total */}
                <div className="p-2 sm:p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <span className="text-[9.5px] font-bold text-neutral-500 uppercase tracking-wider block truncate">
                    Facturación Total
                  </span>
                  <div className="text-base sm:text-lg font-black text-neutral-950 font-mono mt-0.5 truncate">
                    {storeConfig.currency} {totalRevenue.toFixed(2)}
                  </div>
                  <span className="text-[9.5px] text-neutral-400 block mt-0.5 truncate">
                    {orders.length} pedidos hoy
                  </span>
                </div>

                {/* 2. Pagos por QR */}
                <div className="p-2 sm:p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider block truncate">
                    Pagos por QR
                  </span>
                  <div className="text-base sm:text-lg font-black text-emerald-900 font-mono mt-0.5 truncate">
                    {storeConfig.currency} {qrTotal.toFixed(2)}
                  </div>
                  <span className="text-[9.5px] text-emerald-700 font-medium block mt-0.5 truncate">
                    Acreditado en banco
                  </span>
                </div>

                {/* 3. Pago en Efectivo */}
                <div className="p-2 sm:p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <span className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider block truncate">
                    Pago en Efectivo
                  </span>
                  <div className="text-base sm:text-lg font-black text-amber-900 font-mono mt-0.5 truncate">
                    {storeConfig.currency} {cashTotal.toFixed(2)}
                  </div>
                  <span className="text-[9.5px] text-amber-700 font-medium block mt-0.5 truncate">
                    Recaudado en caja
                  </span>
                </div>

                {/* 4. Mayor Monto de Pago */}
                <div className="p-2 sm:p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <span className="text-[9.5px] font-bold text-blue-800 uppercase tracking-wider block truncate">
                    Mayor Pago
                  </span>
                  <div className="text-base sm:text-lg font-black text-blue-950 font-mono mt-0.5 truncate">
                    {storeConfig.currency} {maxOrderAmount.toFixed(2)}
                  </div>
                  <span className="text-[9.5px] text-blue-700 font-medium block mt-0.5 truncate">
                    Ticket récord
                  </span>
                </div>
              </div>

              {/* Filter & Sort Bar */}
              <div className="p-2.5 sm:p-3.5 bg-neutral-50/70 border-b border-neutral-200 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between text-xs flex-shrink-0">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={salesSearch}
                    onChange={(e) => setSalesSearch(e.target.value)}
                    placeholder="Buscar cliente, teléfono o #ORD..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  {salesSearch && (
                    <button
                      onClick={() => setSalesSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500 hidden sm:inline" />
                  <select
                    value={salesSort}
                    onChange={(e) => setSalesSort(e.target.value)}
                    className="bg-white border border-neutral-300 text-xs font-semibold py-1.5 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer shadow-2xs w-full sm:w-auto"
                  >
                    <option value="time-desc">🕒 Más reciente primero</option>
                    <option value="time-asc">⏰ Más antiguo primero</option>
                    <option value="amount-desc">📈 Mayor pedido</option>
                    <option value="amount-asc">📉 Menor pedido</option>
                    <option value="qr-first">💳 QR Simple primero</option>
                    <option value="cash-first">💵 Efectivo primero</option>
                    <option value="delivery-only">🛵 Solo Delivery</option>
                    <option value="dinein-only">🍽️ Solo Salón / Retiro</option>
                    <option value="paid-only">✅ Solo Pagados</option>
                  </select>
                </div>
              </div>

              {/* Table of Orders (Scrollable body) */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-5 overscroll-contain">
                {sortedSales.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-neutral-300" />
                    <p className="font-semibold text-neutral-800 text-sm">
                      No se encontraron ventas con este filtro
                    </p>
                    <p className="text-xs text-neutral-500">
                      Prueba con otro término de búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sortedSales.map((sale) => (
                      <div
                        key={sale.id}
                        className="p-3 sm:p-4 rounded-xl bg-white border border-neutral-200/90 hover:border-neutral-300 shadow-2xs transition space-y-2.5"
                      >
                        {/* Top row */}
                        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="font-mono font-black text-xs sm:text-sm text-neutral-900">
                              {sale.code}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                              <Clock className="w-2.5 h-2.5 text-neutral-400" />
                              <span>{formatOrderTime(sale.createdAt)}</span>
                            </span>
                            <span className="text-[9.5px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                              {sale.orderType}
                            </span>
                            <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded capitalize ${
                              sale.status === "completado"
                                ? "bg-emerald-100 text-emerald-800"
                                : sale.status === "preparando"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}>
                              {sale.status}
                            </span>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-sm sm:text-base font-black text-neutral-950 font-mono">
                              {storeConfig.currency} {sale.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Middle row: Customer & Products Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 text-xs">
                          {/* Customer data */}
                          <div className="space-y-0.5 text-neutral-600">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900 text-xs sm:text-sm truncate">
                                👤 {sale.customerName}
                              </span>
                              <button
                                onClick={() => handleWhatsAppContact(sale)}
                                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded flex-shrink-0"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>WhatsApp</span>
                              </button>
                            </div>
                            <div className="text-[10.5px] text-neutral-500 truncate">
                              📞 Tel: <strong className="text-neutral-700">{sale.customerPhone}</strong>
                            </div>
                            <div className="text-[10.5px] text-neutral-500 truncate">
                              📍 Dirección: <span className="text-neutral-700">{sale.customerAddress}</span>
                            </div>
                            <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10.5px] text-neutral-500">Pago:</span>
                              <span className="font-semibold text-neutral-800 text-[10.5px]">{sale.paymentMethod}</span>
                              {sale.paymentStatus === "pagado" || sale.paymentMethod.toLowerCase().includes("qr") ? (
                                <span className="text-[8.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full border border-emerald-300">
                                  ✅ Acreditado
                                </span>
                              ) : (
                                <span className="text-[8.5px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
                                  ⏳ Al Recibir
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Items breakdown */}
                          <div className="bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/70 space-y-1">
                            <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                              Artículos ({sale.items.length})
                            </span>
                            <div className="space-y-0.5 max-h-20 overflow-y-auto">
                              {sale.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-[10.5px]">
                                  <span className="text-neutral-800 truncate pr-2">
                                    • {it.quantity}x {it.name} {it.option ? `(${it.option})` : ""}
                                  </span>
                                  <span className="font-semibold text-neutral-900 font-mono flex-shrink-0">
                                    {storeConfig.currency}{(it.price * it.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {sale.notes && (
                              <div className="pt-1 border-t border-neutral-200/60 text-[9.5px] text-neutral-500 italic truncate">
                                Nota: "{sale.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-2 text-xs flex-shrink-0">
                <span className="text-neutral-500 text-[10px] sm:text-xs truncate">
                  {sortedSales.length} de {orders.length} pedidos hoy
                </span>
                <button
                  onClick={() => setShowSalesModal(false)}
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition cursor-pointer flex-shrink-0 shadow-xs"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
