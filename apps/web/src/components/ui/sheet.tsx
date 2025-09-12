import React, { forwardRef, createContext, useContext, useState, useCallback, useEffect } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Sheet Context for shared state
interface SheetContextProps {
    variant: "modal" | "standard"
    side: "bottom" | "left" | "right" | "top"
    dragEnabled: boolean
    snapPoints?: number[]
    currentSnapPoint?: number
    onSnapPointChange?: (snapPoint: number) => void
}

const SheetContext = createContext<SheetContextProps | undefined>(undefined)

const useSheetContext = () => {
    const context = useContext(SheetContext)
    if (!context) {
        throw new Error("Sheet components must be used within a Sheet provider")
    }
    return context
}

// Base Sheet Component using Radix Dialog
const Sheet = DialogPrimitive.Root

const SheetTrigger = DialogPrimitive.Trigger

const SheetClose = DialogPrimitive.Close

const SheetPortal = DialogPrimitive.Portal

// Sheet Overlay with MD3 styling
const SheetOverlay = forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-scrim/32 backdrop-blur-sm transition-all duration-300",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))
SheetOverlay.displayName = "SheetOverlay"

// Sheet Content Variants
const sheetVariants = cva(
    "fixed z-50 gap-4 bg-surface-container shadow-lg transition-all duration-300 ease-in-out",
    {
        variants: {
            side: {
                bottom: [
                    "inset-x-0 bottom-0 rounded-t-3xl border-t border-outline-variant",
                    "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
                ],
                top: [
                    "inset-x-0 top-0 rounded-b-3xl border-b border-outline-variant",
                    "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
                ],
                left: [
                    "inset-y-0 left-0 h-full w-full max-w-sm rounded-r-3xl border-r border-outline-variant",
                    "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
                ],
                right: [
                    "inset-y-0 right-0 h-full w-full max-w-sm rounded-l-3xl border-l border-outline-variant",
                    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
                ]
            },
            variant: {
                modal: "data-[state=open]:animate-in data-[state=closed]:animate-out",
                standard: "shadow-none border-none rounded-none"
            },
            size: {
                default: "",
                compact: "",
                expanded: ""
            }
        },
        compoundVariants: [
            // Bottom sheet sizes
            {
                side: "bottom",
                size: "default",
                className: "max-h-[80vh]"
            },
            {
                side: "bottom",
                size: "compact",
                className: "max-h-[50vh]"
            },
            {
                side: "bottom",
                size: "expanded",
                className: "max-h-[95vh]"
            },
            // Side sheet sizes
            {
                side: ["left", "right"],
                size: "default",
                className: "w-full max-w-sm"
            },
            {
                side: ["left", "right"],
                size: "compact",
                className: "w-full max-w-xs"
            },
            {
                side: ["left", "right"],
                size: "expanded",
                className: "w-full max-w-md"
            },
            // Standard sheets (non-modal)
            {
                variant: "standard",
                side: "bottom",
                className: "border-t border-outline-variant"
            },
            {
                variant: "standard",
                side: ["left", "right"],
                className: "border-r border-outline-variant"
            }
        ],
        defaultVariants: {
            side: "bottom",
            variant: "modal",
            size: "default"
        }
    }
)

// Sheet Content Component
export interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
    dragEnabled?: boolean
    snapPoints?: number[]
    onSnapPointChange?: (snapPoint: number) => void
    dragHandle?: boolean
    closeButton?: boolean
}

const SheetContent = forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    SheetContentProps
>(({
    side = "bottom",
    variant = "modal",
    size = "default",
    className,
    children,
    dragEnabled = true,
    snapPoints,
    onSnapPointChange,
    dragHandle = true,
    closeButton = true,
    ...props
}, ref) => {
    const contextValue: SheetContextProps = {
        variant: variant || "modal",
        side: side || "bottom",
        dragEnabled: dragEnabled || false,
        snapPoints,
        currentSnapPoint: snapPoints?.[0],
        onSnapPointChange
    }

    return (
        <SheetContext.Provider value={contextValue}>
            <SheetPortal>
                {variant === "modal" && <SheetOverlay />}
                <DialogPrimitive.Content
                    ref={ref}
                    className={cn(sheetVariants({ side, variant, size }), className)}
                    {...props}
                >
                    {dragHandle && (side === "bottom" || side === "top") && <SheetDragHandle />}
                    {closeButton && <SheetCloseButton />}
                    <div className="flex flex-col overflow-hidden h-full">
                        {children}
                    </div>
                </DialogPrimitive.Content>
            </SheetPortal>
        </SheetContext.Provider>
    )
})
SheetContent.displayName = "SheetContent"

// Sheet Drag Handle Component
const SheetDragHandle = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const { side } = useSheetContext()

    return (
        <div
            ref={ref}
            className={cn(
                "flex justify-center py-4 cursor-grab active:cursor-grabbing",
                side === "bottom" && "order-first",
                side === "top" && "order-last",
                className
            )}
            {...props}
        >
            <div className="w-8 h-1 bg-on-surface-variant/40 rounded-full" />
        </div>
    )
})
SheetDragHandle.displayName = "SheetDragHandle"

// Sheet Close Button Component
const SheetCloseButton = forwardRef<
    React.ElementRef<typeof DialogPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Close
        ref={ref}
        className={cn(
            "absolute right-4 top-4 rounded-full p-2 opacity-70 transition-opacity",
            "hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:pointer-events-none data-[state=open]:bg-secondary",
            className
        )}
        {...props}
    >
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
        </svg>
        <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
))
SheetCloseButton.displayName = "SheetCloseButton"

// Sheet Header Component
const SheetHeader = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col space-y-2 px-6 py-4 border-b border-outline-variant",
            className
        )}
        {...props}
    />
))
SheetHeader.displayName = "SheetHeader"

// Sheet Body Component
const SheetBody = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex-1 overflow-auto px-6 py-4", className)}
        {...props}
    />
))
SheetBody.displayName = "SheetBody"

// Sheet Footer Component
const SheetFooter = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            "px-6 py-4 border-t border-outline-variant gap-2",
            className
        )}
        {...props}
    />
))
SheetFooter.displayName = "SheetFooter"

// Sheet Title Component
const SheetTitle = forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-xl font-semibold text-on-surface", className)}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

// Sheet Description Component
const SheetDescription = forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-on-surface-variant", className)}
        {...props}
    />
))
SheetDescription.displayName = "SheetDescription"

// Bottom Sheet Component (pre-configured)
export interface BottomSheetProps extends Omit<SheetContentProps, "side"> {
    modal?: boolean
}

const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(({
    modal = true,
    variant,
    ...props
}, ref) => (
    <SheetContent
        ref={ref}
        side="bottom"
        variant={modal ? "modal" : "standard"}
        {...props}
    />
))
BottomSheet.displayName = "BottomSheet"

// Side Sheet Component (pre-configured)
export interface SideSheetProps extends Omit<SheetContentProps, "side"> {
    side?: "left" | "right"
    modal?: boolean
}

const SideSheet = forwardRef<HTMLDivElement, SideSheetProps>(({
    side = "right",
    modal = true,
    variant,
    ...props
}, ref) => (
    <SheetContent
        ref={ref}
        side={side}
        variant={modal ? "modal" : "standard"}
        dragHandle={false} // Side sheets typically don't have drag handles
        {...props}
    />
))
SideSheet.displayName = "SideSheet"

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetPortal,
    SheetOverlay,
    SheetContent,
    SheetHeader,
    SheetBody,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetDragHandle,
    SheetCloseButton,
    BottomSheet,
    SideSheet,
    sheetVariants,
    useSheetContext
}
