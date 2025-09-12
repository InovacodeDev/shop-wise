"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faArrowLeft, faEllipsisV, faSearch } from "@fortawesome/free-solid-svg-icons";

// Material Design 3 App Bar Context
interface AppBarContextValue {
    variant: "top" | "bottom";
    size: "small" | "center-aligned" | "medium" | "large";
    scrolled?: boolean;
    prominent?: boolean;
}

const AppBarContext = React.createContext<AppBarContextValue | null>(null);

// Material Design 3 App Bar variants
const appBarVariants = cva(
    [
        "flex items-center w-full transition-all duration-200",
        "relative z-40"
    ],
    {
        variants: {
            variant: {
                // Top App Bar
                top: [
                    "flex-row justify-between",
                    "top-0 left-0 right-0"
                ],
                // Bottom App Bar
                bottom: [
                    "flex-row justify-center",
                    "bottom-0 left-0 right-0"
                ]
            },
            size: {
                // Small top app bar - 64dp height
                small: [
                    "h-16 px-4",
                    "bg-surface text-on-surface"
                ],
                // Center-aligned top app bar - 64dp height  
                "center-aligned": [
                    "h-16 px-4",
                    "bg-surface text-on-surface"
                ],
                // Medium top app bar - 112dp height
                medium: [
                    "h-28 px-4",
                    "bg-surface text-on-surface"
                ],
                // Large top app bar - 152dp height
                large: [
                    "h-38 px-4 pb-7",
                    "bg-surface text-on-surface"
                ],
            },
            elevation: {
                none: "shadow-none",
                level0: "shadow-none",
                level1: "shadow-sm",
                level2: "shadow-md",
                level3: "shadow-lg",
                level4: "shadow-xl",
                level5: "shadow-2xl"
            },
            scrollBehavior: {
                // Standard behavior
                standard: "",
                // Scrolled state - elevated appearance
                scrolled: "shadow-md",
                // Prominent - larger when scrolled up
                prominent: ""
            }
        },
        defaultVariants: {
            variant: "top",
            size: "small",
            elevation: "level0",
            scrollBehavior: "standard"
        }
    }
);

// App Bar Root Component
interface AppBarProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof appBarVariants> {
    /**
     * Whether the app bar is in scrolled state
     */
    scrolled?: boolean;
    /**
     * Whether the app bar should be prominent (expand when scrolled up)
     */
    prominent?: boolean;
    /**
     * Custom element type
     */
    asChild?: boolean;
}

const AppBar = React.forwardRef<
    HTMLElement,
    AppBarProps
>(({ className, variant = "top", size = "small", elevation = "level0", scrollBehavior = "standard", scrolled = false, prominent = false, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "header";

    const contextValue: AppBarContextValue = {
        variant: variant!,
        size: size!,
        scrolled,
        prominent
    };

    const computedElevation = scrolled ? "scrolled" : elevation;

    return (
        <AppBarContext.Provider value={contextValue}>
            <Comp
                ref={ref as any}
                className={cn(
                    appBarVariants({
                        variant,
                        size,
                        elevation: computedElevation === "scrolled" ? undefined : elevation,
                        scrollBehavior: computedElevation === "scrolled" ? "scrolled" : scrollBehavior
                    }),
                    className
                )}
                role="banner"
                {...props}
            >
                {children}
            </Comp>
        </AppBarContext.Provider>
    );
});
AppBar.displayName = "AppBar";

// App Bar Leading Section (typically navigation icon)
const AppBarLeading = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        asChild?: boolean;
    }
>(({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    const context = React.useContext(AppBarContext);

    return (
        <Comp
            ref={ref}
            className={cn(
                "flex items-center gap-2",
                context?.size === "center-aligned" ? "flex-1" : "flex-initial",
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    );
});
AppBarLeading.displayName = "AppBarLeading";

// App Bar Title Section
const AppBarTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement> & {
        asChild?: boolean;
    }
>(({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "h1";
    const context = React.useContext(AppBarContext);

    const getTitleStyles = () => {
        switch (context?.size) {
            case "small":
                return "text-xl font-medium";
            case "center-aligned":
                return "text-xl font-medium text-center flex-1";
            case "medium":
                return "text-2xl font-medium";
            case "large":
                return "text-3xl font-medium";
            default:
                return "text-xl font-medium";
        }
    };

    return (
        <Comp
            ref={ref}
            className={cn(
                "truncate",
                getTitleStyles(),
                context?.size === "large" ? "self-end" : "self-center",
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    );
});
AppBarTitle.displayName = "AppBarTitle";

// App Bar Trailing Section (typically action icons)
const AppBarTrailing = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        asChild?: boolean;
    }
>(({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    const context = React.useContext(AppBarContext);

    return (
        <Comp
            ref={ref}
            className={cn(
                "flex items-center gap-1",
                context?.size === "center-aligned" ? "flex-1 justify-end" : "flex-initial",
                className
            )}
            {...props}
        >
            {children}
        </Comp>
    );
});
AppBarTrailing.displayName = "AppBarTrailing";

// App Bar Action Button - optimized for app bar usage
const AppBarAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button> & {
        icon?: React.ReactNode;
        label?: string;
    }
>(({ className, variant = "text", size = "icon", icon, label, children, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                "h-12 w-12 p-0", // 48dp touch target
                "rounded-full",
                "hover:bg-on-surface/8",
                "focus:bg-on-surface/12",
                label && "sr-only", // Hide label visually if provided (for accessibility)
                className
            )}
            aria-label={label}
            {...props}
        >
            {icon || children}
            {label && <span className="sr-only">{label}</span>}
        </Button>
    );
});
AppBarAction.displayName = "AppBarAction";

// Pre-built common app bar actions
const AppBarMenuButton = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ComponentPropsWithoutRef<typeof AppBarAction>, 'icon' | 'label'>
>(({ ...props }, ref) => (
    <AppBarAction
        ref={ref}
        icon={<FontAwesomeIcon icon={faBars} className="w-5 h-5" />}
        label="Open menu"
        {...props}
    />
));
AppBarMenuButton.displayName = "AppBarMenuButton";

const AppBarBackButton = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ComponentPropsWithoutRef<typeof AppBarAction>, 'icon' | 'label'>
>(({ ...props }, ref) => (
    <AppBarAction
        ref={ref}
        icon={<FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />}
        label="Go back"
        {...props}
    />
));
AppBarBackButton.displayName = "AppBarBackButton";

const AppBarSearchButton = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ComponentPropsWithoutRef<typeof AppBarAction>, 'icon' | 'label'>
>(({ ...props }, ref) => (
    <AppBarAction
        ref={ref}
        icon={<FontAwesomeIcon icon={faSearch} className="w-5 h-5" />}
        label="Search"
        {...props}
    />
));
AppBarSearchButton.displayName = "AppBarSearchButton";

const AppBarMoreButton = React.forwardRef<
    HTMLButtonElement,
    Omit<React.ComponentPropsWithoutRef<typeof AppBarAction>, 'icon' | 'label'>
>(({ ...props }, ref) => (
    <AppBarAction
        ref={ref}
        icon={<FontAwesomeIcon icon={faEllipsisV} className="w-5 h-5" />}
        label="More options"
        {...props}
    />
));
AppBarMoreButton.displayName = "AppBarMoreButton";

// Bottom App Bar specific components
const BottomAppBar = React.forwardRef<
    HTMLElement,
    Omit<AppBarProps, 'variant'>
>(({ className, ...props }, ref) => (
    <AppBar
        ref={ref}
        variant="bottom"
        className={cn("fixed", className)}
        {...props}
    />
));
BottomAppBar.displayName = "BottomAppBar";

// App Bar with FAB (Floating Action Button) - common bottom app bar pattern
const AppBarFAB = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<typeof Button> & {
        icon?: React.ReactNode;
    }
>(({ className, icon, children, ...props }, ref) => {
    return (
        <Button
            ref={ref}
            variant="filled"
            className={cn(
                "h-14 w-14 rounded-full", // 56dp FAB
                "shadow-lg hover:shadow-xl",
                "absolute -top-7 left-1/2 transform -translate-x-1/2", // Positioned above bottom app bar
                className
            )}
            {...props}
        >
            {icon || children}
        </Button>
    );
});
AppBarFAB.displayName = "AppBarFAB";

export {
    AppBar,
    AppBarLeading,
    AppBarTitle,
    AppBarTrailing,
    AppBarAction,
    AppBarMenuButton,
    AppBarBackButton,
    AppBarSearchButton,
    AppBarMoreButton,
    BottomAppBar,
    AppBarFAB,
    appBarVariants
};
