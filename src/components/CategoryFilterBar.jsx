import React from "react";
import { Search, X, ArrowUpDown } from "lucide-react";
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
      {/* Search and Sort row - Compact and single-row responsive */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, código..."
            className="w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2.5 bg-white border border-neutral-200 rounded-xl text-base sm:text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold py-2.5 pl-3 pr-7 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="featured">✨ Destacados</option>
              <option value="price-asc">💵 Menor precio</option>
              <option value="price-desc">💎 Mayor precio</option>
              <option value="name">🔤 Alfabético</option>
              <option value="stock">📦 En stock</option>
            </select>
            <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Categories horizontal scroll pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onSelectCategory("all")}
          className={`relative isolate flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
            selectedCategory === "all"
              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
          }`}
        >
          {selectedCategory === "all" && (
            <motion.div
              layoutId="activeCategoryPill"
              className="absolute inset-0 bg-neutral-900 rounded-[inherit] z-0"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10">Todos ({totalProductsCount})</span>
        </button>

        {categories.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`relative isolate flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                isSelected
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                  : "bg-white text-neutral-700 hover:bg-neutral-50 border-neutral-200"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeCategoryPill"
                  className="absolute inset-0 bg-neutral-900 rounded-[inherit] z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
              <span
                className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                  isSelected ? "bg-white/25 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
