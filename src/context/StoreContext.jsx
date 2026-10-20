import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { BUSINESS_PRESETS, INITIAL_ORDERS, DEFAULT_FEATURES, INITIAL_COUPONS } from "../data/presets";
import { parseOptionExtraPrice } from "../utils/pricing";
import { playOrderChime } from "../utils/audio";
import { toast } from "sonner";

const StoreContext = createContext();

const STORAGE_KEY = "omnistore_prototype_v3";

export function StoreProvider({ children }) {
  // Load saved state or default to restaurant preset
  const [activePresetKey, setActivePresetKey] = useState("restaurant");
  const [storeConfig, setStoreConfig] = useState(BUSINESS_PRESETS.restaurant);
  const [categories, setCategories] = useState(BUSINESS_PRESETS.restaurant.categories);
  const [products, setProducts] = useState(BUSINESS_PRESETS.restaurant.products);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useState([]);

  // Feature Flags (Can be turned on/off per business by the admin)
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Navigation / UI States
  const [viewMode, setViewMode] = useState("storefront"); // 'storefront' | 'admin'
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard"); // 'dashboard' | 'products' | 'orders' | 'categories' | 'customizer'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Modals for new modules
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderCode, setTrackingOrderCode] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState(null);
  const [isAiSimulatorOpen, setIsAiSimulatorOpen] = useState(false);
  const [aiAgentConfig, setAiAgentConfig] = useState({
    name: "Aura Concierge IA",
    role: "Asistente Virtual & Ventas",
    tone: "amable, servicial y profesional",
    welcomeMessage: "¡Hola! Soy el asistente virtual inteligente. ¿En qué te puedo ayudar hoy? Conozco todo el catálogo, precios, horarios y zonas de envío.",
  });

  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);

  const toggleSoundAlerts = () => {
    setSoundAlertsEnabled((prev) => {
      const next = !prev;
      if (next) {
        playOrderChime();
        toast.success("🔔 Alertas sonoras activadas para nuevos pedidos.");
      } else {
        toast.info("🔇 Alertas sonoras silenciadas.");
      }
      return next;
    });
  };

  // Compute live open/closed status based on configured business hours
  const isStoreOpen = useMemo(() => {
    const hours = storeConfig.businessHours || {
      enabled: true,
      openTime: "11:00",
      closeTime: "23:00",
      days: "Lunes a Domingo",
      statusOverride: "auto",
    };

    if (!hours.enabled) return true;
    if (hours.statusOverride === "open") return true;
    if (hours.statusOverride === "closed") return false;

    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const [openH, openM] = (hours.openTime || "11:00").split(":").map(Number);
      const [closeH, closeM] = (hours.closeTime || "23:00").split(":").map(Number);
      const openMinutes = openH * 60 + (openM || 0);
      const closeMinutes = closeH * 60 + (closeM || 0);

      if (closeMinutes > openMinutes) {
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      } else {
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }
    } catch {
      return true;
    }
  }, [storeConfig.businessHours]);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.activePresetKey) setActivePresetKey(parsed.activePresetKey);
        if (parsed.storeConfig) setStoreConfig(parsed.storeConfig);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.cart) setCart(parsed.cart);
        if (parsed.features) setFeatures(parsed.features);
        if (parsed.coupons) setCoupons(parsed.coupons);
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        activePresetKey,
        storeConfig,
        categories,
        products,
        orders,
        cart,
        features,
        coupons,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Failed to save local storage state", e);
    }
  }, [activePresetKey, storeConfig, categories, products, orders, cart, features, coupons]);

  // Toggle optional modules
  const toggleFeature = (featureKey) => {
    setFeatures((prev) => {
      const updated = { ...prev, [featureKey]: !prev[featureKey] };
      const labels = {
        coupons: "Cupones de Descuento",
        thermalReceipts: "Impresión de Tickets Térmicos",
        orderTracking: "Seguimiento de Pedido en Vivo",
        whatsappAiAgent: "Agente IA de WhatsApp",
      };
      if (updated[featureKey]) {
        toast.success(`Módulo activado: ${labels[featureKey] || featureKey}`);
      } else {
        toast.info(`Módulo desactivado: ${labels[featureKey] || featureKey}`);
      }
      return updated;
    });
  };

  // Switch Business Preset (e.g. Restaurante -> Ropa -> Ferretería -> Objetos)
  const switchBusinessPreset = (presetKey) => {
    const preset = BUSINESS_PRESETS[presetKey];
    if (!preset) return;

    setActivePresetKey(presetKey);
    setStoreConfig(preset);
    setCategories(preset.categories);
    setProducts(preset.products);
    setCart([]); // Clear cart when switching business models
    setAppliedCoupon(null);

    toast.success(`Plantilla cambiada a: ${preset.name}`, {
      description: `Diseño, categorías y productos adaptados para ${preset.badge}.`,
    });
  };

  // Reset everything to current preset defaults
  const resetToDefaults = () => {
    const preset = BUSINESS_PRESETS[activePresetKey] || BUSINESS_PRESETS.restaurant;
    setStoreConfig(preset);
    setCategories(preset.categories);
    setProducts(preset.products);
    setOrders(INITIAL_ORDERS);
    setCart([]);
    setFeatures(DEFAULT_FEATURES);
    setCoupons(INITIAL_COUPONS);
    setAppliedCoupon(null);
    toast.info("Datos restablecidos a los valores iniciales de demostración.");
  };

  // Update store configuration (branding, hero, logo, phone, colors)
  const updateStoreConfig = (newConfig) => {
    setStoreConfig((prev) => ({ ...prev, ...newConfig }));
    toast.success("Ajustes de tienda guardados correctamente.");
  };

  // Category CRUD
  const addCategory = (categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;
    if (categories.includes(trimmed)) {
      toast.error("Esta categoría ya existe.");
      return false;
    }
    setCategories((prev) => [...prev, trimmed]);
    toast.success(`Categoría "${trimmed}" agregada.`);
    return true;
  };

  const renameCategory = (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed || oldName === trimmed) return;
    setCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p))
    );
    toast.success(`Categoría actualizada a "${trimmed}".`);
  };

  const deleteCategory = (categoryName) => {
    if (categories.length <= 1) {
      toast.error("Debe existir al menos una categoría en la tienda.");
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== categoryName));
    const fallbackCategory = categories.find((c) => c !== categoryName) || "General";
    setProducts((prev) =>
      prev.map((p) => (p.category === categoryName ? { ...p, category: fallbackCategory } : p))
    );
    toast.info(`Categoría eliminada. Los productos se reasignaron a "${fallbackCategory}".`);
  };

  // Product CRUD
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      stock: Number(productData.stock) || 0,
      price: Number(productData.price) || 0,
      costPrice: Number(productData.costPrice) || 0,
      comparePrice: productData.comparePrice ? Number(productData.comparePrice) : null,
      tags: Array.isArray(productData.tags) ? productData.tags : (productData.tags ? productData.tags.split(",").map(t => t.trim()) : []),
      options: Array.isArray(productData.options) ? productData.options : (productData.options ? productData.options.split(",").map(o => o.trim()) : [])
    };
    setProducts((prev) => [newProduct, ...prev]);
    toast.success(`Producto "${newProduct.name}" publicado en el catálogo.`);
  };

  const updateProduct = (id, updatedData) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    toast.success("Producto modificado correctamente.");
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.info("Producto eliminado del inventario.");
  };

  const updateStock = (id, newStock) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, Number(newStock)) } : p))
    );
  };

  // Cart operations
  const addToCart = (product, selectedOption = null, quantity = 1) => {
    if (product.stock <= 0) {
      toast.error("Este producto está agotado actualmente.");
      return;
    }

    const defaultOption = selectedOption || (product.options && product.options.length > 0 ? product.options[0] : null);
    const cartItemId = `${product.id}-${defaultOption || "default"}`;
    const extraPrice = parseOptionExtraPrice(defaultOption);
    const effectiveUnitPrice = product.price + extraPrice;

    // Check existing item outside functional updater to avoid double-toasts in React StrictMode
    const existing = cart.find((item) => item.cartItemId === cartItemId);
    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (nextQty > product.stock) {
        toast.warning(`Solo hay ${product.stock} unidades disponibles en inventario.`);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: nextQty } : item
        )
      );
      toast.success(`Añadido +${quantity} al carrito`);
    } else {
      setCart((prev) => [
        ...prev,
        {
          ...product,
          price: effectiveUnitPrice,
          basePrice: product.price,
          extraPrice: extraPrice,
          cartItemId,
          selectedOption: defaultOption,
          quantity: Math.min(quantity, product.stock),
        },
      ]);
      toast.success(`"${product.name}" añadido al carrito`);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartQty = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          const targetStock = item.stock || 999;
          const finalQty = Math.min(newQty, targetStock);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  // Device coupon usage tracking
  const getDeviceCouponUsage = () => {
    try {
      const stored = localStorage.getItem("omnistore_coupon_device_usage");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  };

  const recordDeviceCouponUsage = (code) => {
    try {
      const usage = getDeviceCouponUsage();
      usage[code] = (usage[code] || 0) + 1;
      localStorage.setItem("omnistore_coupon_device_usage", JSON.stringify(usage));
    } catch (e) {}
  };

  // Coupon Engine Operations
  const applyCoupon = (couponCode) => {
    if (!features.coupons) {
      toast.error("El módulo de cupones se encuentra inactivo.");
      return false;
    }

    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code.toUpperCase() === cleanCode && c.active);

    if (!coupon) {
      toast.error("Cupón no válido o expirado.");
      return false;
    }

    // Check device usage limit
    const deviceUsage = getDeviceCouponUsage();
    const usedTimes = deviceUsage[cleanCode] || 0;
    const maxUses = coupon.maxUsesPerDevice !== undefined ? coupon.maxUsesPerDevice : 1;
    if (maxUses > 0 && usedTimes >= maxUses) {
      toast.warning(
        `Ya utilizaste este cupón el máximo permitido (${maxUses} vez${maxUses > 1 ? "es" : ""} por dispositivo).`
      );
      return false;
    }

    if (coupon.minPurchase > 0 && cartSubtotal < coupon.minPurchase) {
      toast.warning(
        `Este cupón requiere una compra mínima de ${storeConfig.currency} ${coupon.minPurchase.toFixed(2)}.`
      );
      return false;
    }

    let calculatedDiscount = 0;
    if (coupon.discountType === "percent") {
      calculatedDiscount = (cartSubtotal * coupon.value) / 100;
    } else if (coupon.discountType === "fixed") {
      calculatedDiscount = Math.min(coupon.value, cartSubtotal);
    } else if (coupon.discountType === "free_shipping") {
      calculatedDiscount = storeConfig.deliveryCost || 0;
    }

    setAppliedCoupon({
      ...coupon,
      calculatedDiscount,
    });

    toast.success(`¡Cupón "${coupon.code}" aplicado con éxito!`, {
      description: coupon.description,
    });
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Cupón removido del carrito.");
  };

  const addCoupon = (couponData) => {
    const cleanCode = couponData.code.trim().toUpperCase();
    if (coupons.some((c) => c.code.toUpperCase() === cleanCode)) {
      toast.error("Ya existe un cupón con este código.");
      return;
    }
    const newCoupon = {
      ...couponData,
      code: cleanCode,
      value: Number(couponData.value) || 0,
      minPurchase: Number(couponData.minPurchase) || 0,
      maxUsesPerDevice: Number(couponData.maxUsesPerDevice) || 1,
      active: true,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    toast.success(`Cupón ${cleanCode} creado.`);
  };

  const deleteCoupon = (code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
    if (appliedCoupon?.code === code) setAppliedCoupon(null);
    toast.info(`Cupón ${code} eliminado.`);
  };

  const toggleCouponStatus = (code) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  // Discount calculation
  const discountAmount = useMemo(() => {
    if (!appliedCoupon || !features.coupons) return 0;
    if (appliedCoupon.discountType === "percent") {
      return (cartSubtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.discountType === "fixed") {
      return Math.min(appliedCoupon.value, cartSubtotal);
    } else if (appliedCoupon.discountType === "free_shipping") {
      return storeConfig.deliveryCost || 0;
    }
    return 0;
  }, [appliedCoupon, cartSubtotal, features.coupons, storeConfig.deliveryCost]);

  // Order Placement
  const placeOrder = (orderData) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const isDelivery =
      orderData.orderType.toLowerCase().includes("delivery") ||
      orderData.orderType.toLowerCase().includes("envío") ||
      orderData.orderType.toLowerCase().includes("camión");

    const baseDelivery = isDelivery ? storeConfig.deliveryCost || 0 : 0;
    const finalDelivery = appliedCoupon?.discountType === "free_shipping" ? 0 : baseDelivery;
    const totalOrder = Math.max(0, cartSubtotal - discountAmount + finalDelivery);

    const newOrder = {
      id: `ord-${Date.now()}`,
      code: `#ORD-${orderNumber}`,
      createdAt: new Date().toISOString(),
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress || "Retiro en local",
      deliveryCoords: orderData.deliveryCoords || null,
      googleMapsUrl: orderData.googleMapsUrl || (orderData.deliveryCoords ? `https://www.google.com/maps?q=${orderData.deliveryCoords.lat},${orderData.deliveryCoords.lng}` : null),
      orderType: orderData.orderType,
      paymentMethod: orderData.paymentMethod,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        option: item.selectedOption,
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      deliveryFee: finalDelivery,
      total: totalOrder,
      status: orderData.status || (orderData.paymentStatus === "pagado" ? "preparando" : "pendiente"),
      paymentStatus: orderData.paymentStatus || "pendiente",
      paidAt: orderData.paidAt || null,
      notes: orderData.notes || "",
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const boughtItem = cart.find((c) => c.id === prod.id);
        if (boughtItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - boughtItem.quantity),
          };
        }
        return prod;
      })
    );

    // Save order
    if (appliedCoupon) {
      recordDeviceCouponUsage(appliedCoupon.code);
    }
    setOrders((prev) => [newOrder, ...prev]);
    setCompletedOrder(newOrder);
    clearCart();
    setIsCheckoutOpen(false);

    // Audio chime for admin/kitchen
    if (soundAlertsEnabled) {
      playOrderChime();
    }

    return newOrder;
  };

  // Order Management (Admin)
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    toast.success(`Estado del pedido actualizado a: ${newStatus.toUpperCase()}`);
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    toast.info("Pedido archivado/eliminado.");
  };

  // Helpers to trigger modals from anywhere
  const openTracking = (orderCodeOrObj) => {
    if (typeof orderCodeOrObj === "string") {
      setTrackingOrderCode(orderCodeOrObj);
    } else if (orderCodeOrObj?.code) {
      setTrackingOrderCode(orderCodeOrObj.code);
    } else {
      setTrackingOrderCode(null);
    }
    setIsTrackingOpen(true);
  };

  const openReceipt = (order) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
  };

  return (
    <StoreContext.Provider
      value={{
        activePresetKey,
        switchBusinessPreset,
        resetToDefaults,
        storeConfig,
        updateStoreConfig,
        categories,
        addCategory,
        renameCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartSubtotal,
        cartCount,
        orders,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        viewMode,
        setViewMode,
        activeAdminTab,
        setActiveAdminTab,
        isCartOpen,
        setIsCartOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        isCheckoutOpen,
        setIsCheckoutOpen,
        completedOrder,
        setCompletedOrder,
        // Features & Toggles
        features,
        toggleFeature,
        // Coupons
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        // Tracking
        isTrackingOpen,
        setIsTrackingOpen,
        trackingOrderCode,
        openTracking,
        // Receipt
        isReceiptOpen,
        setIsReceiptOpen,
        receiptOrder,
        openReceipt,
        // AI WhatsApp Agent
        isAiSimulatorOpen,
        setIsAiSimulatorOpen,
        aiAgentConfig,
        setAiAgentConfig,
        // Sound alerts & Store Hours
        soundAlertsEnabled,
        toggleSoundAlerts,
        playOrderBell: playOrderChime,
        isStoreOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
