import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Navigation Rail variants
const navigationRailVariants = cva(
    "flex flex-col bg-surface border-r border-outline-variant",
    {
        variants: {
            variant: {
                standard: "w-20", // 80dp - standard rail width
                expanded: "w-80", // 320dp - expanded rail width
            },
            alignment: {
                top: "justify-start",
                center: "justify-center",
                bottom: "justify-end",
            },
            size: {
                default: "min-h-screen",
                compact: "min-h-96",
            },
        },
        defaultVariants: {
            variant: "standard",
            alignment: "top",
            size: "default",
        },
    }
);

const navigationRailContentVariants = cva(
    "flex flex-col gap-3 p-3",
    {
        variants: {
            variant: {
                standard: "",
                expanded: "px-6",
            },
        },
        defaultVariants: {
            variant: "standard",
        },
    }
);

const navigationRailItemVariants = cva(
    "flex items-center rounded-full transition-all duration-200 ease-in-out cursor-pointer group relative min-h-14", // 56dp minimum touch target
    {
        variants: {
            variant: {
                standard: "flex-col gap-1 w-14 p-1 justify-center text-center",
                expanded: "flex-row gap-3 p-4 justify-start w-full",
            },
            state: {
                default: "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50",
                active: "text-on-secondary-container bg-secondary-container",
                disabled: "text-on-surface-variant/38 cursor-not-allowed",
            },
        },
        compoundVariants: [
            // Active indicator for standard rail
            {
                variant: "standard",
                state: "active",
                class: "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-8 before:bg-secondary-container before:rounded-r-full",
            },
        ],
        defaultVariants: {
            variant: "standard",
            state: "default",
        },
    }
);

const navigationRailIconVariants = cva(
    "transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-6", // 24dp
                large: "size-8", // 32dp for expanded
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const navigationRailLabelVariants = cva(
    "font-medium transition-all duration-200 ease-in-out",
    {
        variants: {
            variant: {
                standard: "text-xs leading-4 text-center line-clamp-1", // 12sp
                expanded: "text-sm leading-5 flex-1", // 14sp
            },
            state: {
                default: "text-on-surface-variant group-hover:text-on-surface",
                active: "text-on-secondary-container",
                disabled: "text-on-surface-variant/38",
            },
        },
        defaultVariants: {
            variant: "standard",
            state: "default",
        },
    }
);

const navigationRailBadgeVariants = cva(
    "flex items-center justify-center rounded-full bg-error text-on-error text-[10px] font-medium leading-none absolute",
    {
        variants: {
            variant: {
                standard: "top-2 right-2",
                expanded: "top-3 right-3",
            },
            size: {
                default: "min-w-4 h-4 px-1", // 16dp
                small: "size-2", // 8dp dot
            },
        },
        defaultVariants: {
            variant: "standard",
            size: "default",
        },
    }
);

// Header area for FAB or menu button
const navigationRailHeaderVariants = cva(
    "flex items-center justify-center p-3 border-b border-outline-variant/50",
    {
        variants: {
            variant: {
                standard: "h-20", // 80dp to match FAB + padding
                expanded: "h-16 justify-start px-6", // 64dp
            },
        },
        defaultVariants: {
            variant: "standard",
        },
    }
);

export interface NavigationRailItemProps
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
    /** Rail variant (inherited from parent) */
    variant?: "standard" | "expanded";
}

const NavigationRailItem = React.forwardRef<HTMLButtonElement, NavigationRailItemProps>(
    ({
        className,
        icon,
        activeIcon,
        label,
        active = false,
        badge,
        dotBadge = false,
        disabled = false,
        variant = "standard",
        ...props
    }, ref) => {
        const displayIcon = active && activeIcon ? activeIcon : icon;
        const state = disabled ? "disabled" : (active ? "active" : "default");

        return (
            <button
                ref={ref}
                className={cn(
                    navigationRailItemVariants({ variant, state }),
                    className
                )}
                disabled={disabled}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                role="tab"
                aria-selected={active}
                {...props}
            >
                {/* Icon container with badge */}
                <div className="relative">
                    <div className={cn(
                        navigationRailIconVariants({
                            size: variant === "expanded" ? "large" : "default"
                        })
                    )}>
                        {displayIcon}
                    </div>

                    {/* Badge */}
                    {(badge !== undefined || dotBadge) && (
                        <div
                            className={cn(
                                navigationRailBadgeVariants({
                                    variant,
                                    size: dotBadge ? "small" : "default"
                                })
                            )}
                            aria-label={dotBadge ? "Has updates" : `${badge} notifications`}
                        >
                            {!dotBadge && badge}
                        </div>
                    )}
                </div>

                {/* Label */}
                <span
                    className={cn(
                        navigationRailLabelVariants({ variant, state })
                    )}
                >
                    {label}
                </span>
            </button>
        );
    }
);
NavigationRailItem.displayName = "NavigationRailItem";

export interface NavigationRailProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationRailVariants> {
    /** Currently active item value */
    value?: string;
    /** Callback when active item changes */
    onValueChange?: (value: string) => void;
    /** Header content (FAB, menu button, or other content) */
    header?: React.ReactNode;
    /** Footer content */
    footer?: React.ReactNode;
    /** Whether rail can be expanded */
    expandable?: boolean;
    /** Whether rail is currently expanded */
    expanded?: boolean;
    /** Callback when expansion state changes */
    onExpandedChange?: (expanded: boolean) => void;
    /** Children must be NavigationRailItem components */
    children: React.ReactElement<NavigationRailItemProps>[];
}

const NavigationRail = React.forwardRef<HTMLDivElement, NavigationRailProps>(
    ({
        className,
        variant = "standard",
        alignment = "top",
        size,
        value,
        onValueChange,
        header,
        footer,
        expandable = false,
        expanded = false,
        onExpandedChange,
        children,
        ...props
    }, ref) => {
        const [internalExpanded, setInternalExpanded] = React.useState(expanded);
        const isExpanded = expandable ? internalExpanded : (variant === "expanded");
        const currentVariant = isExpanded ? "expanded" : "standard";

        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<NavigationRailItemProps>[];

        const toggleExpanded = () => {
            if (expandable) {
                const newExpanded = !internalExpanded;
                setInternalExpanded(newExpanded);
                onExpandedChange?.(newExpanded);
            }
        };

        React.useEffect(() => {
            if (expandable) {
                setInternalExpanded(expanded);
            }
        }, [expanded, expandable]);

        return (
            <aside
                ref={ref}
                className={cn(
                    navigationRailVariants({
                        variant: currentVariant,
                        alignment,
                        size
                    }),
                    className
                )}
                role="navigation"
                aria-label="Main navigation"
                {...props}
            >
                {/* Header */}
                {header && (
                    <div className={cn(navigationRailHeaderVariants({ variant: currentVariant }))}>
                        {expandable && currentVariant === "expanded" ? (
                            <div className="flex items-center justify-between w-full">
                                <div>{header}</div>
                                <button
                                    onClick={toggleExpanded}
                                    className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors"
                                    aria-label="Collapse navigation"
                                >
                                    <div className="size-6 rotate-180">←</div>
                                </button>
                            </div>
                        ) : (
                            <div onClick={expandable ? toggleExpanded : undefined}>
                                {header}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation Items */}
                <div className={cn(
                    navigationRailContentVariants({ variant: currentVariant }),
                    alignment === "center" && "flex-1 justify-center",
                    alignment === "bottom" && "flex-1 justify-end"
                )}>
                    {validChildren.map((child, index) => {
                        const itemValue = child.props.value || child.props.label || index.toString();
                        const isActive = value === itemValue;

                        return React.cloneElement(child, {
                            ...child.props,
                            key: itemValue,
                            active: isActive,
                            variant: currentVariant,
                            onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                                onValueChange?.(itemValue);
                                child.props.onClick?.(event);
                            },
                        });
                    })}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={cn(
                        navigationRailHeaderVariants({ variant: currentVariant }),
                        "border-t border-outline-variant/50 border-b-0"
                    )}>
                        {footer}
                    </div>
                )}
            </aside>
        );
    }
);
NavigationRail.displayName = "NavigationRail";

// Controlled Navigation Rail
export interface ControlledNavigationRailProps extends NavigationRailProps {
    value: string;
    onValueChange: (value: string) => void;
}

const ControlledNavigationRail = React.forwardRef<HTMLDivElement, ControlledNavigationRailProps>(
    (props, ref) => {
        return <NavigationRail ref={ref} {...props} />;
    }
);
ControlledNavigationRail.displayName = "ControlledNavigationRail";

// Responsive Navigation Rail (adapts to screen size)
export interface ResponsiveNavigationRailProps extends NavigationRailProps {
    /** Breakpoint to switch from standard to expanded */
    expandBreakpoint?: "md" | "lg" | "xl" | "2xl";
    /** Whether to hide on mobile */
    hideOnMobile?: boolean;
}

const ResponsiveNavigationRail = React.forwardRef<HTMLDivElement, ResponsiveNavigationRailProps>(
    ({
        expandBreakpoint = "lg",
        hideOnMobile = true,
        className,
        ...props
    }, ref) => {
        const breakpointClass = {
            md: "md:block",
            lg: "lg:block",
            xl: "xl:block",
            "2xl": "2xl:block",
        }[expandBreakpoint];

        const expandedClass = {
            md: "md:w-80",
            lg: "lg:w-80",
            xl: "xl:w-80",
            "2xl": "2xl:w-80",
        }[expandBreakpoint];

        return (
            <NavigationRail
                ref={ref}
                className={cn(
                    hideOnMobile && "hidden",
                    breakpointClass,
                    expandedClass,
                    className
                )}
                {...props}
            />
        );
    }
);
ResponsiveNavigationRail.displayName = "ResponsiveNavigationRail";

// Navigation Rail with Adaptive Header
export interface NavigationRailWithMenuProps extends NavigationRailProps {
    /** Menu button icon */
    menuIcon?: React.ReactNode;
    /** Menu button action */
    onMenuClick?: () => void;
    /** Whether menu is open */
    menuOpen?: boolean;
}

const NavigationRailWithMenu = React.forwardRef<HTMLDivElement, NavigationRailWithMenuProps>(
    ({
        menuIcon = "☰",
        onMenuClick,
        menuOpen = false,
        header,
        ...props
    }, ref) => {
        const menuButton = (
            <button
                onClick={onMenuClick}
                className="flex items-center justify-center p-3 rounded-full hover:bg-surface-variant/50 transition-colors"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
            >
                <div className="size-6">
                    {menuIcon}
                </div>
            </button>
        );

        return (
            <NavigationRail
                ref={ref}
                header={header || menuButton}
                {...props}
            />
        );
    }
);
NavigationRailWithMenu.displayName = "NavigationRailWithMenu";

export {
    NavigationRail,
    NavigationRailItem,
    ControlledNavigationRail,
    ResponsiveNavigationRail,
    NavigationRailWithMenu,
    navigationRailVariants,
};
