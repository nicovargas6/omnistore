import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { parseOptionExtraPrice, getOptionDetails } from "../utils/pricing";
import { X, ShoppingBag, Plus, Minus, MessageCircle, AlertTriangle, Maximize2, Ruler } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailModal() {
  const { 
    selectedProductForDetail, 
    setSelectedProductForDetail, 
    openProductPerspective,
    addToCart, 
    storeConfig, 
    activePresetKey,
    cart 
  } = useStore();

  const product = selectedProductForDetail;
  const [selectedOption, setSelectedOption] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (product) {
      setIsImageLoaded(false);
      setShowSizeGuide(false);
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

  const handleOpenPerspective = () => {
    openProductPerspective(product);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProductForDetail(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh]"
        >
          {/* Close button with 44px touch area */}
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="absolute top-3.5 right-3.5 z-20 bg-white/95 hover:bg-white text-neutral-700 hover:text-neutral-950 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition cursor-pointer border border-neutral-200 active:scale-95"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image with Perspective trigger */}
          <div 
            onClick={handleOpenPerspective}
            className="w-full md:w-1/2 bg-neutral-100 relative aspect-4/3 sm:aspect-auto md:min-h-full overflow-hidden cursor-zoom-in group"
          >
            {!isImageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer z-0" />
            )}
            <img
              src={product.imageUrl}
              alt={product.name}
              onLoad={() => setIsImageLoaded(true)}
              className={`w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                setIsImageLoaded(true);
              }}
            />

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 pointer-events-none">
                {product.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-neutral-900/80 text-white backdrop-blur-md uppercase tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Floating Perspective pill on the image */}
            <div className="absolute bottom-3 right-3 z-10">
              <span className="flex items-center gap-1.5 bg-neutral-950/80 hover:bg-neutral-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-lg transition">
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver en mejor perspectiva</span>
              </span>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="w-full md:w-1/2 p-5 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price Row */}
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-black text-neutral-950 font-mono tracking-tight">
                  {storeConfig.currency} {currentUnitPrice.toFixed(2)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs text-neutral-400 line-through font-mono">
                    {storeConfig.currency} {product.comparePrice.toFixed(2)}
                  </span>
                )}
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Ahorras {storeConfig.currency}{(product.comparePrice - product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>

              {/* Stock Warning Badge */}
              {product.stock <= 5 && product.stock > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>¡Solo quedan {product.stock} unidades en almacén!</span>
                </div>
              )}

              {/* Options selection if any */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                      {product.optionsLabel || "Opciones Disponibles"}:
                    </label>
                    {(activePresetKey === "fashion" || /talle|talla/i.test(product.optionsLabel || "")) && (
                      <button
                        type="button"
                        onClick={() => setShowSizeGuide(!showSizeGuide)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-900 underline hover:text-neutral-600 transition cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>{showSizeGuide ? "Ocultar guía de talles" : "¿Cuál es mi talle?"}</span>
                      </button>
                    )}
                  </div>

                  {/* Expandable Interactive Size Guide Table for Fashion */}
                  {showSizeGuide && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-[11px] space-y-2 overflow-hidden"
                    >
                      <div className="flex items-center justify-between font-bold text-neutral-900">
                        <span>📏 Guía de Medidas (Corte Oversize / Boxy)</span>
                        <span className="text-[10px] text-neutral-500 font-normal">En centímetros (cm)</span>
                      </div>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-neutral-200 text-neutral-500 font-semibold">
                            <th className="py-1">Talle</th>
                            <th className="py-1">Pecho</th>
                            <th className="py-1">Largo</th>
                            <th className="py-1">Cintura / Equiv.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/60 font-mono text-neutral-800">
                          <tr>
                            <td className="py-1 font-bold">S (28)</td>
                            <td className="py-1">56 cm</td>
                            <td className="py-1">70 cm</td>
                            <td className="py-1">74-78 cm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">M (30)</td>
                            <td className="py-1">59 cm</td>
                            <td className="py-1">72 cm</td>
                            <td className="py-1">79-83 cm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">L (32)</td>
                            <td className="py-1">62 cm</td>
                            <td className="py-1">75 cm</td>
                            <td className="py-1">84-89 cm</td>
                          </tr>
                          <tr>
                            <td className="py-1 font-bold">XL (34)</td>
                            <td className="py-1">65 cm</td>
                            <td className="py-1">78 cm</td>
                            <td className="py-1">90-96 cm</td>
                          </tr>
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {product.options.map((opt) => {
                      const optDetails = getOptionDetails(opt, storeConfig.currency);
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedOption(opt)}
                          className={`p-3 text-xs rounded-xl border text-left font-semibold transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "border-neutral-900 bg-neutral-900 text-white shadow-md ring-1 ring-neutral-900"
                              : "border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800"
                          }`}
                        >
                          <span className={isSelected ? "text-white font-bold" : "text-neutral-900 font-semibold"}>
                            {optDetails.name}
                          </span>
                          {optDetails.hasExtra && (
                            <span className={`text-[10px] mt-0.5 ${isSelected ? "text-emerald-300" : "text-emerald-700 font-bold"}`}>
                              {optDetails.extraText}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Cantidad:
                  </span>
                  <div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white transition cursor-pointer disabled:opacity-40 active:scale-95"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-neutral-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-white transition cursor-pointer disabled:opacity-40 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 mt-5 border-t border-neutral-100 space-y-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-98 ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white"
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
