import React, { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { toast } from "sonner";
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Tag, 
  Check, 
  Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    products,
    addToCart,
    activePresetKey,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    cartCount,
    storeConfig,
    setIsCheckoutOpen,
    features,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Clear any active toasts when drawer opens so they don't block the header or close button
  useEffect(() => {
    if (isCartOpen) {
      toast.dismiss();
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleStartCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput);
    if (ok) setCouponInput("");
  };

  const estimatedTotal = Math.max(0, cartSubtotal - discountAmount);
  const freeShippingThreshold = storeConfig.freeShippingThreshold || 100;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  // Upsell / Cross-sell recommendations (items not yet in cart, prioritizing lower price add-ons)
  const upsellItems = (products || [])
    .filter((p) => p.stock > 0 && !cart.some((c) => c.id === p.id))
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer container */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-neutral-200 h-[100dvh]"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  {cartCount}
                </div>
                <div>
                  <h2 className="font-bold text-neutral-900 text-base">Tu Carrito de Compra</h2>
                  <p className="text-xs text-neutral-400">{storeConfig.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-neutral-400 hover:text-rose-600 transition cursor-pointer px-2 py-1"
                    title="Vaciar todo el carrito"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-600 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progressive Free Shipping Bar */}
            {cart.length > 0 && (
              <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  {remainingForFreeShipping > 0 ? (
                    <span className="text-neutral-700 font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-neutral-600" />
                      <span>
                        Agrega <strong className="text-neutral-950 font-bold">{storeConfig.currency}{remainingForFreeShipping.toFixed(2)}</strong> más para <strong className="text-emerald-700">Envío Gratis</strong>
                      </span>
                    </span>
                  ) : (
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>🎉 ¡Felicidades! Desbloqueaste Envío Gratis</span>
                    </span>
                  )}
                  <span className="text-[10px] font-mono font-bold text-neutral-500">
                    {Math.round(freeShippingProgress)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      remainingForFreeShipping === 0 ? "bg-emerald-500" : "bg-neutral-900"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-neutral-300" />
                  </div>
                  <h3 className="text-base font-semibold text-neutral-800 mb-1">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs mb-6">
                    Añade productos de nuestro catálogo para iniciar tu pedido en segundos.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    layout
                    key={item.cartItemId}
                    className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-200 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        {item.name}
                      </h4>
                      {item.selectedOption && (
                        <span className="text-[11px] text-neutral-500 block">
                          {item.selectedOption}
                        </span>
                      )}
                      <div className="text-xs font-bold text-neutral-900 mt-1">
                        {storeConfig.currency} {(item.price * item.quantity).toFixed(2)}
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-neutral-400 font-normal ml-1">
                            ({storeConfig.currency}{item.price.toFixed(2)} c/u)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-neutral-400 hover:text-rose-600 transition cursor-pointer p-1"
                        title="Eliminar este artículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center bg-white border border-neutral-200 rounded-lg p-0.5 shadow-2xs">
                        <button
                          onClick={() => updateCartQty(item.cartItemId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 rounded transition cursor-pointer disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}

              {/* Upselling / Cross-selling block inside Cart */}
              {cart.length > 0 && upsellItems.length > 0 && (
                <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {activePresetKey === "fashion" ? "Completa tu look" : "Completa tu pedido"}
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-400">Sugeridos para ti</span>
                  </div>
                  <div className="space-y-2">
                    {upsellItems.map((up) => (
                      <div
                        key={up.id}
                        className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={up.imageUrl}
                            alt={up.name}
                            className="w-10 h-10 rounded-lg object-cover bg-neutral-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-neutral-900 truncate">
                              {up.name}
                            </div>
                            <div className="text-[11px] font-mono font-semibold text-neutral-500">
                              + {storeConfig.currency}{up.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(up, up.options?.[0] || null, 1)}
                          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Sumar</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer & Checkout Action */}
            {cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-100 bg-neutral-50/70 space-y-3 pb-[calc(1.2rem+env(safe-area-inset-bottom,0px))]">
                {/* Optional Feature: Coupons Block */}
                {features.coupons && (
                  <div className="pt-1 pb-2 border-b border-neutral-200/60">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cupón: <strong>{appliedCoupon.code}</strong></span>
                          <span className="text-emerald-700 font-bold ml-1">
                            (-{storeConfig.currency}{discountAmount.toFixed(2)})
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs text-neutral-400 hover:text-rose-600 transition cursor-pointer p-1"
                          title="Quitar cupón"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : showCouponInput ? (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            placeholder="Ej. BIENVENIDA10"
                            className="w-full pl-8 pr-2 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs uppercase font-semibold focus:outline-none focus:ring-1 focus:ring-neutral-900"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
                        >
                          Aplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCouponInput(false)}
                          className="px-2 py-1.5 text-neutral-400 hover:text-neutral-600 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowCouponInput(true)}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 cursor-pointer py-0.5 transition"
                      >
                        <Tag className="w-3.5 h-3.5 text-amber-500" />
                        <span>¿Tienes un cupón de descuento?</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Subtotals & Calculations */}
                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal de productos:</span>
                    <span className="font-semibold text-neutral-900">
                      {storeConfig.currency} {cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  {features.coupons && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Descuento aplicado:</span>
                      <span>-{storeConfig.currency} {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Costo de entrega:
                    </span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Calculado al elegir entrega
                    </span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                    <span>Total estimado:</span>
                    <span className="text-base font-mono tabular-nums">
                      {storeConfig.currency} {estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartCheckout}
                  className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continuar al Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
