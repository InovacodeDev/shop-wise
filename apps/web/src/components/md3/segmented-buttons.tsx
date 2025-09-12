import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Segmented Button variants
const segmentedButtonsVariants = cva(
    "inline-flex rounded-full border border-outline bg-transparent p-1 isolate",
    {
        variants: {
            size: {
                default: "h-10", // 40dp height
                large: "h-12", // 48dp height  
            },
            density: {
                default: "gap-0",
                comfortable: "gap-1",
            },
        },
        defaultVariants: {
            size: "default",
            density: "default",
        },
    }
);

const segmentedButtonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative",
    {
        variants: {
            size: {
                default: "h-8 min-w-12 text-sm [&_svg]:size-4", // 32dp height inside container
                large: "h-10 min-w-14 text-base [&_svg]:size-5", // 40dp height inside container
            },
            selected: {
                true: "bg-secondary-container text-on-secondary-container shadow-sm border-transparent z-10",
                false: "bg-transparent text-on-surface hover:bg-on-surface/8 active:bg-on-surface/12",
            },
        },
        defaultVariants: {
            size: "default",
            selected: false,
        },
    }
);

export interface SegmentedButtonsProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof segmentedButtonsVariants> {
    value?: string;
    onValueChange?: (value: string) => void;
    multiSelect?: boolean;
    multiValue?: string[];
    onMultiValueChange?: (value: string[]) => void;
    children: React.ReactElement<SegmentedButtonProps>[];
}

const SegmentedButtons = React.forwardRef<HTMLDivElement, SegmentedButtonsProps>(
    ({
        className,
        size,
        density,
        value,
        onValueChange,
        multiSelect = false,
        multiValue = [],
        onMultiValueChange,
        children,
        ...props
    }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<SegmentedButtonProps>[];

        const handleSingleSelect = (buttonValue: string) => {
            if (value === buttonValue) {
                // Allow deselection
                onValueChange?.("");
            } else {
                onValueChange?.(buttonValue);
            }
        };

        const handleMultiSelect = (buttonValue: string) => {
            if (!onMultiValueChange) return;

            if (multiValue.includes(buttonValue)) {
                onMultiValueChange(multiValue.filter(v => v !== buttonValue));
            } else {
                onMultiValueChange([...multiValue, buttonValue]);
            }
        };

        return (
            <div
                ref={ref}
                className={cn(segmentedButtonsVariants({ size, density }), className)}
                role="group"
                {...props}
            >
                {validChildren.map((child, index) => {
                    const buttonValue = child.props.value || index.toString();
                    const isSelected = multiSelect
                        ? multiValue.includes(buttonValue)
                        : value === buttonValue;

                    return React.cloneElement(child, {
                        ...child.props,
                        key: buttonValue,
                        size,
                        selected: isSelected,
                        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                            if (multiSelect) {
                                handleMultiSelect(buttonValue);
                            } else {
                                handleSingleSelect(buttonValue);
                            }
                            child.props.onClick?.(event);
                        },
                    });
                })}
            </div>
        );
    }
);
SegmentedButtons.displayName = "SegmentedButtons";

export interface SegmentedButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof segmentedButtonVariants> {
    value?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

const SegmentedButton = React.forwardRef<HTMLButtonElement, SegmentedButtonProps>(
    ({ className, size, selected, value, icon, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(segmentedButtonVariants({ size, selected }), className)}
                aria-pressed={selected ? "true" : "false"}
                data-value={value}
                {...props}
            >
                {icon && (
                    <span className={cn("flex-shrink-0", children && "mr-2")}>
                        {icon}
                    </span>
                )}
                {children}
            </button>
        );
    }
);
SegmentedButton.displayName = "SegmentedButton";

// Icon-only segmented button
export interface IconSegmentedButtonProps extends Omit<SegmentedButtonProps, "children"> {
    icon: React.ReactNode;
    label: string; // For accessibility
}

const IconSegmentedButton = React.forwardRef<HTMLButtonElement, IconSegmentedButtonProps>(
    ({ icon, label, ...props }, ref) => {
        return (
            <SegmentedButton
                ref={ref}
                aria-label={label}
                title={label}
                {...props}
            >
                {icon}
            </SegmentedButton>
        );
    }
);
IconSegmentedButton.displayName = "IconSegmentedButton";

// Text + Icon segmented button
export interface TextIconSegmentedButtonProps extends SegmentedButtonProps {
    icon: React.ReactNode;
    children: React.ReactNode;
}

const TextIconSegmentedButton = React.forwardRef<HTMLButtonElement, TextIconSegmentedButtonProps>(
    ({ icon, children, ...props }, ref) => {
        return (
            <SegmentedButton
                ref={ref}
                icon={icon}
                {...props}
            >
                {children}
            </SegmentedButton>
        );
    }
);
TextIconSegmentedButton.displayName = "TextIconSegmentedButton";

export {
    SegmentedButtons,
    SegmentedButton,
    IconSegmentedButton,
    TextIconSegmentedButton,
    segmentedButtonsVariants
};
