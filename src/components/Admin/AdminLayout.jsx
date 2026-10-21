import React from "react";
import { useStore } from "../../context/StoreContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Layers, 
  Sliders, 
  ArrowLeft, 
  Store, 
  Sparkles,
  FileText
} from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import ProductManager from "./ProductManager";
import OrderManager from "./OrderManager";
import CategoryManager from "./CategoryManager";
import StoreCustomizer from "./StoreCustomizer";

export default function AdminLayout() {
  const { 
    activeAdminTab, 
    setActiveAdminTab, 
    setViewMode, 
    storeConfig, 
    orders 
  } = useStore();

  const pendingOrdersCount = orders.filter((o) => o.status === "pendiente").length;

  const tabs = [
    { id: "dashboard", label: "Resumen & Métricas", icon: LayoutDashboard },
    { id: "products", label: "Inventario & Productos", icon: Package },
    { 
      id: "orders", 
      label: "Pedidos & Ventas", 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null 
    },
    { id: "categories", label: "Categorías", icon: Layers },
    { id: "customizer", label: "Personalización & Empresa", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-neutral-100/70 pb-16">
      {/* Admin Top Bar */}
      <div className="bg-neutral-900 text-white border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setViewMode("storefront")}
              className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 sm:px-3 py-1.5 rounded-lg transition cursor-pointer flex-shrink-0"
              title="Volver a la tienda del cliente"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver a la Tienda</span>
              <span className="sm:hidden font-medium">Tienda</span>
            </button>
            <div className="h-4 w-px bg-neutral-700 hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
                Admin
              </span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700 hidden md:inline truncate max-w-[140px]">
                {storeConfig.name}
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <a
              href="/propuesta-comercial.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs whitespace-nowrap"
              title="Abrir folleto y propuesta comercial descargable en PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Propuesta Comercial (PDF)</span>
              <span className="sm:hidden">Propuesta PDF</span>
            </a>

            <button
              onClick={() => setViewMode("storefront")}
              className="flex items-center justify-center bg-white text-neutral-900 w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold hover:bg-neutral-100 transition cursor-pointer shadow-xs flex-shrink-0"
              title="Ver tienda como cliente"
            >
              <Store className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline ml-1.5">Ver como Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subnav Navigation Tabs */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-amber-400 text-neutral-950" : "bg-amber-500 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeAdminTab === "dashboard" && <AdminDashboard />}
        {activeAdminTab === "products" && <ProductManager />}
        {activeAdminTab === "orders" && <OrderManager />}
        {activeAdminTab === "categories" && <CategoryManager />}
        {activeAdminTab === "customizer" && <StoreCustomizer />}
      </main>
    </div>
  );
}
