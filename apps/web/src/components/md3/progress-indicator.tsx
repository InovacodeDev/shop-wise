import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Linear Progress variants
const linearProgressVariants = cva(
    "w-full bg-secondary-container rounded-full overflow-hidden",
    {
        variants: {
            size: {
                xs: "h-1", // 4dp height
                sm: "h-1.5", // 6dp height
                default: "h-2", // 8dp height - Material Design 3 standard
                lg: "h-3", // 12dp height
                xl: "h-4", // 16dp height
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const linearProgressBarVariants = cva(
    "h-full bg-primary transition-all duration-300 ease-out rounded-full",
    {
        variants: {
            variant: {
                determinate: "",
                indeterminate: "animate-pulse bg-gradient-to-r from-primary via-primary/80 to-primary",
            },
        },
        defaultVariants: {
            variant: "determinate",
        },
    }
);

// Material Design 3 Circular Progress variants
const circularProgressVariants = cva(
    "relative inline-flex items-center justify-center",
    {
        variants: {
            size: {
                xs: "size-4", // 16dp
                sm: "size-6", // 24dp
                default: "size-8", // 32dp
                lg: "size-12", // 48dp
                xl: "size-16", // 64dp
                "2xl": "size-20", // 80dp
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

// Linear Progress Component
export interface LinearProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof linearProgressVariants> {
    /** Progress value (0-100) */
    value?: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Whether progress is indeterminate (unknown) */
    indeterminate?: boolean;
    /** Custom label for accessibility */
    label?: string;
    /** Whether to show progress text */
    showValue?: boolean;
    /** Buffer value for buffered progress (0-100) */
    buffer?: number;
}

const LinearProgress = React.forwardRef<HTMLDivElement, LinearProgressProps>(
    ({
        className,
        size,
        value = 0,
        max = 100,
        indeterminate = false,
        label,
        showValue = false,
        buffer,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
        const bufferPercentage = buffer ? Math.min(Math.max((buffer / max) * 100, 0), 100) : undefined;

        return (
            <div className="w-full space-y-2">
                {(label || showValue) && (
                    <div className="flex justify-between items-center text-sm">
                        {label && <span className="text-muted-foreground">{label}</span>}
                        {showValue && !indeterminate && (
                            <span className="font-medium">{Math.round(percentage)}%</span>
                        )}
                    </div>
                )}

                <div
                    ref={ref}
                    className={cn(linearProgressVariants({ size }), className)}
                    role="progressbar"
                    aria-valuenow={indeterminate ? undefined : value}
                    aria-valuemax={max}
                    aria-valuemin={0}
                    aria-label={label}
                    {...props}
                >
                    {/* Buffer progress (if provided) */}
                    {bufferPercentage !== undefined && (
                        <div
                            className="absolute inset-0 bg-secondary-container/50 rounded-full transition-all duration-300"
                            style={{ width: `${bufferPercentage}%` }}
                        />
                    )}

                    {/* Main progress bar */}
                    <div
                        className={cn(
                            linearProgressBarVariants({
                                variant: indeterminate ? "indeterminate" : "determinate"
                            }),
                            indeterminate && "animate-pulse"
                        )}
                        style={{
                            width: indeterminate ? "100%" : `${percentage}%`,
                            animation: indeterminate
                                ? "indeterminate-progress 2s ease-in-out infinite"
                                : undefined,
                        }}
                    />
                </div>
            </div>
        );
    }
);
LinearProgress.displayName = "LinearProgress";

// Circular Progress Component
export interface CircularProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularProgressVariants> {
    /** Progress value (0-100) */
    value?: number;
    /** Maximum value (default: 100) */
    max?: number;
    /** Whether progress is indeterminate (unknown) */
    indeterminate?: boolean;
    /** Custom label for accessibility */
    label?: string;
    /** Whether to show progress text in center */
    showValue?: boolean;
    /** Stroke width for the progress ring */
    strokeWidth?: number;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
    ({
        className,
        size,
        value = 0,
        max = 100,
        indeterminate = false,
        label,
        showValue = false,
        strokeWidth = 2,
        ...props
    }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
        const radius = 45; // Fixed radius for consistent calculations
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        // Size mapping for consistent sizing
        const sizeMap = {
            xs: 16,
            sm: 24,
            default: 32,
            lg: 48,
            xl: 64,
            "2xl": 80,
        };

        const sizeInPx = sizeMap[size || "default"];

        return (
            <div
                ref={ref}
                className={cn(circularProgressVariants({ size }), className)}
                role="progressbar"
                aria-valuenow={indeterminate ? undefined : value}
                aria-valuemax={max}
                aria-valuemin={0}
                aria-label={label}
                {...props}
            >
                <svg
                    className="transform -rotate-90"
                    width={sizeInPx}
                    height={sizeInPx}
                    viewBox="0 0 100 100"
                >
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="text-secondary-container"
                    />

                    {/* Progress circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        className={cn(
                            "text-primary transition-all duration-300 ease-out",
                            indeterminate && "animate-spin"
                        )}
                        style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: indeterminate ? circumference * 0.25 : strokeDashoffset,
                            animation: indeterminate
                                ? "spin 1s linear infinite"
                                : undefined,
                        }}
                    />
                </svg>

                {/* Center text */}
                {showValue && !indeterminate && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>
        );
    }
);
CircularProgress.displayName = "CircularProgress";

// Step Progress Component (for multi-step processes)
export interface StepProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Current step (0-based index) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Step labels */
    steps?: string[];
    /** Custom label for accessibility */
    label?: string;
    /** Variant for styling */
    variant?: "default" | "compact";
}

const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
    ({
        className,
        currentStep,
        totalSteps,
        steps = [],
        label = "Progress",
        variant = "default",
        ...props
    }, ref) => {
        const percentage = ((currentStep + 1) / totalSteps) * 100;

        return (
            <div
                ref={ref}
                className={cn("w-full space-y-4", className)}
                role="progressbar"
                aria-valuenow={currentStep + 1}
                aria-valuemax={totalSteps}
                aria-valuemin={1}
                aria-label={`${label}: Step ${currentStep + 1} of ${totalSteps}`}
                {...props}
            >
                {variant === "default" && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{label}</span>
                        <span>{currentStep + 1} of {totalSteps}</span>
                    </div>
                )}

                {/* Progress bar */}
                <LinearProgress
                    value={percentage}
                    showValue={false}
                    size="default"
                />

                {/* Step indicators */}
                {variant === "default" && steps.length > 0 && (
                    <div className="flex justify-between">
                        {steps.slice(0, totalSteps).map((step, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex flex-col items-center space-y-1 text-xs",
                                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        index <= currentStep ? "bg-primary" : "bg-secondary-container"
                                    )}
                                />
                                <span className="text-center max-w-16 truncate">{step}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);
StepProgress.displayName = "StepProgress";

// Add CSS animation for indeterminate progress
if (typeof document !== "undefined" && !document.getElementById("progress-animations")) {
    const style = document.createElement("style");
    style.id = "progress-animations";
    style.textContent = `
    @keyframes indeterminate-progress {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(100%);
      }
    }
  `;
    document.head.appendChild(style);
}

export {
    LinearProgress,
    CircularProgress,
    StepProgress,
    linearProgressVariants,
    circularProgressVariants,
};
