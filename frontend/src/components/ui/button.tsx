import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Note on `active:translate-y-px`: it occupies the same CSS transform slot as
 * positional utilities such as `-translate-y-1/2`. Do not centre a Button with
 * a translate — the press state would override it and the button would jump out
 * from under the pointer. Use a static offset or a flex-centred wrapper.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_10px_28px_-14px_rgba(195,22,58,0.9)] hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-surface-raised text-foreground border border-border hover:border-border-strong hover:bg-surface-overlay",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-raised hover:border-border-strong",
        ghost:
          "text-muted-foreground hover:bg-surface-raised hover:text-foreground",
        subtle:
          "bg-primary-subtle text-primary-foreground/90 border border-primary-border hover:bg-primary-muted",
        danger:
          "bg-danger/90 text-white hover:bg-danger shadow-[0_10px_28px_-16px_rgba(229,72,77,0.9)]",
        link: "text-brand-bright underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
        md: "h-9.5 px-4 [&_svg]:size-4",
        lg: "h-11 px-5 text-[15px] [&_svg]:size-4.5",
        icon: "size-9.5 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";
