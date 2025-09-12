import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button, type ButtonProps } from "./button";
import { cn } from "@/lib/utils";

// Material Design 3 FAB variants
const fabVariants = cva(
    "rounded-2xl shadow-lg hover:shadow-xl active:shadow-lg transition-all duration-200 ease-in-out",
    {
        variants: {
            variant: {
                // Primary container (default)
                primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 active:bg-primary-container/95",
                secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/95",
                tertiary: "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90 active:bg-tertiary-container/95",
                // Surface container (deprecated but available)
                surface: "bg-surface-container text-on-surface hover:bg-surface-container/90 active:bg-surface-container/95",
            },
            size: {
                default: "size-14 [&_svg]:size-6", // 56dp (medium FAB)
                small: "size-10 [&_svg]:size-4", // 40dp (small FAB - deprecated but kept for compatibility)
                medium: "size-14 [&_svg]:size-6", // 56dp (medium FAB)
                large: "size-16 [&_svg]:size-7", // 64dp (large FAB)
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

export interface FABProps
    extends Omit<ButtonProps, "variant" | "size" | "shape">,
    VariantProps<typeof fabVariants> {
    children?: React.ReactNode;
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    fabVariants({ variant, size }),
                    "p-0 gap-0", // Override button padding and gap
                    className
                )}
                shape="round" // FABs are always round
                {...props}
            >
                {children}
            </Button>
        );
    }
);
FAB.displayName = "FAB";

// Extended FAB component
const extendedFabVariants = cva(
    "rounded-2xl shadow-lg hover:shadow-xl active:shadow-lg transition-all duration-200 ease-in-out min-w-20 gap-3 px-4",
    {
        variants: {
            variant: {
                primary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90 active:bg-primary-container/95",
                secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90 active:bg-secondary-container/95",
                tertiary: "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90 active:bg-tertiary-container/95",
                surface: "bg-surface-container text-on-surface hover:bg-surface-container/90 active:bg-surface-container/95",
            },
            size: {
                small: "h-10 text-sm [&_svg]:size-4", // Small extended FAB
                medium: "h-12 text-base [&_svg]:size-5", // Medium extended FAB
                large: "h-14 text-lg [&_svg]:size-6", // Large extended FAB
            },
            collapsed: {
                true: "min-w-14 px-0 gap-0", // Collapsed state (just icon)
                false: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "medium",
            collapsed: false,
        },
    }
);

export interface ExtendedFABProps
    extends Omit<ButtonProps, "variant" | "size" | "shape">,
    VariantProps<typeof extendedFabVariants> {
    icon?: React.ReactNode;
    label?: string;
}

const ExtendedFAB = React.forwardRef<HTMLButtonElement, ExtendedFABProps>(
    ({ className, variant, size, collapsed = false, icon, label, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    extendedFabVariants({ variant, size, collapsed }),
                    className
                )}
                shape="round"
                {...props}
            >
                {icon}
                {!collapsed && (label || children)}
            </Button>
        );
    }
);
ExtendedFAB.displayName = "ExtendedFAB";

// FAB Menu component
export interface FABMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    variant?: "primary" | "secondary" | "tertiary";
    className?: string;
}

const FABMenu = React.forwardRef<HTMLDivElement, FABMenuProps>(
    ({ trigger, children, open = false, onOpenChange, variant = "primary", className }, ref) => {
        const [isOpen, setIsOpen] = React.useState(open);

        React.useEffect(() => {
            setIsOpen(open);
        }, [open]);

        const handleToggle = () => {
            const newState = !isOpen;
            setIsOpen(newState);
            onOpenChange?.(newState);
        };

        return (
            <div ref={ref} className={cn("relative", className)}>
                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={handleToggle}
                    />
                )}

                {/* Menu Items */}
                {isOpen && (
                    <div className="absolute bottom-16 right-0 z-50 flex flex-col-reverse gap-4 min-w-max">
                        {children}
                    </div>
                )}

                {/* Trigger Button */}
                <div onClick={handleToggle} className="relative z-50">
                    {trigger}
                </div>
            </div>
        );
    }
);
FABMenu.displayName = "FABMenu";

// FAB Menu Item component
export interface FABMenuItemProps extends FABProps {
    label?: string;
}

const FABMenuItem = React.forwardRef<HTMLButtonElement, FABMenuItemProps>(
    ({ className, label, children, size = "medium", ...props }, ref) => {
        return (
            <div className="flex items-center gap-4">
                {label && (
                    <span className="bg-surface-container text-on-surface text-sm px-3 py-1.5 rounded-md shadow-md whitespace-nowrap">
                        {label}
                    </span>
                )}
                <FAB
                    ref={ref}
                    size={size}
                    className={cn(className)}
                    {...props}
                >
                    {children}
                </FAB>
            </div>
        );
    }
);
FABMenuItem.displayName = "FABMenuItem";

export { FAB, ExtendedFAB, FABMenu, FABMenuItem, fabVariants };
