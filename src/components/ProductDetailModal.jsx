import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { parseOptionExtraPrice } from "../utils/pricing";
import { X, ShoppingBag, Plus, Minus, MessageCircle, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailModal() {
  const { 
    selectedProductForDetail, 
    setSelectedProductForDetail, 
    addToCart, 
    storeConfig,
    cart 
  } = useStore();

  const product = selectedProductForDetail;
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (product) {
      setIsImageLoaded(false);
      if (product.options && product.options.length > 0) {
        setSelectedOption(product.options[0]);
      } else {
        setSelectedOption("");
      }
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const inCart = cart.find(
    (c) => c.id === product.id && (selectedOption ? c.selectedOption === selectedOption : true)
  );

  const extraPrice = parseOptionExtraPrice(selectedOption);
  const currentUnitPrice = product.price + extraPrice;
  const currentTotalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedOption, quantity);
    setSelectedProductForDetail(null);
  };

  const handleWhatsAppInquiry = () => {
    const cleanPhone = storeConfig.phoneWhatsApp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hola ${storeConfig.name}, tengo una consulta sobre el producto "${product.name}" (${storeConfig.currency}${product.price.toFixed(2)}). ¿Tienen disponibilidad?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProductForDetail(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-neutral-600 hover:text-neutral-900 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition cursor-pointer border border-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image */}
          <div className="w-full md:w-1/2 bg-neutral-100 relative min-h-[260px] md:min-h-full overflow-hidden">
            {!isImageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer z-0" />
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              onLoad={() => setIsImageLoaded(true)}
              className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                setIsImageLoaded(true);
              }}
            />
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-900/80 text-white backdrop-blur-md uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price Row */}
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-neutral-950">
                  {storeConfig.currency} {currentUnitPrice.toFixed(2)}
                </span>
                {extraPrice > 0 && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    +{storeConfig.currency}{extraPrice.toFixed(2)} extra
                  </span>
                )}
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-neutral-400 line-through">
                    {storeConfig.currency} {product.comparePrice.toFixed(2)}
                  </span>
                )}
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Ahorras {storeConfig.currency} {(product.comparePrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              <div className="text-xs flex items-center gap-1.5">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Agotado actualmente
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600" /> Disponibilidad en inventario: {product.stock} unidades
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
                {product.description}
              </p>

              {/* Options selection if product has variants/options */}
              {product.options && product.options.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                    {product.optionsLabel || "Selecciona una opción"}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => setSelectedOption(option)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          selectedOption === option
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                            : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Cantidad:
                  </span>
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white transition cursor-pointer disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white transition cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-neutral-100 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white active:scale-98"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? "No disponible"
                    : `Agregar al Carrito — ${storeConfig.currency} ${currentTotalPrice.toFixed(2)}`}
                </span>
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>¿Dudas sobre este artículo? Preguntar por WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
