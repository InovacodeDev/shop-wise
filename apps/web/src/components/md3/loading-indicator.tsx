import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Loading Indicator variants
const loadingIndicatorVariants = cva(
    "inline-flex items-center justify-center animate-spin",
    {
        variants: {
            variant: {
                // Default: Active indicator without container
                default: "text-primary",
                // Contained: Active indicator with container background
                contained: "text-on-primary-container bg-primary-container rounded-full",
            },
            size: {
                xs: "size-6", // 24dp - minimum size
                sm: "size-8", // 32dp
                default: "size-12", // 48dp - default size
                lg: "size-16", // 64dp
                xl: "size-20", // 80dp
                "2xl": "size-24", // 96dp
                "3xl": "size-32", // 128dp
                max: "size-60", // 240dp - maximum size
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

// Material Design 3 shape morphing animation keyframes
const shapeKeyframes = `
  @keyframes md3-shape-morph {
    0% { border-radius: 50%; }
    12.5% { border-radius: 40%; }
    25% { border-radius: 30%; }
    37.5% { border-radius: 35%; }
    50% { border-radius: 25%; }
    62.5% { border-radius: 30%; }
    75% { border-radius: 35%; }
    87.5% { border-radius: 45%; }
    100% { border-radius: 50%; }
  }
`;

// Inject keyframes into document head
if (typeof document !== "undefined" && !document.getElementById("md3-loading-keyframes")) {
    const style = document.createElement("style");
    style.id = "md3-loading-keyframes";
    style.textContent = shapeKeyframes;
    document.head.appendChild(style);
}

export interface LoadingIndicatorProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingIndicatorVariants> {
    /** 
     * Custom label for accessibility. 
     * Defaults to "Loading..." 
     */
    label?: string;
    /**
     * Whether to show text alongside the indicator
     */
    showLabel?: boolean;
    /**
     * Position of the label relative to the indicator
     */
    labelPosition?: "bottom" | "right";
}

const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
    ({
        className,
        variant,
        size,
        label = "Loading...",
        showLabel = false,
        labelPosition = "bottom",
        ...props
    }, ref) => {
        const indicatorSizeMap = {
            xs: "size-4", // Active indicator is smaller than container
            sm: "size-6",
            default: "size-9", // 36dp active indicator in 48dp container
            lg: "size-12",
            xl: "size-16",
            "2xl": "size-20",
            "3xl": "size-28",
            max: "size-52", // Active indicator in max container
        };

        const activeIndicatorSize = indicatorSizeMap[size || "default"];

        const indicator = (
            <div
                ref={ref}
                className={cn(loadingIndicatorVariants({ variant, size }), className)}
                role="progressbar"
                aria-label={label}
                aria-valuetext="Loading..."
                {...props}
            >
                {/* Active indicator with Material Design 3 shape morphing */}
                <div
                    className={cn(
                        "rounded-full border-2 border-transparent border-t-current border-r-current",
                        "animate-spin",
                        activeIndicatorSize
                    )}
                    style={{
                        animation: "spin 1s linear infinite, md3-shape-morph 2s ease-in-out infinite",
                    }}
                />
            </div>
        );

        if (!showLabel) {
            return indicator;
        }

        return (
            <div
                className={cn(
                    "flex items-center gap-2",
                    labelPosition === "bottom" && "flex-col",
                    labelPosition === "right" && "flex-row"
                )}
            >
                {indicator}
                <span className="text-sm text-muted-foreground font-medium">
                    {label}
                </span>
            </div>
        );
    }
);
LoadingIndicator.displayName = "LoadingIndicator";

// Pull-to-refresh Loading Indicator
export interface PullToRefreshIndicatorProps extends LoadingIndicatorProps {
    /** Whether the indicator is visible during pull-to-refresh */
    visible?: boolean;
    /** Progress of the pull gesture (0 to 1) */
    progress?: number;
    /** Whether the threshold has been reached */
    thresholdReached?: boolean;
}

const PullToRefreshIndicator = React.forwardRef<HTMLDivElement, PullToRefreshIndicatorProps>(
    ({
        visible = false,
        progress = 0,
        thresholdReached = false,
        variant = "contained",
        size = "default",
        className,
        ...props
    }, ref) => {
        const scale = Math.min(progress * 1.2, 1);
        const rotation = progress * 180;

        if (!visible) return null;

        return (
            <div
                className={cn(
                    "transition-all duration-200 ease-out",
                    "transform-gpu", // Use GPU acceleration
                )}
                style={{
                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                    opacity: progress,
                }}
            >
                <LoadingIndicator
                    ref={ref}
                    variant={variant}
                    size={size}
                    className={cn(
                        "transition-all duration-200",
                        thresholdReached && "text-primary-container bg-primary",
                        className
                    )}
                    label="Pull to refresh"
                    {...props}
                />
            </div>
        );
    }
);
PullToRefreshIndicator.displayName = "PullToRefreshIndicator";

// Button Loading Indicator (for inline usage)
export interface ButtonLoadingIndicatorProps extends Omit<LoadingIndicatorProps, "size"> {
    /** Size matches button sizes */
    size?: "xs" | "sm" | "default" | "lg" | "xl";
}

const ButtonLoadingIndicator = React.forwardRef<HTMLDivElement, ButtonLoadingIndicatorProps>(
    ({ size = "sm", variant = "default", className, ...props }, ref) => {
        // Map button sizes to appropriate loading indicator sizes
        const sizeMap = {
            xs: "xs" as const,
            sm: "xs" as const,
            default: "sm" as const,
            lg: "sm" as const,
            xl: "default" as const,
        };

        return (
            <LoadingIndicator
                ref={ref}
                variant={variant}
                size={sizeMap[size]}
                className={cn("mr-2", className)}
                {...props}
            />
        );
    }
);
ButtonLoadingIndicator.displayName = "ButtonLoadingIndicator";

// Page Loading Indicator (for full page loading)
export interface PageLoadingIndicatorProps extends LoadingIndicatorProps {
    /** Whether to show the backdrop */
    backdrop?: boolean;
    /** Whether to center the indicator on the page */
    centered?: boolean;
}

const PageLoadingIndicator = React.forwardRef<HTMLDivElement, PageLoadingIndicatorProps>(
    ({
        backdrop = true,
        centered = true,
        size = "lg",
        showLabel = true,
        className,
        ...props
    }, ref) => {
        const content = (
            <LoadingIndicator
                ref={ref}
                size={size}
                showLabel={showLabel}
                labelPosition="bottom"
                className={className}
                {...props}
            />
        );

        if (!backdrop && !centered) {
            return content;
        }

        return (
            <div
                className={cn(
                    backdrop && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
                    centered && "flex items-center justify-center",
                    !backdrop && centered && "min-h-[200px] w-full"
                )}
                data-state={backdrop ? "open" : undefined}
            >
                {content}
            </div>
        );
    }
);
PageLoadingIndicator.displayName = "PageLoadingIndicator";

export {
    LoadingIndicator,
    PullToRefreshIndicator,
    ButtonLoadingIndicator,
    PageLoadingIndicator,
    loadingIndicatorVariants
};
