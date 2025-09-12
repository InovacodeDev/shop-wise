import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

// Material Design 3 Icon Button variants
const iconButtonVariants = cva(
    "rounded-full transition-all duration-200 ease-in-out",
    {
        variants: {
            variant: {
                // Standard icon button (default)
                standard: "bg-transparent text-on-surface hover:bg-on-surface/8 active:bg-on-surface/12",
                // Filled icon button
                filled: "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/95 shadow-sm",
                // Tonal icon button
                tonal: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:bg-secondary-container/90",
                // Outlined icon button
                outlined: "border border-outline bg-transparent text-on-surface-variant hover:bg-on-surface-variant/8 active:bg-on-surface-variant/12",
            },
            size: {
                xs: "size-6 [&_svg]:size-3", // Extra small: 24dp (minimum 48dp touch target)
                sm: "size-8 [&_svg]:size-4", // Small: 32dp (minimum 48dp touch target)
                default: "size-10 [&_svg]:size-5", // Medium: 40dp
                lg: "size-12 [&_svg]:size-6", // Large: 48dp
                xl: "size-14 [&_svg]:size-7", // Extra large: 56dp
            },
            selected: {
                true: "",
                false: "",
            },
        },
        compoundVariants: [
            // Selected state styling
            {
                variant: "standard",
                selected: true,
                class: "bg-inverse-surface text-inverse-on-surface",
            },
            {
                variant: "filled",
                selected: true,
                class: "bg-primary text-on-primary",
            },
            {
                variant: "tonal",
                selected: true,
                class: "bg-secondary-container text-on-secondary-container",
            },
            {
                variant: "outlined",
                selected: true,
                class: "bg-inverse-surface text-inverse-on-surface border-transparent",
            },
        ],
        defaultVariants: {
            variant: "standard",
            size: "default",
            selected: false,
        },
    }
);

export interface IconButtonProps
    extends Omit<ButtonProps, "variant" | "size" | "shape">,
    VariantProps<typeof iconButtonVariants> {
    selected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant, size, selected = false, onSelectedChange, onClick, children, ...props }, ref) => {
        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (onSelectedChange) {
                onSelectedChange(!selected);
            }
            onClick?.(event);
        };

        // Ensure minimum 48dp touch target for accessibility (xs and sm sizes)
        const needsTouchTarget = size === "xs" || size === "sm";

        return (
            <Button
                ref={ref}
                className={cn(
                    iconButtonVariants({ variant, size, selected }),
                    needsTouchTarget && "relative",
                    className
                )}
                shape="round"
                onClick={handleClick}
                aria-pressed={selected}
                {...props}
            >
                {needsTouchTarget && (
                    <span className="absolute inset-0 min-w-12 min-h-12 -m-2 rounded-full" />
                )}
                {children}
            </Button>
        );
    }
);
IconButton.displayName = "IconButton";

// Toggle Icon Button (for selection states)
export interface ToggleIconButtonProps extends IconButtonProps {
    pressedIcon?: React.ReactNode;
    unpressedIcon?: React.ReactNode;
}

const ToggleIconButton = React.forwardRef<HTMLButtonElement, ToggleIconButtonProps>(
    ({ pressedIcon, unpressedIcon, selected, children, ...props }, ref) => {
        const icon = selected ? (pressedIcon || children) : (unpressedIcon || children);

        return (
            <IconButton
                ref={ref}
                selected={selected}
                {...props}
            >
                {icon}
            </IconButton>
        );
    }
);
ToggleIconButton.displayName = "ToggleIconButton";

export { IconButton, ToggleIconButton, iconButtonVariants };
