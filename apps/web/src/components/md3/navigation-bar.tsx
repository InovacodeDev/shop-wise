import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Navigation Bar variants
const navigationBarVariants = cva(
    "flex items-center justify-around bg-surface-container border-t border-outline-variant",
    {
        variants: {
            size: {
                default: "h-20 px-2", // 80dp height
                compact: "h-16 px-1", // 64dp height for smaller screens
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const navigationBarItemVariants = cva(
    "flex flex-col items-center justify-center gap-1 rounded-full transition-all duration-200 ease-in-out min-w-16 py-2 px-2 relative",
    {
        variants: {
            variant: {
                default: "text-on-surface-variant hover:text-on-surface",
                active: "text-on-secondary-container bg-secondary-container",
            },
            size: {
                default: "min-h-8", // 32dp minimum touch target height
                compact: "min-h-6", // 24dp for compact
            },
            showLabel: {
                true: "",
                false: "pb-0",
            },
        },
        compoundVariants: [
            // Badge positioning
            {
                size: "default",
                class: "[&_.badge]:absolute [&_.badge]:top-1 [&_.badge]:right-2",
            },
            {
                size: "compact",
                class: "[&_.badge]:absolute [&_.badge]:top-0 [&_.badge]:right-1",
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            showLabel: true,
        },
    }
);

const navigationBarIconVariants = cva(
    "transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-6", // 24dp
                compact: "size-5", // 20dp
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

const navigationBarLabelVariants = cva(
    "text-xs font-medium transition-all duration-200 ease-in-out text-center line-clamp-1",
    {
        variants: {
            variant: {
                default: "text-on-surface-variant",
                active: "text-on-secondary-container",
            },
            size: {
                default: "text-xs leading-4", // 12sp
                compact: "text-[10px] leading-3", // 10sp for compact
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const navigationBarBadgeVariants = cva(
    "badge flex items-center justify-center rounded-full bg-error text-on-error text-[10px] font-medium leading-none",
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

export interface NavigationBarItemProps
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
    /** Whether to show the label */
    showLabel?: boolean;
    /** Size variant */
    size?: "default" | "compact";
}

const NavigationBarItem = React.forwardRef<HTMLButtonElement, NavigationBarItemProps>(
    ({
        className,
        icon,
        activeIcon,
        label,
        active = false,
        badge,
        dotBadge = false,
        showLabel = true,
        size = "default",
        ...props
    }, ref) => {
        const displayIcon = active && activeIcon ? activeIcon : icon;

        return (
            <button
                ref={ref}
                className={cn(
                    navigationBarItemVariants({
                        variant: active ? "active" : "default",
                        size,
                        showLabel
                    }),
                    className
                )}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                role="tab"
                aria-selected={active}
                {...props}
            >
                {/* Icon container with badge */}
                <div className="relative">
                    <div className={cn(navigationBarIconVariants({ size }))}>
                        {displayIcon}
                    </div>

                    {/* Badge */}
                    {(badge !== undefined || dotBadge) && (
                        <div
                            className={cn(
                                navigationBarBadgeVariants({
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
                {showLabel && (
                    <span
                        className={cn(
                            navigationBarLabelVariants({
                                variant: active ? "active" : "default",
                                size,
                            })
                        )}
                    >
                        {label}
                    </span>
                )}
            </button>
        );
    }
);
NavigationBarItem.displayName = "NavigationBarItem";

export interface NavigationBarProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof navigationBarVariants> {
    /** Currently active item value */
    value?: string;
    /** Callback when active item changes */
    onValueChange?: (value: string) => void;
    /** Whether to show labels on all items */
    showLabels?: boolean;
    /** Children must be NavigationBarItem components */
    children: React.ReactElement<NavigationBarItemProps>[];
}

const NavigationBar = React.forwardRef<HTMLDivElement, NavigationBarProps>(
    ({
        className,
        size,
        value,
        onValueChange,
        showLabels = true,
        children,
        ...props
    }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<NavigationBarItemProps>[];

        // Ensure we have 3-5 items (Material Design recommendation)
        if (validChildren.length < 3 || validChildren.length > 5) {
            console.warn(
                `NavigationBar should have 3-5 items, but received ${validChildren.length}. ` +
                `Consider using NavigationRail for more than 5 destinations.`
            );
        }

        return (
            <nav
                ref={ref}
                className={cn(navigationBarVariants({ size }), className)}
                role="tablist"
                aria-label="Main navigation"
                {...props}
            >
                {validChildren.map((child, index) => {
                    const itemValue = child.props.value || child.props.label || index.toString();
                    const isActive = value === itemValue;
                    const itemSize = child.props.size || size || "default";

                    return React.cloneElement(child, {
                        ...child.props,
                        key: itemValue,
                        active: isActive,
                        size: itemSize as "default" | "compact",
                        showLabel: child.props.showLabel ?? showLabels,
                        onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                            onValueChange?.(itemValue);
                            child.props.onClick?.(event);
                        },
                    });
                })}
            </nav>
        );
    }
);
NavigationBar.displayName = "NavigationBar";

// Controlled Navigation Bar (explicit controlled component)
export interface ControlledNavigationBarProps extends NavigationBarProps {
    value: string;
    onValueChange: (value: string) => void;
}

const ControlledNavigationBar = React.forwardRef<HTMLDivElement, ControlledNavigationBarProps>(
    (props, ref) => {
        return <NavigationBar ref={ref} {...props} />;
    }
);
ControlledNavigationBar.displayName = "ControlledNavigationBar";

// Navigation Bar with Floating Action Button
export interface NavigationBarWithFABProps extends NavigationBarProps {
    /** FAB component to render */
    fab?: React.ReactNode;
    /** FAB position */
    fabPosition?: "center" | "end";
}

const NavigationBarWithFAB = React.forwardRef<HTMLDivElement, NavigationBarWithFABProps>(
    ({
        fab,
        fabPosition = "center",
        className,
        children,
        ...props
    }, ref) => {
        const validChildren = React.Children.toArray(children).filter(
            child => React.isValidElement(child)
        ) as React.ReactElement<NavigationBarItemProps>[];

        if (fab && fabPosition === "center" && validChildren.length % 2 === 1) {
            console.warn(
                "NavigationBar with center FAB works best with an even number of items"
            );
        }

        return (
            <div className="relative">
                {/* FAB */}
                {fab && (
                    <div
                        className={cn(
                            "absolute -top-7 z-10",
                            fabPosition === "center" && "left-1/2 -translate-x-1/2",
                            fabPosition === "end" && "right-4"
                        )}
                    >
                        {fab}
                    </div>
                )}

                {/* Navigation Bar */}
                <NavigationBar
                    ref={ref}
                    className={cn(
                        fab && fabPosition === "center" && "justify-between px-8",
                        className
                    )}
                    {...props}
                >
                    {validChildren}
                </NavigationBar>
            </div>
        );
    }
);
NavigationBarWithFAB.displayName = "NavigationBarWithFAB";

// Adaptive Navigation Bar (hides on scroll)
export interface AdaptiveNavigationBarProps extends NavigationBarProps {
    /** Whether to hide on scroll */
    hideOnScroll?: boolean;
    /** Scroll threshold in pixels */
    scrollThreshold?: number;
}

const AdaptiveNavigationBar = React.forwardRef<HTMLDivElement, AdaptiveNavigationBarProps>(
    ({
        hideOnScroll = true,
        scrollThreshold = 100,
        className,
        ...props
    }, ref) => {
        const [isVisible, setIsVisible] = React.useState(true);
        const [lastScrollY, setLastScrollY] = React.useState(0);

        React.useEffect(() => {
            if (!hideOnScroll) return;

            const handleScroll = () => {
                const currentScrollY = window.scrollY;

                if (currentScrollY > scrollThreshold) {
                    setIsVisible(currentScrollY < lastScrollY);
                } else {
                    setIsVisible(true);
                }

                setLastScrollY(currentScrollY);
            };

            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
        }, [hideOnScroll, scrollThreshold, lastScrollY]);

        return (
            <NavigationBar
                ref={ref}
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300",
                    !isVisible && "translate-y-full",
                    className
                )}
                {...props}
            />
        );
    }
);
AdaptiveNavigationBar.displayName = "AdaptiveNavigationBar";

export {
    NavigationBar,
    NavigationBarItem,
    ControlledNavigationBar,
    NavigationBarWithFAB,
    AdaptiveNavigationBar,
    navigationBarVariants,
};
