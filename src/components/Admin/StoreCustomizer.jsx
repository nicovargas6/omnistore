import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { BUSINESS_PRESETS } from "../../data/presets";
import { 
  Sparkles, 
  Store, 
  Image as ImageIcon, 
  Phone, 
  MapPin, 
  DollarSign, 
  RotateCcw, 
  Save, 
  CheckCircle2,
  ExternalLink,
  Tag,
  Printer,
  Clock,
  Plus,
  Trash2,
  Layers,
  Bot,
  Building2,
  CreditCard,
  ShieldCheck
} from "lucide-react";
import ImagePickerModal from "./ImagePickerModal";
import { toast } from "sonner";

export default function StoreCustomizer() {
  const { 
    storeConfig, 
    updateStoreConfig, 
    activePresetKey, 
    switchBusinessPreset, 
    resetToDefaults,
    setViewMode,
    features,
    toggleFeature,
    coupons,
    addCoupon,
    deleteCoupon,
    toggleCouponStatus,
    setIsAiSimulatorOpen
  } = useStore();

  const [formData, setFormData] = useState({
    name: storeConfig.name,
    legalName: storeConfig.legalName || "Aura Bistró & Cantina S.R.L.",
    taxId: storeConfig.taxId || "NIT 1028475021",
    adminPin: storeConfig.adminPin || "1234",
    billingEnabled: storeConfig.billingEnabled !== undefined ? storeConfig.billingEnabled : true,
    tagline: storeConfig.tagline,
    heroBadge: storeConfig.heroBadge || "",
    logoUrl: storeConfig.logoUrl,
    bannerUrl: storeConfig.bannerUrl,
    phoneWhatsApp: storeConfig.phoneWhatsApp,
    address: storeConfig.address,
    currency: storeConfig.currency,
    deliveryCost: storeConfig.deliveryCost || 0,
    bankDetails: storeConfig.bankDetails || {
      bankName: "Banco Nacional de Bolivia (BNB)",
      accountHolder: "Alex Valenzuela - OmniStore",
      accountNumber: "150-0894213-01",
      accountType: "Caja de Ahorro en Bolivianos (BOB)",
      notificationEmail: "alertas.pagos@miempresa.bo",
    },
    businessHours: storeConfig.businessHours || {
      enabled: true,
      openTime: "11:00",
      closeTime: "23:00",
      days: "Lunes a Domingo",
      statusOverride: "auto", // 'auto' | 'open' | 'closed'
    },
  });

  const [activeImageField, setActiveImageField] = useState(null); // 'logoUrl' | 'bannerUrl' | null

  // New coupon form state
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState("percent");
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponMin, setNewCouponMin] = useState("");
  const [newCouponMaxUses, setNewCouponMaxUses] = useState(1);
  const [newCouponDesc, setNewCouponDesc] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    updateStoreConfig({
      ...formData,
      deliveryCost: parseFloat(formData.deliveryCost) || 0,
    });
  };

  const handlePresetClick = (presetKey) => {
    switchBusinessPreset(presetKey);
    const p = BUSINESS_PRESETS[presetKey];
    setFormData((prev) => ({
      ...prev,
      name: p.name,
      legalName: p.legalName || p.name,
      taxId: p.taxId || "NIT 1028475021",
      adminPin: p.adminPin || "1234",
      billingEnabled: p.billingEnabled !== undefined ? p.billingEnabled : true,
      tagline: p.tagline,
      heroBadge: p.heroBadge || "",
      logoUrl: p.logoUrl,
      bannerUrl: p.bannerUrl,
      phoneWhatsApp: p.phoneWhatsApp,
      address: p.address,
      currency: p.currency,
      deliveryCost: p.deliveryCost || 0,
      bankDetails: p.bankDetails || prev.bankDetails,
      businessHours: p.businessHours || prev.businessHours,
    }));
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode.trim()) {
      toast.error("El código del cupón es obligatorio.");
      return;
    }
    addCoupon({
      code: newCouponCode,
      discountType: newCouponType,
      value: parseFloat(newCouponValue) || 0,
      minPurchase: parseFloat(newCouponMin) || 0,
      maxUsesPerDevice: parseInt(newCouponMaxUses, 10) || 1,
      description: newCouponDesc || `Descuento ${newCouponCode}`,
    });
    setNewCouponCode("");
    setNewCouponValue("");
    setNewCouponMin("");
    setNewCouponMaxUses(1);
    setNewCouponDesc("");
  };

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Personalización de la Empresa & Módulos
          </h2>
          <p className="text-xs text-neutral-500">
            Modifica la identidad de marca, activa módulos opcionales y adapta cada función a tu cliente
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("storefront")}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <span>Ver Tienda</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Restablecer todo a los datos iniciales de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Demo</span>
          </button>
        </div>
      </div>

      {/* Preset Archetypes Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            1. Cambiar Giro de Negocio / Arquetipo con 1 Clic:
          </h3>
        </div>
        <p className="text-xs text-neutral-500">
          Usa estas plantillas preconfiguradas para mostrar a tus clientes cómo se adapta la tienda a cualquier rubro:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {Object.values(BUSINESS_PRESETS).map((preset) => {
            const isSelected = preset.id === activePresetKey;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-md ring-2 ring-neutral-900"
                    : "border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-neutral-300 text-neutral-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isSelected ? "bg-white/20 text-white" : "bg-neutral-200/60 text-neutral-700"
                    }`}>
                      {preset.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm mt-1">{preset.name}</h4>
                  <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                    isSelected ? "text-neutral-300" : "text-neutral-500"
                  }`}>
                    {preset.tagline}
                  </p>
                </div>
                <div className={`mt-3 pt-2 border-t text-[10px] flex justify-between font-mono ${
                  isSelected ? "border-neutral-700 text-neutral-300" : "border-neutral-200 text-neutral-400"
                }`}>
                  <span>{preset.products.length} productos</span>
                  <span>{preset.categories.length} categorías</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Flags & Modular Settings */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-700" />
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              2. Módulos Adicionales (Activar / Desactivar según el Cliente)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Personaliza la experiencia sin saturar</span>
        </div>

        <p className="text-xs text-neutral-500">
          Si tu cliente no necesita alguna de estas opciones, desactívala con un interruptor y desaparecerá por completo de la tienda sin dejar rastro:
        </p>

        {/* 4 Module Cards with Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Module 1: Coupons */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            features.coupons ? "bg-emerald-50/50 border-emerald-300" : "bg-neutral-50 border-neutral-200 opacity-75"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Tag className="w-4 h-4" />
                </div>
                {/* Switch */}
                <button
                  type="button"
                  onClick={() => toggleFeature("coupons")}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.coupons ? "bg-emerald-600" : "bg-neutral-300"
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    features.coupons ? "translate-x-6" : "translate-x-1"
                  } mt-1`} />
                </button>
              </div>
              <h4 className="font-bold text-xs text-neutral-900">Cupones de Descuento</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Permite a los clientes ingresar códigos con límites por dispositivo en el carrito.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] font-bold text-neutral-600">
              Estado: <span className={features.coupons ? "text-emerald-700" : "text-neutral-400"}>
                {features.coupons ? "Activo en Tienda" : "Desactivado / Oculto"}
              </span>
            </div>
          </div>

          {/* Module 2: Thermal Receipts */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            features.thermalReceipts ? "bg-blue-50/50 border-blue-300" : "bg-neutral-50 border-neutral-200 opacity-75"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Printer className="w-4 h-4" />
                </div>
                {/* Switch */}
                <button
                  type="button"
                  onClick={() => toggleFeature("thermalReceipts")}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.thermalReceipts ? "bg-blue-600" : "bg-neutral-300"
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    features.thermalReceipts ? "translate-x-6" : "translate-x-1"
                  } mt-1`} />
                </button>
              </div>
              <h4 className="font-bold text-xs text-neutral-900">Tickets Térmicos (80mm)</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Genera e imprime comandas de cocina o mostrador optimizadas en 80mm sin diálogo cliente.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] font-bold text-neutral-600">
              Estado: <span className={features.thermalReceipts ? "text-blue-700" : "text-neutral-400"}>
                {features.thermalReceipts ? "Activo en Panel" : "Desactivado / Oculto"}
              </span>
            </div>
          </div>

          {/* Module 3: Order Tracking */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            features.orderTracking ? "bg-amber-50/50 border-amber-300" : "bg-neutral-50 border-neutral-200 opacity-75"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-amber-600 shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                {/* Switch */}
                <button
                  type="button"
                  onClick={() => toggleFeature("orderTracking")}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.orderTracking ? "bg-amber-500" : "bg-neutral-300"
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    features.orderTracking ? "translate-x-6" : "translate-x-1"
                  } mt-1`} />
                </button>
              </div>
              <h4 className="font-bold text-xs text-neutral-900">Seguimiento en Vivo</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Barra de progreso de pedido (Recibido ➔ Cocina ➔ Camino ➔ Entregado) para clientes.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] font-bold text-neutral-600">
              Estado: <span className={features.orderTracking ? "text-amber-700" : "text-neutral-400"}>
                {features.orderTracking ? "Activo en Tienda" : "Desactivado / Oculto"}
              </span>
            </div>
          </div>

          {/* Module 4: WhatsApp AI Agent */}
          <div className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
            features.whatsappAiAgent ? "bg-emerald-50/60 border-emerald-300 shadow-2xs" : "bg-neutral-50 border-neutral-200 opacity-75"
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                {/* Switch */}
                <button
                  type="button"
                  onClick={() => toggleFeature("whatsappAiAgent")}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    features.whatsappAiAgent ? "bg-emerald-600" : "bg-neutral-300"
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform transform ${
                    features.whatsappAiAgent ? "translate-x-6" : "translate-x-1"
                  } mt-1`} />
                </button>
              </div>
              <h4 className="font-bold text-xs text-neutral-900">Agente IA de WhatsApp</h4>
              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                Conectado a <span className="font-semibold text-neutral-800">{formData.phoneWhatsApp}</span>. Responde dudas, catálogo y permite a caja intervenir.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
              <span className="text-[10px] font-bold text-neutral-600">
                Estado: <span className={features.whatsappAiAgent ? "text-emerald-700" : "text-neutral-400"}>
                  {features.whatsappAiAgent ? "Activo" : "Inactivo"}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsAiSimulatorOpen(true)}
                className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Abrir simulador interactivo de WhatsApp"
              >
                <span>🧪 Probar IA</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coupon Manager (Only visible when coupons module is enabled) */}
        {features.coupons && (
          <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-600" />
              <span>Administrar Cupones Activos ({coupons.length})</span>
            </h4>

            {/* Coupons List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {coupons.map((c) => (
                <div key={c.code} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-neutral-900">{c.code}</span>
                      <span className="text-[9px] bg-neutral-200/80 text-neutral-700 font-semibold px-1.5 py-0.5 rounded">
                        Máx: {c.maxUsesPerDevice || 1} uso{(c.maxUsesPerDevice || 1) > 1 ? "s" : ""} / disp.
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      {c.discountType === "percent" ? `${c.value}% OFF` : c.discountType === "fixed" ? `${storeConfig.currency}${c.value} OFF` : "Envío Gratis"}
                      {c.minPurchase > 0 && ` (Min: ${storeConfig.currency}${c.minPurchase})`}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteCoupon(c.code)}
                    className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer transition"
                    title="Eliminar cupón"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add coupon */}
            <form onSubmit={handleCreateCoupon} className="flex flex-wrap items-center gap-2 pt-2">
              <input
                type="text"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                placeholder="CÓDIGO (Ej. PROMO10)"
                className="w-36 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs uppercase font-bold focus:bg-white"
              />
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value)}
                className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium cursor-pointer"
              >
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ({storeConfig.currency})</option>
                <option value="free_shipping">Envío Gratis</option>
              </select>
              {newCouponType !== "free_shipping" && (
                <input
                  type="number"
                  step="0.5"
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(e.target.value)}
                  placeholder="Valor"
                  className="w-20 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white"
                />
              )}
              <input
                type="number"
                step="0.5"
                value={newCouponMin}
                onChange={(e) => setNewCouponMin(e.target.value)}
                placeholder="Mín. compra"
                className="w-24 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:bg-white"
              />
              <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-[10px] text-neutral-400 font-medium">Límite:</span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={newCouponMaxUses}
                  onChange={(e) => setNewCouponMaxUses(e.target.value)}
                  placeholder="1"
                  title="Máximo de usos permitidos por dispositivo del cliente"
                  className="w-10 text-xs font-bold text-neutral-800 bg-transparent focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400">/ disp.</span>
              </div>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-bold hover:bg-neutral-800 transition cursor-pointer"
              >
                + Crear Cupón
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Customizer Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-6">
        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-neutral-500" />
          <span>3. Información General & Estilo de la Empresa</span>
        </h3>

        {/* Name and Tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Nombre de la Empresa / Marca *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Insignia / Badge de Portada
            </label>
            <input
              type="text"
              value={formData.heroBadge}
              onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
              placeholder="Ej. 🍴 Pedidos en línea / ✨ Nueva Temporada"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Eslogan / Descripción Breve
          </label>
          <textarea
            rows={2}
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        {/* Visual Assets (Logo and Banner) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
          {/* Logo */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Logotipo (URL)</span>
              <button
                type="button"
                onClick={() => setActiveImageField("logoUrl")}
                className="text-neutral-900 hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Elegir imagen
              </button>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Foto de Portada / Banner Hero (URL)</span>
              <button
                type="button"
                onClick={() => setActiveImageField("bannerUrl")}
                className="text-neutral-900 hover:underline font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Elegir imagen
              </button>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
              <div className="w-14 h-10 rounded-xl overflow-hidden border border-neutral-200 bg-[#ecebe6] flex-shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={formData.bannerUrl}
                  alt="Banner preview"
                  className={`w-full h-full ${
                    formData.bannerUrl?.endsWith(".png") ? "object-contain" : "object-cover"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Commerce Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-100">
          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Teléfono WhatsApp Ventas *
            </label>
            <input
              type="text"
              required
              value={formData.phoneWhatsApp}
              onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Símbolo de Moneda *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white cursor-pointer"
            >
              <option value="$">$ (Dólares / Pesos)</option>
              <option value="€">€ (Euros)</option>
              <option value="S/">S/ (Soles Peruanos)</option>
              <option value="Bs">Bs (Bolivianos / Bolívares)</option>
              <option value="MXN$">MXN$ (Pesos Mexicanos)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Costo Base Entrega ({formData.currency})
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.deliveryCost}
              onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
            Dirección Física / Local / Zona de Cobertura
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        {/* 4. Bank Details for QR Simple */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>4. Datos de Cobro Bancario (Para QR Simple al Vender la Web)</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              0% Comisiones
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Configura aquí la cuenta del negocio que adquiere este sistema para que todos los pagos por QR ingresen directamente a su banco:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Banco Receptor *
              </label>
              <select
                value={formData.bankDetails?.bankName || "Banco Nacional de Bolivia (BNB)"}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white cursor-pointer"
              >
                <option value="Banco Nacional de Bolivia (BNB)">Banco Nacional de Bolivia (BNB)</option>
                <option value="Banco de Crédito de Bolivia (BCP)">Banco de Crédito de Bolivia (BCP)</option>
                <option value="Banco Unión">Banco Unión</option>
                <option value="Banco Mercantil Santa Cruz">Banco Mercantil Santa Cruz</option>
                <option value="Banco Bisa">Banco Bisa</option>
                <option value="Banco Ganadero">Banco Ganadero</option>
                <option value="Banco Sol">Banco Sol</option>
                <option value="Banco Fie">Banco Fie</option>
                <option value="Banco Económico">Banco Económico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Titular de la Cuenta *
              </label>
              <input
                type="text"
                value={formData.bankDetails?.accountHolder || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountHolder: e.target.value }
                })}
                placeholder="Ej. Juan Pérez / Restaurante SRL"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Número de Cuenta Bancaria *
              </label>
              <input
                type="text"
                value={formData.bankDetails?.accountNumber || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                })}
                placeholder="Ej. 150-12345678-01"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Correo de Alertas del Banco (Cloud Listener)
              </label>
              <input
                type="email"
                value={formData.bankDetails?.notificationEmail || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  bankDetails: { ...formData.bankDetails, notificationEmail: e.target.value }
                })}
                placeholder="Ej. pagos@minegocio.bo"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 5. Business Hours */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>5. Horarios de Atención del Local (Abierto / Cerrado en Vivo)</span>
            </h3>
            <span className="text-[11px] text-neutral-400">Control de pedidos fuera de turno</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Hora de Apertura
              </label>
              <input
                type="time"
                value={formData.businessHours?.openTime || "11:00"}
                onChange={(e) => setFormData({
                  ...formData,
                  businessHours: { ...formData.businessHours, openTime: e.target.value }
                })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Hora de Cierre
              </label>
              <input
                type="time"
                value={formData.businessHours?.closeTime || "23:00"}
                onChange={(e) => setFormData({
                  ...formData,
                  businessHours: { ...formData.businessHours, closeTime: e.target.value }
                })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Días de Atención
              </label>
              <input
                type="text"
                value={formData.businessHours?.days || "Lunes a Domingo"}
                onChange={(e) => setFormData({
                  ...formData,
                  businessHours: { ...formData.businessHours, days: e.target.value }
                })}
                placeholder="Ej. Martes a Domingo"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Estado Forzado / Manual
              </label>
              <select
                value={formData.businessHours?.statusOverride || "auto"}
                onChange={(e) => setFormData({
                  ...formData,
                  businessHours: { ...formData.businessHours, statusOverride: e.target.value }
                })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white cursor-pointer"
              >
                <option value="auto">🟢 Automático (por reloj)</option>
                <option value="open">🟢 Forzar Abierto Ahora</option>
                <option value="closed">🔴 Forzar Cerrado por Hoy</option>
              </select>
            </div>
          </div>
        </div>

        {/* 6. Legal & Tax Settings (Bolivia Compliance) */}
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>6. Seguridad y Datos Fiscales (Compliance Bolivia)</span>
            </h3>
            <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
              Protección y Facturación
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                PIN de Acceso al Panel Admin *
              </label>
              <input
                type="text"
                maxLength={8}
                value={formData.adminPin || "1234"}
                onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                placeholder="Ej. 1234"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">Protege los pedidos de miradas de clientes</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Razón Social Oficial (Titular)
              </label>
              <input
                type="text"
                value={formData.legalName || ""}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Ej. Inversiones Gastronómicas S.R.L."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                NIT / Identificación Tributaria
              </label>
              <input
                type="text"
                value={formData.taxId || ""}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="Ej. NIT 1028475021"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Billing Switch for the business */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-neutral-800">
                Habilitar Solicitud de Factura en el Checkout
              </div>
              <div className="text-[11px] text-neutral-500">
                Permite a los clientes solicitar factura ingresando su NIT/CI y Razón Social al hacer el pedido.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, billingEnabled: !formData.billingEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                formData.billingEnabled ? "bg-emerald-600" : "bg-neutral-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                  formData.billingEnabled ? "left-6.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes de la Empresa</span>
          </button>
        </div>
      </form>

      {/* Image Picker for logo or banner */}
      <ImagePickerModal
        isOpen={Boolean(activeImageField)}
        onClose={() => setActiveImageField(null)}
        currentImage={activeImageField ? formData[activeImageField] : ""}
        onSelectImage={(url) => {
          if (activeImageField) {
            setFormData({ ...formData, [activeImageField]: url });
          }
        }}
      />
    </div>
  );
}
