import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Radio Button variants
const radioVariants = cva(
    "relative inline-flex items-center justify-center rounded-full transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38",
    {
        variants: {
            size: {
                default: "size-5", // 20dp icon size
                large: "size-6", // 24dp icon size  
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const radioInputVariants = cva(
    "sr-only peer",
);

const radioIndicatorVariants = cva(
    "flex items-center justify-center rounded-full border-2 transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-5 border-2", // 20dp with 2dp border
                large: "size-6 border-2", // 24dp with 2dp border
            },
            checked: {
                true: "border-primary bg-transparent",
                false: "border-on-surface-variant bg-transparent hover:border-on-surface",
            },
        },
        compoundVariants: [
            // Disabled states
            {
                checked: true,
                class: "peer-disabled:border-on-surface/38",
            },
            {
                checked: false,
                class: "peer-disabled:border-on-surface/38",
            },
        ],
        defaultVariants: {
            size: "default",
            checked: false,
        },
    }
);

const radioInnerDotVariants = cva(
    "rounded-full bg-primary transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-2.5", // 10dp inner dot for 20dp radio
                large: "size-3", // 12dp inner dot for 24dp radio
            },
            checked: {
                true: "scale-100 opacity-100",
                false: "scale-0 opacity-0",
            },
        },
        compoundVariants: [
            // Disabled state
            {
                checked: true,
                class: "peer-disabled:bg-on-surface/38",
            },
        ],
        defaultVariants: {
            size: "default",
            checked: false,
        },
    }
);

// State layer for hover/focus/pressed states (48dp minimum touch target)
const radioStateLayerVariants = cva(
    "absolute inset-0 rounded-full transition-all duration-200 ease-in-out -m-3.5", // Extends to 48dp touch target
    {
        variants: {
            state: {
                default: "",
                hover: "peer-hover:bg-primary/8",
                focus: "peer-focus-visible:bg-primary/12",
                pressed: "peer-active:bg-primary/12",
            },
        },
        defaultVariants: {
            state: "default",
        },
    }
);

export interface RadioButtonProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** Whether the radio button is checked */
    checked?: boolean;
    /** Callback when the checked state changes */
    onCheckedChange?: (checked: boolean) => void;
    /** Size variant */
    size?: "default" | "large";
    /** Label text */
    label?: string;
    /** Label position */
    labelPosition?: "right" | "left";
    /** Custom className for the container */
    containerClassName?: string;
    /** Custom className for the label */
    labelClassName?: string;
}

const RadioButton = React.forwardRef<HTMLInputElement, RadioButtonProps>(
    ({
        className,
        containerClassName,
        labelClassName,
        size = "default",
        checked = false,
        onCheckedChange,
        onChange,
        label,
        labelPosition = "right",
        id,
        disabled = false,
        ...props
    }, ref) => {
        const radioId = id || React.useId();

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            const isChecked = event.target.checked;
            onCheckedChange?.(isChecked);
            onChange?.(event);
        };

        const radioElement = (
            <div className={cn("relative inline-flex", containerClassName)}>
                <input
                    ref={ref}
                    id={radioId}
                    type="radio"
                    className={cn(radioInputVariants(), className)}
                    checked={checked}
                    onChange={handleChange}
                    disabled={disabled}
                    {...props}
                />

                {/* Touch target and state layers */}
                <div className="absolute inset-0 size-12 -m-3.5 rounded-full" />
                <div className={cn(radioStateLayerVariants({ state: "hover" }))} />
                <div className={cn(radioStateLayerVariants({ state: "focus" }))} />
                <div className={cn(radioStateLayerVariants({ state: "pressed" }))} />

                {/* Radio button indicator */}
                <div className={cn(radioIndicatorVariants({ size, checked }))}>
                    {/* Inner dot when checked */}
                    <div className={cn(radioInnerDotVariants({ size, checked }))} />
                </div>
            </div>
        );

        if (!label) {
            return radioElement;
        }

        return (
            <div className={cn(
                "flex items-center gap-3 cursor-pointer",
                disabled && "cursor-not-allowed opacity-38",
                labelPosition === "left" && "flex-row-reverse"
            )}>
                {radioElement}
                <label
                    htmlFor={radioId}
                    className={cn(
                        "text-sm font-medium text-on-surface cursor-pointer select-none",
                        disabled && "cursor-not-allowed",
                        labelClassName
                    )}
                >
                    {label}
                </label>
            </div>
        );
    }
);
RadioButton.displayName = "RadioButton";

// Radio Group component for managing multiple radio buttons
export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Currently selected value */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Callback when selection changes */
    onValueChange?: (value: string) => void;
    /** Group name for radio buttons */
    name?: string;
    /** Whether the group is disabled */
    disabled?: boolean;
    /** Layout orientation */
    orientation?: "horizontal" | "vertical";
    /** Size for all radio buttons in the group */
    size?: "default" | "large";
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({
        className,
        value,
        defaultValue,
        onValueChange,
        name: nameProp,
        disabled = false,
        orientation = "vertical",
        size = "default",
        children,
        ...props
    }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue || "");
        const isControlled = value !== undefined;
        const selectedValue = isControlled ? value : internalValue;
        const groupName = nameProp || React.useId();

        const handleValueChange = (newValue: string) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onValueChange?.(newValue);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "flex gap-4",
                    orientation === "vertical" && "flex-col",
                    orientation === "horizontal" && "flex-row flex-wrap",
                    className
                )}
                role="radiogroup"
                aria-disabled={disabled}
                {...props}
            >
                {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child) && child.type === RadioGroupItem) {
                        const itemValue = child.props.value || index.toString();
                        return React.cloneElement(child, {
                            ...child.props,
                            name: groupName,
                            checked: selectedValue === itemValue,
                            onCheckedChange: () => handleValueChange(itemValue),
                            disabled: disabled || child.props.disabled,
                            size: child.props.size || size,
                        });
                    }
                    return child;
                })}
            </div>
        );
    }
);
RadioGroup.displayName = "RadioGroup";

// Radio Group Item component
export interface RadioGroupItemProps extends Omit<RadioButtonProps, "name" | "onCheckedChange"> {
    /** Value for this radio button */
    value: string;
    /** Label text for this item */
    children?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ value, children, label, ...props }, ref) => {
        const displayLabel = children || label;

        return (
            <RadioButton
                ref={ref}
                label={typeof displayLabel === "string" ? displayLabel : undefined}
                value={value}
                {...props}
            >
                {typeof displayLabel !== "string" ? displayLabel : null}
            </RadioButton>
        );
    }
);
RadioGroupItem.displayName = "RadioGroupItem";

// Controlled Radio Group (explicit controlled component)
export interface ControlledRadioGroupProps extends Omit<RadioGroupProps, "defaultValue"> {
    value: string;
    onValueChange: (value: string) => void;
}

const ControlledRadioGroup = React.forwardRef<HTMLDivElement, ControlledRadioGroupProps>(
    (props, ref) => {
        return <RadioGroup ref={ref} {...props} />;
    }
);
ControlledRadioGroup.displayName = "ControlledRadioGroup";

export {
    RadioButton,
    RadioGroup,
    RadioGroupItem,
    ControlledRadioGroup,
    radioVariants,
    radioIndicatorVariants,
};
