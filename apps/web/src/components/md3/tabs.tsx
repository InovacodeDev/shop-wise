import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Tabs variants
const tabsVariants = cva(
    "flex bg-surface border-b border-outline-variant overflow-hidden",
    {
        variants: {
            variant: {
                primary: "h-12", // 48dp height for text-only
                "primary-with-icon": "h-16", // 64dp height for icon + text
                secondary: "h-12", // 48dp height
            },
            type: {
                fixed: "w-full",
                scrollable: "w-auto min-w-full",
            },
            alignment: {
                start: "justify-start",
                center: "justify-center",
                fill: "justify-stretch",
            },
        },
        defaultVariants: {
            variant: "primary",
            type: "fixed",
            alignment: "fill",
        },
    }
);

const tabsListVariants = cva(
    "inline-flex items-end relative",
    {
        variants: {
            type: {
                fixed: "w-full",
                scrollable: "w-auto pl-13", // 52dp offset for scrollable tabs
            },
        },
        defaultVariants: {
            type: "fixed",
        },
    }
);

const tabsTriggerVariants = cva(
    "inline-flex items-center justify-center relative cursor-pointer transition-all duration-200 ease-in-out text-sm font-normal border-b-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "h-12 px-6 gap-2 text-on-surface-variant hover:text-on-surface data-[active=true]:text-primary data-[active=true]:font-bold data-[active=true]:text-base", // 48dp
                "primary-with-icon": "h-16 px-6 gap-2 flex-col text-on-surface-variant hover:text-on-surface data-[active=true]:text-primary data-[active=true]:font-bold data-[active=true]:text-base", // 64dp
                secondary: "h-12 px-4 gap-2 text-on-surface-variant hover:text-on-surface data-[active=true]:text-on-surface data-[active=true]:font-bold data-[active=true]:text-base", // 48dp
            },
            type: {
                fixed: "flex-1 min-w-0",
                scrollable: "flex-none whitespace-nowrap",
            },
            state: {
                default: "",
                active: "data-[active=true]:text-primary",
                hover: "hover:bg-surface-variant/50",
                focus: "focus-visible:bg-surface-variant/50",
                pressed: "active:bg-surface-variant/70",
            },
        },
        compoundVariants: [
            // Active indicator positioning
            {
                variant: "primary",
                class: "data-[active=true]:after:absolute data-[active=true]:after:bottom-0 data-[active=true]:after:left-2 data-[active=true]:after:right-2 data-[active=true]:after:h-0.75 data-[active=true]:after:bg-primary data-[active=true]:after:rounded-t-full data-[active=true]:after:min-w-6", // 3dp height, 24dp min width
            },
            {
                variant: "primary-with-icon",
                class: "data-[active=true]:after:absolute data-[active=true]:after:bottom-0 data-[active=true]:after:left-2 data-[active=true]:after:right-2 data-[active=true]:after:h-0.75 data-[active=true]:after:bg-primary data-[active=true]:after:rounded-t-full data-[active=true]:after:min-w-6",
            },
            {
                variant: "secondary",
                class: "data-[active=true]:after:absolute data-[active=true]:after:bottom-0 data-[active=true]:after:left-2 data-[active=true]:after:right-2 data-[active=true]:after:h-0.5 data-[active=true]:after:bg-primary data-[active=true]:after:rounded-t-full data-[active=true]:after:min-w-6", // 2dp height
            },
            // Active state border emphasis
            {
                variant: "primary",
                class: "data-[active=true]:border-primary",
            },
            {
                variant: "primary-with-icon",
                class: "data-[active=true]:border-primary",
            },
        ],
        defaultVariants: {
            variant: "primary",
            type: "fixed",
            state: "default",
        },
    }
);

const tabsIconVariants = cva(
    "transition-all duration-200 ease-in-out",
    {
        variants: {
            size: {
                default: "size-6", // 24dp
                large: "size-7", // 28dp for better accessibility
            },
            variant: {
                primary: "",
                "primary-with-icon": "",
                secondary: "",
            },
        },
        defaultVariants: {
            size: "default",
            variant: "primary",
        },
    }
);

const tabsLabelVariants = cva(
    "font-medium transition-all duration-200 ease-in-out line-clamp-1",
    {
        variants: {
            variant: {
                primary: "text-sm", // 14sp
                "primary-with-icon": "text-xs", // 12sp when with icon
                secondary: "text-sm", // 14sp
            },
            alignment: {
                horizontal: "",
                vertical: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            alignment: "horizontal",
        },
    }
);

const tabsBadgeVariants = cva(
    "absolute flex items-center justify-center rounded-full bg-error text-on-error text-[10px] font-medium leading-none transition-all duration-200",
    {
        variants: {
            size: {
                default: "min-w-4 h-4 px-1", // 16dp
                small: "size-2", // 8dp dot
            },
            position: {
                "icon-overlap": "top-0 right-0 translate-x-1.5 -translate-y-1.5", // 6dp overlap on stacked icon
                "text-inline": "top-1 right-1", // 4dp from text
            },
        },
        defaultVariants: {
            size: "default",
            position: "icon-overlap",
        },
    }
);

const tabsContentVariants = cva(
    "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    {
        variants: {
            variant: {
                default: "",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

// Tabs Context
interface TabsContextType {
    value?: string;
    onValueChange?: (value: string) => void;
}

const TabsContextValue = React.createContext<TabsContextType | undefined>(undefined);

export interface TabsProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsVariants> {
    /** Currently active tab value */
    value?: string;
    /** Default active tab value (uncontrolled) */
    defaultValue?: string;
    /** Callback when active tab changes */
    onValueChange?: (value: string) => void;
    /** Tabs orientation */
    orientation?: "horizontal" | "vertical";
    /** Whether tabs scroll content can be activated with left/right arrow keys */
    activationMode?: "automatic" | "manual";
    /** Children should include TabsList and TabsContent components */
    children: React.ReactNode;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({
        className,
        variant = "primary",
        type = "fixed",
        alignment = "fill",
        value: controlledValue,
        defaultValue,
        onValueChange,
        orientation = "horizontal",
        activationMode = "automatic",
        children,
        ...props
    }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue || "");
        const isControlled = controlledValue !== undefined;
        const value = isControlled ? controlledValue : internalValue;

        const handleValueChange = React.useCallback((newValue: string) => {
            if (!isControlled) {
                setInternalValue(newValue);
            }
            onValueChange?.(newValue);
        }, [isControlled, onValueChange]);

        // Keyboard navigation
        React.useEffect(() => {
            if (orientation === "horizontal" && activationMode === "automatic") {
                const handleKeyDown = (event: KeyboardEvent) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                        event.preventDefault();
                        // TODO: Implement arrow key navigation between tabs
                    }
                };

                document.addEventListener("keydown", handleKeyDown);
                return () => document.removeEventListener("keydown", handleKeyDown);
            }
        }, [orientation, activationMode]);

        const contextValue = React.useMemo(() => ({
            value,
            onValueChange: handleValueChange,
        }), [value, handleValueChange]);

        return (
            <TabsContextValue.Provider value={contextValue}>
                <div
                    ref={ref}
                    className={cn("w-full", className)}
                    data-orientation={orientation}
                    {...props}
                >
                    {children}
                </div>
            </TabsContextValue.Provider>
        );
    }
);
Tabs.displayName = "Tabs";

export interface TabsListProps
    extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof tabsVariants>, "variant" | "type" | "alignment"> {
    /** Children should be TabsTrigger components */
    children: React.ReactNode;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
    ({
        className,
        variant = "primary",
        type = "fixed",
        alignment = "fill",
        children,
        ...props
    }, ref) => {
        const scrollRef = React.useRef<HTMLDivElement>(null);

        // Auto-scroll active tab into view for scrollable tabs
        React.useEffect(() => {
            if (type === "scrollable" && scrollRef.current) {
                const activeTab = scrollRef.current.querySelector('[data-active="true"]');
                if (activeTab) {
                    activeTab.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                    });
                }
            }
        });

        // Add variants to context for children
        const processedChildren = React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === TabsTrigger) {
                return React.cloneElement(child, {
                    variant,
                    tabType: type,
                    ...child.props,
                });
            }
            return child;
        });

        return (
            <div
                ref={ref}
                className={cn(
                    tabsVariants({ variant, type, alignment }),
                    className
                )}
                role="tablist"
                aria-orientation="horizontal"
                {...props}
            >
                <div
                    ref={scrollRef}
                    className={cn(
                        tabsListVariants({ type }),
                        type === "scrollable" && "overflow-x-auto scrollbar-hide"
                    )}
                >
                    {processedChildren}
                </div>
            </div>
        );
    }
);
TabsList.displayName = "TabsList";

export interface TabsTriggerProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
    /** Unique value for this tab */
    value: string;
    /** Icon element (24dp recommended) */
    icon?: React.ReactNode;
    /** Tab label text */
    children: React.ReactNode;
    /** Badge content (number or text) */
    badge?: string | number;
    /** Whether to show a dot badge instead of text/number */
    dotBadge?: boolean;
    /** Whether this tab is disabled */
    disabled?: boolean;
    /** Tab variant (inherited from parent) */
    variant?: "primary" | "primary-with-icon" | "secondary";
    /** Tab type (inherited from parent) */
    tabType?: "fixed" | "scrollable";
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({
        className,
        value,
        icon,
        children,
        badge,
        dotBadge = false,
        disabled = false,
        variant = "primary",
        tabType = "fixed",
        ...props
    }, ref) => {
        const TabsContext = React.useContext(TabsContextValue);
        const isActive = TabsContext?.value === value;
        const hasIcon = !!icon;

        // Automatically adjust variant based on icon presence
        const effectiveVariant = hasIcon && variant === "primary" ? "primary-with-icon" : variant;

        const handleClick = () => {
            if (!disabled && TabsContext?.onValueChange) {
                TabsContext.onValueChange(value);
            }
        };

        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    tabsTriggerVariants({
                        variant: effectiveVariant,
                        type: tabType,
                        state: isActive ? "active" : "default"
                    }),
                    className
                )}
                disabled={disabled}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${value}`}
                id={`tab-${value}`}
                tabIndex={isActive ? 0 : -1}
                data-active={isActive}
                onClick={handleClick}
                {...props}
            >
                {/* Icon and Badge container */}
                {hasIcon && (
                    <div className="relative flex items-center justify-center">
                        <div className={cn(tabsIconVariants({ variant: effectiveVariant }))}>
                            {icon}
                        </div>

                        {/* Badge on icon */}
                        {(badge !== undefined || dotBadge) && (
                            <div
                                className={cn(
                                    tabsBadgeVariants({
                                        size: dotBadge ? "small" : "default",
                                        position: "icon-overlap"
                                    })
                                )}
                                aria-label={dotBadge ? "Has updates" : `${badge} notifications`}
                            >
                                {!dotBadge && badge}
                            </div>
                        )}
                    </div>
                )}

                {/* Label and inline badge */}
                <div className="relative flex items-center gap-1">
                    <span className={cn(
                        tabsLabelVariants({
                            variant: effectiveVariant,
                            alignment: hasIcon && effectiveVariant === "primary-with-icon" ? "vertical" : "horizontal"
                        })
                    )}>
                        {children}
                    </span>

                    {/* Inline badge (only when no icon) */}
                    {!hasIcon && (badge !== undefined || dotBadge) && (
                        <div
                            className={cn(
                                tabsBadgeVariants({
                                    size: dotBadge ? "small" : "default",
                                    position: "text-inline"
                                })
                            )}
                            aria-label={dotBadge ? "Has updates" : `${badge} notifications`}
                        >
                            {!dotBadge && badge}
                        </div>
                    )}
                </div>
            </button>
        );
    }
);
TabsTrigger.displayName = "TabsTrigger";

export interface TabsContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    /** Value that corresponds to the TabsTrigger value */
    value: string;
    /** Content to display when tab is active */
    children: React.ReactNode;
    /** Whether content should be force mounted */
    forceMount?: boolean;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({
        className,
        value,
        children,
        forceMount = false,
        ...props
    }, ref) => {
        const TabsContext = React.useContext(TabsContextValue);
        const isActive = TabsContext?.value === value;

        if (!isActive && !forceMount) {
            return null;
        }

        return (
            <div
                ref={ref}
                className={cn(
                    tabsContentVariants(),
                    !isActive && "hidden",
                    className
                )}
                role="tabpanel"
                id={`tabpanel-${value}`}
                aria-labelledby={`tab-${value}`}
                hidden={!isActive}
                tabIndex={0}
                {...props}
            >
                {children}
            </div>
        );
    }
);
TabsContent.displayName = "TabsContent";

// Controlled Tabs (explicit controlled component)
export interface ControlledTabsProps extends TabsProps {
    value: string;
    onValueChange: (value: string) => void;
}

const ControlledTabs = React.forwardRef<HTMLDivElement, ControlledTabsProps>(
    (props, ref) => {
        return <Tabs ref={ref} {...props} />;
    }
);
ControlledTabs.displayName = "ControlledTabs";

// Secondary Tabs (simplified variant)
export interface SecondaryTabsProps extends Omit<TabsProps, "variant"> { }

const SecondaryTabs = React.forwardRef<HTMLDivElement, SecondaryTabsProps>(
    (props, ref) => {
        return <Tabs ref={ref} variant="secondary" {...props} />;
    }
);
SecondaryTabs.displayName = "SecondaryTabs";

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    ControlledTabs,
    SecondaryTabs,
    tabsVariants,
};
