import { useState } from "react";
import { cn } from "@/lib/utils";

export function SpotlightCard({ className, children, glowColor = "30,136,229" }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }

  return (
    <article
      onMouseMove={handlePointerMove}
      onFocus={handlePointerMove}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-sky-100 bg-[linear-gradient(165deg,#ffffff_0%,#f2f9ff_100%)] p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card",
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at ${position.x}% ${position.y}%, rgba(${glowColor},0.18), transparent 38%), linear-gradient(180deg,#ffffff,#f2f9ff)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-medical-primary/70 to-transparent" />
        <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-medical-primary/55 to-transparent" />
      </div>
      <div className="relative z-10">{children}</div>
    </article>
  );
}
