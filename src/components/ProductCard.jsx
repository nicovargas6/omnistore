import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Plus, Check, Eye, AlertCircle, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const { 
    storeConfig, 
    activePresetKey,
    addToCart, 
    setSelectedProductForDetail, 
    openProductPerspective,
    cart 
  } = useStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const isFashion = activePresetKey === "fashion";
  const isFood = activePresetKey === "restaurant";
  const isOutOfStock = product.stock <= 0;
  const inCartItem = cart.find((item) => item.id === product.id);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    // If product has options (like sizes, extras, sides), open the detail modal so customer can choose
    if (product.options && product.options.length > 0) {
      setSelectedProductForDetail(product);
      return;
    }
    addToCart(product, null, 1);
  };

  const handleCardClick = () => {
    setSelectedProductForDetail(product);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    openProductPerspective(product);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className={`group relative transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        isFashion
          ? "bg-[#f8f7f4] rounded-none border border-neutral-300/90 hover:border-neutral-950"
          : isFood
          ? "bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md hover:border-[#ff5500]/40"
          : "bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md"
      }`}
    >
      {/* Product Image Frame */}
      <div 
        onClick={handleImageClick}
        className={`relative bg-neutral-100 overflow-hidden cursor-zoom-in ${
          isFashion ? "aspect-4/4 sm:aspect-4/5" : "aspect-4/3 sm:aspect-square"
        }`}
      >
        {/* Skeleton shimmer loader while image is downloading */}
        {!isImageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer z-0" />
        )}

        <img
          src={hasImageError ? "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80" : product.imageUrl}
          alt={product.name}
          onLoad={() => setIsImageLoaded(true)}
          onError={() => {
            setHasImageError(true);
            setIsImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
            isImageLoaded ? "opacity-100" : "opacity-0"
          } ${isOutOfStock ? "grayscale filter opacity-60" : ""}`}
          loading="lazy"
        />

        {/* Floating Badges (Tags & Stock) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
          {product.tags && product.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-md uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}

          {/* Out of stock badge */}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider shadow-xs">
              Agotado
            </span>
          )}
        </div>

        {/* Floating Zoom / Perspective Button */}
        <button
          type="button"
          onClick={handleImageClick}
          className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/60 hover:bg-black/85 active:scale-90 text-white text-[10px] font-semibold px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
          title="Toca para ver en mejor perspectiva y alta resolución"
        >
          <Maximize2 className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px]">Ver foto</span>
        </button>

        {/* Hover quick view overlay pill (Desktop) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-neutral-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>Ver detalles & opciones</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-bold text-neutral-900 text-sm sm:text-base leading-snug group-hover:text-neutral-700 transition line-clamp-2 mt-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-neutral-950 tabular-nums font-mono">
                {storeConfig.currency} {product.price.toFixed(2)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-neutral-400 line-through tabular-nums font-mono">
                  {storeConfig.currency} {product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            {isOutOfStock && (
              <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                No disponible
              </span>
            )}
          </div>

          {/* Quick Add Button with generous 42px touch target on mobile */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
              isFashion ? "rounded-none uppercase tracking-wider" : "rounded-xl"
            } ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : inCartItem
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                : isFood
                ? "bg-[#ff5500] hover:bg-[#e64d00] text-white shadow-[#ff5500]/20"
                : "bg-neutral-900 hover:bg-neutral-800 text-white"
            }`}
            title={isOutOfStock ? "Producto agotado" : "Añadir a mi pedido"}
          >
            {inCartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>({inCartItem.quantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
