import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

// Material Design 3 Button Group variants
const buttonGroupVariants = cva(
    "inline-flex",
    {
        variants: {
            variant: {
                // Standard button group (separated buttons)
                standard: "gap-2",
                // Connected button group (connected buttons)
                connected: "isolate",
            },
            orientation: {
                horizontal: "flex-row",
                vertical: "flex-col",
            },
        },
        defaultVariants: {
            variant: "standard",
            orientation: "horizontal",
        },
    }
);

const buttonGroupItemVariants = cva(
    "transition-all duration-200 ease-in-out",
    {
        variants: {
            variant: {
                standard: "",
                connected: "relative first:rounded-r-none last:rounded-l-none [&:not(:first-child):not(:last-child)]:rounded-none first:z-10 [&:not(:first-child)]:border-l-0 focus:z-20 hover:z-20",
            },
            orientation: {
                horizontal: "",
                vertical: "",
            },
        },
        compoundVariants: [
            {
                variant: "connected",
                orientation: "vertical",
                class: "first:rounded-b-none last:rounded-t-none [&:not(:first-child):not(:last-child)]:rounded-none [&:not(:first-child)]:border-t-0 [&:not(:first-child)]:border-l border-l-border",
            },
        ],
        defaultVariants: {
            variant: "standard",
            orientation: "horizontal",
        },
    }
);

export interface ButtonGroupProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
    children: React.ReactNode;
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
    ({ className, variant, orientation, children, ...props }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        );

        return (
            <div
                ref={ref}
                className={cn(buttonGroupVariants({ variant, orientation }), className)}
                role="group"
                {...props}
            >
                {validChildren.map((child, index) => {
                    if (React.isValidElement(child) && child.type === ButtonGroupItem) {
                        return React.cloneElement(child, {
                            ...child.props,
                            variant,
                            orientation,
                            key: index,
                        });
                    }
                    return child;
                })}
            </div>
        );
    }
);
ButtonGroup.displayName = "ButtonGroup";

export interface ButtonGroupItemProps
    extends Omit<ButtonProps, "variant">,
    VariantProps<typeof buttonGroupItemVariants> {
    selected?: boolean;
    onSelectedChange?: (selected: boolean) => void;
}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
    ({
        className,
        variant: groupVariant,
        orientation,
        selected = false,
        onSelectedChange,
        onClick,
        children,
        ...props
    }, ref) => {
        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            if (onSelectedChange) {
                onSelectedChange(!selected);
            }
            onClick?.(event);
        };

        return (
            <Button
                ref={ref}
                variant="outlined" // Default variant for button group items
                className={cn(
                    buttonGroupItemVariants({ variant: groupVariant, orientation }),
                    selected && "bg-secondary-container text-on-secondary-container",
                    className
                )}
                onClick={handleClick}
                aria-pressed={selected}
                {...props}
            >
                {children}
            </Button>
        );
    }
);
ButtonGroupItem.displayName = "ButtonGroupItem";

// Controlled Button Group for single selection
export interface ControlledButtonGroupProps extends ButtonGroupProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactElement<ControlledButtonGroupItemProps>[];
}

const ControlledButtonGroup = React.forwardRef<HTMLDivElement, ControlledButtonGroupProps>(
    ({ value, onValueChange, children, ...props }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<ControlledButtonGroupItemProps>[];

        return (
            <ButtonGroup ref={ref} {...props}>
                {validChildren.map((child, index) => {
                    const itemValue = child.props.value || index.toString();
                    const isSelected = value === itemValue;

                    return React.cloneElement(child, {
                        ...child.props,
                        key: itemValue,
                        selected: isSelected,
                        onSelectedChange: () => onValueChange?.(itemValue),
                    });
                })}
            </ButtonGroup>
        );
    }
);
ControlledButtonGroup.displayName = "ControlledButtonGroup";

export interface ControlledButtonGroupItemProps extends ButtonGroupItemProps {
    value?: string;
}

const ControlledButtonGroupItem = React.forwardRef<HTMLButtonElement, ControlledButtonGroupItemProps>(
    ({ value, ...props }, ref) => {
        return <ButtonGroupItem ref={ref} {...props} />;
    }
);
ControlledButtonGroupItem.displayName = "ControlledButtonGroupItem";

// Multi-select Button Group
export interface MultiSelectButtonGroupProps extends ButtonGroupProps {
    value?: string[];
    onValueChange?: (value: string[]) => void;
    children: React.ReactElement<MultiSelectButtonGroupItemProps>[];
}

const MultiSelectButtonGroup = React.forwardRef<HTMLDivElement, MultiSelectButtonGroupProps>(
    ({ value = [], onValueChange, children, ...props }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<MultiSelectButtonGroupItemProps>[];

        const handleItemChange = (itemValue: string, isSelected: boolean) => {
            if (!onValueChange) return;

            if (isSelected) {
                onValueChange([...value, itemValue]);
            } else {
                onValueChange(value.filter(v => v !== itemValue));
            }
        };

        return (
            <ButtonGroup ref={ref} {...props}>
                {validChildren.map((child, index) => {
                    const itemValue = child.props.value || index.toString();
                    const isSelected = value.includes(itemValue);

                    return React.cloneElement(child, {
                        ...child.props,
                        key: itemValue,
                        selected: isSelected,
                        onSelectedChange: (selected: boolean) =>
                            handleItemChange(itemValue, selected),
                    });
                })}
            </ButtonGroup>
        );
    }
);
MultiSelectButtonGroup.displayName = "MultiSelectButtonGroup";

export interface MultiSelectButtonGroupItemProps extends ButtonGroupItemProps {
    value?: string;
}

const MultiSelectButtonGroupItem = React.forwardRef<HTMLButtonElement, MultiSelectButtonGroupItemProps>(
    ({ value, ...props }, ref) => {
        return <ButtonGroupItem ref={ref} {...props} />;
    }
);
MultiSelectButtonGroupItem.displayName = "MultiSelectButtonGroupItem";

export {
    ButtonGroup,
    ButtonGroupItem,
    ControlledButtonGroup,
    ControlledButtonGroupItem,
    MultiSelectButtonGroup,
    MultiSelectButtonGroupItem,
    buttonGroupVariants
};
