import React, { forwardRef, createContext, useContext } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Toolbar Context for shared state
interface ToolbarContextProps {
    variant: "docked" | "floating"
    colorScheme: "standard" | "vibrant"
    size: "default" | "compact"
    orientation: "horizontal" | "vertical"
}

const ToolbarContext = createContext<ToolbarContextProps | undefined>(undefined)

const useToolbarContext = () => {
    const context = useContext(ToolbarContext)
    if (!context) {
        throw new Error("Toolbar components must be used within a Toolbar provider")
    }
    return context
}

// Toolbar Container Variants
const toolbarVariants = cva(
    "flex items-center transition-all duration-200 ease-in-out",
    {
        variants: {
            variant: {
                docked: "w-full fixed bottom-0 left-0 right-0 z-40",
                floating: "rounded-full shadow-lg backdrop-blur-sm border border-outline-variant/20"
            },
            colorScheme: {
                standard: "",
                vibrant: ""
            },
            size: {
                default: "",
                compact: ""
            },
            orientation: {
                horizontal: "flex-row",
                vertical: "flex-col"
            }
        },
        compoundVariants: [
            // Docked variants
            {
                variant: "docked",
                colorScheme: "standard",
                className: "bg-surface-container border-t border-outline-variant"
            },
            {
                variant: "docked",
                colorScheme: "vibrant",
                className: "bg-primary-container border-t border-primary"
            },
            {
                variant: "docked",
                size: "default",
                className: "h-20 px-4"
            },
            {
                variant: "docked",
                size: "compact",
                className: "h-16 px-3"
            },

            // Floating variants
            {
                variant: "floating",
                colorScheme: "standard",
                className: "bg-surface-container-high"
            },
            {
                variant: "floating",
                colorScheme: "vibrant",
                className: "bg-primary-container"
            },
            {
                variant: "floating",
                orientation: "horizontal",
                size: "default",
                className: "h-14 px-4 gap-2 min-w-fit max-w-fit"
            },
            {
                variant: "floating",
                orientation: "horizontal",
                size: "compact",
                className: "h-12 px-3 gap-1 min-w-fit max-w-fit"
            },
            {
                variant: "floating",
                orientation: "vertical",
                size: "default",
                className: "w-14 py-4 gap-2 min-h-fit max-h-fit"
            },
            {
                variant: "floating",
                orientation: "vertical",
                size: "compact",
                className: "w-12 py-3 gap-1 min-h-fit max-h-fit"
            }
        ],
        defaultVariants: {
            variant: "floating",
            colorScheme: "standard",
            size: "default",
            orientation: "horizontal"
        }
    }
)

// Toolbar Item Variants
const toolbarItemVariants = cva(
    "flex items-center justify-center transition-colors duration-150",
    {
        variants: {
            variant: {
                docked: "",
                floating: ""
            },
            size: {
                default: "min-w-[48px] min-h-[48px]",
                compact: "min-w-[40px] min-h-[40px]"
            }
        },
        defaultVariants: {
            variant: "floating",
            size: "default"
        }
    }
)

// Toolbar Separator Variants
const toolbarSeparatorVariants = cva(
    "bg-outline-variant",
    {
        variants: {
            orientation: {
                horizontal: "w-px h-6",
                vertical: "w-6 h-px"
            }
        },
        defaultVariants: {
            orientation: "horizontal"
        }
    }
)

// Toolbar Container Component
export interface ToolbarProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toolbarVariants> {
    withElevation?: boolean
    position?: {
        bottom?: number
        top?: number
        left?: number
        right?: number
    }
}

const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(({
    className,
    variant = "floating",
    colorScheme = "standard",
    size = "default",
    orientation = "horizontal",
    withElevation = true,
    position,
    children,
    style,
    ...props
}, ref) => {
    const contextValue: ToolbarContextProps = {
        variant: variant || "floating",
        colorScheme: colorScheme || "standard",
        size: size || "default",
        orientation: orientation || "horizontal"
    }

    const positionStyles = position ? {
        bottom: position.bottom ? `${position.bottom}px` : undefined,
        top: position.top ? `${position.top}px` : undefined,
        left: position.left ? `${position.left}px` : undefined,
        right: position.right ? `${position.right}px` : undefined,
        ...style
    } : style

    return (
        <ToolbarContext.Provider value={contextValue}>
            <div
                ref={ref}
                className={cn(
                    toolbarVariants({ variant, colorScheme, size, orientation }),
                    variant === "floating" && !withElevation && "shadow-none",
                    className
                )}
                style={positionStyles}
                role="toolbar"
                aria-label="Toolbar"
                {...props}
            >
                {children}
            </div>
        </ToolbarContext.Provider>
    )
})
Toolbar.displayName = "Toolbar"

// Toolbar Item Component
export interface ToolbarItemProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean
}

const ToolbarItem = forwardRef<HTMLDivElement, ToolbarItemProps>(({
    className,
    asChild = false,
    children,
    ...props
}, ref) => {
    const { variant, size } = useToolbarContext()

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement, {
            className: cn(
                toolbarItemVariants({ variant, size }),
                children.props.className,
                className
            ),
            ref,
            ...props
        })
    }

    return (
        <div
            ref={ref}
            className={cn(toolbarItemVariants({ variant, size }), className)}
            {...props}
        >
            {children}
        </div>
    )
})
ToolbarItem.displayName = "ToolbarItem"

// Toolbar Group Component (for logical grouping)
export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    spacing?: "tight" | "normal" | "loose"
}

const ToolbarGroup = forwardRef<HTMLDivElement, ToolbarGroupProps>(({
    className,
    spacing = "normal",
    children,
    ...props
}, ref) => {
    const { orientation } = useToolbarContext()

    const spacingClasses = {
        tight: orientation === "horizontal" ? "gap-1" : "gap-1",
        normal: orientation === "horizontal" ? "gap-2" : "gap-2",
        loose: orientation === "horizontal" ? "gap-4" : "gap-4"
    }

    return (
        <div
            ref={ref}
            className={cn(
                "flex",
                orientation === "horizontal" ? "flex-row items-center" : "flex-col items-center",
                spacingClasses[spacing],
                className
            )}
            role="group"
            {...props}
        >
            {children}
        </div>
    )
})
ToolbarGroup.displayName = "ToolbarGroup"

// Toolbar Separator Component
export interface ToolbarSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

const ToolbarSeparator = forwardRef<HTMLDivElement, ToolbarSeparatorProps>(({
    className,
    ...props
}, ref) => {
    const { orientation } = useToolbarContext()

    return (
        <div
            ref={ref}
            className={cn(toolbarSeparatorVariants({ orientation }), className)}
            role="separator"
            aria-orientation={orientation}
            {...props}
        />
    )
})
ToolbarSeparator.displayName = "ToolbarSeparator"

// Toolbar Action Component (wrapper for buttons and actions)
export interface ToolbarActionProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean
    emphasis?: "low" | "medium" | "high"
    disabled?: boolean
}

const ToolbarAction = forwardRef<HTMLDivElement, ToolbarActionProps>(({
    className,
    asChild = false,
    emphasis = "low",
    disabled = false,
    children,
    ...props
}, ref) => {
    const { variant, size, colorScheme } = useToolbarContext()

    const actionClasses = cn(
        toolbarItemVariants({ variant, size }),
        "rounded-full transition-all duration-150",
        disabled && "opacity-50 pointer-events-none",
        emphasis === "high" && colorScheme === "standard" && "bg-primary text-on-primary hover:bg-primary/90",
        emphasis === "high" && colorScheme === "vibrant" && "bg-primary text-on-primary hover:bg-primary/90",
        emphasis === "medium" && "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/90",
        emphasis === "low" && "hover:bg-on-surface/8 active:bg-on-surface/12",
        className
    )

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement, {
            className: cn(actionClasses, children.props.className),
            ref,
            disabled,
            ...props
        })
    }

    return (
        <div
            ref={ref}
            className={actionClasses}
            aria-disabled={disabled}
            {...props}
        >
            {children}
        </div>
    )
})
ToolbarAction.displayName = "ToolbarAction"

// Toolbar Spacer Component (flexible space)
export interface ToolbarSpacerProps extends React.HTMLAttributes<HTMLDivElement> { }

const ToolbarSpacer = forwardRef<HTMLDivElement, ToolbarSpacerProps>(({
    className,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn("flex-1", className)}
            {...props}
        />
    )
})
ToolbarSpacer.displayName = "ToolbarSpacer"

// Docked Toolbar Component (pre-configured)
export interface DockedToolbarProps extends Omit<ToolbarProps, "variant"> { }

const DockedToolbar = forwardRef<HTMLDivElement, DockedToolbarProps>(({
    colorScheme = "standard",
    size = "default",
    children,
    ...props
}, ref) => {
    return (
        <Toolbar
            ref={ref}
            variant="docked"
            orientation="horizontal"
            colorScheme={colorScheme}
            size={size}
            withElevation={false}
            {...props}
        >
            {children}
        </Toolbar>
    )
})
DockedToolbar.displayName = "DockedToolbar"

// Floating Toolbar Component (pre-configured)
export interface FloatingToolbarProps extends Omit<ToolbarProps, "variant"> { }

const FloatingToolbar = forwardRef<HTMLDivElement, FloatingToolbarProps>(({
    orientation = "horizontal",
    colorScheme = "standard",
    size = "default",
    withElevation = true,
    children,
    ...props
}, ref) => {
    return (
        <Toolbar
            ref={ref}
            variant="floating"
            orientation={orientation}
            colorScheme={colorScheme}
            size={size}
            withElevation={withElevation}
            {...props}
        >
            {children}
        </Toolbar>
    )
})
FloatingToolbar.displayName = "FloatingToolbar"

// Controlled Toolbar Component (with state management)
export interface ControlledToolbarProps extends ToolbarProps {
    actions?: Array<{
        id: string
        icon?: React.ReactNode
        label?: string
        onClick?: () => void
        emphasis?: "low" | "medium" | "high"
        disabled?: boolean
        hidden?: boolean
    }>
    onActionClick?: (actionId: string) => void
    maxVisibleActions?: number
    overflowIcon?: React.ReactNode
}

const ControlledToolbar = forwardRef<HTMLDivElement, ControlledToolbarProps>(({
    actions = [],
    onActionClick,
    maxVisibleActions,
    overflowIcon,
    children,
    ...props
}, ref) => {
    const visibleActions = maxVisibleActions
        ? actions.filter(action => !action.hidden).slice(0, maxVisibleActions)
        : actions.filter(action => !action.hidden)

    const hiddenActions = maxVisibleActions
        ? actions.filter(action => !action.hidden).slice(maxVisibleActions)
        : []

    const handleActionClick = (actionId: string) => {
        const action = actions.find(a => a.id === actionId)
        if (action?.onClick) {
            action.onClick()
        }
        if (onActionClick) {
            onActionClick(actionId)
        }
    }

    return (
        <Toolbar ref={ref} {...props}>
            {children}
            {visibleActions.map((action) => (
                <ToolbarAction
                    key={action.id}
                    emphasis={action.emphasis}
                    disabled={action.disabled}
                    onClick={() => handleActionClick(action.id)}
                >
                    {action.icon}
                    {action.label && (
                        <span className="ml-2 text-sm font-medium">{action.label}</span>
                    )}
                </ToolbarAction>
            ))}
            {hiddenActions.length > 0 && (
                <ToolbarAction emphasis="low">
                    {overflowIcon || "⋯"}
                </ToolbarAction>
            )}
        </Toolbar>
    )
})
ControlledToolbar.displayName = "ControlledToolbar"

export {
    Toolbar,
    ToolbarItem,
    ToolbarGroup,
    ToolbarSeparator,
    ToolbarAction,
    ToolbarSpacer,
    DockedToolbar,
    FloatingToolbar,
    ControlledToolbar,
    toolbarVariants,
    toolbarItemVariants,
    toolbarSeparatorVariants,
    useToolbarContext
}
