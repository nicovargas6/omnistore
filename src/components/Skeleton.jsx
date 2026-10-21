import React from "react";

// Atomic Base Skeleton Component
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      {...props}
    />
  );
}

// Product Card Skeleton matching ProductCard.jsx 1:1
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Image Frame Skeleton */}
      <div className="relative aspect-4/3 sm:aspect-square bg-neutral-100 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
        {/* Floating badge skeleton */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <Skeleton className="w-16 h-5 rounded-md bg-neutral-300/80" />
        </div>
      </div>

      {/* Product Details Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          {/* Category */}
          <Skeleton className="w-20 h-3.5 rounded" />
          {/* Title (2 lines) */}
          <Skeleton className="w-4/5 h-4.5 rounded mt-1" />
          <Skeleton className="w-3/5 h-4.5 rounded" />
          {/* Description (2 lines) */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="w-full h-3 rounded" />
            <Skeleton className="w-5/6 h-3 rounded" />
          </div>
        </div>

        {/* Price & Action Button Skeleton */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="space-y-1">
            <Skeleton className="w-16 h-5 rounded" />
            <Skeleton className="w-10 h-3 rounded" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Category Filter Bar Skeleton
export function CategoryFilterBarSkeleton() {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <Skeleton className="w-full sm:flex-1 h-11 rounded-2xl" />
        <Skeleton className="w-full sm:w-44 h-11 rounded-2xl" />
      </div>
      <div className="flex items-center gap-2 overflow-x-hidden py-1">
        {[20, 28, 24, 32, 22, 26, 30].map((w, idx) => (
          <Skeleton
            key={idx}
            className={`h-9 rounded-full flex-shrink-0 w-${w}`}
            style={{ width: `${w * 4}px` }}
          />
        ))}
      </div>
    </div>
  );
}

// WhatsApp Chat Message Skeleton (Simulates AI streaming / thinking)
export function WhatsAppChatSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] sm:max-w-[75%] bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="w-3.5 h-3.5 rounded-full bg-emerald-300" />
          <Skeleton className="w-28 h-3 rounded" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="w-64 max-w-full h-3 rounded" />
          <Skeleton className="w-56 max-w-[90%] h-3 rounded" />
          <Skeleton className="w-40 max-w-[70%] h-3 rounded" />
        </div>
        <div className="flex justify-end pt-0.5">
          <Skeleton className="w-10 h-2.5 rounded" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton for Admin View
export function TableSkeletonRow({ columns = 5 }) {
  return (
    <tr className="border-b border-neutral-100">
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="w-28 h-3.5 rounded" />
            <Skeleton className="w-16 h-3 rounded" />
          </div>
        </div>
      </td>
      {Array.from({ length: columns - 1 }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="w-20 h-4 rounded" />
        </td>
      ))}
    </tr>
  );
}

// Order Card Skeleton for Admin Order Manager
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <Skeleton className="w-20 h-6 rounded-lg" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <Skeleton className="w-28 h-7 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
        <Skeleton className="w-32 h-4 rounded" />
        <Skeleton className="w-20 h-5 rounded" />
      </div>
    </div>
  );
}

export default Skeleton;
