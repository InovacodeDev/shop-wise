import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { faChevronRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";

import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// MD3 Menu variants following Material Design 3 specifications
const menuVariants = cva([
    // Base menu styles
    "z-50 overflow-hidden rounded-lg border border-outline-variant bg-surface-container shadow-lg",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
], {
    variants: {
        size: {
            default: "min-w-[8rem] max-w-[280dp] py-2", // MD3 menu sizing
            sm: "min-w-[6rem] max-w-[240dp] py-1.5",
            lg: "min-w-[12rem] max-w-[320dp] py-3"
        }
    },
    defaultVariants: {
        size: "default"
    }
});

const menuItemVariants = cva([
    // Base item styles - 48dp height for touch targets
    "relative flex cursor-default select-none items-center gap-3 px-3 py-3 text-sm",
    "outline-none transition-colors duration-150",
    // Text colors
    "text-on-surface",
    // Interactive states
    "hover:bg-on-surface/8 focus:bg-on-surface/12 active:bg-on-surface/12",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-38"
], {
    variants: {
        variant: {
            default: "",
            destructive: [
                "text-error hover:bg-error/8 focus:bg-error/12",
                "hover:text-error focus:text-error"
            ]
        },
        selected: {
            false: "",
            true: "bg-secondary-container text-on-secondary-container"
        }
    },
    defaultVariants: {
        variant: "default",
        selected: false
    }
});

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

interface DropdownMenuSubTriggerProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> {
    inset?: boolean;
}

const DropdownMenuSubTrigger = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
    DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
            menuItemVariants(),
            "data-[state=open]:bg-on-surface/12",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            inset && "pl-8",
            className
        )}
        {...props}
    >
        {children}
        <FontAwesomeIcon icon={faChevronRight} className="ml-auto text-on-surface-variant" />
    </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

interface DropdownMenuSubContentProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>,
    VariantProps<typeof menuVariants> { }

const DropdownMenuSubContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
    DropdownMenuSubContentProps
>(({ className, size, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
        ref={ref}
        className={cn(menuVariants({ size }), className)}
        {...props}
    />
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

interface DropdownMenuContentProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>,
    VariantProps<typeof menuVariants> { }

const DropdownMenuContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Content>,
    DropdownMenuContentProps
>(({ className, sideOffset = 8, size, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(menuVariants({ size }), className)}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

interface DropdownMenuItemProps
    extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof menuItemVariants> {
    inset?: boolean;
}

const DropdownMenuItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Item>,
    DropdownMenuItemProps
>(({ className, variant, selected, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
            menuItemVariants({ variant, selected }),
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            inset && "pl-8",
            className
        )}
        {...props}
    />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            menuItemVariants(),
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            className
        )}
        checked={checked}
        {...props}
    >
        <span className="flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-primary" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
            menuItemVariants(),
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            className
        )}
        {...props}
    >
        <span className="flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <FontAwesomeIcon icon={faCircle} className="h-2 w-2 fill-current text-primary" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
        inset?: boolean;
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props}
    />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
};
