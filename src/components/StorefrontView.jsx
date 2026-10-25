import React, { useState, useMemo, useRef, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import Header from "./Header";
import Hero from "./Hero";
import CategoryFilterBar from "./CategoryFilterBar";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import ProductPerspectiveModal from "./ProductPerspectiveModal";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import OrderSuccessModal from "./OrderSuccessModal";
import { ProductGridSkeleton } from "./Skeleton";
import { 
  PackageSearch, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  LayoutDashboard,
  Bot,
  MessageCircle,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS_PRESETS } from "../data/presets";

export default function StorefrontView() {
  const { 
    products, 
    categories, 
    storeConfig, 
    setViewMode, 
    setActiveAdminTab,
    switchBusinessPreset,
    activePresetKey,
    features,
    setIsAiSimulatorOpen,
    openLegalDoc,
    openPrivacyCenter,
    navigateTo,
    enterAdminMode,
    isAdminAuthenticated,
    isCartOpen,
    selectedProductForDetail,
    selectedProductForPerspective,
    isCheckoutOpen,
    isAdminPinModalOpen
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);

  const catalogRef = useRef(null);

  // Trigger fluid skeleton animation when preset or model changes
  useEffect(() => {
    setSelectedCategory("all");
    setIsCatalogLoading(true);
    const timer = setTimeout(() => {
      setIsCatalogLoading(false);
    }, 380);
    return () => clearTimeout(timer);
  }, [activePresetKey]);

  const handleSelectCategory = (cat) => {
    if (cat === selectedCategory) return;
    setIsCatalogLoading(true);
    setSelectedCategory(cat);
    setTimeout(() => {
      setIsCatalogLoading(false);
    }, 280);
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      counts[cat] = products.filter((p) => p.category === cat).length;
    });
    return counts;
  }, [categories, products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = products.filter((prod) => {
      const matchCategory = selectedCategory === "all" || prod.category === selectedCategory;
      const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.tags && prod.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchCategory && matchSearch;
    });

    // Sorting
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "stock":
        return list.sort((a, b) => b.stock - a.stock);
      case "featured":
      default:
        return list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Theme-specific styling variables
  const isFashion = activePresetKey === "fashion";
  const isFood = activePresetKey === "restaurant";

  const containerThemeClass = isFashion
    ? "bg-[#f4f3f0]"
    : isFood
    ? "bg-[#faf8f5]"
    : "bg-neutral-50/60";

  return (
    <div className={`min-h-screen flex flex-col ${containerThemeClass} selection:bg-neutral-900 selection:text-white transition-colors duration-300 overflow-x-hidden`}>
      {/* Main Header */}
      <Header />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 w-full pb-28 sm:pb-16 overflow-x-hidden">
        {/* Themed Animated Hero Section */}
        <Hero onExploreClick={scrollToCatalog} onSelectCategory={handleSelectCategory} />

        {/* Catalog Section Anchor */}
        <div ref={catalogRef} className="pt-2">
          {/* Section Title with Theme-specific Editorial Treatment */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2"
          >
            <div>
              {isFashion ? (
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                    [ FW26 ARCHIVE // PIEZAS DISPONIBLES ]
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-950 uppercase tracking-tight font-['Outfit'] mt-1">
                    {selectedCategory === "all" ? "BEST OF GAZU // KULT" : selectedCategory}
                  </h2>
                </div>
              ) : isFood ? (
                <div>
                  <span className="text-xs font-semibold tracking-wider text-amber-800 uppercase flex items-center gap-1.5">
                    <span>🍴</span>
                    <span>SELECCIÓN DEL CHEF & ALTA COCINA</span>
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-normal text-stone-900 tracking-tight font-serif italic mt-1">
                    {selectedCategory === "all" ? "Nuestra Carta de Especialidades" : selectedCategory}
                  </h2>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Catálogo Disponible
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight font-['Outfit']">
                    {selectedCategory === "all" ? "Todos los Productos" : selectedCategory}
                  </h2>
                </div>
              )}
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Mostrando <strong className="text-neutral-900 font-bold">{filteredProducts.length}</strong> de {products.length} artículos
            </span>
          </motion.div>

          {/* Filters, Search & Categories */}
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProductsCount={products.length}
            categoryCounts={categoryCounts}
          />

          {/* Products Grid or Skeleton Loader */}
          {isCatalogLoading ? (
            <ProductGridSkeleton count={Math.min(8, products.length || 8)} />
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-neutral-200 p-12 sm:p-16 text-center my-6 shadow-2xs">
              <PackageSearch className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-neutral-900 mb-1">
                No encontramos productos que coincidan
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
                Intenta buscar con otros términos o selecciona otra categoría.
              </p>
              <button
                onClick={() => {
                  handleSelectCategory("all");
                  setSearchQuery("");
                }}
                className="bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition cursor-pointer"
              >
                Limpiar filtros de búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Prototype Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-16 text-xs text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Store info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                <img src={storeConfig.logoUrl} alt={storeConfig.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">{storeConfig.name}</h4>
            </div>
            <p className="text-neutral-500 text-xs leading-relaxed">
              {storeConfig.tagline}
            </p>
            <div className="pt-1 text-[11px] text-neutral-500 space-y-1">
              <div>📍 {storeConfig.address}</div>
              <div>📱 WhatsApp: {storeConfig.phoneWhatsApp}</div>
              {storeConfig.taxId && (
                <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-100">
                  <span>Razón Social: <strong>{storeConfig.legalName || storeConfig.name}</strong></span>
                  <br />
                  <span>{storeConfig.taxId} • Cochabamba, Bolivia</span>
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Business archetypes demo picker */}
          <div className="space-y-2">
            <div className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Giro de Negocio</span>
            </div>
            <p className="text-neutral-500 text-xs">
              Alterna entre modelos preconfigurados:
            </p>
            <div className="grid grid-cols-1 gap-1.5 pt-1">
              {Object.values(BUSINESS_PRESETS).slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchBusinessPreset(p.id)}
                  className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                    p.id === activePresetKey
                      ? "bg-neutral-900 text-white border-neutral-900 font-semibold shadow-2xs"
                      : "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700"
                  }`}
                >
                  <span className="truncate">{p.name.split("|")[0]}</span>
                  <span className="text-[10px] opacity-75">{p.badge.split("&")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Compliance & Legal Information */}
          <div className="space-y-3">
            <div className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Privacidad & Legal</span>
            </div>
            <ul className="space-y-2 text-xs text-neutral-600">
              <li>
                <button
                  onClick={() => navigateTo("privacy")}
                  className="hover:text-neutral-900 hover:underline transition cursor-pointer flex items-center gap-1 text-left"
                >
                  <span>• Política de Privacidad</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo("terms")}
                  className="hover:text-neutral-900 hover:underline transition cursor-pointer flex items-center gap-1 text-left"
                >
                  <span>• Términos y Condiciones</span>
                </button>
              </li>
              <li>
                <button
                  onClick={openPrivacyCenter}
                  className="hover:text-emerald-700 hover:underline transition cursor-pointer flex items-center gap-1 font-semibold text-emerald-800 text-left"
                >
                  <span>• Centro de Privacidad (Derecho al Olvido)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const clean = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
                    window.open(`https://wa.me/${clean}?text=${encodeURIComponent("Hola, deseo registrar una queja/reclamación formal según Ley 453 (Defensa del Consumidor).")}`, "_blank");
                  }}
                  className="hover:text-neutral-900 hover:underline transition cursor-pointer flex items-center gap-1 text-left text-[11px] text-neutral-500"
                >
                  <span>• Libro de Reclamaciones ODECO (Ley 453)</span>
                </button>
              </li>
              <li className="text-[11px] text-neutral-400 pt-1 leading-snug">
                Cumplimiento Ley 453 de Defensa del Consumidor. Cobro seguro con QR Simple (0% comisiones).
              </li>
            </ul>
          </div>

          {/* Col 4: Customer service or Admin Panel if authenticated */}
          <div className="space-y-3">
            <div className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              {isAdminAuthenticated ? "Panel de Gestión" : "Atención & Despachos"}
            </div>
            {isAdminAuthenticated ? (
              <>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Sesión administrativa activa. Gestiona comandas, catálogo y finanzas en tiempo real.
                </p>
                <button
                  onClick={() => enterAdminMode("dashboard")}
                  className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Abrir Panel Administrador</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  Cocina y bar abiertos para pedidos directos. Despacho rápido a domicilio y retiro en salón.
                </p>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700 text-xs space-y-1">
                  <div>⏰ <strong>Horario:</strong> {storeConfig.businessHours?.openTime || "11:00"} a {storeConfig.businessHours?.closeTime || "23:00"}</div>
                  <div>📍 <strong>Ubicación:</strong> {storeConfig.address}</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200/80 py-4 px-4 text-center text-neutral-500 text-[11px] flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">
          <span>© {new Date().getFullYear()} {storeConfig.name}. Todos los derechos reservados.</span>
          <div className="flex items-center gap-3.5 sm:pr-40">
            <button onClick={() => navigateTo("privacy")} className="hover:underline cursor-pointer">
              Privacidad
            </button>
            <span>•</span>
            <button onClick={() => navigateTo("terms")} className="hover:underline cursor-pointer">
              Términos
            </button>
            <span>•</span>
            <button onClick={openPrivacyCenter} className="hover:underline cursor-pointer text-emerald-700 font-semibold">
              Mis Datos
            </button>
            <span>•</span>
            <button
              onClick={() => enterAdminMode("dashboard")}
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 px-1.5 py-0.5 rounded-md transition cursor-pointer"
              title="Acceso de Gestión (o presiona Alt + A)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Minimalist WhatsApp AI Assistant Button */}
      <AnimatePresence>
        {features.whatsappAiAgent && !isCartOpen && !selectedProductForDetail && !selectedProductForPerspective && !isCheckoutOpen && !isAdminPinModalOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            className="fixed bottom-5 right-4 sm:bottom-7 sm:right-7 z-30"
          >
            {/* Mobile: Compact 48px circular FAB - Leaves 85% of screen width completely clear */}
            <div className="sm:hidden">
              <motion.button
                whileTap={{ scale: 0.90 }}
                onClick={() => setIsAiSimulatorOpen(true)}
                className="w-12 h-12 rounded-full bg-neutral-900/95 text-white flex items-center justify-center shadow-xl border border-neutral-700/80 backdrop-blur-md relative active:scale-95 cursor-pointer"
                title={`Asistente Virtual IA de ${storeConfig.name}`}
              >
                <Bot className="w-5 h-5 text-emerald-400" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 ring-2 ring-neutral-900" />
                </span>
              </motion.button>
            </div>

            {/* Desktop: Elegant full pill button */}
            <div className="hidden sm:block">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsAiSimulatorOpen(true)}
                className="group relative flex items-center gap-2.5 bg-neutral-900/95 hover:bg-neutral-900 text-white pl-3 pr-3.5 py-2 rounded-full shadow-lg hover:shadow-xl border border-neutral-700/80 backdrop-blur-md transition-all duration-200 cursor-pointer"
                title={`Asistente Virtual IA de ${storeConfig.name}`}
              >
                {/* Subtle Ambient Pulse Ring */}
                <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500/25 to-teal-500/25 opacity-70 blur-xs group-hover:opacity-100 transition duration-300 animate-pulse pointer-events-none" />

                {/* Bot Icon with active presence dot */}
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 ring-2 ring-neutral-900" />
                  </span>
                </div>

                {/* Typography: Clean, Minimalist & Compact */}
                <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight">
                  <span className="text-neutral-100 font-medium">Asistente IA</span>
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/90 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                    En vivo
                  </span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Overlays */}
      <ProductPerspectiveModal />
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
    </div>
  );
}
