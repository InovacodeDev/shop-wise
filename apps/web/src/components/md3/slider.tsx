"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// MD3 Slider variants following Material Design 3 specifications
const sliderVariants = cva(
    "relative flex w-full touch-none select-none items-center",
    {
        variants: {
            size: {
                default: "h-12", // 48dp touch target
                sm: "h-10" // Compact version
            },
            variant: {
                default: "",
                error: ""
            }
        },
        defaultVariants: {
            size: "default",
            variant: "default"
        }
    }
);

const sliderTrackVariants = cva(
    "relative grow overflow-hidden rounded-full",
    {
        variants: {
            size: {
                default: "h-1", // 4dp track height
                sm: "h-0.5" // 2dp for compact
            },
            variant: {
                default: "bg-surface-variant",
                error: "bg-error-container"
            }
        },
        defaultVariants: {
            size: "default",
            variant: "default"
        }
    }
);

const sliderRangeVariants = cva(
    "absolute h-full rounded-full",
    {
        variants: {
            variant: {
                default: "bg-primary",
                error: "bg-error"
            }
        },
        defaultVariants: {
            variant: "default"
        }
    }
);

const sliderThumbVariants = cva([
    // Base thumb styles - 20dp handle
    "block rounded-full border-2 transition-all duration-200 ease-out",
    "ring-offset-background focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // State layer
    "relative before:absolute before:inset-0 before:rounded-full before:transition-colors before:pointer-events-none",
    // Hover: 40dp state layer
    "before:hover:bg-primary/8 before:active:bg-primary/12",
    "before:hover:w-10 before:hover:h-10 before:hover:-inset-4",
    "before:active:w-11 before:active:h-11 before:active:-inset-5"
], {
    variants: {
        size: {
            default: "h-5 w-5 bg-background", // 20dp handle
            sm: "h-4 w-4 bg-background" // 16dp handle  
        },
        variant: {
            default: "border-primary before:hover:bg-primary/8",
            error: "border-error before:hover:bg-error/8"
        }
    },
    defaultVariants: {
        size: "default",
        variant: "default"
    }
});

interface SliderProps
    extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    VariantProps<typeof sliderVariants> {
    label?: string;
    showValue?: boolean;
    valueFormatter?: (value: number) => string;
    error?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

const Slider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    SliderProps
>(({
    className,
    size,
    variant,
    label,
    showValue,
    valueFormatter,
    error,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    ...props
}, ref) => {
    const sliderVariant = error ? "error" : variant;
    const currentValue = value || defaultValue || [min];
    const displayValue = Array.isArray(currentValue) ? currentValue[0] : currentValue;

    const sliderElement = (
        <SliderPrimitive.Root
            ref={ref}
            className={cn(sliderVariants({ size, variant: sliderVariant }), className)}
            value={value}
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={step}
            {...props}
        >
            <SliderPrimitive.Track
                className={cn(sliderTrackVariants({ size, variant: sliderVariant }))}
            >
                <SliderPrimitive.Range
                    className={cn(sliderRangeVariants({ variant: sliderVariant }))}
                />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
                className={cn(sliderThumbVariants({ size, variant: sliderVariant }))}
            />
        </SliderPrimitive.Root>
    );

    if (label || showValue) {
        return (
            <div className="w-full space-y-2">
                {(label || showValue) && (
                    <div className="flex items-center justify-between">
                        {label && (
                            <label className={cn(
                                "text-sm font-medium",
                                error ? "text-error" : "text-on-surface",
                                props.disabled && "opacity-38"
                            )}>
                                {label}
                            </label>
                        )}
                        {showValue && (
                            <span className={cn(
                                "text-xs font-medium tabular-nums",
                                error ? "text-error" : "text-on-surface-variant",
                                props.disabled && "opacity-38"
                            )}>
                                {valueFormatter ? valueFormatter(displayValue) : displayValue}
                            </span>
                        )}
                    </div>
                )}
                {sliderElement}
            </div>
        );
    }

    return sliderElement;
});
Slider.displayName = SliderPrimitive.Root.displayName;

// Range Slider for two handles
interface RangeSliderProps extends Omit<SliderProps, 'value' | 'defaultValue'> {
    value?: [number, number];
    defaultValue?: [number, number];
    formatRange?: (min: number, max: number) => string;
}

const RangeSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    RangeSliderProps
>(({
    className,
    size,
    variant,
    label,
    showValue,
    formatRange,
    error,
    min = 0,
    max = 100,
    step = 1,
    value = [min, max],
    defaultValue = [min, max],
    ...props
}, ref) => {
    const sliderVariant = error ? "error" : variant;
    const currentValue = value || defaultValue;
    const [minVal, maxVal] = currentValue;

    return (
        <div className="w-full space-y-2">
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <label className={cn(
                            "text-sm font-medium",
                            error ? "text-error" : "text-on-surface",
                            props.disabled && "opacity-38"
                        )}>
                            {label}
                        </label>
                    )}
                    {showValue && (
                        <span className={cn(
                            "text-xs font-medium tabular-nums",
                            error ? "text-error" : "text-on-surface-variant",
                            props.disabled && "opacity-38"
                        )}>
                            {formatRange ? formatRange(minVal, maxVal) : `${minVal} - ${maxVal}`}
                        </span>
                    )}
                </div>
            )}

            <SliderPrimitive.Root
                ref={ref}
                className={cn(sliderVariants({ size, variant: sliderVariant }), className)}
                value={value}
                defaultValue={defaultValue}
                min={min}
                max={max}
                step={step}
                {...props}
            >
                <SliderPrimitive.Track
                    className={cn(sliderTrackVariants({ size, variant: sliderVariant }))}
                >
                    <SliderPrimitive.Range
                        className={cn(sliderRangeVariants({ variant: sliderVariant }))}
                    />
                </SliderPrimitive.Track>
                <SliderPrimitive.Thumb
                    className={cn(sliderThumbVariants({ size, variant: sliderVariant }))}
                />
                <SliderPrimitive.Thumb
                    className={cn(sliderThumbVariants({ size, variant: sliderVariant }))}
                />
            </SliderPrimitive.Root>
        </div>
    );
});
RangeSlider.displayName = "RangeSlider";

// Discrete Slider with step indicators
interface DiscreteSliderProps extends SliderProps {
    showSteps?: boolean;
    stepLabels?: string[];
}

const DiscreteSlider = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    DiscreteSliderProps
>(({ showSteps, stepLabels, min = 0, max = 100, step = 10, ...props }, ref) => {
    const steps = Math.floor((max - min) / step) + 1;

    return (
        <div className="w-full space-y-4">
            <Slider
                ref={ref}
                min={min}
                max={max}
                step={step}
                {...props}
            />

            {(showSteps || stepLabels) && (
                <div className="relative">
                    <div className="flex justify-between">
                        {Array.from({ length: steps }, (_, i) => {
                            const stepValue = min + (i * step);
                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center"
                                >
                                    <div className="w-0.5 h-2 bg-outline-variant" />
                                    {stepLabels && stepLabels[i] && (
                                        <span className="text-xs text-on-surface-variant mt-1">
                                            {stepLabels[i]}
                                        </span>
                                    )}
                                    {showSteps && !stepLabels && (
                                        <span className="text-xs text-on-surface-variant mt-1">
                                            {stepValue}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
});
DiscreteSlider.displayName = "DiscreteSlider";

export { Slider, RangeSlider, DiscreteSlider, sliderVariants };
