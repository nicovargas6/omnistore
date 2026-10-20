import React, { useState, useMemo, useRef } from "react";
import { useStore } from "../context/StoreContext";
import Header from "./Header";
import Hero from "./Hero";
import CategoryFilterBar from "./CategoryFilterBar";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import OrderSuccessModal from "./OrderSuccessModal";
import { 
  PackageSearch, 
  MapPin, 
  Phone, 
  Sparkles, 
  ShieldCheck, 
  Heart,
  LayoutDashboard,
  Bot,
  MessageCircle
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
    setIsAiSimulatorOpen
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const catalogRef = useRef(null);

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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50/60 selection:bg-neutral-900 selection:text-white">
      {/* Main Header */}
      <Header />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
        {/* Hero Section */}
        <Hero onExploreClick={scrollToCatalog} />

        {/* Catalog Section Anchor */}
        <div ref={catalogRef} className="pt-2">
          {/* Section Title */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Catálogo Disponible
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selectedCategory === "all" ? "Todos los Productos" : selectedCategory}
              </h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Mostrando {filteredProducts.length} de {products.length} artículos
            </span>
          </div>

          {/* Filters, Search & Categories */}
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalProductsCount={products.length}
            categoryCounts={categoryCounts}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
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
                  setSelectedCategory("all");
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
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                <img src={storeConfig.logoUrl} alt={storeConfig.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-neutral-900 text-sm">{storeConfig.name}</h4>
            </div>
            <p className="text-neutral-500 text-xs leading-relaxed">
              {storeConfig.tagline}
            </p>
            <div className="pt-2 text-[11px] text-neutral-400">
              Dirección: {storeConfig.address}
            </div>
          </div>

          {/* Col 2: Business archetypes demo picker */}
          <div className="space-y-2 md:col-span-2">
            <div className="font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Giro de Negocio para este Prototipo</span>
            </div>
            <p className="text-neutral-500 text-xs">
              Haz clic para transformar este prototipo en otro modelo de negocio al instante:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {Object.values(BUSINESS_PRESETS).map((p) => (
                <button
                  key={p.id}
                  onClick={() => switchBusinessPreset(p.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
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

          {/* Col 3: Admin shortcuts */}
          <div className="space-y-3">
            <div className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
              Control & Administración
            </div>
            <p className="text-neutral-500 text-xs">
              Accede al panel de control para editar precios, fotos, categorías y despachar pedidos.
            </p>
            <button
              onClick={() => {
                setViewMode("admin");
                setActiveAdminTab("dashboard");
              }}
              className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Abrir Panel Administrador</span>
            </button>
          </div>
        </div>

        <div className="border-t border-neutral-100 py-4 text-center text-neutral-400 text-[11px]">
          OmniStore Prototipo Web Adaptable • Diseñado con alta estética y funcionalidad para cualquier negocio
        </div>
      </footer>

      {/* Floating WhatsApp AI Assistant Button (when module is enabled) */}
      <AnimatePresence>
        {features.whatsappAiAgent && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-40"
          >
            <button
              onClick={() => setIsAiSimulatorOpen(true)}
              className="group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:shadow-emerald-900/25 transition-all duration-200 cursor-pointer border border-emerald-400/30"
              title={`Chatear con el Agente IA de ${storeConfig.name}`}
            >
              <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black uppercase tracking-wider leading-tight flex items-center gap-1">
                  <span>WhatsApp IA</span>
                  <span className="text-[9px] bg-emerald-800/60 font-semibold px-1 rounded text-emerald-100">En Vivo</span>
                </div>
                <div className="text-[10px] text-emerald-100/90 font-medium leading-none mt-0.5">
                  ¿Dudas o pedidos? Chatea aquí
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Overlays */}
      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
    </div>
  );
}
