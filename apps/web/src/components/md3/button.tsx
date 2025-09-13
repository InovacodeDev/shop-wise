import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { ButtonLoadingIndicator } from "./loading-indicator";

// Material Design 3 Button variants following MD3 specifications
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 [&_svg]:pointer-events-none [&_svg]:shrink-0 relative overflow-hidden",
    {
        variants: {
            variant: {
                // Filled (primary) button
                filled: "bg-primary text-on-primary shadow-sm hover:shadow-md hover:bg-primary/90 active:bg-primary/95",
                // Elevated button 
                elevated: "bg-surface-container-low text-primary shadow-md hover:shadow-lg hover:bg-surface-container-low/90 active:bg-surface-container-low/95",
                // Tonal button
                tonal: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:bg-secondary-container/90",
                // Outlined button
                outlined: "border border-outline bg-transparent text-primary hover:bg-primary/8 active:bg-primary/12 shadow-none",
                // Text button
                text: "bg-transparent text-primary hover:bg-primary/8 active:bg-primary/12 shadow-none",
                // Destructive variants
                destructive: "bg-error text-on-error hover:bg-error/90 active:bg-error/95",
                "destructive-outlined": "border border-error bg-transparent text-error hover:bg-error/8 active:bg-error/12",
                // Legacy variants (maintained for compatibility)
                default: "bg-primary text-on-primary shadow-sm hover:shadow-md hover:bg-primary/90 active:bg-primary/95",
                ghost: "bg-transparent hover:bg-primary/8 active:bg-primary/12",
                link: "text-primary underline-offset-4 hover:underline bg-transparent",
            },
            size: {
                xs: "h-8 px-3 text-xs gap-1 [&_svg]:size-3", // Extra small: 32dp height
                sm: "h-10 px-4 text-sm gap-1.5 [&_svg]:size-3.5", // Small: 40dp height  
                default: "h-11 px-6 text-sm gap-2 [&_svg]:size-4", // Medium: 44dp height (default)
                lg: "h-12 px-8 text-base gap-2 [&_svg]:size-5", // Large: 48dp height
                xl: "h-14 px-10 text-lg gap-2.5 [&_svg]:size-6", // Extra large: 56dp height
                icon: "size-10 p-0 [&_svg]:size-4", // Square icon button
                "icon-sm": "size-8 p-0 [&_svg]:size-3.5", // Small icon button
                "icon-lg": "size-12 p-0 [&_svg]:size-5", // Large icon button
            },
            shape: {
                round: "rounded-full", // Fully rounded (default)
                square: "rounded-lg", // Square corners (12dp radius)
            },
            state: {
                default: "",
                pressed: "rounded-md", // More square when pressed (8dp radius)
            },
        },
        compoundVariants: [
            // Shape morphing for pressed state
            {
                shape: "round",
                state: "pressed",
                class: "rounded-md", // 8dp radius when pressed
            },
            {
                shape: "square",
                state: "pressed",
                class: "rounded-md", // 8dp radius when pressed
            },
        ],
        defaultVariants: {
            variant: "filled",
            size: "default",
            shape: "round",
            state: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

// Extended Button Props for LoadingButton
export interface LoadingButtonProps extends ButtonProps {
    loading?: boolean;
    loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, shape, state, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, shape, state, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

// Toggle Button for selection states
const ToggleButton = React.forwardRef<
    HTMLButtonElement,
    ButtonProps & {
        pressed?: boolean;
        onPressedChange?: (pressed: boolean) => void;
    }
>(({ className, variant = "outlined", shape = "round", pressed = false, onPressedChange, onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPressedChange?.(!pressed);
        onClick?.(event);
    };

    // Toggle buttons change shape when selected
    const toggleShape = pressed ? (shape === "round" ? "square" : "round") : shape;

    // Different styling for selected state
    const toggleVariant = pressed
        ? variant === "outlined" ? "tonal" : variant
        : variant;

    return (
        <Button
            ref={ref}
            className={cn("aria-pressed:bg-secondary-container aria-pressed:text-on-secondary-container", className)}
            variant={toggleVariant}
            shape={toggleShape}
            aria-pressed={pressed}
            onClick={handleClick}
            {...props}
        />
    );
});
ToggleButton.displayName = "ToggleButton";

// Loading Button - Button with integrated loading state
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, disabled, size, onClick, className, ...props }, ref) => {
        const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
            if (loading) return; // Prevent clicks when loading
            onClick?.(event);
        };

        // Map button sizes to loading indicator sizes, excluding icon variants
        const getLoadingSize = (buttonSize: typeof size): "xs" | "sm" | "default" | "lg" | "xl" => {
            if (!buttonSize || buttonSize.includes("icon")) return "sm";
            if (buttonSize === "xs") return "xs";
            if (buttonSize === "sm") return "sm";  
            if (buttonSize === "default") return "default";
            if (buttonSize === "lg") return "lg";
            if (buttonSize === "xl") return "xl";
            return "default";
        };

        return (
            <Button
                ref={ref}
                disabled={loading || disabled}
                size={size}
                onClick={handleClick}
                className={cn(
                    loading && "opacity-25", // Apply 25% opacity when loading
                    className
                )}
                {...props}
            >
                {loading ? (
                    <ButtonLoadingIndicator 
                        size={getLoadingSize(size)} 
                        variant="default"
                        showLabel={false}
                    />
                ) : (
                    children
                )}
            </Button>
        );
    }
);
LoadingButton.displayName = "LoadingButton";

export { Button, buttonVariants, LoadingButton, ToggleButton };

