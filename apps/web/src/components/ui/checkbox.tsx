import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { faCheck, faMinus } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Material Design 3 Checkbox specifications
const checkboxVariants = cva(
    [
        // Base styles following MD3 specs
        "peer relative shrink-0 rounded-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-38",
        // Size: 18dp container, 40dp state layer (touch target)
        "h-[18px] w-[18px]",
        "before:absolute before:inset-0 before:rounded-sm before:transition-colors",
        "before:h-10 before:w-10 before:-top-[11px] before:-left-[11px]", // 40dp state layer
    ],
    {
        variants: {
            variant: {
                // Default checkbox
                default: [
                    // Unselected state
                    "border-2 border-outline bg-transparent text-transparent",
                    "hover:before:bg-on-surface/8 hover:border-on-surface",
                    // Selected state  
                    "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-on-primary",
                    "data-[state=checked]:hover:before:bg-primary/8",
                    // Indeterminate state
                    "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-on-primary",
                    "data-[state=indeterminate]:hover:before:bg-primary/8",
                ],
                // Error state checkbox
                error: [
                    // Unselected error state
                    "border-2 border-error bg-transparent text-transparent",
                    "hover:before:bg-error/8 hover:border-error",
                    // Selected error state
                    "data-[state=checked]:bg-error data-[state=checked]:border-error data-[state=checked]:text-on-error",
                    "data-[state=checked]:hover:before:bg-error/8",
                    // Indeterminate error state
                    "data-[state=indeterminate]:bg-error data-[state=indeterminate]:border-error data-[state=indeterminate]:text-on-error",
                    "data-[state=indeterminate]:hover:before:bg-error/8",
                ],
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

// Material Design 3 Checkbox component
const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
    VariantProps<typeof checkboxVariants> & {
        /**
         * Error state - shows error colors
         */
        error?: boolean;
        /**
         * Label text adjacent to checkbox
         */
        label?: string;
    }
>(({ className, variant, error = false, label, ...props }, ref) => {
    const computedVariant = error ? "error" : variant;

    const checkboxElement = (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                checkboxVariants({ variant: computedVariant }),
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                {/* Check icon for checked state */}
                <FontAwesomeIcon
                    icon={faCheck}
                    className="h-3 w-3 data-[state=indeterminate]:hidden"
                />
                {/* Minus icon for indeterminate state */}
                <FontAwesomeIcon
                    icon={faMinus}
                    className="h-3 w-3 data-[state=checked]:hidden"
                />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );

    // If label is provided, wrap in a label element
    if (label) {
        return (
            <label className="flex items-center gap-3 cursor-pointer">
                {checkboxElement}
                <span className="text-sm text-on-surface select-none">
                    {label}
                </span>
            </label>
        );
    }

    return checkboxElement;
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };
