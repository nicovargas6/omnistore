import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  ArrowUpDown,
  Filter
} from "lucide-react";
import ProductFormModal from "./ProductFormModal";
import { toast } from "sonner";

export default function ProductManager() {
  const { 
    products, 
    categories, 
    deleteProduct, 
    addProduct, 
    updateStock, 
    storeConfig 
  } = useStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'critical' | 'out'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) ||
                          prod.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;
    const matchesStock = stockFilter === "all" ||
                         (stockFilter === "critical" && prod.stock <= 5) ||
                         (stockFilter === "out" && prod.stock === 0);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDuplicate = (prod) => {
    const duplicated = {
      ...prod,
      name: `${prod.name} (Copia)`,
      stock: Math.max(1, Math.floor(prod.stock / 2)),
    };
    addProduct(duplicated);
    toast.success(`Copia creada de "${prod.name}"`);
  };

  const handleDelete = (prod) => {
    if (confirm(`¿Estás seguro de eliminar "${prod.name}" del inventario?`)) {
      deleteProduct(prod.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Control de Inventario & Catálogo
          </h2>
          <p className="text-xs text-neutral-500">
            {products.length} productos registrados en {storeConfig.name}
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Nuevo Producto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
        </div>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setStockFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              stockFilter === "all"
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
          >
            Todos ({products.length})
          </button>
          <button
            onClick={() => setStockFilter("critical")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border flex items-center gap-1 ${
              stockFilter === "critical"
                ? "bg-amber-500 text-neutral-950 border-amber-600 font-bold"
                : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Stock Crítico ({lowStockCount + outOfStockCount})</span>
          </button>
          <button
            onClick={() => setStockFilter("out")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              stockFilter === "out"
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
            }`}
          >
            Agotados ({outOfStockCount})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-neutral-50 border border-neutral-200 text-xs font-medium py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
          >
            <option value="all">Todas las categorías ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Precio Venta</th>
                <th className="py-3 px-4">Costo / Margen</th>
                <th className="py-3 px-4">Stock en Almacén</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>No se encontraron productos con estos criterios.</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const margin = prod.price > 0 && prod.costPrice > 0
                    ? (((prod.price - prod.costPrice) / prod.price) * 100).toFixed(0)
                    : null;
                  const isOutOfStock = prod.stock <= 0;
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;

                  return (
                    <tr key={prod.id} className="hover:bg-neutral-50/70 transition">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                          </div>
                          <div className="max-w-xs">
                            <span className="font-bold text-neutral-900 block truncate">
                              {prod.name}
                            </span>
                            <span className="text-[11px] text-neutral-400 block truncate">
                              {prod.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-medium text-[11px]">
                          {prod.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-neutral-900">
                        {storeConfig.currency} {prod.price.toFixed(2)}
                      </td>

                      {/* Cost / Margin */}
                      <td className="py-3 px-4 text-neutral-500">
                        {prod.costPrice > 0 ? (
                          <div>
                            <span>{storeConfig.currency} {prod.costPrice.toFixed(2)}</span>
                            {margin && (
                              <span className="ml-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1 rounded">
                                +{margin}%
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Stock Level with inline adjust */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={prod.stock}
                            onChange={(e) => updateStock(prod.id, e.target.value)}
                            className={`w-16 px-2 py-1 rounded-lg border text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
                              isOutOfStock
                                ? "bg-rose-50 border-rose-200 text-rose-700"
                                : isLowStock
                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                : "bg-neutral-50 border-neutral-200 text-neutral-900"
                            }`}
                          />
                          <span className="text-[11px]">
                            {isOutOfStock ? (
                              <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                                <AlertTriangle className="w-3 h-3" /> Bajo stock
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Ok
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(prod)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                            title="Duplicar producto"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />
    </div>
  );
}
