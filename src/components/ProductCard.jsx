import React, { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Plus, Check, Eye, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCard({ product }) {
  const { storeConfig, addToCart, setSelectedProductForDetail, cart } = useStore();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 sm:aspect-square bg-neutral-100 overflow-hidden">
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

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.tags && product.tags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-md uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}

          {/* Low stock or Out of stock badge */}
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider shadow-xs">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-neutral-950 uppercase tracking-wider shadow-xs">
              ¡Últimas {product.stock}!
            </span>
          ) : null}
        </div>

        {/* Hover quick view overlay pill */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-neutral-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5" />
            <span>Ver detalles</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-semibold text-neutral-900 text-sm sm:text-base leading-snug group-hover:text-neutral-700 transition line-clamp-2 mt-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-neutral-950 tabular-nums font-mono">
                {storeConfig.currency} {product.price.toFixed(2)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-xs text-neutral-400 line-through tabular-nums font-mono">
                  {storeConfig.currency} {product.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">
              {isOutOfStock ? "Sin stock disponible" : `${product.stock} disponibles`}
            </span>
          </div>

          {/* Quick Add Button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : inCartItem
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-neutral-900 hover:bg-neutral-800 text-white"
            }`}
            title={isOutOfStock ? "Producto agotado" : "Añadir al pedido"}
          >
            {inCartItem ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>({inCartItem.quantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agregar</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
