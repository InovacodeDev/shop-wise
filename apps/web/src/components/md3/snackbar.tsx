import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Material Design 3 Snackbar variants
const snackbarVariants = cva(
    "fixed z-50 flex items-center justify-between gap-2 rounded-sm border border-border bg-inverse-surface p-4 text-inverse-on-surface shadow-lg transition-all duration-300 ease-in-out",
    {
        variants: {
            variant: {
                default: "",
                error: "border-destructive/50",
                success: "border-green-500/50",
                warning: "border-yellow-500/50",
                info: "border-blue-500/50",
            },
            position: {
                "bottom-left": "bottom-4 left-4",
                "bottom-right": "bottom-4 right-4",
                "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
                "top-left": "top-4 left-4",
                "top-right": "top-4 right-4",
                "top-center": "top-4 left-1/2 -translate-x-1/2",
            },
            size: {
                default: "min-h-12 max-w-md", // 48dp minimum height
                compact: "min-h-10 max-w-sm", // 40dp minimum height
                expanded: "min-h-16 max-w-lg", // 64dp minimum height for two lines
            },
        },
        defaultVariants: {
            variant: "default",
            position: "bottom-center",
            size: "default",
        },
    }
);

const snackbarContentVariants = cva(
    "flex-1 text-sm font-medium",
    {
        variants: {
            lines: {
                single: "line-clamp-1",
                double: "line-clamp-2",
            },
        },
        defaultVariants: {
            lines: "single",
        },
    }
);

const snackbarActionVariants = cva(
    "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent px-3 text-xs font-medium transition-colors hover:bg-inverse-on-surface/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "text-inverse-primary hover:bg-inverse-primary/10",
                ghost: "text-inverse-on-surface/70 hover:bg-inverse-on-surface/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface SnackbarProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof snackbarVariants> {
    /** Whether the snackbar is open */
    open?: boolean;
    /** Callback when the snackbar should close */
    onClose?: () => void;
    /** Auto-dismiss duration in milliseconds (0 to disable) */
    duration?: number;
    /** Action button configuration */
    action?: {
        label: string;
        onClick: () => void;
        variant?: "default" | "ghost";
    };
    /** Whether to show close button */
    showClose?: boolean;
    /** Description for screen readers */
    description?: string;
    /** Whether the content can span two lines */
    allowTwoLines?: boolean;
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
    ({
        className,
        variant,
        position,
        size,
        open = false,
        onClose,
        duration = 4000,
        action,
        showClose = false,
        description,
        allowTwoLines = false,
        children,
        ...props
    }, ref) => {
        const [isVisible, setIsVisible] = React.useState(false);
        const [isMounted, setIsMounted] = React.useState(false);
        const timerRef = React.useRef<NodeJS.Timeout>();

        // Handle auto-dismiss
        React.useEffect(() => {
            if (open && duration > 0 && !action) {
                timerRef.current = setTimeout(() => {
                    onClose?.();
                }, duration);
            }

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }, [open, duration, action, onClose]);

        // Handle visibility animation
        React.useEffect(() => {
            if (open) {
                setIsMounted(true);
                // Delay to allow mounting before animation
                const timer = setTimeout(() => setIsVisible(true), 10);
                return () => clearTimeout(timer);
            } else {
                setIsVisible(false);
                // Delay unmounting until animation completes
                const timer = setTimeout(() => setIsMounted(false), 300);
                return () => clearTimeout(timer);
            }
        }, [open]);

        // Clear timer on action or close
        const handleAction = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            action?.onClick();
            onClose?.();
        };

        const handleClose = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            onClose?.();
        };

        if (!isMounted) return null;

        return (
            <div
                ref={ref}
                className={cn(
                    snackbarVariants({ variant, position, size }),
                    // Animation classes
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                    position?.includes("bottom") && [
                        "data-[state=closed]:slide-out-to-bottom-full",
                        "data-[state=open]:slide-in-from-bottom-full",
                    ],
                    position?.includes("top") && [
                        "data-[state=closed]:slide-out-to-top-full",
                        "data-[state=open]:slide-in-from-top-full",
                    ],
                    !isVisible && "opacity-0 translate-y-2",
                    isVisible && "opacity-100 translate-y-0",
                    className
                )}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                aria-describedby={description ? `${props.id}-desc` : undefined}
                data-state={isVisible ? "open" : "closed"}
                {...props}
            >
                <div className={cn(
                    snackbarContentVariants({
                        lines: allowTwoLines ? "double" : "single"
                    })
                )}>
                    {children}
                </div>

                {description && (
                    <div id={`${props.id}-desc`} className="sr-only">
                        {description}
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {action && (
                        <button
                            className={cn(snackbarActionVariants({ variant: action.variant }))}
                            onClick={handleAction}
                        >
                            {action.label}
                        </button>
                    )}

                    {showClose && (
                        <button
                            className={cn(snackbarActionVariants({ variant: "ghost" }))}
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <CloseIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);
Snackbar.displayName = "Snackbar";

// Close icon component
const CloseIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
    <svg
        className={className}
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        {...props}
    >
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
    </svg>
);

// Snackbar Provider for managing multiple snackbars
interface SnackbarContextValue {
    snackbars: Array<{
        id: string;
        message: string;
        variant?: SnackbarProps["variant"];
        action?: SnackbarProps["action"];
        duration?: number;
    }>;
    addSnackbar: (snackbar: Omit<SnackbarContextValue["snackbars"][0], "id">) => void;
    removeSnackbar: (id: string) => void;
    clearAll: () => void;
}

const SnackbarContext = React.createContext<SnackbarContextValue | null>(null);

export interface SnackbarProviderProps {
    children: React.ReactNode;
    /** Maximum number of snackbars to show at once */
    limit?: number;
    /** Default position for snackbars */
    position?: SnackbarProps["position"];
    /** Default duration */
    defaultDuration?: number;
}

export function SnackbarProvider({
    children,
    limit = 1,
    position = "bottom-center",
    defaultDuration = 4000,
}: SnackbarProviderProps) {
    const [snackbars, setSnackbars] = React.useState<SnackbarContextValue["snackbars"]>([]);

    const addSnackbar = React.useCallback((newSnackbar: Omit<SnackbarContextValue["snackbars"][0], "id">) => {
        const id = Math.random().toString(36).substr(2, 9);

        setSnackbars((current) => {
            const updated = [...current, { ...newSnackbar, id }];
            // Enforce limit by removing oldest snackbars
            return updated.slice(-limit);
        });
    }, [limit]);

    const removeSnackbar = React.useCallback((id: string) => {
        setSnackbars((current) => current.filter((snackbar) => snackbar.id !== id));
    }, []);

    const clearAll = React.useCallback(() => {
        setSnackbars([]);
    }, []);

    const value = React.useMemo(() => ({
        snackbars,
        addSnackbar,
        removeSnackbar,
        clearAll,
    }), [snackbars, addSnackbar, removeSnackbar, clearAll]);

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            {snackbars.map((snackbar, index) => (
                <Snackbar
                    key={snackbar.id}
                    open={true}
                    variant={snackbar.variant}
                    position={position}
                    duration={snackbar.duration ?? defaultDuration}
                    action={snackbar.action}
                    onClose={() => removeSnackbar(snackbar.id)}
                    style={{
                        // Stack snackbars with slight offset
                        zIndex: 50 - index,
                        transform: `translateY(${-index * 8}px)`,
                    }}
                >
                    {snackbar.message}
                </Snackbar>
            ))}
        </SnackbarContext.Provider>
    );
}

// Hook to use snackbars
export function useSnackbar() {
    const context = React.useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
}

// Convenience hook for common snackbar actions
export function useToast() {
    const { addSnackbar } = useSnackbar();

    return React.useMemo(() => ({
        success: (message: string, action?: SnackbarProps["action"]) =>
            addSnackbar({ message, variant: "success", action }),
        error: (message: string, action?: SnackbarProps["action"]) =>
            addSnackbar({ message, variant: "error", action }),
        warning: (message: string, action?: SnackbarProps["action"]) =>
            addSnackbar({ message, variant: "warning", action }),
        info: (message: string, action?: SnackbarProps["action"]) =>
            addSnackbar({ message, variant: "info", action }),
        default: (message: string, action?: SnackbarProps["action"]) =>
            addSnackbar({ message, variant: "default", action }),
    }), [addSnackbar]);
}

// Simple snackbar trigger component
export interface SnackbarTriggerProps {
    children: React.ReactNode;
    message: string;
    variant?: SnackbarProps["variant"];
    action?: SnackbarProps["action"];
    duration?: number;
}

export function SnackbarTrigger({
    children,
    message,
    variant,
    action,
    duration,
}: SnackbarTriggerProps) {
    const { addSnackbar } = useSnackbar();

    const handleTrigger = () => {
        addSnackbar({ message, variant, action, duration });
    };

    return (
        <div onClick={handleTrigger} role="button" tabIndex={0}>
            {children}
        </div>
    );
}

export {
    Snackbar,
    snackbarVariants,
    type SnackbarContextValue,
};
