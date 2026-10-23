import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

export function InteractiveHoverButton({
  children,
  className = "",
  icon: Icon = ArrowRight,
  onClick,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "group relative w-full sm:w-auto cursor-pointer overflow-hidden rounded-xl border border-neutral-300 bg-white px-5 py-3.5 text-center font-bold text-neutral-900 shadow-md transition-all duration-300 hover:shadow-lg active:scale-95",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <div className="h-2 w-2 rounded-full bg-amber-500 transition-all duration-300 group-hover:scale-[70]" />
        <span className="inline-block transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute inset-0 z-10 flex h-full w-full translate-x-8 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 font-bold">
        <span>{children}</span>
        <Icon className="w-4 h-4 ml-1" />
      </div>
    </button>
  );
}

export default InteractiveHoverButton;
