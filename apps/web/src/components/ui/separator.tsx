import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { materialColors } from "@/lib/material-design";

// Material Design 3 Divider specifications
const dividerVariants = cva(
    "shrink-0",
    {
        variants: {
            variant: {
                // Full-width divider - spans entire width of container
                "full-width": "bg-outline-variant",
                // Inset divider - indented from leading edge  
                "inset": "bg-outline-variant ml-4",
                // Middle inset divider - indented from both edges
                "middle": "bg-outline-variant mx-4",
            },
            orientation: {
                horizontal: "h-px w-full",
                vertical: "w-px h-full",
            },
            thickness: {
                thin: "", // 1px default
                thick: "", // Custom thickness via className
            }
        },
        defaultVariants: {
            variant: "full-width",
            orientation: "horizontal",
            thickness: "thin",
        },
    }
);

// Material Design 3 Divider component
const Divider = React.forwardRef<
    React.ElementRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> &
    VariantProps<typeof dividerVariants>
>(({ className, orientation = "horizontal", variant = "full-width", thickness = "thin", decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
            dividerVariants({ variant, orientation, thickness }),
            className
        )}
        {...props}
    />
));
Divider.displayName = SeparatorPrimitive.Root.displayName;

// Legacy alias for backward compatibility
const Separator = Divider;

export { Divider, Separator, dividerVariants };
