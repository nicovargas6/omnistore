import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { X, Image as ImageIcon, Sparkles, DollarSign, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImagePickerModal from "./ImagePickerModal";
import { toast } from "sonner";

export default function ProductFormModal({ isOpen, onClose, productToEdit }) {
  const { categories, addProduct, updateProduct, storeConfig } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "General",
    price: "",
    comparePrice: "",
    costPrice: "",
    stock: 10,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
    description: "",
    tags: "",
    optionsLabel: "Variante / Opciones",
    options: "",
    isFeatured: true,
  });

  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || "",
        category: productToEdit.category || categories[0] || "General",
        price: productToEdit.price !== undefined ? productToEdit.price : "",
        comparePrice: productToEdit.comparePrice !== undefined && productToEdit.comparePrice !== null ? productToEdit.comparePrice : "",
        costPrice: productToEdit.costPrice !== undefined && productToEdit.costPrice !== null ? productToEdit.costPrice : "",
        stock: productToEdit.stock !== undefined ? productToEdit.stock : 10,
        imageUrl: productToEdit.imageUrl || "",
        description: productToEdit.description || "",
        tags: Array.isArray(productToEdit.tags) ? productToEdit.tags.join(", ") : (productToEdit.tags || ""),
        optionsLabel: productToEdit.optionsLabel || "Opciones",
        options: Array.isArray(productToEdit.options) ? productToEdit.options.join(", ") : (productToEdit.options || ""),
        isFeatured: productToEdit.isFeatured !== undefined ? productToEdit.isFeatured : true,
      });
    } else {
      setFormData({
        name: "",
        category: categories[0] || "General",
        price: "",
        comparePrice: "",
        costPrice: "",
        stock: 15,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        description: "",
        tags: "Novedad, Calidad Premium",
        optionsLabel: "Variante",
        options: "Opción Estándar, Opción Especial",
        isFeatured: true,
      });
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") {
      toast.error("El nombre y el precio son obligatorios.");
      return;
    }

    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
      stock: parseInt(formData.stock, 10) || 0,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      options: formData.options ? formData.options.split(",").map((o) => o.trim()).filter(Boolean) : [],
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }
    onClose();
  };

  return (
    <>
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

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  {productToEdit ? "Editar Artículo" : "Nuevo Artículo"}
                </span>
                <h3 className="text-lg font-bold text-neutral-900">
                  {productToEdit ? `Modificar: ${productToEdit.name}` : "Publicar Producto en Catálogo"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer border border-neutral-200 shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Nombre del Producto / Plato / Material *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Bife de Chorizo Angus / Camiseta Boxy Fit / Taladro 20V"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition"
                />
              </div>

              {/* Category & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Destacado en Portada
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-900 accent-neutral-900 cursor-pointer"
                      />
                      <span>Mostrar en sección de destacados</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Price, Compare Price, Cost, Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Precio Venta ({storeConfig.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="25.00"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Precio Anterior ({storeConfig.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    placeholder="30.00"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Costo Base ({storeConfig.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="12.00"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Image URL with Easy Image Picker Trigger */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Imagen del Producto (URL)</span>
                  <button
                    type="button"
                    onClick={() => setIsImagePickerOpen(true)}
                    className="text-neutral-900 hover:underline flex items-center gap-1 font-semibold normal-case text-xs cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Seleccionar de Galería / Unsplash</span>
                  </button>
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex-shrink-0">
                    <img
                      src={formData.imageUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Descripción Comercial / Ingredientes / Ficha Técnica
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre materiales, dimensiones, acompañamientos, cocción..."
                  className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                />
              </div>

              {/* Tags & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Etiquetas / Tags (Separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Ej. Vegano, Oferta, Top Ventas"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Opciones / Talles / Sabores (Separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    placeholder="Ej. Talle S, Talle M, Talle L"
                    className="w-full px-3.5 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer active:scale-98"
                >
                  {productToEdit ? "Guardar Modificaciones" : "Crear Producto"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Image Picker Sub-Modal */}
      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentImage={formData.imageUrl}
        onSelectImage={(url) => setFormData({ ...formData, imageUrl: url })}
      />
    </>
  );
}
