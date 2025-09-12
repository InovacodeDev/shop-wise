import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// Using a simple chevron down SVG instead of @radix-ui/react-icons
const ChevronDownIcon = () => (
    <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="m4.93179 5.43179c0.20081 -0.20081 0.52659 -0.20081 0.72741 0l2.34080 2.34081 2.34080 -2.34081c0.20081 -0.20081 0.52659 -0.20081 0.72741 0c0.20081 0.20081 0.20081 0.52659 0 0.72741l-2.7082 2.7082c-0.20081 0.20081 -0.52659 0.20081 -0.72741 0l-2.7082 -2.7082c-0.20081 -0.20081 -0.20081 -0.52659 0 -0.72741Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
        />
    </svg>
);

// Material Design 3 Split Button variants
const splitButtonVariants = cva(
    "inline-flex isolate",
    {
        variants: {
            variant: {
                elevated: "",
                filled: "",
                tonal: "",
                outlined: "",
                text: "",
            },
            size: {
                xs: "",
                sm: "",
                default: "",
                lg: "",
                xl: "",
            },
        },
        defaultVariants: {
            variant: "filled",
            size: "default",
        },
    }
);

const splitButtonLeadingVariants = cva(
    "relative z-10 rounded-r-none border-r-0",
    {
        variants: {
            variant: {
                elevated: "border-r border-r-outline/20",
                filled: "border-r border-r-on-primary/20",
                tonal: "border-r border-r-on-secondary-container/20",
                outlined: "",
                text: "",
            },
        },
        defaultVariants: {
            variant: "filled",
        },
    }
);

const splitButtonTrailingVariants = cva(
    "rounded-l-none px-2 min-w-0",
    {
        variants: {
            variant: {
                elevated: "",
                filled: "",
                tonal: "",
                outlined: "",
                text: "",
            },
            size: {
                xs: "px-1.5 [&_svg]:size-3",
                sm: "px-2 [&_svg]:size-3.5",
                default: "px-2 [&_svg]:size-4",
                lg: "px-2.5 [&_svg]:size-4",
                xl: "px-3 [&_svg]:size-5",
            },
        },
        defaultVariants: {
            variant: "filled",
            size: "default",
        },
    }
);

export interface SplitButtonProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">,
    VariantProps<typeof splitButtonVariants> {
    // Leading button props
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    children: React.ReactNode;

    // Trailing button props
    onDropdownClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    dropdownIcon?: React.ReactNode;
    dropdownLabel?: string;

    // Menu state
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>(
    ({
        className,
        variant,
        size,
        onClick,
        onDropdownClick,
        disabled = false,
        dropdownIcon = <ChevronDownIcon />,
        dropdownLabel = "More options",
        open = false,
        onOpenChange,
        children,
        ...props
    }, ref) => {
        const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange?.(!open);
            onDropdownClick?.(event);
        };

        return (
            <div
                ref={ref}
                className={cn(splitButtonVariants({ variant, size }), className)}
                {...props}
            >
                {/* Leading button */}
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled}
                    onClick={onClick}
                    className={cn(splitButtonLeadingVariants({ variant }))}
                >
                    {children}
                </Button>

                {/* Trailing dropdown button */}
                <Button
                    variant={variant}
                    size={size}
                    disabled={disabled}
                    onClick={handleDropdownClick}
                    className={cn(splitButtonTrailingVariants({ variant, size }))}
                    aria-label={dropdownLabel}
                    aria-expanded={open}
                    aria-haspopup="true"
                >
                    <span
                        className={cn(
                            "transform transition-transform duration-200",
                            open && "rotate-180"
                        )}
                    >
                        {dropdownIcon}
                    </span>
                </Button>
            </div>
        );
    }
);
SplitButton.displayName = "SplitButton";

// Enhanced Split Button with built-in dropdown menu
export interface EnhancedSplitButtonProps extends SplitButtonProps {
    items?: SplitButtonMenuItem[];
    onItemSelect?: (item: SplitButtonMenuItem) => void;
}

export interface SplitButtonMenuItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
}

const EnhancedSplitButton = React.forwardRef<HTMLDivElement, EnhancedSplitButtonProps>(
    ({ items = [], onItemSelect, open, onOpenChange, ...props }, ref) => {
        const [internalOpen, setInternalOpen] = React.useState(false);
        const isControlled = open !== undefined;
        const isOpen = isControlled ? open : internalOpen;

        const handleOpenChange = (newOpen: boolean) => {
            if (!isControlled) {
                setInternalOpen(newOpen);
            }
            onOpenChange?.(newOpen);
        };

        const handleItemClick = (item: SplitButtonMenuItem) => {
            handleOpenChange(false);
            onItemSelect?.(item);
            item.onClick?.();
        };

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (!isOpen) return;

                const target = event.target as HTMLElement;
                if (!target.closest('[data-split-button]')) {
                    handleOpenChange(false);
                }
            };

            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }, [isOpen]);

        return (
            <div className="relative" data-split-button>
                <SplitButton
                    ref={ref}
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                    {...props}
                />

                {/* Dropdown menu */}
                {isOpen && items.length > 0 && (
                    <div className="absolute top-full left-0 z-50 mt-1 min-w-32 rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95">
                        {items.map((item) => (
                            <button
                                key={item.id}
                                className={cn(
                                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                                    item.disabled
                                        ? "pointer-events-none opacity-50"
                                        : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                                disabled={item.disabled}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.icon && (
                                    <span className="mr-2 h-4 w-4">
                                        {item.icon}
                                    </span>
                                )}
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);
EnhancedSplitButton.displayName = "EnhancedSplitButton";

// Split Icon Button variant (compact version)
export interface SplitIconButtonProps
    extends Omit<SplitButtonProps, "children"> {
    icon: React.ReactNode;
    label: string;
}

const SplitIconButton = React.forwardRef<HTMLDivElement, SplitIconButtonProps>(
    ({ icon, label, ...props }, ref) => {
        return (
            <SplitButton
                ref={ref}
                aria-label={label}
                {...props}
            >
                {icon}
            </SplitButton>
        );
    }
);
SplitIconButton.displayName = "SplitIconButton";

export {
    SplitButton,
    EnhancedSplitButton,
    SplitIconButton,
    splitButtonVariants
};
