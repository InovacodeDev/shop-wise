import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * @deprecated Navigation Drawer is deprecated in Material Design 3 (May 2025).
 * Use NavigationRail with expanded variant instead for better user experience.
 * This component is provided for legacy support only.
 */

// Material Design 3 Navigation Drawer variants
const navigationDrawerVariants = cva(
    "fixed inset-y-0 z-50 flex flex-col bg-surface-container-low border-r border-outline-variant transition-transform duration-300 ease-in-out",
    {
        variants: {
            variant: {
                standard: "w-80 left-0", // 320dp standard drawer
                modal: "w-80 left-0", // 320dp modal drawer
            },
            position: {
                left: "left-0",
                right: "right-0 border-r-0 border-l",
            },
            state: {
                closed: "-translate-x-full",
                open: "translate-x-0",
            },
        },
        compoundVariants: [
            {
                position: "right",
                state: "closed",
                class: "translate-x-full",
            },
        ],
        defaultVariants: {
            variant: "standard",
            position: "left",
            state: "closed",
        },
    }
);

const navigationDrawerOverlayVariants = cva(
    "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out",
    {
        variants: {
            visible: {
                true: "opacity-100",
                false: "opacity-0 pointer-events-none",
            },
        },
        defaultVariants: {
            visible: false,
        },
    }
);

const navigationDrawerHeaderVariants = cva(
    "flex items-center gap-4 px-6 py-4 border-b border-outline-variant/50 min-h-16",
    {
        variants: {
            variant: {
                standard: "",
                compact: "px-4 py-3 min-h-12",
            },
        },
        defaultVariants: {
            variant: "standard",
        },
    }
);

const navigationDrawerContentVariants = cva(
    "flex-1 overflow-y-auto py-2",
    {
        variants: {
            padding: {
                default: "px-3",
                none: "px-0",
            },
        },
        defaultVariants: {
            padding: "default",
        },
    }
);

const navigationDrawerItemVariants = cva(
    "flex items-center gap-3 rounded-full transition-all duration-200 ease-in-out cursor-pointer group relative min-h-14 mx-3 px-4", // 56dp minimum touch target
    {
        variants: {
            state: {
                default: "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50",
                active: "text-on-secondary-container bg-secondary-container",
                disabled: "text-on-surface-variant/38 cursor-not-allowed",
            },
        },
        compoundVariants: [
            // Active indicator
            {
                state: "active",
                class: "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-secondary-container before:rounded-r-full",
            },
        ],
        defaultVariants: {
            state: "default",
        },
    }
);

const navigationDrawerIconVariants = cva(
    "transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-6", // 24dp
                large: "size-8", // 32dp
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const navigationDrawerLabelVariants = cva(
    "text-sm font-medium transition-all duration-200 ease-in-out flex-1", // 14sp
    {
        variants: {
            state: {
                default: "text-on-surface-variant group-hover:text-on-surface",
                active: "text-on-secondary-container",
                disabled: "text-on-surface-variant/38",
            },
        },
        defaultVariants: {
            state: "default",
        },
    }
);

const navigationDrawerBadgeVariants = cva(
    "flex items-center justify-center rounded-full bg-error text-on-error text-[10px] font-medium leading-none",
    {
        variants: {
            size: {
                default: "min-w-4 h-4 px-1", // 16dp
                small: "size-2", // 8dp dot
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

export interface NavigationDrawerItemProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Icon element (24dp recommended) */
    icon: React.ReactNode;
    /** Active/selected icon (optional, uses icon if not provided) */
    activeIcon?: React.ReactNode;
    /** Label text */
    label: string;
    /** Unique value for this item */
    value?: string;
    /** Whether this item is active */
    active?: boolean;
    /** Badge content (number or text) */
    badge?: string | number;
    /** Whether to show a dot badge instead of text/number */
    dotBadge?: boolean;
    /** Whether this item is disabled */
    disabled?: boolean;
}

const NavigationDrawerItem = React.forwardRef<HTMLButtonElement, NavigationDrawerItemProps>(
    ({
        className,
        icon,
        activeIcon,
        label,
        active = false,
        badge,
        dotBadge = false,
        disabled = false,
        ...props
    }, ref) => {
        const displayIcon = active && activeIcon ? activeIcon : icon;
        const state = disabled ? "disabled" : (active ? "active" : "default");

        return (
            <button
                ref={ref}
                className={cn(
                    navigationDrawerItemVariants({ state }),
                    className
                )}
                disabled={disabled}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                role="menuitem"
                aria-selected={active}
                {...props}
            >
                {/* Icon */}
                <div className={cn(navigationDrawerIconVariants())}>
                    {displayIcon}
                </div>

                {/* Label */}
                <span className={cn(navigationDrawerLabelVariants({ state }))}>
                    {label}
                </span>

                {/* Badge */}
                {(badge !== undefined || dotBadge) && (
                    <div
                        className={cn(
                            navigationDrawerBadgeVariants({
                                size: dotBadge ? "small" : "default"
                            })
                        )}
                        aria-label={dotBadge ? "Has updates" : `${badge} notifications`}
                    >
                        {!dotBadge && badge}
                    </div>
                )}
            </button>
        );
    }
);
NavigationDrawerItem.displayName = "NavigationDrawerItem";

// Section divider for grouping items
export interface NavigationDrawerSectionProps
    extends React.HTMLAttributes<HTMLDivElement> {
    /** Section title */
    title?: string;
    /** Whether to show divider line */
    showDivider?: boolean;
    /** Children items */
    children: React.ReactNode;
}

const NavigationDrawerSection = React.forwardRef<HTMLDivElement, NavigationDrawerSectionProps>(
    ({
        className,
        title,
        showDivider = false,
        children,
        ...props
    }, ref) => {
        return (
            <div ref={ref} className={cn("py-2", className)} {...props}>
                {showDivider && (
                    <div className="mx-6 mb-2 border-t border-outline-variant/30" />
                )}

                {title && (
                    <div className="px-6 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                        {title}
                    </div>
                )}

                <div className="space-y-1">
                    {children}
                </div>
            </div>
        );
    }
);
NavigationDrawerSection.displayName = "NavigationDrawerSection";

export interface NavigationDrawerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationDrawerVariants> {
    /** Whether drawer is open */
    open?: boolean;
    /** Callback when drawer should close */
    onClose?: () => void;
    /** Currently active item value */
    value?: string;
    /** Callback when active item changes */
    onValueChange?: (value: string) => void;
    /** Header content */
    header?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Whether to show backdrop for modal variant */
    modal?: boolean;
    /** Whether clicking backdrop closes drawer */
    closeOnBackdropClick?: boolean;
    /** Children must be NavigationDrawerItem or NavigationDrawerSection components */
    children: React.ReactNode;
}

/**
 * @deprecated Navigation Drawer is deprecated in Material Design 3 (May 2025).
 * Use NavigationRail with expanded variant instead.
 */
const NavigationDrawer = React.forwardRef<HTMLDivElement, NavigationDrawerProps>(
    ({
        className,
        variant = "standard",
        position = "left",
        open = false,
        onClose,
        value,
        onValueChange,
        header,
        footer,
        modal = false,
        closeOnBackdropClick = true,
        children,
        ...props
    }, ref) => {
        const [isVisible, setIsVisible] = React.useState(open);
        const drawerRef = React.useRef<HTMLDivElement>(null);

        // Effect to sync internal state with prop
        React.useEffect(() => {
            setIsVisible(open);
        }, [open]);

        // Handle backdrop click
        const handleBackdropClick = React.useCallback((event: React.MouseEvent) => {
            if (closeOnBackdropClick && event.target === event.currentTarget) {
                onClose?.();
            }
        }, [closeOnBackdropClick, onClose]);

        // Handle escape key
        React.useEffect(() => {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape" && open) {
                    onClose?.();
                }
            };

            if (open) {
                document.addEventListener("keydown", handleEscape);
                return () => document.removeEventListener("keydown", handleEscape);
            }
        }, [open, onClose]);

        // Focus management
        React.useEffect(() => {
            if (open && drawerRef.current) {
                const firstFocusable = drawerRef.current.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                ) as HTMLElement;
                firstFocusable?.focus();
            }
        }, [open]);

        const processChildren = (children: React.ReactNode): React.ReactNode => {
            return React.Children.map(children, (child, index) => {
                if (React.isValidElement(child)) {
                    // Handle NavigationDrawerItem
                    if (child.type === NavigationDrawerItem) {
                        const itemProps = child.props as NavigationDrawerItemProps;
                        const itemValue = itemProps.value || itemProps.label || index.toString();
                        const isActive = value === itemValue;

                        return React.cloneElement(child, {
                            ...itemProps,
                            key: itemValue,
                            active: isActive,
                            onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                                onValueChange?.(itemValue);
                                itemProps.onClick?.(event);
                                // Optionally close drawer on item selection
                                if (modal) {
                                    onClose?.();
                                }
                            },
                        });
                    }

                    // Handle NavigationDrawerSection
                    if (child.type === NavigationDrawerSection) {
                        return React.cloneElement(child, {
                            ...child.props,
                            key: index,
                            children: processChildren(child.props.children),
                        });
                    }
                }

                return child;
            });
        };

        return (
            <>
                {/* Backdrop for modal variant */}
                {(modal || variant === "modal") && (
                    <div
                        className={cn(navigationDrawerOverlayVariants({
                            visible: isVisible
                        }))}
                        onClick={handleBackdropClick}
                        aria-hidden="true"
                    />
                )}

                {/* Drawer */}
                <nav
                    ref={drawerRef}
                    className={cn(
                        navigationDrawerVariants({
                            variant,
                            position,
                            state: isVisible ? "open" : "closed"
                        }),
                        className
                    )}
                    role="navigation"
                    aria-label="Navigation drawer"
                    aria-hidden={!isVisible}
                    {...props}
                >
                    {/* Deprecation Warning (only in development) */}
                    {process.env.NODE_ENV === "development" && (
                        <div className="bg-amber-100 border-b border-amber-200 p-2 text-xs text-amber-800">
                            ⚠️ NavigationDrawer is deprecated. Use NavigationRail instead.
                        </div>
                    )}

                    {/* Header */}
                    {header && (
                        <div className={cn(navigationDrawerHeaderVariants())}>
                            {header}
                        </div>
                    )}

                    {/* Content */}
                    <div className={cn(navigationDrawerContentVariants())}>
                        {processChildren(children)}
                    </div>

                    {/* Footer */}
                    {footer && (
                        <div className={cn(
                            navigationDrawerHeaderVariants(),
                            "border-t border-outline-variant/50 border-b-0"
                        )}>
                            {footer}
                        </div>
                    )}
                </nav>
            </>
        );
    }
);
NavigationDrawer.displayName = "NavigationDrawer";

// Navigation Drawer Hook for state management
export const useNavigationDrawer = (initialOpen = false) => {
    const [open, setOpen] = React.useState(initialOpen);

    const openDrawer = React.useCallback(() => setOpen(true), []);
    const closeDrawer = React.useCallback(() => setOpen(false), []);
    const toggleDrawer = React.useCallback(() => setOpen(prev => !prev), []);

    return {
        open,
        openDrawer,
        closeDrawer,
        toggleDrawer,
    };
};

// Responsive Navigation Drawer (automatically becomes modal on smaller screens)
export interface ResponsiveNavigationDrawerProps extends NavigationDrawerProps {
    /** Breakpoint below which drawer becomes modal */
    modalBreakpoint?: "sm" | "md" | "lg" | "xl";
}

/**
 * @deprecated Use ResponsiveNavigationRail instead
 */
const ResponsiveNavigationDrawer = React.forwardRef<HTMLDivElement, ResponsiveNavigationDrawerProps>(
    ({
        modalBreakpoint = "md",
        className,
        ...props
    }, ref) => {
        const [isModal, setIsModal] = React.useState(false);

        React.useEffect(() => {
            const breakpoints = {
                sm: 640,
                md: 768,
                lg: 1024,
                xl: 1280,
            };

            const checkBreakpoint = () => {
                setIsModal(window.innerWidth < breakpoints[modalBreakpoint]);
            };

            checkBreakpoint();
            window.addEventListener("resize", checkBreakpoint);
            return () => window.removeEventListener("resize", checkBreakpoint);
        }, [modalBreakpoint]);

        return (
            <NavigationDrawer
                ref={ref}
                variant={isModal ? "modal" : "standard"}
                modal={isModal}
                className={className}
                {...props}
            />
        );
    }
);
ResponsiveNavigationDrawer.displayName = "ResponsiveNavigationDrawer";

export {
    NavigationDrawer,
    NavigationDrawerItem,
    NavigationDrawerSection,
    ResponsiveNavigationDrawer,
    navigationDrawerVariants,
};
