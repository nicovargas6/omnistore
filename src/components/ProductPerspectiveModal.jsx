import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShoppingBag, 
  MessageCircle, 
  Eye, 
  Sparkles, 
  Check, 
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductPerspectiveModal() {
  const { 
    selectedProductForPerspective, 
    closeProductPerspective, 
    storeConfig, 
    addToCart,
    cart
  } = useStore();

  const product = selectedProductForPerspective;
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  useEffect(() => {
    if (product) {
      setZoomLevel(1);
      setActiveAngleIndex(0);
      setIsAddedRecently(false);
    }
  }, [product]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeProductPerspective();
    };
    if (product) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [product, closeProductPerspective]);

  if (!product) return null;

  const inCartItem = cart.find((item) => item.id === product.id);
  const isOutOfStock = product.stock <= 0;

  // Curated perspectives or zoom presets
  const perspectives = [
    { id: "general", label: "Vista General", zoom: 1, icon: Eye },
    { id: "detail", label: "Detalle & Textura", zoom: 1.5, icon: Layers },
    { id: "macro", label: "Enfoque Macro", zoom: 2.1, icon: ZoomIn },
  ];

  const handleSelectPerspective = (p, idx) => {
    setActiveAngleIndex(idx);
    setZoomLevel(p.zoom);
  };

  const handleToggleZoom = () => {
    setZoomLevel((prev) => (prev >= 2 ? 1 : prev + 0.5));
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, product.options?.[0] || null, 1);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleWhatsAppInquiry = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hola ${storeConfig.name}, estuve viendo la foto en detalle del producto "${product.name}" (${storeConfig.currency}${product.price.toFixed(2)}). ¿Tienen disponibilidad inmediata?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex flex-col justify-between bg-black/95 backdrop-blur-2xl text-white select-none overflow-hidden touch-none">
        
        {/* Top Floating Control Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="relative z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent"
        >
          {/* Product Title & Badge */}
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                {product.category}
              </span>
              <span className="text-[11px] text-neutral-400 hidden sm:inline">
                Perspectiva de Alta Fidelidad
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-bold tracking-tight text-white truncate mt-1">
              {product.name}
            </h2>
          </div>

          {/* Action Buttons: Zoom Controls & Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Zoom Toggle */}
            <button
              onClick={handleToggleZoom}
              className="flex items-center gap-1.5 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-700 transition cursor-pointer active:scale-95"
              title="Alternar nivel de zoom"
            >
              {zoomLevel > 1 ? <ZoomOut className="w-3.5 h-3.5 text-amber-400" /> : <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />}
              <span className="font-mono">{zoomLevel.toFixed(1)}x</span>
            </button>

            {/* Close Button with 44px touch target */}
            <button
              onClick={closeProductPerspective}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center border border-neutral-700 transition cursor-pointer active:scale-95 shadow-md"
              title="Cerrar vista en perspectiva"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Center: Interactive Image Viewer Canvas */}
        <div 
          onClick={handleToggleZoom}
          className="relative flex-1 flex items-center justify-center p-3 sm:p-8 overflow-hidden cursor-zoom-in"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              scale: zoomLevel,
              transition: { type: "spring", stiffness: 280, damping: 26 } 
            }}
            exit={{ opacity: 0, scale: 0.88 }}
            className="relative max-w-full max-h-[62vh] sm:max-h-[72vh] flex items-center justify-center"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[60vh] sm:max-h-[70vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] pointer-events-none"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=90";
              }}
            />
          </motion.div>

          {/* Perspective selector pills (Floating in canvas) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-800 shadow-xl z-20">
            {perspectives.map((p, idx) => {
              const Icon = p.icon;
              const isActive = activeAngleIndex === idx;
              return (
                <button
                  key={p.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPerspective(p, idx);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                    isActive 
                      ? "bg-white text-neutral-950 font-bold shadow-xs" 
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Floating Card: Price, Description & Purchase Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
          className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-black via-black/90 to-transparent"
        >
          <div className="max-w-xl mx-auto bg-neutral-900/95 border border-neutral-800/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Precio unitario
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    {storeConfig.currency} {product.price.toFixed(2)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-xs text-neutral-500 line-through font-mono">
                      {storeConfig.currency} {product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* In stock badge */}
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                isOutOfStock 
                  ? "bg-rose-950/80 text-rose-300 border-rose-800/60" 
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
              }`}>
                {isOutOfStock ? "Agotado" : "Disponible en local"}
              </span>
            </div>

            {/* Short description */}
            <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98 ${
                  isOutOfStock
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                    : isAddedRecently
                    ? "bg-emerald-600 text-white"
                    : "bg-white hover:bg-neutral-100 text-neutral-950"
                }`}
              >
                {isAddedRecently ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Añadido al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-neutral-900" />
                    <span>
                      {inCartItem ? `Agregar otro (${inCartItem.quantity} en pedido)` : "Añadir a mi Pedido"}
                    </span>
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-neutral-300 hover:text-white bg-neutral-800/90 hover:bg-neutral-750 border border-neutral-700/80 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Consultar por WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
}
