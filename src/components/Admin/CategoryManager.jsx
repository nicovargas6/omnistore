import React, { useState } from "react";
import { useStore } from "../../context/StoreContext";
import { Plus, Edit2, Trash2, Tags, Check, X, Layers } from "lucide-react";
import { toast } from "sonner";

export default function CategoryManager() {
  const { categories, addCategory, renameCategory, deleteCategory, products, storeConfig } = useStore();
  const [newCatName, setNewCatName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const ok = addCategory(newCatName);
    if (ok) setNewCatName("");
  };

  const handleStartRename = (cat) => {
    setEditingCategory(cat);
    setEditValue(cat);
  };

  const handleSaveRename = () => {
    if (!editValue.trim() || editValue === editingCategory) {
      setEditingCategory(null);
      return;
    }
    renameCategory(editingCategory, editValue);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Gestión de Categorías
        </h2>
        <p className="text-xs text-neutral-500">
          Organiza cómo tus clientes exploran tus productos en {storeConfig.name}
        </p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
        <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Nueva Categoría</span>
        </h3>
        <form onSubmit={handleAddCategory} className="flex gap-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ej. Postres de Autor / Calzado Deportivo / Herramientas Manuales..."
            className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer active:scale-98"
          >
            Agregar
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 flex justify-between items-center text-xs font-bold text-neutral-700 uppercase tracking-wider">
          <span>Categorías Activas ({categories.length})</span>
          <span>Productos Asociados</span>
        </div>

        <div className="divide-y divide-neutral-100">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category === cat).length;
            const isEditing = editingCategory === cat;

            return (
              <div
                key={cat}
                className="p-4 flex items-center justify-between gap-4 hover:bg-neutral-50/70 transition"
              >
                {isEditing ? (
                  <div className="flex items-center gap-2 flex-1 max-w-md">
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <button
                      onClick={handleSaveRename}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                      title="Guardar nombre"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="p-1.5 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-neutral-900 text-sm block">
                        {cat}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                    {count} {count === 1 ? "producto" : "productos"}
                  </span>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartRename(cat)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                        title="Renombrar categoría"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Eliminar categoría"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
