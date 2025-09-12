import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Material Design 3 Badge specifications
const badgeVariants = cva(
    "inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-medium whitespace-nowrap",
    {
        variants: {
            variant: {
                // Large badge - 16dp height, rounded full
                "large": [
                    "bg-error text-on-error",
                    "hover:bg-error/90",
                    "h-4 min-w-4 px-1.5",
                    "rounded-full",
                    "text-xs leading-none"
                ],
                // Small badge - 6dp height, circular dot
                "small": [
                    "bg-error text-on-error",
                    "hover:bg-error/90",
                    "h-1.5 w-1.5",
                    "rounded-full",
                    "p-0"
                ],
                // Numbered badge - with count/number
                "numbered": [
                    "bg-error text-on-error",
                    "hover:bg-error/90",
                    "h-4 min-w-4 px-1.5",
                    "rounded-full",
                    "text-xs leading-none font-medium"
                ],
                // Default variant for backward compatibility
                "default": [
                    "bg-primary text-on-primary",
                    "hover:bg-primary/90",
                    "h-5 px-2",
                    "rounded-md",
                    "text-xs"
                ],
                "secondary": [
                    "bg-secondary text-on-secondary",
                    "hover:bg-secondary/90",
                    "h-5 px-2",
                    "rounded-md",
                    "text-xs"
                ],
                "destructive": [
                    "bg-error text-on-error",
                    "hover:bg-error/90",
                    "h-5 px-2",
                    "rounded-md",
                    "text-xs"
                ],
                "outline": [
                    "border border-outline text-on-surface bg-transparent",
                    "hover:bg-surface-variant/8",
                    "h-5 px-2",
                    "rounded-md",
                    "text-xs"
                ],
            },
            size: {
                small: "h-4 text-xs",
                default: "h-5 text-xs",
                large: "h-6 text-sm",
            }
        },
        defaultVariants: {
            variant: "large",
            size: "default",
        },
    }
);

// Material Design 3 Badge component
export interface BadgeProps
    extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'content'>,
    VariantProps<typeof badgeVariants> {
    /**
     * Content of the badge - can be text, number, or empty for dot
     */
    content?: React.ReactNode;
    /**
     * Maximum number to display (shows "99+" if exceeded)
     */
    max?: number;
    /**
     * Show badge even when content is 0
     */
    showZero?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "large", size, content, max = 99, showZero = false, children, ...props }, ref) => {
        // Handle numbered badges
        const getDisplayContent = () => {
            if (content === undefined || content === null) {
                return variant === "small" ? null : children;
            }

            if (typeof content === 'number') {
                if (content === 0 && !showZero) {
                    return null;
                }
                return content > max ? `${max}+` : content.toString();
            }

            return content;
        };

        const displayContent = getDisplayContent();

        // Don't render if no content and not showZero
        if (displayContent === null && !showZero && variant !== "small") {
            return null;
        }

        return (
            <span
                ref={ref}
                className={cn(badgeVariants({ variant, size }), className)}
                {...props}
            >
                {variant === "small" ? null : displayContent}
            </span>
        );
    }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
