import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 active:scale-[0.98] touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline: "border-2 border-primary bg-background text-primary hover:bg-primary/10",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Farmer-friendly variants
        farmer: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg min-h-[56px] px-6 text-lg",
        "farmer-secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg min-h-[56px] px-6 text-lg",
        "farmer-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 min-h-[56px] px-6 text-lg",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-md",
        // Icon buttons
        icon: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
        "icon-outline": "border-2 border-primary text-primary hover:bg-primary/10 rounded-full",
        // Scan button
        scan: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-xl min-w-[72px] min-h-[72px]",
      },
      size: {
        default: "h-12 px-5 py-3",
        sm: "h-10 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-lg",
        xl: "h-16 rounded-2xl px-10 text-xl",
        icon: "h-12 w-12",
        "icon-lg": "h-16 w-16",
        "icon-xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
