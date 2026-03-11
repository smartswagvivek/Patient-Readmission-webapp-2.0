import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "relative isolate group mx-auto inline-flex items-center justify-center overflow-hidden rounded-full border text-center text-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-blue-500/5 hover:bg-blue-500/10 border-blue-500/20 hover:border-blue-500/45 text-slate-800",
        solid:
          "bg-blue-600 text-white border-transparent hover:bg-blue-700 hover:shadow-[0_12px_22px_-16px_rgba(29,78,216,0.7)]",
        ghost:
          "border-transparent bg-transparent hover:border-zinc-400 hover:bg-white/10 text-slate-700",
      },
      size: {
        default: "px-7 py-2",
        sm: "px-4 py-1",
        lg: "px-10 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, neon = true, size, variant, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
            "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.25),transparent_68%)]",
            neon && "group-hover:opacity-100"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-0 transition-all duration-500",
            neon && "group-hover:left-[120%] group-hover:opacity-100"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-x-4 top-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-transform duration-300",
            neon && "group-hover:scale-x-100"
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute inset-x-4 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-transform duration-300",
            neon && "group-hover:scale-x-100"
          )}
        />
        <span className="relative z-10">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

