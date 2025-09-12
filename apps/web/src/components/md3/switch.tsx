import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// MD3 Switch variants following Material Design 3 specifications
const switchVariants = cva(
    [
        // Base styles
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-38",
        // Touch target: 48dp minimum
        "relative before:absolute before:inset-0 before:rounded-full before:transition-colors",
        "before:hover:bg-on-surface/8 before:focus:bg-on-surface/12",
        "before:active:bg-on-surface/12"
    ],
    {
        variants: {
            size: {
                default: [
                    // Track: 52dp × 32dp
                    "h-8 w-[52px] border-2",
                    // State layer hover area
                    "before:w-12 before:h-12 before:-inset-2"
                ],
                sm: [
                    // Smaller variant: 44dp × 28dp
                    "h-7 w-11 border-2",
                    "before:w-11 before:h-11 before:-inset-2"
                ]
            },
            variant: {
                default: [
                    // Unchecked state
                    "border-outline bg-surface-variant",
                    // Checked state
                    "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
                    // Hover states
                    "hover:before:bg-on-surface/8",
                    "data-[state=checked]:hover:before:bg-primary/8",
                ],
                error: [
                    "border-error bg-error-container",
                    "data-[state=checked]:border-error data-[state=checked]:bg-error",
                    "hover:before:bg-error/8"
                ]
            }
        },
        defaultVariants: {
            size: "default",
            variant: "default"
        }
    }
);

const switchThumbVariants = cva(
    [
        // Base thumb styles
        "pointer-events-none block rounded-full transition-all duration-200 ease-out",
        "shadow-sm ring-0 bg-background border border-outline-variant"
    ],
    {
        variants: {
            size: {
                default: [
                    // Handle: 24dp diameter, grows to 28dp when pressed
                    "h-6 w-6",
                    // Transform: 20dp when unchecked, moves 20dp when checked
                    "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
                    // Active state expansion
                    "active:h-7 active:w-7 active:data-[state=unchecked]:-translate-x-0.5"
                ],
                sm: [
                    "h-5 w-5",
                    "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
                    "active:h-6 active:w-6"
                ]
            },
            variant: {
                default: [
                    // Unchecked: outline handle on surface-variant track
                    "bg-outline border-outline",
                    // Checked: on-primary handle on primary track
                    "data-[state=checked]:bg-on-primary data-[state=checked]:border-primary"
                ],
                error: [
                    "bg-error border-error",
                    "data-[state=checked]:bg-on-error data-[state=checked]:border-error"
                ]
            }
        },
        defaultVariants: {
            size: "default",
            variant: "default"
        }
    }
);

interface SwitchProps
    extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
    label?: string;
    description?: string;
    error?: boolean;
}

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    SwitchProps
>(({ className, size, variant, label, description, error, ...props }, ref) => {
    const switchVariant = error ? "error" : variant;

    const switchElement = (
        <SwitchPrimitives.Root
            className={cn(switchVariants({ size, variant: switchVariant }), className)}
            {...props}
            ref={ref}
        >
            <SwitchPrimitives.Thumb
                className={cn(switchThumbVariants({ size, variant: switchVariant }))}
            />
        </SwitchPrimitives.Root>
    );

    if (label || description) {
        return (
            <div className="flex items-start gap-3">
                <div className="flex-1">
                    {label && (
                        <label
                            className={cn(
                                "text-sm font-medium leading-5",
                                error ? "text-error" : "text-on-surface",
                                props.disabled && "opacity-38"
                            )}
                            onClick={() => !props.disabled && props.onCheckedChange?.(!props.checked)}
                        >
                            {label}
                        </label>
                    )}
                    {description && (
                        <p className={cn(
                            "text-xs text-on-surface-variant mt-1 leading-4",
                            error && "text-error",
                            props.disabled && "opacity-38"
                        )}>
                            {description}
                        </p>
                    )}
                </div>
                {switchElement}
            </div>
        );
    }

    return switchElement;
});
Switch.displayName = SwitchPrimitives.Root.displayName;

// Helper component for common switch with icon
interface IconSwitchProps extends SwitchProps {
    icon?: React.ReactNode;
    iconPosition?: "start" | "end";
}

const IconSwitch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    IconSwitchProps
>(({ icon, iconPosition = "start", label, className, ...props }, ref) => (
    <div className="flex items-center gap-3">
        {icon && iconPosition === "start" && (
            <div className="text-on-surface-variant">{icon}</div>
        )}
        <Switch
            ref={ref}
            label={label}
            className={className}
            {...props}
        />
        {icon && iconPosition === "end" && (
            <div className="text-on-surface-variant">{icon}</div>
        )}
    </div>
));
IconSwitch.displayName = "IconSwitch";

export { Switch, IconSwitch, switchVariants };
