import React, { useState } from "react";
import { IMAGE_LIBRARY_PRESETS } from "../../data/presets";
import { X, Image as ImageIcon, Link, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImagePickerModal({ isOpen, onClose, onSelectImage, currentImage }) {
  const [activeTab, setActiveTab] = useState(IMAGE_LIBRARY_PRESETS[0].category);
  const [customUrl, setCustomUrl] = useState(currentImage || "");
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(currentImage || "");

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalUrl = customUrl.trim() || selectedPresetUrl;
    if (finalUrl) {
      onSelectImage(finalUrl);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm sm:text-base">
                  Selector & Galería de Imágenes
                </h3>
                <p className="text-xs text-neutral-500">
                  Selecciona una imagen de muestra o pega un enlace personalizado
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer border border-neutral-200 shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Custom URL Input */}
            <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Link className="w-3.5 h-3.5 text-neutral-500" />
                <span>Pega la URL de cualquier imagen web:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setSelectedPresetUrl(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 bg-white border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>

            {/* Presets by Category */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  O elige de nuestra galería sugerida:
                </span>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {IMAGE_LIBRARY_PRESETS.map((group) => (
                  <button
                    key={group.category}
                    onClick={() => setActiveTab(group.category)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex-shrink-0 ${
                      activeTab === group.category
                        ? "bg-neutral-900 text-white font-semibold shadow-xs"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {group.category}
                  </button>
                ))}
              </div>

              {/* Grid of image presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                {IMAGE_LIBRARY_PRESETS.find((g) => g.category === activeTab)?.images.map(
                  (item, idx) => {
                    const isSelected = selectedPresetUrl === item.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedPresetUrl(item.url);
                          setCustomUrl(item.url);
                        }}
                        className={`group relative aspect-4/3 rounded-xl overflow-hidden border-2 cursor-pointer transition ${
                          isSelected
                            ? "border-neutral-900 shadow-md ring-2 ring-neutral-900"
                            : "border-transparent hover:border-neutral-300"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate drop-shadow">
                            {item.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Preview Box */}
            {selectedPresetUrl && (
              <div className="flex items-center gap-3 p-3 bg-neutral-100/70 rounded-xl border border-neutral-200">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0">
                  <img
                    src={selectedPresetUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <span className="font-semibold text-neutral-800 block">Vista previa seleccionada</span>
                  <span className="text-neutral-500 truncate block text-[11px] font-mono">{selectedPresetUrl}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Aplicar Esta Imagen
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
