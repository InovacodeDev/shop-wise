import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { materialShapes, materialElevation, materialSpacing, materialTypography } from "@/lib/material-design";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

// Material Design 3 Dialog specifications
const dialogVariants = cva(
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100vw-2rem)] translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] overflow-hidden",
    {
        variants: {
            variant: {
                // Basic dialog - urgent information, alerts, confirmations
                basic: [
                    "bg-surface-container-high text-on-surface",
                    "max-w-[560px] min-w-[280px]",
                    "gap-0", // Remove default gap to control spacing manually per MD3 specs
                    "max-h-[calc(100vh-2rem)]", // Prevent dialog from being taller than viewport
                    "overflow-x-hidden overflow-y-auto" // Prevent horizontal scroll, allow vertical if needed
                ],
                // Full-screen dialog - complex tasks requiring multiple steps (mobile only)
                fullscreen: [
                    "bg-surface-container-high text-on-surface",
                    "w-screen h-screen max-w-none",
                    "top-0 left-0 translate-x-0 translate-y-0",
                    "rounded-none",
                    "gap-0",
                    "overflow-hidden"
                ]
            }
        },
        defaultVariants: {
            variant: "basic",
        },
    }
);

// Scrim (overlay) with Material Design 3 specs
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-scrim/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

export interface DialogContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
    showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    DialogContentProps
>(({ className, children, variant, showCloseButton = true, ...props }, ref) => {
    const getDialogStyles = () => {
        const baseStyles = {
            borderRadius: variant === "fullscreen" ? "0px" : materialShapes.corner.extraLarge, // 28dp for basic, 0 for fullscreen
            boxShadow: materialElevation.level3.shadow,
        };

        if (variant === "basic") {
            return {
                ...baseStyles,
                padding: "0", // We'll handle padding in individual sections
                minWidth: "280px",
                maxWidth: "560px",
            };
        } else if (variant === "fullscreen") {
            return {
                ...baseStyles,
                borderRadius: "0px",
                padding: "0",
                boxShadow: "none", // Full-screen dialogs don't have shadows
            };
        }

        return baseStyles;
    };

    return (
        <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(dialogVariants({ variant }), className)}
                style={getDialogStyles()}
                {...props}
            >
                {children}
                {showCloseButton && variant === "basic" && (
                    <DialogPrimitive.Close
                        className={cn(
                            "absolute right-6 top-6 rounded-full p-2",
                            "opacity-70 ring-offset-background transition-opacity hover:opacity-100",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            "disabled:pointer-events-none",
                            "hover:bg-on-surface/8 active:bg-on-surface/12"
                        )}
                        style={{
                            top: materialSpacing.lg, // 24dp from top
                            right: materialSpacing.lg, // 24dp from right
                        }}
                    >
                        <FontAwesomeIcon icon={faXmark} className="h-4 w-4 text-on-surface-variant" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Material Design 3 Dialog Header (with proper padding and spacing)
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-2 text-left", className)}
        style={{
            padding: `${materialSpacing.lg} ${materialSpacing.lg} ${materialSpacing.sm}`, // 24px sides, 8px bottom
        }}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

// Material Design 3 Dialog Footer (action area)
const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-row justify-end", className)}
        style={{
            padding: `${materialSpacing.sm} ${materialSpacing.lg} ${materialSpacing.lg}`, // 8px top, 24px sides and bottom
            gap: materialSpacing.sm, // 8px gap between buttons
        }}
        {...props}
    />
);
DialogFooter.displayName = "DialogFooter";

// Material Design 3 Dialog Title (Headline)
const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-on-surface font-medium leading-tight", className)}
        style={{
            // Material Design 3 headline-small for dialog titles
            fontSize: materialTypography.headlineSmall.fontSize, // 24px
            fontWeight: materialTypography.headlineSmall.fontWeight,
            lineHeight: materialTypography.headlineSmall.lineHeight,
            letterSpacing: materialTypography.headlineSmall.letterSpacing,
        }}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Material Design 3 Dialog Description (Supporting text)
const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-on-surface-variant", className)}
        style={{
            // Material Design 3 body-medium for supporting text
            fontSize: materialTypography.bodyMedium.fontSize, // 14px
            fontWeight: materialTypography.bodyMedium.fontWeight,
            lineHeight: materialTypography.bodyMedium.lineHeight,
            letterSpacing: materialTypography.bodyMedium.letterSpacing,
        }}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Additional Material Design 3 Dialog components

// Dialog Icon (optional, appears above title)
const DialogIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex justify-center items-center mb-2 text-secondary", className)}
            style={{
                fontSize: "24px", // Standard icon size for dialogs
            }}
            {...props}
        >
            {children}
        </div>
    )
);
DialogIcon.displayName = "DialogIcon";

// Dialog Content Body (for scrollable content between header and footer)
const DialogBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex-1 overflow-x-hidden overflow-y-auto", className)}
            style={{
                padding: `0 ${materialSpacing.lg}`, // 24px horizontal padding
                maxHeight: "60vh", // Limit height to ensure footer remains visible
            }}
            {...props}
        />
    )
);
DialogBody.displayName = "DialogBody";

// Full-screen dialog specific header with close button
const DialogFullscreenHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("flex items-center justify-between border-b border-outline-variant", className)}
            style={{
                padding: materialSpacing.md, // 16px padding
                minHeight: "56px", // Material Design 3 spec for app bar height
            }}
            {...props}
        >
            {children}
        </div>
    )
);
DialogFullscreenHeader.displayName = "DialogFullscreenHeader";

// Divider component for dialogs (optional)
const DialogDivider = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(
    ({ className, ...props }, ref) => (
        <hr
            ref={ref}
            className={cn("border-0 border-t border-outline-variant", className)}
            style={{
                marginTop: materialSpacing.md, // 16dp spacing above
                marginBottom: materialSpacing.md, // 16dp spacing below
            }}
            {...props}
        />
    )
);
DialogDivider.displayName = "DialogDivider";

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogIcon,
    DialogBody,
    DialogFullscreenHeader,
    DialogDivider,
    dialogVariants,
};
