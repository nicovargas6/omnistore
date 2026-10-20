import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";

export default function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalProductsCount,
  categoryCounts
}) {
  return (
    <div className="mb-6 space-y-4">
      {/* Search and Sort row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, ingrediente o código..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-neutral-500 font-medium hidden md:inline">Ordenar por:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold py-2.5 pl-3.5 pr-8 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="featured">✨ Destacados</option>
              <option value="price-asc">💵 Precio: Menor a Mayor</option>
              <option value="price-desc">💎 Precio: Mayor a Menor</option>
              <option value="name">🔤 Nombre Alfabético</option>
              <option value="stock">📦 Mayor Disponibilidad</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories horizontal scroll pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectCategory("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
            selectedCategory === "all"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200"
          }`}
        >
          Todos ({totalProductsCount})
        </button>

        {categories.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-200"
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
