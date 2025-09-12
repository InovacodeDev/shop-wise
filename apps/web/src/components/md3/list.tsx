"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "./switch";
import { Avatar } from "../ui/avatar";

// MD3 List variants following Material Design 3 specifications
const listVariants = cva([
    // Base list container
    "divide-y divide-outline-variant bg-surface"
], {
    variants: {
        variant: {
            default: "",
            outlined: "border border-outline-variant rounded-lg overflow-hidden",
            elevated: "shadow-md rounded-lg overflow-hidden"
        },
        density: {
            default: "",
            compact: "[&_.list-item]:py-2 [&_.list-item-one-line]:h-12 [&_.list-item-two-line]:h-16 [&_.list-item-three-line]:h-20",
            comfortable: "[&_.list-item]:py-4 [&_.list-item-one-line]:h-16 [&_.list-item-two-line]:h-20 [&_.list-item-three-line]:h-24"
        }
    },
    defaultVariants: {
        variant: "default",
        density: "default"
    }
});

const listItemVariants = cva([
    // Base list item styles
    "list-item relative flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
    // Interactive states
    "hover:bg-on-surface/8 focus:bg-on-surface/12 active:bg-on-surface/12",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
    // Disabled state
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-38"
], {
    variants: {
        size: {
            // MD3 List item heights
            "one-line": "list-item-one-line min-h-[56px]",    // 56dp
            "two-line": "list-item-two-line min-h-[72px]",    // 72dp  
            "three-line": "list-item-three-line min-h-[88px]" // 88dp
        },
        selected: {
            false: "",
            true: "bg-secondary-container text-on-secondary-container"
        },
        clickable: {
            false: "cursor-default",
            true: "cursor-pointer"
        }
    },
    defaultVariants: {
        size: "one-line",
        selected: false,
        clickable: false
    }
});

const listContentVariants = cva([
    "flex-1 min-w-0" // Allow text truncation
], {
    variants: {
        alignment: {
            top: "items-start",
            center: "items-center",
            bottom: "items-end"
        }
    },
    defaultVariants: {
        alignment: "center"
    }
});

// List Container
interface ListProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listVariants> { }

const List = React.forwardRef<HTMLDivElement, ListProps>(({
    className,
    variant,
    density,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(listVariants({ variant, density }), className)}
        role="list"
        {...props}
    />
));
List.displayName = "List";

// List Item
interface ListItemProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listItemVariants> {
    asChild?: boolean;
    disabled?: boolean;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(({
    className,
    size,
    selected,
    clickable,
    disabled,
    onClick,
    ...props
}, ref) => {
    const isClickable = clickable || !!onClick;

    return (
        <div
            ref={ref}
            className={cn(listItemVariants({ size, selected, clickable: isClickable }), className)}
            role="listitem"
            tabIndex={isClickable && !disabled ? 0 : undefined}
            data-disabled={disabled}
            onClick={disabled ? undefined : onClick}
            onKeyDown={isClickable && !disabled ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.(e as any);
                }
            } : undefined}
            {...props}
        />
    );
});
ListItem.displayName = "ListItem";

// List Item Content (headline + supporting text)
interface ListItemContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listContentVariants> {
    headline: string;
    supportingText?: string;
    overline?: string;
}

const ListItemContent = React.forwardRef<HTMLDivElement, ListItemContentProps>(({
    className,
    alignment,
    headline,
    supportingText,
    overline,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(listContentVariants({ alignment }), "flex flex-col", className)}
        {...props}
    >
        {overline && (
            <span className="text-xs font-medium text-on-surface-variant mb-1 leading-tight">
                {overline}
            </span>
        )}
        <span className="text-base font-normal text-on-surface leading-6 truncate">
            {headline}
        </span>
        {supportingText && (
            <span className="text-sm text-on-surface-variant leading-5 truncate mt-1">
                {supportingText}
            </span>
        )}
    </div>
));
ListItemContent.displayName = "ListItemContent";

// List Item Leading Element (avatar, icon, image, etc.)
interface ListItemLeadingProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    size?: "small" | "medium" | "large";
}

const ListItemLeading = React.forwardRef<HTMLDivElement, ListItemLeadingProps>(({
    className,
    size = "medium",
    children,
    ...props
}, ref) => {
    const sizeClasses = {
        small: "w-6 h-6",      // 24dp
        medium: "w-10 h-10",   // 40dp  
        large: "w-14 h-14"     // 56dp
    };

    return (
        <div
            ref={ref}
            className={cn(
                "flex-shrink-0 flex items-center justify-center",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
ListItemLeading.displayName = "ListItemLeading";

// List Item Trailing Element (icon, text, control, etc.)
interface ListItemTrailingProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const ListItemTrailing = React.forwardRef<HTMLDivElement, ListItemTrailingProps>(({
    className,
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn("flex-shrink-0 flex items-center", className)}
        {...props}
    >
        {children}
    </div>
));
ListItemTrailing.displayName = "ListItemTrailing";

// List Item with Avatar
interface ListItemWithAvatarProps extends Omit<ListItemProps, 'size'> {
    avatar: {
        src?: string;
        alt?: string;
        fallback?: string;
    };
    headline: string;
    supportingText?: string;
    overline?: string;
    trailingText?: string;
    trailingElement?: React.ReactNode;
    size?: "one-line" | "two-line" | "three-line";
}

const ListItemWithAvatar = React.forwardRef<HTMLDivElement, ListItemWithAvatarProps>(({
    avatar,
    headline,
    supportingText,
    overline,
    trailingText,
    trailingElement,
    size = supportingText ? "two-line" : "one-line",
    ...props
}, ref) => (
    <ListItem ref={ref} size={size} {...props}>
        <ListItemLeading size="medium">
            <Avatar className="w-10 h-10">
                {avatar.src ? (
                    <img src={avatar.src} alt={avatar.alt} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-primary text-on-primary flex items-center justify-center text-sm font-medium">
                        {avatar.fallback}
                    </div>
                )}
            </Avatar>
        </ListItemLeading>

        <ListItemContent
            headline={headline}
            supportingText={supportingText}
            overline={overline}
        />

        {(trailingText || trailingElement) && (
            <ListItemTrailing>
                {trailingText && (
                    <span className="text-sm text-on-surface-variant">
                        {trailingText}
                    </span>
                )}
                {trailingElement}
            </ListItemTrailing>
        )}
    </ListItem>
));
ListItemWithAvatar.displayName = "ListItemWithAvatar";

// List Item with Checkbox
interface ListItemWithCheckboxProps extends Omit<ListItemProps, 'size'> {
    headline: string;
    supportingText?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    checkboxPosition?: "leading" | "trailing";
    size?: "one-line" | "two-line" | "three-line";
}

const ListItemWithCheckbox = React.forwardRef<HTMLDivElement, ListItemWithCheckboxProps>(({
    headline,
    supportingText,
    checked,
    onCheckedChange,
    checkboxPosition = "trailing",
    size = supportingText ? "two-line" : "one-line",
    onClick,
    ...props
}, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onCheckedChange?.(!checked);
        onClick?.(e);
    };

    const checkbox = (
        <Checkbox
            checked={checked}
            onCheckedChange={onCheckedChange}
            onClick={(e) => e.stopPropagation()}
        />
    );

    return (
        <ListItem
            ref={ref}
            size={size}
            clickable
            onClick={handleClick}
            {...props}
        >
            {checkboxPosition === "leading" && (
                <ListItemLeading size="small">
                    {checkbox}
                </ListItemLeading>
            )}

            <ListItemContent
                headline={headline}
                supportingText={supportingText}
            />

            {checkboxPosition === "trailing" && (
                <ListItemTrailing>
                    {checkbox}
                </ListItemTrailing>
            )}
        </ListItem>
    );
});
ListItemWithCheckbox.displayName = "ListItemWithCheckbox";

// List Item with Switch
interface ListItemWithSwitchProps extends Omit<ListItemProps, 'size'> {
    headline: string;
    supportingText?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    icon?: React.ReactNode;
    size?: "one-line" | "two-line" | "three-line";
}

const ListItemWithSwitch = React.forwardRef<HTMLDivElement, ListItemWithSwitchProps>(({
    headline,
    supportingText,
    checked,
    onCheckedChange,
    icon,
    size = supportingText ? "two-line" : "one-line",
    onClick,
    ...props
}, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onCheckedChange?.(!checked);
        onClick?.(e);
    };

    return (
        <ListItem
            ref={ref}
            size={size}
            clickable
            onClick={handleClick}
            {...props}
        >
            {icon && (
                <ListItemLeading size="small">
                    <div className="text-on-surface-variant">
                        {icon}
                    </div>
                </ListItemLeading>
            )}

            <ListItemContent
                headline={headline}
                supportingText={supportingText}
            />

            <ListItemTrailing>
                <Switch
                    checked={checked}
                    onCheckedChange={onCheckedChange}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
            </ListItemTrailing>
        </ListItem>
    );
});
ListItemWithSwitch.displayName = "ListItemWithSwitch";

// List Item with Image/Thumbnail  
interface ListItemWithImageProps extends Omit<ListItemProps, 'size'> {
    image: {
        src: string;
        alt: string;
        aspectRatio?: "1:1" | "16:9" | "4:3";
    };
    headline: string;
    supportingText?: string;
    overline?: string;
    trailingText?: string;
    trailingElement?: React.ReactNode;
    size?: "one-line" | "two-line" | "three-line";
}

const ListItemWithImage = React.forwardRef<HTMLDivElement, ListItemWithImageProps>(({
    image,
    headline,
    supportingText,
    overline,
    trailingText,
    trailingElement,
    size = supportingText ? "two-line" : "one-line",
    ...props
}, ref) => {
    const aspectRatioClasses = {
        "1:1": "aspect-square",
        "16:9": "aspect-video",
        "4:3": "aspect-[4/3]"
    };

    return (
        <ListItem ref={ref} size={size} {...props}>
            <ListItemLeading size="large">
                <img
                    src={image.src}
                    alt={image.alt}
                    className={cn(
                        "w-full h-full object-cover rounded",
                        aspectRatioClasses[image.aspectRatio || "1:1"]
                    )}
                />
            </ListItemLeading>

            <ListItemContent
                headline={headline}
                supportingText={supportingText}
                overline={overline}
            />

            {(trailingText || trailingElement) && (
                <ListItemTrailing>
                    {trailingText && (
                        <span className="text-sm text-on-surface-variant">
                            {trailingText}
                        </span>
                    )}
                    {trailingElement}
                </ListItemTrailing>
            )}
        </ListItem>
    );
});
ListItemWithImage.displayName = "ListItemWithImage";

// List Subheader for section grouping
interface ListSubheaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const ListSubheader = React.forwardRef<HTMLDivElement, ListSubheaderProps>(({
    className,
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn(
            "px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface",
            "border-b border-outline-variant first:border-t-0",
            className
        )}
        {...props}
    >
        {children}
    </div>
));
ListSubheader.displayName = "ListSubheader";

// Draggable List Item (for reordering)
interface DraggableListItemProps extends ListItemProps {
    onDragStart?: (e: React.DragEvent) => void;
    onDragEnd?: (e: React.DragEvent) => void;
    dragHandle?: boolean;
}

const DraggableListItem = React.forwardRef<HTMLDivElement, DraggableListItemProps>(({
    className,
    onDragStart,
    onDragEnd,
    dragHandle = true,
    children,
    ...props
}, ref) => (
    <ListItem
        ref={ref}
        className={cn("group", className)}
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        {...props}
    >
        {children}
        {dragHandle && (
            <ListItemTrailing>
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <FontAwesomeIcon icon={faGripVertical} className="w-4 h-4 text-on-surface-variant" />
                </Button>
            </ListItemTrailing>
        )}
    </ListItem>
));
DraggableListItem.displayName = "DraggableListItem";

export {
    List,
    ListItem,
    ListItemContent,
    ListItemLeading,
    ListItemTrailing,
    ListItemWithAvatar,
    ListItemWithCheckbox,
    ListItemWithSwitch,
    ListItemWithImage,
    ListSubheader,
    DraggableListItem,
    listVariants,
    listItemVariants
};
