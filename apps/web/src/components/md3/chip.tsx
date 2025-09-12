import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { materialTypography, materialSpacing } from "@/lib/material-design";

// Material Design 3 Chip specifications
const chipVariants = cva(
    "inline-flex items-center justify-center cursor-pointer transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-38 disabled:cursor-not-allowed",
    {
        variants: {
            variant: {
                // Assist chip - helps people enter information or make selections
                assist: [
                    "border border-outline",
                    "bg-transparent text-on-surface",
                    "hover:bg-on-surface/8 hover:shadow-sm",
                    "active:bg-on-surface/12",
                    "disabled:border-on-surface/12 disabled:text-on-surface/38"
                ],
                // Filter chip - allows selection from a set of options
                filter: [
                    "border border-outline",
                    "bg-transparent text-on-surface-variant",
                    "hover:bg-on-surface-variant/8",
                    "active:bg-on-surface-variant/12",
                    "data-[selected=true]:bg-secondary-container data-[selected=true]:text-on-secondary-container data-[selected=true]:border-transparent",
                    "data-[selected=true]:hover:bg-secondary-container/80",
                    "disabled:border-on-surface/12 disabled:text-on-surface/38"
                ],
                // Input chip - represents user input like tags or contacts
                input: [
                    "border border-outline-variant",
                    "bg-transparent text-on-surface-variant",
                    "hover:bg-on-surface-variant/8",
                    "active:bg-on-surface-variant/12",
                    "focus:border-primary",
                    "disabled:border-on-surface/12 disabled:text-on-surface/38"
                ],
                // Suggestion chip - presents dynamically generated suggestions
                suggestion: [
                    "border border-outline",
                    "bg-transparent text-on-surface-variant",
                    "hover:bg-on-surface-variant/8 hover:shadow-sm",
                    "active:bg-on-surface-variant/12",
                    "disabled:border-on-surface/12 disabled:text-on-surface/38"
                ],
                // Custom category variant for product categories
                category: [
                    "border-transparent",
                    "transition-colors duration-200",
                    "hover:scale-105 hover:shadow-sm",
                    "active:scale-95"
                ]
            },
            size: {
                default: "",
                small: "text-xs"
            }
        },
        defaultVariants: {
            variant: "assist",
            size: "default",
        },
    }
);

export interface ChipProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {
    selected?: boolean;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    onTrailingIconClick?: () => void;
    asChild?: boolean;
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
    ({
        className,
        variant,
        size,
        selected,
        leadingIcon,
        trailingIcon,
        onTrailingIconClick,
        children,
        onClick,
        asChild = false,
        disabled,
        style,
        ...props
    }, ref) => {
        const handleTrailingIconClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            onTrailingIconClick?.();
        };

        const chipStyles = {
            // Material Design 3 measurements
            height: '32px',
            borderRadius: '8px',
            paddingLeft: leadingIcon ? materialSpacing.sm : materialSpacing.md, // 8px with icon, 16px without
            paddingRight: trailingIcon ? materialSpacing.sm : materialSpacing.md, // 8px with icon, 16px without
            minHeight: '32px',
            fontSize: materialTypography.labelLarge.fontSize,
            fontWeight: materialTypography.labelLarge.fontWeight,
            lineHeight: materialTypography.labelLarge.lineHeight,
            letterSpacing: materialTypography.labelLarge.letterSpacing,
            ...style,
        };

        const content = (
            <>
                {leadingIcon && (
                    <span
                        className="flex items-center justify-center mr-2"
                        style={{ width: '18px', height: '18px' }}
                    >
                        {leadingIcon}
                    </span>
                )}
                <span className="truncate">
                    {children}
                </span>
                {trailingIcon && (
                    <span
                        className="flex items-center justify-center ml-2 cursor-pointer rounded-full hover:bg-black/10 transition-colors"
                        style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '-4px' // Adjust for better visual alignment
                        }}
                        onClick={onTrailingIconClick ? handleTrailingIconClick : undefined}
                    >
                        {trailingIcon}
                    </span>
                )}
            </>
        );

        if (asChild) {
            return (
                <span
                    className={cn(chipVariants({ variant, size }), className)}
                    style={chipStyles}
                    data-selected={selected}
                >
                    {content}
                </span>
            );
        }

        return (
            <button
                className={cn(chipVariants({ variant, size }), className)}
                style={chipStyles}
                data-selected={selected}
                ref={ref}
                disabled={disabled}
                onClick={onClick}
                {...props}
            >
                {content}
            </button>
        );
    }
);

Chip.displayName = "Chip";

export { Chip, chipVariants };
