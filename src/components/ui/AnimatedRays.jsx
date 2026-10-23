import React from "react";
import { cn } from "../../utils/cn";

export function AnimatedRays({ className = "", children }) {
  const stripes = `repeating-linear-gradient(
    100deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.08) 7%,
    transparent 10%,
    transparent 12%,
    rgba(255, 255, 255, 0.08) 16%
  )`;

  const rainbow = `repeating-linear-gradient(
    100deg,
    rgba(245, 158, 11, 0.16) 10%,
    rgba(239, 68, 68, 0.14) 15%,
    rgba(245, 158, 11, 0.16) 20%,
    rgba(16, 185, 129, 0.14) 25%,
    rgba(245, 158, 11, 0.16) 30%
  )`;

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className="absolute inset-0 animate-aurora-bg opacity-70"
        style={{
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: "300%, 200%",
          mixBlendMode: "screen",
          filter: "blur(14px)",
          maskImage: "radial-gradient(ellipse at 80% 20%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 80% 20%, black 30%, transparent 75%)",
        }}
      />
      {children}
    </div>
  );
}

export default AnimatedRays;
