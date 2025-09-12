import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { Button } from "./button";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

// MD3 Tooltip variants
const tooltipVariants = cva(
    "z-50 overflow-hidden rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
    {
        variants: {
            variant: {
                plain: "bg-inverse-surface text-inverse-on-surface px-2 py-1 text-xs font-medium min-h-[24dp] rounded-md",
                rich: "bg-surface-container text-on-surface-variant max-w-[280dp] p-3 rounded-lg border border-outline-variant",
            },
        },
        defaultVariants: {
            variant: "plain",
        },
    }
);

// Plain Tooltip Content
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipVariants>
>(({ className, variant = "plain", sideOffset = 8, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ variant }), className)}
        {...props}
    />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Rich Tooltip Components
interface RichTooltipProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
    title?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    sideOffset?: number;
}

const RichTooltip = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    RichTooltipProps
>(({ className, title, children, actions, sideOffset = 8, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ variant: "rich" }), className)}
        {...props}
    >
        <div className="space-y-2">
            {title && (
                <div className="text-sm font-medium text-on-surface">{title}</div>
            )}
            <div className="text-xs leading-relaxed text-on-surface-variant">
                {children}
            </div>
            {actions && (
                <div className="flex gap-2 mt-3 pt-2 border-t border-outline-variant">
                    {actions}
                </div>
            )}
        </div>
    </TooltipPrimitive.Content>
));
RichTooltip.displayName = "RichTooltip";

// Rich Tooltip Action Button
interface TooltipActionProps extends React.ComponentPropsWithoutRef<typeof Button> {
    children: React.ReactNode;
}

const TooltipAction = React.forwardRef<
    React.ElementRef<typeof Button>,
    TooltipActionProps
>(({ className, variant = "ghost", size = "sm", ...props }, ref) => (
    <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
            "h-8 px-2 text-xs font-medium",
            "text-primary hover:text-primary-hover",
            "hover:bg-primary/8 focus:bg-primary/12",
            className
        )}
        {...props}
    />
));
TooltipAction.displayName = "TooltipAction";

// Helper component for common tooltip with icon button
interface TooltipIconButtonProps {
    tooltip: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    side?: "top" | "bottom" | "left" | "right";
}

const TooltipIconButton = React.forwardRef<
    HTMLButtonElement,
    TooltipIconButtonProps
>(({ tooltip, icon = <FontAwesomeIcon icon={faInfoCircle} />, onClick, className, side = "top" }, ref) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    ref={ref}
                    variant="ghost"
                    size="icon"
                    className={cn("w-6 h-6 text-on-surface-variant hover:text-on-surface", className)}
                    onClick={onClick}
                >
                    {icon}
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                {tooltip}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
));
TooltipIconButton.displayName = "TooltipIconButton";

export {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
    RichTooltip,
    TooltipAction,
    TooltipIconButton,
    tooltipVariants
};
